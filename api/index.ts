import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { setupServerlessRoutes } from '../server/serverless-routes';
import '../server/env-validation'; // Validate environment variables
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();

// Configure CORS for production
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'https://your-domain.vercel.app']
        : true,
    credentials: true
}));

// Configure Express middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Setup routes
setupServerlessRoutes(app);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// Vercel serverless function handler
export default function handler(req: VercelRequest, res: VercelResponse) {
    return app(req, res);
}
