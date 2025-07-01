import type { Express } from "express";
import multer from "multer";
import path from "path";
import { storage } from "../server/storage";
import { insertTeamSchema, insertGameScoreSchema } from "@shared/schema";
import { z } from "zod";

// Conditional import for Cloudinary
let uploadToCloudinary: any = null;
try {
    const cloudinaryModule = require("../server/cloudinary");
    uploadToCloudinary = cloudinaryModule.uploadToCloudinary;
} catch (error) {
    console.warn('Cloudinary module not available:', error);
}

// Configure multer for memory storage (since we'll upload to Cloudinary)
const upload = multer({
    storage: multer.memoryStorage(),
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

export function setupServerlessRoutes(app: Express): void {
    // Health check endpoint
    app.get("/api/health", (req, res) => {
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
            database: process.env.DATABASE_URL ? "configured" : "missing",
            cloudinary: uploadToCloudinary ? "available" : "unavailable"
        });
    });

    // Team registration endpoint with file upload
    app.post("/api/teams", upload.single('bankSlip'), async (req, res) => {
        try {
            // Parse form data first to get team information
            const formData = {
                ...req.body,
                bankSlip: req.file ? 'temp-filename' : undefined
            };

            const teamData = insertTeamSchema.parse(formData);

            // Check if team name is unique
            const existingTeam = await storage.getTeamByName(teamData.teamName);
            if (existingTeam) {
                return res.status(400).json({
                    message: "Team name already exists. Please choose a different name.",
                    field: "teamName"
                });
            }

            // Upload file to Cloudinary if present
            let finalFileName = undefined;
            if (req.file) {
                try {
                    if (!uploadToCloudinary) {
                        throw new Error('File upload service not available');
                    }

                    const timestamp = Date.now();
                    const extension = path.extname(req.file.originalname);

                    // Clean team name and leader name for filename (remove special characters)
                    const cleanTeamName = teamData.teamName.replace(/[^a-zA-Z0-9]/g, '');
                    const cleanLeaderName = teamData.player1Name.replace(/[^a-zA-Z0-9]/g, '');

                    const filename = `${cleanTeamName}-${cleanLeaderName}-${timestamp}`;

                    // Upload to Cloudinary
                    const cloudinaryResult = await uploadToCloudinary(
                        req.file.buffer,
                        filename,
                        'tournament-bank-slips'
                    );

                    finalFileName = cloudinaryResult.url; // Store the Cloudinary URL
                } catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    // Continue without file if upload fails
                    finalFileName = undefined;
                }
            }

            // Update teamData with the final filename/URL
            const finalTeamData = {
                ...teamData,
                bankSlip: finalFileName
            };

            const team = await storage.createTeam(finalTeamData);
            res.status(201).json(team);
        } catch (error) {
            console.error("Error in POST /api/teams:", error);

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
            console.error("Error in GET /api/teams/check:", error);
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
            console.log('Received game score submission:', req.body);

            const scoreData = insertGameScoreSchema.parse(req.body);
            console.log('Validated score data:', scoreData);

            const score = await storage.createGameScore(scoreData);
            console.log('Created score:', score);

            res.status(201).json(score);
        } catch (error) {
            console.error("Error in POST /api/game-scores:", error);

            if (error instanceof z.ZodError) {
                console.error("Validation errors:", error.errors);
                return res.status(400).json({
                    message: "Validation error",
                    errors: error.errors
                });
            }

            // Log the full error for debugging
            const errorDetails = error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : { message: String(error) };

            console.error("Full error details:", errorDetails);

            res.status(500).json({
                message: "Internal server error",
                error: process.env.NODE_ENV === 'development' ? errorDetails.message : undefined
            });
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

    // File access endpoint - redirect to Cloudinary URL
    app.get("/api/files/:teamId/bank-slip", async (req, res) => {
        try {
            const { teamId } = req.params;
            
            // Get team data to find the bank slip URL
            const teams = await storage.getAllTeams();
            const team = teams.find((t: any) => t.id === parseInt(teamId));
            
            if (!team || !team.bankSlipUrl) {
                return res.status(404).json({ message: "File not found" });
            }

            // If it's a Cloudinary URL, redirect to it
            if (team.bankSlipUrl.startsWith('http')) {
                return res.redirect(team.bankSlipUrl);
            }

            // Fallback for old file system uploads (shouldn't happen in production)
            return res.status(404).json({ message: "File not found" });
        } catch (error) {
            console.error("Error accessing file:", error);
            res.status(500).json({ message: "Error accessing file" });
        }
    });

    // List all uploaded files (admin endpoint)
    app.get("/api/admin/files", async (req, res) => {
        try {
            const teams = await storage.getAllTeams();
            const files = teams
                .filter((team: any) => team.bankSlipUrl)
                .map((team: any) => ({
                    teamId: team.id,
                    teamName: team.teamName,
                    fileName: team.bankSlipUrl,
                    fileUrl: team.bankSlipUrl.startsWith('http') ? team.bankSlipUrl : null,
                    uploadedAt: team.registeredAt
                }));

            res.json(files);
        } catch (error) {
            console.error("Error listing files:", error);
            res.status(500).json({ message: "Error listing files" });
        }
    });

    // Database test endpoint
    app.get("/api/test-db", async (req, res) => {
        try {
            console.log('Testing database connection...');

            // Test basic query
            const teams = await storage.getAllTeams();
            console.log(`Database test successful. Found ${teams.length} teams.`);

            res.json({
                status: "success",
                message: "Database connection working",
                teamCount: teams.length
            });
        } catch (error) {
            console.error("Database test failed:", error);
            const errorDetails = error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : { message: String(error) };

            res.status(500).json({
                status: "error",
                message: "Database connection failed",
                error: errorDetails
            });
        }
    });
}
