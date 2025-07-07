import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { MongoDBStorage } from "./mongo-storage";
import { insertTeamSchema, insertGameScoreSchema, insertSecretChallengeSchema } from "../shared/mongo-validation";
import { z } from "zod";
import adminRouter from "./admin-routes";

// Initialize MongoDB storage
const storage = new MongoDBStorage();

// Configure multer for file uploads with temporary filename
const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Use temporary filename, will rename later with team info
    const tempName = 'temp-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, tempName);
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Team registration endpoint with file upload
  app.post("/api/teams", upload.single('bankSlip'), async (req, res) => {
    try {
      // Parse form data first to get team information
      const formData = {
        ...req.body,
        bankSlip: req.file ? req.file.filename : undefined
      };

      const teamData = insertTeamSchema.parse(formData);

      // Check team registration limits
      const currentTeamCount = await storage.getTeamCount(teamData.game);
      const maxTeams = teamData.game === "valorant" ? 8 : 12;
      
      if (currentTeamCount >= maxTeams) {
        // If team limit reached and we have a file, clean up the temp file
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.error('Error deleting temp file:', e);
          }
        }
        return res.status(400).json({
          message: `Registration is closed for ${teamData.game}. Maximum ${maxTeams} teams allowed.`,
          field: "game"
        });
      }

      // Check if team name is unique
      const existingTeam = await storage.getTeamByName(teamData.teamName);
      if (existingTeam) {
        // If team name exists and we have a file, clean up the temp file
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.error('Error deleting temp file:', e);
          }
        }
        return res.status(400).json({
          message: "Team name already exists. Please choose a different name.",
          field: "teamName"
        });
      }

      // Prepare team data for MongoDB storage
      let finalTeamData: any = { ...teamData };

      // If we have a file, read it and prepare for GridFS storage
      if (req.file) {
        try {
          // Read the uploaded file
          const fileBuffer = fs.readFileSync(req.file.path);

          // Create proper filename
          const timestamp = Date.now();
          const extension = path.extname(req.file.originalname);
          const cleanTeamName = teamData.teamName.replace(/[^a-zA-Z0-9]/g, '');
          const cleanLeaderName = teamData.player1Name.replace(/[^a-zA-Z0-9]/g, '');
          const finalFileName = `${cleanTeamName}-${cleanLeaderName}-${timestamp}${extension}`;

          // Add file data for GridFS storage
          finalTeamData = {
            ...teamData,
            bankSlipFile: fileBuffer,
            bankSlipFileName: finalFileName,
            bankSlipContentType: req.file.mimetype
          };

          // Clean up the temporary file
          fs.unlinkSync(req.file.path);
        } catch (error) {
          console.error('Error processing uploaded file:', error);
          // Clean up the temporary file if it exists
          try {
            if (req.file && req.file.path) {
              fs.unlinkSync(req.file.path);
            }
          } catch (cleanupError) {
            console.error('Error cleaning up temp file:', cleanupError);
          }
          throw new Error('Failed to process uploaded file');
        }
      }

      const team = await storage.createTeam(finalTeamData);
      res.status(201).json(team);
    } catch (error) {
      console.error("Error in POST /api/teams:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        data: (error as any)?.data || 'No additional data'
      });

      // Clean up uploaded file if there was an error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error('Error deleting temp file after error:', e);
        }
      }

      if (error instanceof z.ZodError) {
        // Format validation errors for better user experience
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          message: "Please fix the following errors:",
          errors: formattedErrors,
          details: error.errors
        });
      }
      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          message: error.message,
          field: "bankSlip"
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check team name availability
  app.get("/api/teams/check/:teamName", async (req, res) => {
    try {
      const { teamName } = req.params;
      const existingTeam = await storage.getTeamByName(teamName);
      res.json({ available: !existingTeam });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check registration availability for a specific game
  app.get("/api/teams/check-availability/:game", async (req, res) => {
    try {
      const { game } = req.params;
      
      if (!["valorant", "cod"].includes(game)) {
        return res.status(400).json({ message: "Invalid game type" });
      }

      const teamCount = await storage.getTeamCount(game);
      const maxTeams = game === "valorant" ? 8 : 12;
      const isAvailable = teamCount < maxTeams;

      res.json({
        game,
        registered: teamCount,
        maxTeams,
        isAvailable,
        message: isAvailable 
          ? `Registration is open. ${maxTeams - teamCount} spots remaining.`
          : "Registration is closed for this tournament."
      });
    } catch (error) {
      console.error("Error in /api/teams/check-availability:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get team statistics
  app.get("/api/teams/stats", async (req, res) => {
    try {
      const valorantCount = await storage.getTeamCount("valorant");
      const codCount = await storage.getTeamCount("cod");

      res.json({
        valorant: { registered: valorantCount, total: 8 },
        cod: { registered: codCount, total: 12 }
      });
    } catch (error) {
      console.error("Error in /api/teams/stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Game score endpoints
  app.post("/api/game-scores", async (req, res) => {
    try {
      const scoreData = insertGameScoreSchema.parse(req.body);
      const score = await storage.createGameScore(scoreData);
      res.status(201).json(score);
    } catch (error) {
      console.error("Error in POST /api/game-scores:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/game-scores/leaderboard/:gameType", async (req, res) => {
    try {
      const { gameType } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const scores = await storage.getTopScores(gameType, limit);
      res.json(scores);
    } catch (error) {
      console.error("Error in GET /api/game-scores/leaderboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Secret challenge endpoints
  app.post("/api/secret-challenge", async (req, res) => {
    try {
      const challengeData = insertSecretChallengeSchema.parse(req.body);
      const challenge = await storage.createSecretChallenge(challengeData);
      res.status(201).json({ success: true, message: "Challenge completed!", rank: challenge });
    } catch (error) {
      console.error("Error in POST /api/secret-challenge:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      if (error instanceof Error && error.message.includes("already completed")) {
        return res.status(409).json({ message: "You have already completed this challenge!" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/secret-challenge/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getSecretLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error in GET /api/secret-challenge/leaderboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/secret-challenge/check/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const hasCompleted = await storage.hasPlayerCompletedSecret(email);
      res.json({ hasCompleted });
    } catch (error) {
      console.error("Error in GET /api/secret-challenge/check:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.use("/api/admin", adminRouter);

  // File access endpoint - serve files from MongoDB GridFS
  app.get("/api/files/:teamId/bank-slip", async (req, res) => {
    try {
      const { teamId } = req.params;

      // Get team data to find the bank slip file
      const teams = await storage.getAllTeams();
      const team = teams.find((t: any) => t._id.toString() === teamId);

      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if team has a GridFS file
      if (team.bankSlipFileId) {
        try {
          const file = await storage.getBankSlipFile(team.bankSlipFileId.toString());

          // Set appropriate headers
          res.set({
            'Content-Type': team.bankSlipContentType || file.contentType,
            'Content-Disposition': `inline; filename="${team.bankSlipFileName || file.filename}"`,
            'Content-Length': file.buffer.length,
            'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
          });

          // Send file buffer as binary data
          res.end(file.buffer);
          return;
        } catch (fileError) {
          console.error('Error serving GridFS file:', fileError);
          return res.status(404).json({ message: "File not found in database" });
        }
      }

      return res.status(404).json({ message: "No bank slip file found" });
    } catch (error) {
      console.error("Error accessing file:", error);
      res.status(500).json({ message: "Error accessing file" });
    }
  });

  // Direct file access by GridFS file ID
  app.get("/api/files/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;
      const download = req.query.download === 'true';

      try {
        const file = await storage.getBankSlipFile(fileId);

        // Set appropriate headers based on whether it's a download or preview
        const disposition = download ? 'attachment' : 'inline';
        res.set({
          'Content-Type': file.contentType,
          'Content-Disposition': `${disposition}; filename="${file.filename}"`,
          'Content-Length': file.buffer.length,
          'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
        });

        // Send file buffer as binary data
        res.end(file.buffer);
        return;
      } catch (fileError) {
        console.error('Error serving GridFS file:', fileError);
        return res.status(404).json({ message: "File not found in database" });
      }
    } catch (error) {
      console.error("Error accessing file:", error);
      res.status(500).json({ message: "Error accessing file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
