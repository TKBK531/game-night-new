import 'dotenv/config';
import { connectToDatabase } from './mongodb';
import { User } from '../shared/mongo-schema';

async function migrateUserActiveStatus() {
    try {
        await connectToDatabase();
        console.log('🔌 Connected to MongoDB for user migration');

        // Update all users that don't have isActive field or have it set to null/undefined
        const result = await User.updateMany(
            {
                $or: [
                    { isActive: { $exists: false } },
                    { isActive: null },
                    { isActive: undefined }
                ]
            },
            {
                $set: { isActive: true }
            }
        );

        console.log(`✅ Migration completed: ${result.modifiedCount} users updated with isActive: true`);

        // Verify superuser status
        const superuserUsername = process.env.SUPERUSER_USERNAME;
        if (superuserUsername) {
            const superuser = await User.findOne({ username: superuserUsername });
            if (superuser) {
                console.log(`📋 Superuser "${superuserUsername}" status:`);
                console.log(`   - isActive: ${superuser.isActive}`);
                console.log(`   - role: ${superuser.role}`);
                console.log(`   - createdAt: ${superuser.createdAt}`);
            } else {
                console.log(`❌ Superuser "${superuserUsername}" not found`);
            }
        }

        // Show all users status
        const allUsers = await User.find({}, { username: 1, role: 1, isActive: 1 });
        console.log('📋 All users in database:');
        allUsers.forEach(user => {
            console.log(`   - ${user.username} (${user.role}): isActive = ${user.isActive}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during user migration:', error);
        process.exit(1);
    }
}

// Run the migration
migrateUserActiveStatus();
