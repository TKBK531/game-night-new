import "dotenv/config";
import express from 'express';
import { setupServerlessRoutes } from '../server/serverless-routes';
import '../server/env-validation'; // Validate environment variables

const app = express();

// Configure Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup routes
setupServerlessRoutes(app);

// Export for Vercel
export default app;
