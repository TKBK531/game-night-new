import type { Express } from "express";
import multer from "multer";
import path from "path";
import { MongoDBStorage } from "../server/mongo-storage";
import { connectToDatabase } from "../server/mongodb";
import { insertTeamSchema, insertGameScoreSchema } from "../shared/mongo-validation";
import { siteConfig } from "../shared/config";
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

    // Debug endpoint for production troubleshooting
    app.get("/api/debug", async (req, res) => {
        try {
            // Test database connection
            await connectToDatabase();
            const dbConnected = true;

            res.json({
                status: "ok",
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || "development",
                database: {
                    configured: !!process.env.MONGODB_URI,
                    connected: dbConnected
                },
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
                database: {
                    configured: !!process.env.MONGODB_URI,
                    connected: false
                }
            });
        }
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

            // Check team registration limits
            const currentTeamCount = await storage.getTeamCount(teamData.game);
            const maxTeams = teamData.game === "valorant" ? 8 : 12;

            if (currentTeamCount >= maxTeams) {
                return res.status(400).json({
                    message: `Registration is closed for ${teamData.game}. Maximum ${maxTeams} teams allowed.`,
                    field: "game"
                });
            }

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

    // Check registration availability for a specific game
    app.get("/api/teams/check-availability/:game", async (req, res) => {
        try {
            const { game } = req.params;

            if (!["valorant", "cod"].includes(game)) {
                return res.status(400).json({ message: "Invalid game type" });
            }

            if (game === "valorant") {
                const teamCount = await storage.getConfirmedTeamCount(game);
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
                        ? `Registration is open. ${maxTeams - confirmedCount} confirmed spots, ${maxQueue - queuedCount} queue spots remaining.`
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

    // Leaderboard endpoints for the new leaderboard page
    app.get("/api/leaderboard", async (req, res) => {
        try {
            await connectToDatabase();

            const game = req.query.game as string;

            if (!game || (game !== "valorant" && game !== "cod")) {
                const leaderboard = await storage.getTeamLeaderboard(game as "valorant" | "cod");

                // If no real data, return sample data
                if (leaderboard.length === 0) {
                    const sampleData = [
                        {
                            _id: "sample1",
                            teamId: "1",
                            teamName: "Team Alpha",
                            game: game || "valorant",
                            score: 2500,
                            matchesWon: 8,
                            matchesLost: 2,
                            totalMatches: 10,
                            lastUpdated: new Date().toISOString(),
                            updatedBy: "system"
                        },
                        {
                            _id: "sample2",
                            teamId: "2",
                            teamName: "Elite Squad",
                            game: game || "valorant",
                            score: 2300,
                            matchesWon: 7,
                            matchesLost: 3,
                            totalMatches: 10,
                            lastUpdated: new Date().toISOString(),
                            updatedBy: "system"
                        },
                        {
                            _id: "sample3",
                            teamId: "3",
                            teamName: "Phoenix Riders",
                            game: game || "valorant",
                            score: 2100,
                            matchesWon: 6,
                            matchesLost: 4,
                            totalMatches: 10,
                            lastUpdated: new Date().toISOString(),
                            updatedBy: "system"
                        }
                    ];

                    return res.json(sampleData);
                }

                res.json(leaderboard);
            } else {
                return res.status(400).json({ message: "Game parameter is required and must be 'valorant' or 'cod'" });
            }
        } catch (error) {
            console.error("Error in /api/leaderboard:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    // Matches endpoints
    app.get("/api/matches", async (req, res) => {
        try {
            await connectToDatabase();

            const game = req.query.game as string;

            if (!game || (game !== "valorant" && game !== "cod")) {
                const matches = await storage.getMatches(game as "valorant" | "cod");

                // If no real data, return sample data
                if (matches.length === 0) {
                    const sampleData = [
                        {
                            _id: "match1",
                            game: game || "valorant",
                            team1Id: "1",
                            team1Name: "Team Alpha",
                            team2Id: "2",
                            team2Name: "Elite Squad",
                            status: "scheduled",
                            scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                            round: "Semi-Final",
                            createdBy: "admin",
                            createdAt: new Date().toISOString(),
                            lastUpdated: new Date().toISOString()
                        },
                        {
                            _id: "match2",
                            game: game || "valorant",
                            team1Id: "3",
                            team1Name: "Phoenix Riders",
                            team2Id: "4",
                            team2Name: "Shadow Warriors",
                            status: "in_progress",
                            scheduledTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
                            actualStartTime: new Date(Date.now() - 1800000).toISOString(),
                            team1Score: 8,
                            team2Score: 6,
                            round: "Quarter-Final",
                            createdBy: "admin",
                            createdAt: new Date().toISOString(),
                            lastUpdated: new Date().toISOString()
                        }
                    ];

                    return res.json(sampleData);
                }

                res.json(matches);
            } else {
                return res.status(400).json({ message: "Game parameter is required and must be 'valorant' or 'cod'" });
            }
        } catch (error) {
            console.error("Error in /api/matches:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    // Create/Update leaderboard score
    app.post("/api/leaderboard", async (req, res) => {
        try {
            await connectToDatabase();
            const result = await storage.updateTeamScore(req.body);
            res.json(result);
        } catch (error) {
            console.error("Error in /api/leaderboard:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    // Create match
    app.post("/api/matches", async (req, res) => {
        try {
            await connectToDatabase();
            const result = await storage.createMatch(req.body);
            res.json(result);
        } catch (error) {
            console.error("Error in /api/matches:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    // Update match
    app.put("/api/matches/:id", async (req, res) => {
        try {
            await connectToDatabase();
            const result = await storage.updateMatch(req.params.id, req.body);
            res.json(result);
        } catch (error) {
            console.error("Error in /api/matches/:id:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}

// Add admin routes
export function configureAdminRoutes(app: Express) {
    app.use('/api/admin', adminRouter);
}
