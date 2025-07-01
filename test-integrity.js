import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testFileIntegrity() {
    try {
        console.log('🧪 Testing file upload and download integrity...');

        // Create a test image file (1x1 PNG)
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

        const testImagePath = path.join(__dirname, 'uploads', 'test-integrity.png');
        fs.writeFileSync(testImagePath, testImageBuffer);

        console.log('✅ Original file created, size:', testImageBuffer.length, 'bytes');
        console.log('📄 Original file checksum:', Buffer.from(testImageBuffer).toString('hex').substring(0, 32) + '...');

        // Upload the file
        const FormData = (await import('form-data')).default;
        const fetch = (await import('node-fetch')).default;

        const formData = new FormData();

        // Add team data
        const teamName = 'TestIntegrity' + Math.floor(Math.random() * 1000);
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
            filename: 'test-integrity.png',
            contentType: 'image/png'
        });

        // Upload the file
        console.log('⬆️  Uploading file...');
        const uploadResponse = await fetch('http://localhost:5000/api/teams', {
            method: 'POST',
            body: formData
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
            console.log('❌ Upload failed:', uploadResult);
            return false;
        }

        console.log('✅ Upload successful, team ID:', uploadResult._id);

        // Download the file
        console.log('⬇️  Downloading file...');
        const downloadResponse = await fetch(`http://localhost:5000/api/files/${uploadResult._id}/bank-slip`);

        if (!downloadResponse.ok) {
            console.log('❌ Download failed:', downloadResponse.status);
            return false;
        }

        const downloadedBuffer = Buffer.from(await downloadResponse.arrayBuffer());

        console.log('✅ Download successful, size:', downloadedBuffer.length, 'bytes');
        console.log('📄 Downloaded file checksum:', downloadedBuffer.toString('hex').substring(0, 32) + '...');

        // Compare files
        const originalHex = testImageBuffer.toString('hex');
        const downloadedHex = downloadedBuffer.toString('hex');

        if (originalHex === downloadedHex) {
            console.log('✅ File integrity test PASSED - Files are identical!');

            // Save downloaded file for manual inspection
            const downloadedPath = path.join(__dirname, 'downloads', 'test-downloaded.png');
            fs.mkdirSync(path.dirname(downloadedPath), { recursive: true });
            fs.writeFileSync(downloadedPath, downloadedBuffer);
            console.log('💾 Downloaded file saved to:', downloadedPath);

            return true;
        } else {
            console.log('❌ File integrity test FAILED - Files are different!');
            console.log('Original length:', testImageBuffer.length);
            console.log('Downloaded length:', downloadedBuffer.length);

            // Find first difference
            for (let i = 0; i < Math.min(testImageBuffer.length, downloadedBuffer.length); i++) {
                if (testImageBuffer[i] !== downloadedBuffer[i]) {
                    console.log(`First difference at byte ${i}: original=${testImageBuffer[i]}, downloaded=${downloadedBuffer[i]}`);
                    break;
                }
            }

            // Save both files for comparison
            const downloadsDir = path.join(__dirname, 'downloads');
            fs.mkdirSync(downloadsDir, { recursive: true });
            fs.writeFileSync(path.join(downloadsDir, 'original.png'), testImageBuffer);
            fs.writeFileSync(path.join(downloadsDir, 'downloaded.png'), downloadedBuffer);
            console.log('💾 Both files saved to downloads/ folder for manual comparison');

            return false;
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        return false;
    } finally {
        // Clean up test file
        try {
            const testImagePath = path.join(__dirname, 'uploads', 'test-integrity.png');
            if (fs.existsSync(testImagePath)) {
                fs.unlinkSync(testImagePath);
            }
        } catch (e) {
            console.warn('Warning: Could not clean up test file');
        }
    }
}

// Run the test
testFileIntegrity().then(success => {
    if (success) {
        console.log('🎉 File integrity test completed successfully!');
    } else {
        console.log('💥 File integrity test failed!');
    }
    process.exit(success ? 0 : 1);
});
