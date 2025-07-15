import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { MongoDBStorage } from "./mongo-storage";
import { insertTeamSchema, insertGameScoreSchema, insertSecretChallengeSchema } from "../shared/mongo-validation";
import { siteConfig } from "../shared/config";
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
      if (teamData.game === "valorant") {
        const currentTeamCount = await storage.getConfirmedTeamCount(teamData.game);
        const maxTeams = 8;

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
      } else {
        // COD queue system
        const confirmedCount = await storage.getConfirmedTeamCount(teamData.game);
        const queuedCount = await storage.getQueuedTeamCount(teamData.game);
        const maxTeams = 12;
        const maxQueue = 5;

        if (confirmedCount >= maxTeams) {
          if (req.file) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (e) {
              console.error('Error deleting temp file:', e);
            }
          }
          return res.status(400).json({
            message: `Registration is closed for ${teamData.game}. Tournament is full.`,
            field: "game"
          });
        }

        if (queuedCount >= maxQueue) {
          if (req.file) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (e) {
              console.error('Error deleting temp file:', e);
            }
          }
          return res.status(400).json({
            message: `Registration queue is full for ${teamData.game}. Please try again later.`,
            field: "game"
          });
        }
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

      // Return different response based on game type
      if (teamData.game === "cod") {
        res.status(201).json({
          ...team,
          message: "Your team has been added to the COD registration queue. Due to high demand, the first teams to register will be notified with bank details and have 24 hours to complete payment. You will receive an email notification if selected.",
          isQueued: true
        });
      } else {
        res.status(201).json(team);
      }
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

      if (game === "valorant") {
        const teamCount = await storage.getConfirmedTeamCount(game); // Use confirmed count
        const maxTeams = 8;
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
      } else {
        // COD queue system
        const confirmedCount = await storage.getConfirmedTeamCount(game);
        const queuedCount = await storage.getQueuedTeamCount(game);
        const maxTeams = 12;
        const maxQueue = 5;

        const isRegistrationOpen = confirmedCount < maxTeams && queuedCount < maxQueue;

        res.json({
          game,
          confirmed: confirmedCount,
          queued: queuedCount,
          maxTeams,
          maxQueue,
          isAvailable: isRegistrationOpen,
          message: isRegistrationOpen
            ? "Registration is open. You will be added to the registration queue."
            : confirmedCount >= maxTeams
              ? "Registration is closed. Tournament is full."
              : "Registration queue is full. Please try again later."
        });
      }
    } catch (error) {
      console.error("Error in /api/teams/check-availability:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get team statistics
  app.get("/api/teams/stats", async (req, res) => {
    try {
      const valorantCount = await storage.getConfirmedTeamCount("valorant");
      const codConfirmedCount = await storage.getConfirmedTeamCount("cod");
      const codQueuedCount = await storage.getQueuedTeamCount("cod");

      res.json({
        valorant: { registered: valorantCount, total: 8 },
        cod: {
          confirmed: codConfirmedCount,
          queued: codQueuedCount,
          total: 12,
          maxQueue: 5
        }
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

  // Admin endpoints for COD queue management
  app.get("/api/admin/cod-queue", async (req, res) => {
    try {
      const queuedTeams = await storage.getQueuedTeams("cod");
      res.json(queuedTeams);
    } catch (error) {
      console.error("Error in /api/admin/cod-queue:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/approve-team/:teamId", async (req, res) => {
    try {
      const { teamId } = req.params;
      const { approvedBy } = req.body;

      if (!approvedBy) {
        return res.status(400).json({ message: "Approver information required" });
      }

      const team = await storage.approveTeamForPayment(teamId, approvedBy);
      res.json(team);
    } catch (error) {
      console.error("Error in /api/admin/approve-team:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/reject-team/:teamId", async (req, res) => {
    try {
      const { teamId } = req.params;
      await storage.rejectTeam(teamId);
      res.json({ message: "Team rejected successfully" });
    } catch (error) {
      console.error("Error in /api/admin/reject-team:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Migration endpoint - run once to update existing teams
  app.post("/api/admin/migrate-teams", async (req, res) => {
    try {
      await storage.migrateExistingTeams();
      res.json({ message: "Teams migrated successfully" });
    } catch (error) {
      console.error("Error in /api/admin/migrate-teams:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Leaderboard endpoints for the new leaderboard page
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { game } = req.query;
      if (!game || (game !== "valorant" && game !== "cod")) {
        return res.status(400).json({ message: "Valid game parameter required (valorant or cod)" });
      }

      const leaderboard = await storage.getTeamLeaderboard(game as "valorant" | "cod");

      // If no data exists, return sample data for demo
      if (leaderboard.length === 0) {
        const sampleData = [
          {
            _id: "sample1",
            teamId: "1",
            teamName: "TeamNotFound",
            game: game,
            score: 250,
            matchesWon: 8,
            matchesLost: 2,
            totalMatches: 10,
            lastUpdated: new Date().toISOString(),
            updatedBy: "system"
          },
          {
            _id: "sample2",
            teamId: "2",
            teamName: "Silent Reapers",
            game: game,
            score: 230,
            matchesWon: 7,
            matchesLost: 3,
            totalMatches: 10,
            lastUpdated: new Date().toISOString(),
            updatedBy: "system"
          },
          {
            _id: "sample3",
            teamId: "3",
            teamName: "Dragon Worriers",
            game: game,
            score: 210,
            matchesWon: 6,
            matchesLost: 4,
            totalMatches: 10,
            lastUpdated: new Date().toISOString(),
            updatedBy: "system"
          },
          {
            _id: "sample4",
            teamId: "4",
            teamName: "Team Mythics",
            game: game,
            score: 190,
            matchesWon: 5,
            matchesLost: 5,
            totalMatches: 10,
            lastUpdated: new Date().toISOString(),
            updatedBy: "system"
          }
        ];
        return res.json(sampleData);
      }

      res.json(leaderboard);
    } catch (error) {
      console.error("Error in /api/leaderboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Match endpoints
  app.get("/api/matches", async (req, res) => {
    try {
      const { game, status } = req.query;
      if (!game || (game !== "valorant" && game !== "cod")) {
        return res.status(400).json({ message: "Valid game parameter required (valorant or cod)" });
      }

      const matches = await storage.getMatches(game as "valorant" | "cod", status as string);

      // If no data exists, return sample data for demo
      if (matches.length === 0) {
        const sampleMatches = [
          {
            _id: "match1",
            game: game,
            team1Id: "1",
            team1Name: "TeamNotFound",
            team2Id: "2",
            team2Name: "Silent Reapers",
            status: "in_progress",
            scheduledTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
            actualStartTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            team1Score: 8,
            team2Score: 6,
            round: "Semi-Final",
            createdBy: "admin",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          },
          {
            _id: "match2",
            game: game,
            team1Id: "3",
            team1Name: "Dragon Worriers",
            team2Id: "4",
            team2Name: "Team Mythics",
            status: "scheduled",
            scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            round: "Quarter-Final",
            createdBy: "admin",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          },
          {
            _id: "match3",
            game: game,
            team1Id: "5",
            team1Name: "Hellborn",
            team2Id: "6",
            team2Name: "Reapers",
            status: "completed",
            scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            actualStartTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            actualEndTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
            winnerId: "5",
            winnerName: "Hellborn",
            team1Score: 13,
            team2Score: 9,
            round: "Round 1",
            createdBy: "admin",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          }
        ];
        return res.json(sampleMatches);
      }

      res.json(matches);
    } catch (error) {
      console.error("Error in /api/matches:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      // Admin authentication would go here
      const match = await storage.createMatch(req.body);
      res.json(match);
    } catch (error) {
      console.error("Error in /api/matches:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/matches/:matchId", async (req, res) => {
    try {
      // Admin authentication would go here
      const { matchId } = req.params;
      const match = await storage.updateMatch(matchId, req.body);
      res.json(match);
    } catch (error) {
      console.error("Error in /api/matches/:matchId:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/leaderboard", async (req, res) => {
    try {
      // Admin authentication would go here
      const score = await storage.updateTeamScore(req.body);
      res.json(score);
    } catch (error) {
      console.error("Error in /api/leaderboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
