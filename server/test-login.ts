import 'dotenv/config';
import { connectToDatabase } from './mongodb';
import { User } from '../shared/mongo-schema';
import bcrypt from 'bcrypt';

async function testLogin() {
    try {
        await connectToDatabase();
        console.log('🔌 Connected to MongoDB for login test');

        const username = process.env.SUPERUSER_USERNAME || 'TKBK531';
        const password = process.env.SUPERUSER_PASSWORD || 'Kasthuri@1971';

        console.log(`🧪 Testing login for username: ${username}`);

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log('✅ User found:', {
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            isActiveType: typeof user.isActive,
            hasPassword: !!user.password,
            createdAt: user.createdAt
        });

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(`🔐 Password validation: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);

        // Check isActive status
        console.log(`🎯 isActive check: ${user.isActive ? '✅ Active' : '❌ Deactivated'}`);
        console.log(`📊 Truthiness of isActive: ${!!user.isActive}`);

        if (user.isActive && isPasswordValid) {
            console.log('🎉 Login would be successful!');
        } else {
            console.log('❌ Login would fail');
            if (!isPasswordValid) console.log('   Reason: Invalid password');
            if (!user.isActive) console.log('   Reason: Account deactivated');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during login test:', error);
        process.exit(1);
    }
}

// Run the test
testLogin();
