import 'dotenv/config';
import { connectToDatabase } from './mongodb';
import { User } from '../shared/mongo-schema';
import bcrypt from 'bcrypt';

async function initializeSuperuser() {
    try {
        await connectToDatabase();
        console.log('🔌 Connected to MongoDB');

        // Check if superuser already exists
        const existingSuperuser = await User.findOne({ username: 'TKBK531' });

        if (existingSuperuser) {
            console.log('✅ Superuser already exists');
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('Kasthuri@1971', 10);

        // Create superuser
        const superuser = new User({
            username: 'TKBK531',
            password: hashedPassword,
            role: 'superuser',
            isActive: true
        });

        await superuser.save();
        console.log('✅ Superuser created successfully');
        console.log('Username: TKBK531');
        console.log('Password: Kasthuri@1971');
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
