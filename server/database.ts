import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
}

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Create the drizzle database instance
export const db = drizzle(pool, { schema });

// Test database connection
export async function testConnection() {
    try {
        const client = await pool.connect();
        console.log("✅ Database connected successfully");
        client.release();
        return true;
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        return false;
    }
}

// Gracefully close the database connection
export async function closeConnection() {
    await pool.end();
    console.log("🔌 Database connection closed");
}
