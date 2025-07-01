# MongoDB Atlas Setup Guide

This guide will walk you through setting up MongoDB Atlas for your ProcurementPro website and migrating from PostgreSQL.

## Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**: Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Sign up**: Create a free account with your email
3. **Verify email**: Check your email and verify your account

## Step 2: Create a New Cluster

1. **Create a New Project**:
   - Click "New Project"
   - Name it "ProcurementPro" (or any name you prefer)
   - Click "Create Project"

2. **Build a Database**:
   - Click "Build a Database"
   - Choose "M0 (Free)" tier
   - Select a cloud provider (AWS recommended)
   - Choose a region close to your users
   - Name your cluster "Cluster0" (default)
   - Click "Create"

3. **Wait for Creation**: This takes 1-3 minutes

## Step 3: Configure Database Access

1. **Create Database User**:
   - In the Security section, click "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `procurementpro_user` (or your choice)
   - Generate a secure password and **save it somewhere safe**
   - Set privileges to "Read and write to any database"
   - Click "Add User"

2. **Set Network Access**:
   - Click "Network Access" in the Security section
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific server IP addresses
   - Click "Confirm"

## Step 4: Get Connection String

1. **Connect to Cluster**:
   - Go to "Database" section
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string

2. **Example Connection String**:
   ```
   mongodb+srv://procurementpro_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Update Environment Variables

1. **Create/Update .env file** in your project root:
   ```bash
   # Database Configuration - MongoDB Atlas
   MONGODB_URI=mongodb+srv://procurementpro_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/procurementpro?retryWrites=true&w=majority

   # Environment
   NODE_ENV=development

   # Session (generate a secure random string)
   SESSION_SECRET=your-super-secure-session-secret-here-make-it-long-and-random

   # Application
   PORT=3000

   # Cloudinary Configuration (for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

2. **Important Notes**:
   - Replace `YOUR_PASSWORD` with the actual password you created
   - Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
   - Add `/procurementpro` before the `?` to specify the database name
   - Keep your password secure and never commit it to version control

## Step 6: Test the Connection

1. **Test Database Connection**:
   ```powershell
   npm run db:test
   ```

2. **Expected Output**:
   ```
   Testing MongoDB connection...
   MONGODB_URI: Set ✅
   🎉 MongoDB connection successful!
   ```

3. **If Connection Fails**:
   - Check your MONGODB_URI format
   - Verify username and password
   - Ensure your IP is whitelisted in Network Access
   - Check if the cluster is running

## Step 7: Start Your Application

1. **Install Dependencies** (if not already done):
   ```powershell
   npm install
   ```

2. **Start Development Server**:
   ```powershell
   npm run dev
   ```

3. **Test API Endpoints**:
   - Health Check: `http://localhost:3000/api/health`
   - Database Test: `http://localhost:3000/api/test-db`

## Step 8: Verify Everything Works

1. **Test Team Registration**:
   - Go to your website
   - Try registering a team
   - Upload a bank slip
   - Check if data is saved

2. **Test Game Scores**:
   - Play the reaction game
   - Submit a score
   - Check the leaderboard

3. **Check Database in Atlas**:
   - Go to MongoDB Atlas Dashboard
   - Click "Browse Collections"
   - You should see "teams" and "gamescores" collections

## Production Deployment

### For Vercel:
1. **Add Environment Variable**:
   - Go to your Vercel project dashboard
   - Click "Settings" → "Environment Variables"
   - Add `MONGODB_URI` with your connection string
   - Make sure to select all environments (Development, Preview, Production)

### For Other Hosting:
1. **Set Environment Variables**:
   - Add `MONGODB_URI` to your hosting platform's environment variables
   - Ensure the MongoDB cluster allows connections from your hosting provider's IP ranges

## Security Best Practices

1. **Network Access**:
   - For production: Only allow specific IP addresses
   - Avoid using "Allow Access from Anywhere" in production

2. **Database User**:
   - Use specific database users for each environment
   - Grant minimal required permissions

3. **Connection String**:
   - Never commit connection strings to version control
   - Use environment variables for all sensitive data

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**:
   - Check username and password in connection string
   - Verify user exists in Database Access

2. **"Connection timeout"**:
   - Check Network Access whitelist
   - Verify cluster is running

3. **"Database not found"**:
   - Ensure database name is specified in connection string
   - MongoDB will create the database automatically when first data is inserted

4. **"Too many connections"**:
   - Free tier has connection limits
   - Check for connection leaks in your code

### Getting Help:
- MongoDB Atlas Documentation: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- MongoDB Community Forums: [https://community.mongodb.com/](https://community.mongodb.com/)

## Migration Complete! 🎉

Your website is now using MongoDB Atlas instead of PostgreSQL. The migration includes:

- ✅ Team registration with MongoDB storage
- ✅ Game score tracking
- ✅ File uploads to Cloudinary (unchanged)
- ✅ All API endpoints working with MongoDB
- ✅ Proper error handling and validation
- ✅ Connection pooling and caching

Your data structure remains the same, but now uses MongoDB's flexible document storage instead of PostgreSQL's relational structure.
