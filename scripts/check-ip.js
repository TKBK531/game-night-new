#!/usr/bin/env node

// Quick script to check your current public IP address
// Run with: node scripts/check-ip.js

import https from 'https';

console.log('🔍 Checking your current public IP address...\n');

// Method 1: ipify.org
https.get('https://api.ipify.org?format=json', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('📍 Your current public IP address is:', result.ip);
            console.log('\n📋 Steps to whitelist this IP in MongoDB Atlas:');
            console.log('1. Go to https://cloud.mongodb.com/');
            console.log('2. Navigate to Network Access');
            console.log('3. Click "Add IP Address"');
            console.log('4. Enter:', result.ip);
            console.log('5. Add a description like "Development Machine"');
            console.log('6. Click "Confirm"');
            console.log('\n⏳ Wait 1-2 minutes for changes to take effect, then try npm run dev again.');
        } catch (e) {
            console.error('Error parsing IP response:', e);
        }
    });
}).on('error', (err) => {
    console.error('Error getting IP address:', err.message);
    console.log('\n🌐 You can also check your IP manually at: https://whatismyipaddress.com/');
});
