# MongoDB Atlas IP Whitelist Fix

## Problem
Your current IP address is not whitelisted in MongoDB Atlas, preventing database connections.

## Solution Steps

### Option 1: Add Your Current IP Address
1. **Find Your Current IP Address**:
   - Go to https://whatismyipaddress.com/
   - Note down your public IP address

2. **Access MongoDB Atlas**:
   - Go to https://cloud.mongodb.com/
   - Log in to your MongoDB Atlas account
   - Select your cluster

3. **Configure Network Access**:
   - Click on "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Add your current public IP address
   - Or click "Add Current IP Address" for automatic detection
   - Add a description like "Development Machine"
   - Click "Confirm"

### Option 2: Allow Access from Anywhere (Development Only)
⚠️ **Warning**: Only use this for development/testing environments!

1. In MongoDB Atlas Network Access:
   - Click "Add IP Address"
   - Enter `0.0.0.0/0` as the IP address
   - Add description "Allow All (Development)"
   - Click "Confirm"

### Option 3: Use MongoDB Atlas Connection String Builder
1. In your MongoDB Atlas cluster:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the updated connection string
   - Replace the connection string in your `.env` file

## Verify Connection String Format
Make sure your `.env` file has the correct format:

```
MONGODB_URI=mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority
```

Replace:
- `username`: Your MongoDB Atlas username
- `password`: Your MongoDB Atlas password (URL encoded)
- `cluster-name.xxxxx.mongodb.net`: Your cluster endpoint
- `database-name`: Your database name (e.g., "tournament" or "gamenight")

## Test Connection
After updating IP whitelist, restart your application:
```bash
npm run dev
```

## Additional Notes
- IP whitelist changes can take 1-2 minutes to take effect
- If you have a dynamic IP, you may need to update this periodically
- For production, use specific IP addresses rather than allowing all IPs
