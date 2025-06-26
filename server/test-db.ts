import "dotenv/config";
import { testConnection, closeConnection } from "./database";

async function main() {
    console.log("Testing database connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set ✅" : "Not set ❌");

    const connected = await testConnection();

    if (connected) {
        console.log("🎉 Database connection successful!");
    } else {
        console.log("💥 Database connection failed!");
        console.log("\nTroubleshooting tips:");
        console.log("1. Make sure PostgreSQL is running");
        console.log("2. Check your DATABASE_URL in .env file");
        console.log("3. Verify database and user exist");
        console.log("4. Check credentials are correct");
    }

    await closeConnection();
    process.exit(connected ? 0 : 1);
}

main().catch(console.error);
