import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test function to check bank slip upload
async function testBankSlipUpload() {
    try {
        // Create a simple test image file (1x1 PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
            0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
            0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00,
            0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        // Save test image to uploads folder
        const testImagePath = path.join(__dirname, 'uploads', 'test-bank-slip.png');
        fs.writeFileSync(testImagePath, testImageBuffer);

        console.log('✅ Test image created:', testImagePath);

        // Create FormData to test the upload

        const formData = new FormData();

        // Add team data
        const teamName = 'Test' + Math.floor(Math.random() * 1000);
        formData.append('teamName', teamName);
        formData.append('game', 'valorant');
        formData.append('captainEmail', 'test@email.com');
        formData.append('captainPhone', '1234567890');

        // Add player data
        for (let i = 1; i <= 5; i++) {
            formData.append(`player${i}Name`, `Player${i}`);
            formData.append(`player${i}GamingId`, `Gaming${i}`);
            formData.append(`player${i}ValorantId`, `Valorant${i}#1234`);
        }

        // Add the bank slip file
        formData.append('bankSlip', fs.createReadStream(testImagePath), {
            filename: 'test-bank-slip.png',
            contentType: 'image/png'
        });

        // Send request to the server
        const response = await fetch('http://localhost:5000/api/teams', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Team registration successful!');
            console.log('Team ID:', result._id);
            console.log('Bank slip stored:', result.bankSlipFileId ? 'Yes (GridFS)' : 'No');

            // Clean up test file
            fs.unlinkSync(testImagePath);

            return true;
        } else {
            console.log('❌ Team registration failed:');
            console.log('Status:', response.status);
            console.log('Error:', result);

            // Clean up test file
            fs.unlinkSync(testImagePath);

            return false;
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        return false;
    }
}

// Run the test
console.log('🧪 Testing bank slip upload functionality...');
testBankSlipUpload().then(success => {
    if (success) {
        console.log('✅ All tests passed! Bank slip upload is working correctly.');
    } else {
        console.log('❌ Tests failed! Please check the implementation.');
    }
    process.exit(success ? 0 : 1);
});
