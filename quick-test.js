import fs from 'fs';
import path from 'path';

async function quickIntegrityTest() {
    try {
        console.log('🧪 Quick integrity test after server restart...');

        // Create test image
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

        const testImagePath = path.join(process.cwd(), 'uploads', 'quick-test.png');
        fs.writeFileSync(testImagePath, testImageBuffer);

        console.log('📄 Original checksum:', testImageBuffer.toString('hex').substring(0, 32) + '...');

        // Upload the file
        const FormData = (await import('form-data')).default;
        const fetch = (await import('node-fetch')).default;

        const formData = new FormData();
        formData.append('teamName', 'QuickTest' + Math.floor(Math.random() * 1000));
        formData.append('game', 'valorant');
        formData.append('captainEmail', 'test@email.com');
        formData.append('captainPhone', '1234567890');

        for (let i = 1; i <= 5; i++) {
            formData.append(`player${i}Name`, `Player${i}`);
            formData.append(`player${i}GamingId`, `Gaming${i}`);
            formData.append(`player${i}ValorantId`, `Valorant${i}#1234`);
        }

        formData.append('bankSlip', fs.createReadStream(testImagePath), {
            filename: 'quick-test.png',
            contentType: 'image/png'
        });

        console.log('⬆️  Uploading...');
        const uploadResponse = await fetch('http://localhost:5000/api/teams', {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            console.log('❌ Upload failed');
            return false;
        }

        const uploadResult = await uploadResponse.json();
        console.log('✅ Upload successful');

        // Download the file
        console.log('⬇️  Downloading...');
        const downloadResponse = await fetch(`http://localhost:5000/api/files/${uploadResult._id}/bank-slip`);

        if (!downloadResponse.ok) {
            console.log('❌ Download failed');
            return false;
        }

        const downloadedBuffer = Buffer.from(await downloadResponse.arrayBuffer());
        console.log('📄 Downloaded checksum:', downloadedBuffer.toString('hex').substring(0, 32) + '...');

        // Compare files
        const isIdentical = testImageBuffer.equals(downloadedBuffer);

        if (isIdentical) {
            console.log('✅ SUCCESS: Files are identical! File corruption issue is FIXED!');
        } else {
            console.log('❌ FAILED: Files are still different');
            console.log('Original length:', testImageBuffer.length);
            console.log('Downloaded length:', downloadedBuffer.length);
        }

        // Clean up
        fs.unlinkSync(testImagePath);

        return isIdentical;

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

quickIntegrityTest();
