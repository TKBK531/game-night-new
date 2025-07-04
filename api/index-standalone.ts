import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";

// Environment validation
if (!process.env.MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI environment variable");
}
if (!process.env.SESSION_SECRET) {
  console.error("❌ Missing SESSION_SECRET environment variable");
}

// MongoDB connection function
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

// Validation schemas
const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const insertTeamSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  game: z.enum(["valorant", "cod"], {
    message: "Game must be 'valorant' or 'cod'",
  }),
  captainEmail: z.string().email("Invalid email format"),
  captainPhone: z.string().min(1, "Captain phone is required"),
  player1Name: z.string().min(1, "Player 1 name is required"),
  player1GamingId: z.string().min(1, "Player 1 gaming ID is required"),
  player1ValorantId: z.string().optional(),
  player2Name: z.string().min(1, "Player 2 name is required"),
  player2GamingId: z.string().min(1, "Player 2 gaming ID is required"),
  player2ValorantId: z.string().optional(),
  player3Name: z.string().min(1, "Player 3 name is required"),
  player3GamingId: z.string().min(1, "Player 3 gaming ID is required"),
  player3ValorantId: z.string().optional(),
  player4Name: z.string().min(1, "Player 4 name is required"),
  player4GamingId: z.string().min(1, "Player 4 gaming ID is required"),
  player4ValorantId: z.string().optional(),
  player5Name: z.string().min(1, "Player 5 name is required"),
  player5GamingId: z.string().min(1, "Player 5 gaming ID is required"),
  player5ValorantId: z.string().optional(),
});

const insertGameScoreSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  score: z.string().min(1, "Score is required"),
  gameType: z.string().min(1, "Game type is required"),
});

// MongoDB Schemas
const TeamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  game: { type: String, enum: ["valorant", "cod"], required: true },
  captainEmail: { type: String, required: true },
  captainPhone: { type: String, required: true },
  player1Name: { type: String, required: true },
  player1GamingId: { type: String, required: true },
  player1ValorantId: { type: String },
  player2Name: { type: String, required: true },
  player2GamingId: { type: String, required: true },
  player2ValorantId: { type: String },
  player3Name: { type: String, required: true },
  player3GamingId: { type: String, required: true },
  player3ValorantId: { type: String },
  player4Name: { type: String, required: true },
  player4GamingId: { type: String, required: true },
  player4ValorantId: { type: String },
  player5Name: { type: String, required: true },
  player5GamingId: { type: String, required: true },
  player5ValorantId: { type: String },
  bankSlipFileId: { type: mongoose.Schema.Types.ObjectId },
  bankSlipFileName: { type: String },
  bankSlipContentType: { type: String },
  registeredAt: { type: Date, default: Date.now },
});

const GameScoreSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  score: { type: String, required: true },
  gameType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "superuser", "elite_board", "top_board"],
    default: "admin",
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

