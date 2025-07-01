import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function testCustomConnection() {
    console.log('🔧 MongoDB Connection Tester');
    console.log('============================\n');

    const username = await askQuestion('Enter MongoDB username: ');
    const password = await askQuestion('Enter MongoDB password: ');
    const cluster = await askQuestion('Enter cluster URL (e.g., cluster0.aqzc6cg.mongodb.net): ');
    const database = await askQuestion('Enter database name (e.g., game-night-db): ');

    const uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${cluster}/${database}?retryWrites=true&w=majority`;

    console.log('\n🔄 Testing connection...');
    console.log('📍 URI (masked):', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ CONNECTION SUCCESSFUL!');

        const db = client.db();
        console.log(`📁 Connected to database: ${db.databaseName}`);

        // Test operations
        const testCollection = db.collection('connection-test');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        console.log('✅ Write test successful');

        const doc = await testCollection.findOne({ test: true });
        console.log('✅ Read test successful');

        await testCollection.deleteMany({ test: true });
        console.log('✅ Cleanup successful');

        console.log('\n🎉 All tests passed! Use this connection string:');
        console.log(`MONGODB_URI=${uri}`);

    } catch (error) {
        console.error('\n❌ CONNECTION FAILED:');
        console.error(error.message);

        if (error.message.includes('Authentication failed')) {
            console.log('\n💡 Troubleshooting tips:');
            console.log('1. Verify username and password in MongoDB Atlas');
            console.log('2. Check Database Access → Users');
            console.log('3. Ensure user has "Read and write to any database" permissions');
            console.log('4. Check Network Access → IP Whitelist');
        }
    } finally {
        await client.close();
        rl.close();
    }
}

testCustomConnection();
