import type { Express } from "express";
import multer from "multer";
import path from "path";
import { MongoDBStorage } from "../server/mongo-storage";
import { insertTeamSchema, insertGameScoreSchema } from "../shared/mongo-validation";
import { z } from "zod";
import adminRouter from "./admin-routes";

// Initialize MongoDB storage
const storage = new MongoDBStorage();

// Configure multer for memory storage (for MongoDB GridFS upload)
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
            database: process.env.MONGODB_URI ? "configured" : "missing",
            fileStorage: "mongodb_gridfs"
        });
    });

    // Team registration endpoint with file upload to MongoDB GridFS
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

            // Prepare team data for MongoDB storage
            let finalTeamData: any = { ...teamData };

            // Handle file upload to MongoDB GridFS if present
            if (req.file) {
                try {
                    const timestamp = Date.now();
                    const extension = path.extname(req.file.originalname);

                    // Clean team name and leader name for filename (remove special characters)
                    const cleanTeamName = teamData.teamName.replace(/[^a-zA-Z0-9]/g, '');
                    const cleanLeaderName = teamData.player1Name.replace(/[^a-zA-Z0-9]/g, '');

                    const filename = `${cleanTeamName}-${cleanLeaderName}-${timestamp}${extension}`;

                    // Prepare file data for GridFS storage
                    finalTeamData = {
                        ...teamData,
                        bankSlipFile: req.file.buffer,
                        bankSlipFileName: filename,
                        bankSlipContentType: req.file.mimetype
                    };

                    console.log(`Uploading bank slip to MongoDB GridFS: ${filename} (${req.file.mimetype})`);
                } catch (uploadError) {
                    console.error('File preparation error:', uploadError);
                    return res.status(500).json({
                        message: "Failed to process uploaded file",
                        field: "bankSlip"
                    });
                }
            }

            // Create team with GridFS file data
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

    // List all uploaded files (admin endpoint)
    app.get("/api/admin/files", async (req, res) => {
        try {
            const teams = await storage.getAllTeams();
            const files = teams
                .filter((team: any) => team.bankSlipFileId)
                .map((team: any) => ({
                    teamId: team._id.toString(),
                    teamName: team.teamName,
                    fileName: team.bankSlipFileName || 'unknown',
                    fileType: 'gridfs',
                    fileId: team.bankSlipFileId?.toString(),
                    fileUrl: `/api/files/${team._id.toString()}/bank-slip`,
                    contentType: team.bankSlipContentType,
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

// Add admin routes
export function configureAdminRoutes(app: Express) {
    app.use('/api/admin', adminRouter);
}
