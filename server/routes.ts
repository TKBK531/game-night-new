import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertTeamSchema, insertGameScoreSchema } from "@shared/schema";
import { z } from "zod";

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

      // Check if team name is unique
      const existingTeam = await storage.getTeamByName(teamData.teamName);
      if (existingTeam) {
        // If team name exists and we have a file, clean up the temp file
        if (req.file) {
          try {
            fs.unlinkSync(path.join('uploads', req.file.filename));
          } catch (e) {
            console.error('Error deleting temp file:', e);
          }
        }
        return res.status(400).json({
          message: "Team name already exists. Please choose a different name.",
          field: "teamName"
        });
      }

      // If we have a file, rename it with the proper format
      let finalFileName = undefined;
      if (req.file) {
        const timestamp = Date.now();
        const extension = path.extname(req.file.originalname);

        // Clean team name and leader name for filename (remove special characters)
        const cleanTeamName = teamData.teamName.replace(/[^a-zA-Z0-9]/g, '');
        const cleanLeaderName = teamData.player1Name.replace(/[^a-zA-Z0-9]/g, '');

        finalFileName = `${cleanTeamName}-${cleanLeaderName}-${timestamp}${extension}`;

        const oldPath = path.join('uploads', req.file.filename);
        const newPath = path.join('uploads', finalFileName);

        try {
          fs.renameSync(oldPath, newPath);
        } catch (error) {
          console.error('Error renaming file:', error);
          // If rename fails, keep the original filename
          finalFileName = req.file.filename;
        }
      }

      // Update teamData with the final filename
      const finalTeamData = {
        ...teamData,
        bankSlip: finalFileName
      };

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
          fs.unlinkSync(path.join('uploads', req.file.filename));
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

  // Get team statistics
  app.get("/api/teams/stats", async (req, res) => {
    try {
      const valorantCount = await storage.getTeamCount("valorant");
      const codCount = await storage.getTeamCount("cod");

      res.json({
        valorant: { registered: valorantCount, total: 32 },
        cod: { registered: codCount, total: 32 }
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

  const httpServer = createServer(app);
  return httpServer;
}
