import 'dotenv/config';
import { connectToDatabase } from './mongodb';
import { User } from '../shared/mongo-schema';
import bcrypt from 'bcrypt';

async function initializeSuperuser() {
    try {
        await connectToDatabase();
        console.log('🔌 Connected to MongoDB');

        // Get superuser credentials from environment variables
        const superuserUsername = process.env.SUPERUSER_USERNAME;
        const superuserPassword = process.env.SUPERUSER_PASSWORD;

        if (!superuserUsername || !superuserPassword) {
            console.error('❌ SUPERUSER_USERNAME and SUPERUSER_PASSWORD must be set in environment variables');
            return;
        }

        // Check if superuser already exists
        const existingSuperuser = await User.findOne({ username: superuserUsername });

        if (existingSuperuser) {
            console.log('✅ Superuser already exists');
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(superuserPassword, 10);

        // Create superuser
        const superuser = new User({
            username: superuserUsername,
            password: hashedPassword,
            role: 'superuser',
            isActive: true
        });

        await superuser.save();
        console.log('✅ Superuser created successfully');
        console.log(`Username: ${superuserUsername}`);
        console.log('Role: superuser');

    } catch (error) {
        console.error('❌ Error initializing superuser:', error);
    }
}

export { initializeSuperuser };

// If run directly
const isMainModule = process.argv[1] === new URL(import.meta.url).pathname;
if (isMainModule) {
    initializeSuperuser().then(() => process.exit(0));
}
