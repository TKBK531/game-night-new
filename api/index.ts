import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import necessary modules for full functionality
// We'll import these directly to avoid module resolution issues
let mongoose: any;
let MongoDBStorage: any;
let insertTeamSchema: any;
let insertGameScoreSchema: any;

// Dynamic imports to handle module resolution in serverless environment
async function initializeModules() {
    if (!mongoose) {
        mongoose = await import('mongoose');

        // Initialize MongoDB connection if not already connected
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is required');
        }

        if (mongoose.default.connection.readyState === 0) {
            console.log('🔌 Connecting to MongoDB...');
            await mongoose.default.connect(process.env.MONGODB_URI);
            console.log('✅ MongoDB connected successfully');
        }
    }
}

// Environment validation
if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI environment variable');
}
if (!process.env.SESSION_SECRET) {
    console.error('❌ Missing SESSION_SECRET environment variable');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log('API endpoint hit:', req.url, req.method);

    // Basic CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url, method } = req;

    try {
        // Initialize modules for database operations
        if (url?.includes('/teams') || url?.includes('/game-scores') || url?.includes('/files')) {
            await initializeModules();
        }

        // Health check endpoint
        if (url?.includes('/health')) {
            res.status(200).json({
                status: "ok",
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || "development",
                database: process.env.MONGODB_URI ? "configured" : "missing",
                sessionSecret: process.env.SESSION_SECRET ? "configured" : "missing",
                fileStorage: "mongodb_gridfs"
            });
            return;
        }

        // Debug endpoint
        if (url?.includes('/debug')) {
            let dbConnected = false;
            try {
                await initializeModules();
                dbConnected = mongoose.default.connection.readyState === 1;
            } catch (error) {
                console.error('Database connection test failed:', error);
            }

            res.status(200).json({
                status: "ok",
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || "development",
                database: {
                    configured: !!process.env.MONGODB_URI,
                    connected: dbConnected
                },
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                url,
                method
            });
            return;
        }

        // Team registration endpoint
        if (url?.includes('/teams') && method === 'POST') {
            res.status(200).json({
                message: 'Team registration endpoint',
                note: 'Full functionality will be implemented step by step',
                received: {
                    method,
                    url,
                    body: req.body
                }
            });
            return;
        }

        // Teams check endpoint
        if (url?.includes('/teams/check/') && method === 'GET') {
            const teamName = url.split('/teams/check/')[1];
            res.status(200).json({
                message: 'Team check endpoint',
                teamName,
                exists: false, // TODO: Implement actual check
                note: 'Full functionality will be implemented'
            });
            return;
        }

        // Teams stats endpoint
        if (url?.includes('/teams/stats') && method === 'GET') {
            res.status(200).json({
                message: 'Team stats endpoint',
                stats: {
                    totalTeams: 0,
                    valorantTeams: 0,
                    csTeams: 0
                },
                note: 'Full functionality will be implemented'
            });
            return;
        }

        // Game scores endpoint
        if (url?.includes('/game-scores') && method === 'POST') {
            res.status(200).json({
                message: 'Game scores endpoint',
                note: 'Full functionality will be implemented',
                received: {
                    method,
                    url,
                    body: req.body
                }
            });
            return;
        }

        // Leaderboard endpoint
        if (url?.includes('/game-scores/leaderboard/') && method === 'GET') {
            const gameType = url.split('/leaderboard/')[1];
            res.status(200).json({
                message: 'Leaderboard endpoint',
                gameType,
                scores: [],
                note: 'Full functionality will be implemented'
            });
            return;
        }

        // Test endpoint
        if (url?.includes('/test')) {
            res.status(200).json({
                message: 'Test endpoint working',
                timestamp: new Date().toISOString(),
                method,
                url
            });
            return;
        }

        // Default response for unmatched routes
        res.status(404).json({
            error: 'API endpoint not found',
            availableEndpoints: [
                '/api/health',
                '/api/debug',
                '/api/test',
                '/api/teams (POST)',
                '/api/teams/check/:teamName (GET)',
                '/api/teams/stats (GET)',
                '/api/game-scores (POST)',
                '/api/game-scores/leaderboard/:gameType (GET)'
            ],
            requestedUrl: url
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}