// Models
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
const GameScore =
  mongoose.models.GameScore || mongoose.model("GameScore", GameScoreSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// Storage class implementation
class MongoDBStorage {
  async createTeam(teamData: any) {
    await connectToDatabase();
    const team = new Team(teamData);
    await team.save();
    return team;
  }

  async teamExists(teamName: string): Promise<boolean> {
    await connectToDatabase();
    const team = await Team.findOne({
      teamName: { $regex: new RegExp(`^${teamName}$`, "i") },
    });
    return !!team;
  }

  async getTeamStats() {
    await connectToDatabase();
    const totalTeams = await Team.countDocuments({});
    const valorantTeams = await Team.countDocuments({ game: "valorant" });
    const codTeams = await Team.countDocuments({ game: "cod" });

    return {
      totalTeams,
      valorantTeams,
      codTeams,
    };
  }

  async getAllTeams() {
    await connectToDatabase();
    const teams = await Team.find({}).sort({ registeredAt: -1 });
    return teams;
  }

  async deleteTeam(teamId: string) {
    await connectToDatabase();
    await Team.findByIdAndDelete(teamId);
  }

  async createGameScore(scoreData: any) {
    await connectToDatabase();
    const gameScore = new GameScore(scoreData);
    await gameScore.save();
    return gameScore;
  }

  async getLeaderboard(gameType: string) {
    await connectToDatabase();
    const scores = await GameScore.find({ gameType })
      .sort({ score: 1 }) // Ascending order for reaction time (lower is better)
      .limit(20);
    return scores;
  }

  async getAllScores() {
    await connectToDatabase();
    const scores = await GameScore.find({}).sort({ createdAt: -1 });
    return scores;
  }

  async deleteGameScore(scoreId: string) {
    await connectToDatabase();
    await GameScore.findByIdAndDelete(scoreId);
  }

  async authenticateUser(credentials: any) {
    await connectToDatabase();
    const { username, password } = credentials;

    const user = await User.findOne({ username });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async updateLastLogin(userId: string) {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  async getAllUsers() {
    await connectToDatabase();
    const users = await User.find({}).select("-password");
    return users;
  }

  async deleteUser(userId: string) {
    await connectToDatabase();
    await User.findByIdAndDelete(userId);
  }

  async getFiles() {
    await connectToDatabase();
    const teams = await Team.find({
      bankSlipFileId: { $exists: true, $ne: null },
    }).select(
      "teamName bankSlipFileId bankSlipFileName bankSlipContentType registeredAt"
    );

    return teams.map((team) => ({
      _id: team.bankSlipFileId,
      filename: team.bankSlipFileName,
      contentType: team.bankSlipContentType,
      teamName: team.teamName,
      uploadedAt: team.registeredAt,
    }));
  }

  async getFileById(fileId: string) {
    // This would need GridFS implementation for file retrieval
    // For now, return null
    return null;
  }
}

// Initialize storage
const storage = new MongoDBStorage();

// Token-based authentication functions
function generateToken(user: any): string {
  const secret = process.env.SESSION_SECRET || "game-night-secret-key";
  const payload = JSON.stringify({
    _id: user._id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const signature = hmac.digest("hex");

  return Buffer.from(payload).toString("base64") + "." + signature;
}

function verifyToken(token: string): any | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const payload = Buffer.from(payloadB64, "base64").toString();

    const secret = process.env.SESSION_SECRET || "game-night-secret-key";
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) return null;

    const data = JSON.parse(payload);

    if (Date.now() > data.exp) return null;

    return data;
  } catch (error) {
    return null;
  }
}

function getTokenFromRequest(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenMatch = cookies.match(/token=([^;]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("API endpoint hit:", req.url, req.method);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  const token = getTokenFromRequest(req);

  try {
    // Health check endpoint
    if (url?.includes("/health")) {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: process.env.MONGODB_URI ? "configured" : "missing",
        sessionSecret: process.env.SESSION_SECRET ? "configured" : "missing",
      });
      return;
    }

    // Debug endpoint
    if (url?.includes("/debug")) {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: {
          configured: !!process.env.MONGODB_URI,
          connected: mongoose.connection.readyState === 1,
        },
        nodeVersion: process.version,
        url,
        method,
      });
      return;
    }

    // Admin login endpoint
    if (url?.includes("/admin/login") && method === "POST") {
      try {
        const validatedData = loginUserSchema.parse(req.body);
        const user = await storage.authenticateUser(validatedData);

        if (!user) {
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        if (!user.isActive) {
          return res.status(401).json({ message: "Account is deactivated" });
        }

        await storage.updateLastLogin(user._id);

        const authToken = generateToken({
          _id: user._id,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
        });

        res.setHeader(
          "Set-Cookie",
          `token=${authToken}; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict`
        );
        res.status(200).json({
          message: "Login successful",
          user: {
            _id: user._id,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
          },
          token: authToken,
        });
        return;
      } catch (error) {
        console.error("Admin login error:", error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid input data" });
        }
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    // Admin me endpoint
    if (url?.includes("/admin/me") && method === "GET") {
      if (!token) {
        return res.status(401).json({ message: "No token found" });
      }

      const userSession = verifyToken(token);
      if (!userSession) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      res.status(200).json({ user: userSession });
      return;
    }

    // Admin logout endpoint
    if (url?.includes("/admin/logout") && method === "POST") {
      res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly; Max-Age=0");
      res.status(200).json({ message: "Logout successful" });
      return;
    }

    // Team registration endpoint
    if (url?.includes("/teams") && method === "POST") {
      try {
        const validatedData = insertTeamSchema.parse(req.body);
        const team = await storage.createTeam(validatedData);
        res.status(201).json(team);
        return;
      } catch (error) {
        console.error("Error in POST /api/teams:", error);
        if (error instanceof z.ZodError) {
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
          return res.status(400).json({
            message: "Please fix the following errors:",
            errors: formattedErrors,
          });
        }
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    // Teams check endpoint
    if (url?.includes("/teams/check/") && method === "GET") {
      const teamName = url.split("/teams/check/")[1];
      try {
        const exists = await storage.teamExists(teamName);
        res.status(200).json({ exists });
        return;
      } catch (error) {
        console.error("Error checking team:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Teams stats endpoint
    if (url?.includes("/teams/stats") && method === "GET") {
      try {
        await connectToDatabase();
        const valorantCount = await Team.countDocuments({ game: "valorant" });
        const codCount = await Team.countDocuments({ game: "cod" });

        const stats = {
          valorant: { registered: valorantCount, total: 32 },
          cod: { registered: codCount, total: 32 },
        };

        res.status(200).json(stats);
        return;
      } catch (error) {
        console.error("Error getting team stats:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Game scores endpoint
    if (url?.includes("/game-scores") && method === "POST") {
      try {
        const validatedData = insertGameScoreSchema.parse(req.body);
        const gameScore = await storage.createGameScore(validatedData);
        res.status(201).json(gameScore);
        return;
      } catch (error) {
        console.error("Error in POST /api/game-scores:", error);
        if (error instanceof z.ZodError) {
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
          return res.status(400).json({
            message: "Please fix the following errors:",
            errors: formattedErrors,
          });
        }
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    // Leaderboard endpoint
    if (url?.includes("/game-scores/leaderboard/") && method === "GET") {
      const gameType = url.split("/leaderboard/")[1];
      try {
        const scores = await storage.getLeaderboard(gameType);
        res.status(200).json(scores);
        return;
      } catch (error) {
        console.error("Error getting leaderboard:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Public file access endpoint (for bank slip preview/download)
    if (url?.match(/\/files\/[a-fA-F0-9]{24}/) && method === "GET") {
      // For the standalone API, we don't have full GridFS implementation
      // So we'll return a not implemented response
      return res.status(501).json({
        message: "File access not implemented in standalone mode",
      });
    }

    // Admin teams endpoint
    if (url?.includes("/admin/teams") && method === "GET" && token) {
      const userSession = verifyToken(token);
      if (
        !userSession ||
        !["admin", "superuser", "elite_board"].includes(userSession.role)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      try {
        const teams = await storage.getAllTeams();
        res.status(200).json(teams);
        return;
      } catch (error) {
        console.error("Error getting teams:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Admin scores endpoint
    if (url?.includes("/admin/scores") && method === "GET" && token) {
      const userSession = verifyToken(token);
      if (
        !userSession ||
        !["admin", "superuser", "elite_board"].includes(userSession.role)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      try {
        const scores = await storage.getAllScores();
        res.status(200).json(scores);
        return;
      } catch (error) {
        console.error("Error getting scores:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Admin users endpoint
    if (url?.includes("/admin/users") && token) {
      const userSession = verifyToken(token);
      if (
        !userSession ||
        !["superuser", "elite_board"].includes(userSession.role)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      if (method === "GET") {
        try {
          const users = await storage.getAllUsers();
          res.status(200).json(users);
          return;
        } catch (error) {
          console.error("Error getting users:", error);
          res.status(500).json({ message: "Internal server error" });
          return;
        }
      }
    }

    // Delete team endpoint
    if (
      url?.match(/\/admin\/teams\/[a-fA-F0-9]{24}$/) &&
      method === "DELETE" &&
      token
    ) {
      const userSession = verifyToken(token);
      if (
        !userSession ||
        !["admin", "superuser", "elite_board"].includes(userSession.role)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const teamId = url.split("/admin/teams/")[1];
      try {
        await storage.deleteTeam(teamId);
        res.status(200).json({ message: "Team deleted successfully" });
        return;
      } catch (error) {
        console.error("Error deleting team:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Delete score endpoint
    if (
      url?.match(/\/admin\/scores\/[a-fA-F0-9]{24}$/) &&
      method === "DELETE" &&
      token
    ) {
      const userSession = verifyToken(token);
      if (
        !userSession ||
        !["admin", "superuser", "elite_board"].includes(userSession.role)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const scoreId = url.split("/admin/scores/")[1];
      try {
        await storage.deleteGameScore(scoreId);
        res.status(200).json({ message: "Score deleted successfully" });
        return;
      } catch (error) {
        console.error("Error deleting score:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Delete user endpoint
    if (
      url?.match(/\/admin\/users\/[a-fA-F0-9]{24}$/) &&
      method === "DELETE" &&
      token
    ) {
      const userSession = verifyToken(token);
      if (!userSession || userSession.role !== "superuser") {
        return res
          .status(403)
          .json({ message: "Only superuser can delete users" });
      }

      const userId = url.split("/admin/users/")[1];
      try {
        await storage.deleteUser(userId);
        res.status(200).json({ message: "User deleted successfully" });
        return;
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Default response for unmatched routes
    res.status(404).json({
      error: "API endpoint not found",
      availableEndpoints: [
        "/api/health (GET)",
        "/api/debug (GET)",
        "/api/admin/login (POST)",
        "/api/admin/me (GET)",
        "/api/admin/logout (POST)",
        "/api/admin/teams (GET)",
        "/api/admin/scores (GET)",
        "/api/admin/users (GET)",
        "/api/admin/teams/:id (DELETE)",
        "/api/admin/scores/:id (DELETE)",
        "/api/admin/users/:id (DELETE)",
        "/api/teams (POST)",
        "/api/teams/check/:teamName (GET)",
        "/api/teams/stats (GET)",
        "/api/game-scores (POST)",
        "/api/game-scores/leaderboard/:gameType (GET)",
        "/api/files/:id (GET)",
      ],
      requestedUrl: url,
      method: method,
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error instanceof Error
          ? error.message
          : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
