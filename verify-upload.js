import { connectToDatabase } from './server/mongodb.ts';
import { Team } from './shared/mongo-schema.ts';

async function checkBankSlipStorage() {
    try {
        await connectToDatabase();

        // Find the most recent team
        const team = await Team.findOne().sort({ registeredAt: -1 });

        if (team) {
            console.log('✅ Found team:', team.teamName);
            console.log('🏦 Bank slip file ID:', team.bankSlipFileId);
            console.log('📁 Bank slip filename:', team.bankSlipFileName);
            console.log('📄 Bank slip content type:', team.bankSlipContentType);
            console.log('📅 Registered at:', team.registeredAt);

            if (team.bankSlipFileId) {
                console.log('✅ Bank slip is properly stored in GridFS!');
            } else {
                console.log('❌ Bank slip is NOT stored in GridFS!');
            }
        } else {
            console.log('❌ No teams found in database');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking bank slip storage:', error);
        process.exit(1);
    }
}

checkBankSlipStorage();
