import "dotenv/config";
import { testConnection } from "./mongodb";

async function main() {
    console.log("Testing MongoDB connection...");
    console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set ✅" : "Not set ❌");

    const connected = await testConnection();

    if (connected) {
        console.log("🎉 MongoDB connection successful!");
    } else {
        console.log("💥 MongoDB connection failed!");
        console.log("\nTroubleshooting tips:");
        console.log("1. Make sure your MongoDB Atlas cluster is running");
        console.log("2. Check your MONGODB_URI in .env file");
        console.log("3. Verify database user exists and has proper permissions");
        console.log("4. Check network access (IP whitelist) in MongoDB Atlas");
    }

    process.exit(connected ? 0 : 1);
}

main().catch(console.error);
