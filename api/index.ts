import "dotenv/config";
import express from 'express';
import { setupServerlessRoutes } from '../server/serverless-routes';

const app = express();

// Configure Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup routes
setupServerlessRoutes(app);

// Export for Vercel
export default app;
