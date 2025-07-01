# MongoDB Atlas Setup Instructions
# 
# 1. Go to https://cloud.mongodb.com/
# 2. Navigate to Database Access → Add New Database User
# 3. Create user with "Read and write to any database" permissions
# 4. Navigate to Network Access → Add IP Address (add your current IP or 0.0.0.0/0 for testing)
# 5. Navigate to Database → Connect → Connect your application
# 6. Copy the connection string and replace the values below

# Template MongoDB URI:
# mongodb+srv://<username>:<password>@cluster0.aqzc6cg.mongodb.net/<database>?retryWrites=true&w=majority&appName=Cluster0

# Example with your cluster:
# MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.aqzc6cg.mongodb.net/game-night-db?retryWrites=true&w=majority&appName=Cluster0

# Common issues:
# - Username/password contains special characters that need URL encoding
# - User doesn't exist or doesn't have proper permissions
# - IP address not whitelisted
# - Database name missing from URI
