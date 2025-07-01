import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Global cache for the MongoDB connection
declare global {
    var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
    if (cached!.conn) {
        console.log('✅ Using cached MongoDB connection');
        return cached!.conn;
    }

    if (!cached!.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10, // Maximum number of connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        };

        console.log('🔌 Connecting to MongoDB...');
        cached!.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached!.conn = await cached!.promise;
        console.log('✅ MongoDB connected successfully');
        return cached!.conn;
    } catch (e) {
        cached!.promise = null;
        console.error('❌ MongoDB connection failed:', e);
        throw e;
    }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
    try {
        await connectToDatabase();
        if (mongoose.connection.db) {
            const adminDb = mongoose.connection.db.admin();
            await adminDb.ping();
            console.log('✅ Database connection test successful');
            return true;
        } else {
            throw new Error('Database connection not established');
        }
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
    }
}

// Gracefully close the database connection
export async function closeConnection(): Promise<void> {
    if (cached?.conn) {
        await cached.conn.disconnect();
        cached.conn = null;
        cached.promise = null;
        console.log('🔌 Database connection closed');
    }
}
