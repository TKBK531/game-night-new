import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";
import { IncomingForm } from "formidable";
import { GridFSBucket, ObjectId } from "mongodb";
import * as fs from "fs";
import { siteConfig } from "../shared/config";

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
  player1UniversityEmail: z
    .string()
    .email("Invalid email format")
    .refine((email) => email.endsWith("pdn.ac.lk"), {
      message: "University email must end with pdn.ac.lk",
    }),
  player1ValorantId: z.string().optional(),
  player2Name: z.string().min(1, "Player 2 name is required"),
  player2GamingId: z.string().min(1, "Player 2 gaming ID is required"),
  player2UniversityEmail: z
    .string()
    .email("Invalid email format")
    .refine((email) => email.endsWith("pdn.ac.lk"), {
      message: "University email must end with pdn.ac.lk",
    }),
  player2ValorantId: z.string().optional(),
  player3Name: z.string().min(1, "Player 3 name is required"),
  player3GamingId: z.string().min(1, "Player 3 gaming ID is required"),
  player3UniversityEmail: z
    .string()
    .email("Invalid email format")
    .refine((email) => email.endsWith("pdn.ac.lk"), {
      message: "University email must end with pdn.ac.lk",
    }),
  player3ValorantId: z.string().optional(),
  player4Name: z.string().min(1, "Player 4 name is required"),
  player4GamingId: z.string().min(1, "Player 4 gaming ID is required"),
  player4UniversityEmail: z
    .string()
    .email("Invalid email format")
    .refine((email) => email.endsWith("pdn.ac.lk"), {
      message: "University email must end with pdn.ac.lk",
    }),
  player4ValorantId: z.string().optional(),
  player5Name: z.string().min(1, "Player 5 name is required"),
  player5GamingId: z.string().min(1, "Player 5 gaming ID is required"),
  player5UniversityEmail: z
    .string()
    .email("Invalid email format")
    .refine((email) => email.endsWith("pdn.ac.lk"), {
      message: "University email must end with pdn.ac.lk",
    }),
  player5ValorantId: z.string().optional(),
  // Make bank slip optional since the frontend might not always send it
  bankSlip: z.any().optional(),
});

const insertGameScoreSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  score: z.string().min(1, "Score is required"),
  gameType: z.string().min(1, "Game type is required"),
});

const insertSecretChallengeSchema = z.object({
  playerEmail: z.string()
    .email("Please enter a valid email address")
    .min(5, "Email too short")
    .max(100, "Email too long")
    .refine((email) => email.endsWith("pdn.ac.lk"), {
      message: "Only PDN university emails (ending with pdn.ac.lk) are allowed for this challenge",
    }),
  score: z.number().min(0, "Score must be a positive number").max(2000, "Score seems too high"),
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
  // New fields for COD queue system
  status: {
    type: String,
    required: true,
    enum: ["confirmed", "queued", "approved", "rejected"],
    default: "confirmed", // Default to confirmed for backward compatibility
  },
  queuedAt: { type: Date },
  paymentDeadline: { type: Date },
  approvedBy: { type: String },
  approvedAt: { type: Date },
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

const SecretChallengeSchema = new mongoose.Schema({
  playerEmail: { type: String, required: true, unique: true },
  score: { type: Number, required: true, min: 0 },
  completedAt: { type: Date, default: Date.now },
});

const LeaderboardScoreSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  teamName: { type: String, required: true },
  game: { type: String, required: true, enum: ['valorant', 'cod'] },
  score: { type: Number, required: true, default: 0 },
  matchesWon: { type: Number, default: 0 },
  matchesLost: { type: Number, default: 0 },
  totalMatches: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: String, required: true }
}, { timestamps: true });

const MatchSchema = new mongoose.Schema({
  game: { type: String, required: true, enum: ['valorant', 'cod'] },
  team1Id: { type: String, required: true },
  team1Name: { type: String, required: true },
  team2Id: { type: String, required: true },
  team2Name: { type: String, required: true },
  status: { type: String, required: true, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
  scheduledTime: { type: Date, required: true },
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },
  team1Score: { type: Number },
  team2Score: { type: Number },
  winnerId: { type: String },
  winnerName: { type: String },
  round: { type: String },
  createdBy: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Models
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
const GameScore =
  mongoose.models.GameScore || mongoose.model("GameScore", GameScoreSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const SecretChallenge = mongoose.models.SecretChallenge || mongoose.model("SecretChallenge", SecretChallengeSchema);
const LeaderboardScore = mongoose.models.LeaderboardScore || mongoose.model("LeaderboardScore", LeaderboardScoreSchema);
const Match = mongoose.models.Match || mongoose.model("Match", MatchSchema);

// Storage class implementation
class MongoDBStorage {
  async createTeam(
    teamData: any,
    fileBuffer?: Buffer,
    fileName?: string,
    contentType?: string
  ) {
    await connectToDatabase();

    let teamDoc = { ...teamData };

    // Handle file upload to GridFS if file data is provided
    if (fileBuffer && fileName && contentType) {
      console.log("Uploading bank slip to GridFS...");

      // Validate file type
      if (!validateBankSlipFile(contentType, fileName)) {
        throw new Error(
          "Invalid file type. Only images (JPEG, PNG, GIF, BMP, WebP) and PDF files are allowed."
        );
      }

      try {
        // Generate clean filename
        const timestamp = Date.now();
        const cleanTeamName = teamData.teamName.replace(/[^a-zA-Z0-9]/g, "");
        const extension = fileName.substring(fileName.lastIndexOf("."));
        const cleanFileName = `${cleanTeamName}-${timestamp}${extension}`;

        // Upload file to GridFS
        const fileId = await uploadFileToGridFS(
          fileBuffer,
          cleanFileName,
          contentType
        );

        // Store GridFS file information in team document
        teamDoc.bankSlipFileId = fileId;
        teamDoc.bankSlipFileName = cleanFileName;
        teamDoc.bankSlipContentType = contentType;

        console.log(`Bank slip uploaded successfully with ID: ${fileId}`);
      } catch (error) {
        console.error("Failed to upload bank slip file:", error);
        throw new Error("Failed to upload bank slip file");
      }
    }

    // Set team status based on game type and COD queue logic
    if (teamDoc.game === "cod") {
      // Check if COD queue is full
      const queuedCount = await Team.countDocuments({ game: "cod", status: "queued" });
      if (queuedCount >= 5) {
        throw new Error("COD registration queue is full. Please try again later.");
      }

      // Add to COD queue
      teamDoc.status = "queued";
      teamDoc.queuedAt = new Date();
    } else {
      // Valorant teams are confirmed immediately (with payment)
      teamDoc.status = "confirmed";
    }

    const team = new Team(teamDoc);
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
    console.log("Getting team stats...");

    const totalTeams = await Team.countDocuments({});
    const valorantTeams = await Team.countDocuments({ game: "valorant" });
    const codTeams = await Team.countDocuments({ game: "cod" });

    console.log("Team stats:", { totalTeams, valorantTeams, codTeams });

    return {
      totalTeams,
      valorantTeams,
      codTeams,
      csTeams: codTeams, // Also provide csTeams for backward compatibility
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

  // Secret challenge methods
  async createSecretChallenge(challengeData: any) {
    await connectToDatabase();

    // Check if player has already completed the challenge
    const existingChallenge = await SecretChallenge.findOne({
      playerEmail: challengeData.playerEmail
    });

    if (existingChallenge) {
      throw new Error("You have already completed this challenge!");
    }

    const secretChallenge = new SecretChallenge(challengeData);
    await secretChallenge.save();
    return secretChallenge;
  }

  async getSecretLeaderboard(limit: number = 10) {
    await connectToDatabase();
    const challenges = await SecretChallenge.find({})
      .sort({ score: -1, completedAt: 1 }) // Sort by highest score, then earliest completion
      .limit(limit);
    return challenges;
  }

  async hasPlayerCompletedSecret(email: string) {
    await connectToDatabase();
    const challenge = await SecretChallenge.findOne({ playerEmail: email });
    return !!challenge;
  }

  async getAllSecretChallenges() {
    await connectToDatabase();
    const challenges = await SecretChallenge.find({}).sort({ score: -1, completedAt: 1 });
    return challenges;
  }

  async deleteSecretChallenge(challengeId: string) {
    await connectToDatabase();
    await SecretChallenge.findByIdAndDelete(challengeId);
  }
}

// GridFS functions for file storage
let gridFSBucket: GridFSBucket | null = null;

async function getGridFSBucket(): Promise<GridFSBucket> {
  console.log("getGridFSBucket called");

  if (!gridFSBucket) {
    console.log("GridFS bucket not initialized, creating new one");
    await connectToDatabase();
    console.log("Database connected");

    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database connection not established");
      throw new Error("Database connection not established");
    }

    console.log("Creating GridFS bucket with database:", db.databaseName);
    gridFSBucket = new GridFSBucket(db, { bucketName: "bankSlips" });
    console.log("GridFS bucket created successfully");
  } else {
    console.log("Using existing GridFS bucket");
  }

  return gridFSBucket;
}

async function uploadFileToGridFS(
  fileBuffer: Buffer,
  filename: string,
  contentType: string
): Promise<ObjectId> {
  const bucket = await getGridFSBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType,
      metadata: {
        uploadDate: new Date(),
        originalName: filename,
      },
    });

    uploadStream.on("error", (error) => {
      console.error("GridFS upload error:", error);
      reject(error);
    });

    uploadStream.on("finish", () => {
      console.log(`File uploaded successfully with ID: ${uploadStream.id}`);
      resolve(uploadStream.id);
    });

    uploadStream.end(fileBuffer);
  });
}

async function downloadFileFromGridFS(
  fileId: string
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  console.log("downloadFileFromGridFS called with fileId:", fileId);

  try {
    const bucket = await getGridFSBucket();
    console.log("GridFS bucket obtained");

    const objectId = new ObjectId(fileId);
    console.log("ObjectId created:", objectId);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      const downloadStream = bucket.openDownloadStream(objectId);
      console.log("Download stream opened");

      downloadStream.on("data", (chunk) => {
        chunks.push(chunk);
        console.log("Received chunk, size:", chunk.length);
      });

      downloadStream.on("end", async () => {
        console.log("Download stream ended, total chunks:", chunks.length);
        try {
          const buffer = Buffer.concat(chunks);
          console.log("Buffer concatenated, total size:", buffer.length);

          // Get file info
          const files = await bucket.find({ _id: objectId }).toArray();
          console.log("Found files:", files.length);

          if (files.length === 0) {
            console.log("No files found with ID:", objectId);
            reject(new Error("File not found"));
            return;
          }

          const file = files[0];
          console.log("File metadata:", {
            filename: file.filename,
            contentType: file.contentType,
            length: file.length,
          });

          resolve({
            buffer,
            filename: file.filename,
            contentType: file.contentType || "application/octet-stream",
          });
        } catch (error) {
          console.error("Error in downloadStream.end handler:", error);
          reject(error);
        }
      });

      downloadStream.on("error", (error) => {
        console.error("Download stream error:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error in downloadFileFromGridFS:", error);
    throw error;
  }
}

function validateBankSlipFile(contentType: string, filename: string): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "application/pdf",
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".pdf",
  ];
  const fileExtension = filename
    .toLowerCase()
    .substring(filename.lastIndexOf("."));

  return (
    allowedTypes.includes(contentType.toLowerCase()) &&
    allowedExtensions.includes(fileExtension)
  );
}

// Helper function to parse form data
function parseFormData(
  req: VercelRequest
): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) {
        reject(err);
        return;
      }

      // Convert arrays to single values for simple fields
      const processedFields: any = {};
      Object.keys(fields).forEach((key) => {
        const value = fields[key];
        processedFields[key] = Array.isArray(value) ? value[0] : value;
      });

      resolve({ fields: processedFields, files });
    });
  });
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
    "Content-Type, Authorization, Cookie, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

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
    }    // Static image serving endpoints - fetch from GitHub
    if (url?.startsWith("/images/") && method === "GET") {
      try {
        // Extract the image path from the URL
        const imagePath = url.replace("/images/", "");

        // GitHub raw URL for the image
        const githubRawUrl = `https://raw.githubusercontent.com/TKBK531/game-night-new/leaderboard/images/${imagePath}`;

        console.log("Attempting to fetch image from GitHub:", githubRawUrl);

        // Fetch the image from GitHub
        const response = await fetch(githubRawUrl);

        if (!response.ok) {
          console.log("Image not found on GitHub:", githubRawUrl);
          res.status(404).json({ error: "Image not found" });
          return;
        }

        // Get the image buffer
        const imageBuffer = await response.arrayBuffer();

        // Determine content type based on file extension
        const ext = imagePath.toLowerCase().split('.').pop();
        let contentType = "image/jpeg"; // default
        switch (ext) {
          case "png": contentType = "image/png"; break;
          case "gif": contentType = "image/gif"; break;
          case "webp": contentType = "image/webp"; break;
          case "svg": contentType = "image/svg+xml"; break;
          case "ico": contentType = "image/x-icon"; break;
          case "jpg":
          case "jpeg":
          default: contentType = "image/jpeg"; break;
        }

        // Set headers and send file
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
        res.status(200);
        res.end(Buffer.from(imageBuffer));
        return;
      } catch (error) {
        console.error("Error serving image:", error);
        res.status(500).json({ error: "Error serving image" });
        return;
      }
    }    // Static uploads serving endpoints - try GitHub first, then GridFS
    if (url?.startsWith("/uploads/") && method === "GET") {
      try {
        // Extract the file path from the URL
        const filePath = url.replace("/uploads/", "");

        // First try to fetch from GitHub (for files committed to repo)
        const githubRawUrl = `https://raw.githubusercontent.com/TKBK531/game-night-new/leaderboard/uploads/${filePath}`;

        console.log("Attempting to fetch upload from GitHub:", githubRawUrl);

        try {
          const response = await fetch(githubRawUrl);

          if (response.ok) {
            // File found on GitHub
            const fileBuffer = await response.arrayBuffer();

            // Determine content type based on file extension
            const ext = filePath.toLowerCase().split('.').pop();
            let contentType = "application/octet-stream"; // default
            switch (ext) {
              case "pdf": contentType = "application/pdf"; break;
              case "png": contentType = "image/png"; break;
              case "jpg":
              case "jpeg": contentType = "image/jpeg"; break;
              case "gif": contentType = "image/gif"; break;
              case "webp": contentType = "image/webp"; break;
            }

            // Set headers and send file
            res.setHeader("Content-Type", contentType);
            res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
            res.status(200);
            res.end(Buffer.from(fileBuffer));
            return;
          }
        } catch (githubError) {
          console.log("File not found on GitHub, trying GridFS...");
        }

        // If not found on GitHub, try GridFS for user uploads
        // This would need GridFS implementation for file retrieval
        console.log("Upload not found:", filePath);
        res.status(404).json({ error: "File not found" });
        return;
      } catch (error) {
        console.error("Error serving upload:", error);
        res.status(500).json({ error: "Error serving file" });
        return;
      }
    }

    // Test endpoint for team registration
    if (url?.includes("/test/teams") && method === "POST") {
      try {
        console.log("Test team registration endpoint hit");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);

        res.status(200).json({
          message: "Test endpoint working",
          receivedData: req.body,
          headers: req.headers,
        });
        return;
      } catch (error) {
        console.error("Test endpoint error:", error);
        res.status(500).json({
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return;
      }
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
        console.log("Team registration request received");
        console.log("Content-Type:", req.headers["content-type"]);

        let teamData;
        let fileBuffer: Buffer | undefined;
        let fileName: string | undefined;
        let fileContentType: string | undefined;

        const contentType = req.headers["content-type"];

        if (contentType && contentType.includes("multipart/form-data")) {
          console.log("Parsing FormData...");
          const { fields, files } = await parseFormData(req);
          console.log("FormData fields:", fields);
          console.log("FormData files:", Object.keys(files));
          teamData = fields;

          // Handle file if present
          if (files.bankSlip) {
            const bankSlipFile = Array.isArray(files.bankSlip)
              ? files.bankSlip[0]
              : files.bankSlip;
            console.log("Bank slip file found:", {
              originalFilename: bankSlipFile.originalFilename,
              mimetype: bankSlipFile.mimetype,
              size: bankSlipFile.size,
              filepath: bankSlipFile.filepath,
            });

            // Read the file buffer
            if (bankSlipFile.filepath) {
              try {
                fileBuffer = await fs.promises.readFile(bankSlipFile.filepath);
                fileName = bankSlipFile.originalFilename || "bankslip";
                fileContentType =
                  bankSlipFile.mimetype || "application/octet-stream";
                console.log(
                  `File read successfully: ${fileName} (${fileBuffer.length} bytes)`
                );
              } catch (fileError) {
                console.error("Error reading uploaded file:", fileError);
                return res.status(400).json({
                  message: "Error processing uploaded file",
                });
              }
            }
          }
        } else {
          // Regular JSON data
          console.log("Processing JSON data...");
          teamData = req.body;
        }

        console.log("Processing team data:", teamData);

        // Validate team data
        const validatedData = insertTeamSchema.parse(teamData);
        console.log("Validation passed for team:", validatedData.teamName);

        // Check if team name already exists
        const exists = await storage.teamExists(validatedData.teamName);
        if (exists) {
          console.log("Team name already exists:", validatedData.teamName);
          return res.status(400).json({
            message:
              "Team name already exists. Please choose a different name.",
          });
        }

        // Create team with file upload
        const team = await storage.createTeam(
          validatedData,
          fileBuffer,
          fileName,
          fileContentType
        );
        console.log("Team created successfully:", team._id);

        res.status(201).json({
          message: "Team registered successfully!",
          team: {
            _id: team._id,
            teamName: team.teamName,
            game: team.game,
            registeredAt: team.registeredAt,
            bankSlipUploaded: !!fileBuffer,
          },
        });
        return;
      } catch (error) {
        console.error("Error in POST /api/teams:", error);
        if (error instanceof z.ZodError) {
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
          console.log("Validation errors:", formattedErrors);
          return res.status(400).json({
            message: "Please fix the following errors:",
            errors: formattedErrors,
          });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({
          message: "Internal server error",
          error:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        });
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
        console.log("Teams stats endpoint hit");
        await connectToDatabase();

        // Count confirmed teams for Valorant (all Valorant teams are confirmed)
        const valorantCount = await Team.countDocuments({
          game: "valorant",
          $or: [
            { status: 'confirmed' },
            { status: { $exists: false } },
            { status: null }
          ]
        });

        // Count confirmed + approved teams for COD
        const codConfirmedCount = await Team.countDocuments({
          game: "cod",
          $or: [
            { status: 'confirmed' },
            { status: 'approved' },
            { status: { $exists: false } },
            { status: null }
          ]
        });

        // Count queued teams for COD
        const codQueuedCount = await Team.countDocuments({
          game: "cod",
          status: "queued"
        });

        const stats = {
          valorant: { registered: valorantCount, total: 8 },
          cod: {
            confirmed: codConfirmedCount,
            queued: codQueuedCount,
            total: 12,
            maxQueue: 5
          }
        };

        console.log("Returning stats:", stats);
        res.status(200).json(stats);
        return;
      } catch (error) {
        console.error("Error getting team stats:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
          message: "Internal server error",
          error:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        });
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

    // Secret challenge endpoints
    if (url?.includes("/secret-challenge") && method === "POST") {
      try {
        const challengeData = insertSecretChallengeSchema.parse(req.body);
        const challenge = await storage.createSecretChallenge(challengeData);
        res.status(201).json({ success: true, message: "Challenge completed!", challenge });
        return;
      } catch (error) {
        console.error("Error in POST /api/secret-challenge:", error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            message: "Validation error",
            errors: error.errors
          });
        }
        if (error instanceof Error && error.message.includes("already completed")) {
          return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    if (url?.includes("/secret-challenge/leaderboard") && method === "GET") {
      try {
        const limit = parseInt((req.query?.limit as string) || "10");
        const leaderboard = await storage.getSecretLeaderboard(limit);
        res.json(leaderboard);
        return;
      } catch (error) {
        console.error("Error in GET /api/secret-challenge/leaderboard:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    if (url?.includes("/secret-challenge/check/") && method === "GET") {
      try {
        const email = url.split("/secret-challenge/check/")[1];
        const decodedEmail = decodeURIComponent(email);
        const hasCompleted = await storage.hasPlayerCompletedSecret(decodedEmail);
        res.json({ hasCompleted });
        return;
      } catch (error) {
        console.error("Error in GET /api/secret-challenge/check:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Admin files endpoint
    if (url?.includes("/admin/files") && method === "GET" && token) {
      const userSession = verifyToken(token);
      if (
        !userSession ||
        !["admin", "superuser", "elite_board"].includes(userSession.role)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      try {
        const files = await storage.getFiles();
        res.status(200).json(files);
        return;
      } catch (error) {
        console.error("Error getting files:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Download file endpoint
    if (
      url?.match(/\/admin\/files\/[a-fA-F0-9]{24}$/) &&
      method === "GET" &&
      token
    ) {
      const userSession = verifyToken(token);
      if (
        !userSession ||
        !["admin", "superuser", "elite_board"].includes(userSession.role)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const fileId = url.split("/admin/files/")[1];
      try {
        const fileData = await downloadFileFromGridFS(fileId);

        res.setHeader("Content-Type", fileData.contentType);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileData.filename}"`
        );
        res.setHeader("Content-Length", fileData.buffer.length);

        res.status(200).send(fileData.buffer);
        return;
      } catch (error) {
        console.error("Error downloading file:", error);
        res.status(404).json({ message: "File not found" });
        return;
      }
    }

    // Public file access endpoint (for bank slip preview/download)
    if (url?.match(/\/files\/[a-fA-F0-9]{24}/) && method === "GET") {
      console.log("File endpoint hit:", url);
      console.log("Query params:", req.query);

      // Extract file ID, handling query parameters
      const match = url.match(/\/files\/([a-fA-F0-9]{24})/);
      const fileId = match ? match[1] : null;

      console.log("Extracted file ID:", fileId);

      if (!fileId) {
        console.log("Invalid file ID");
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const download = req.query?.download === "true";
      console.log("Download mode:", download);

      try {
        console.log("Attempting to download file from GridFS:", fileId);
        const fileData = await downloadFileFromGridFS(fileId);
        console.log("File data retrieved:", {
          filename: fileData.filename,
          contentType: fileData.contentType,
          bufferSize: fileData.buffer.length,
        });

        const disposition = download ? "attachment" : "inline";
        res.setHeader("Content-Type", fileData.contentType);
        res.setHeader(
          "Content-Disposition",
          `${disposition}; filename="${fileData.filename}"`
        );
        res.setHeader("Content-Length", fileData.buffer.length);
        res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

        console.log("Sending file response");
        res.status(200).send(fileData.buffer);
        return;
      } catch (error) {
        console.error("Error accessing file:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(404)
          .json({ message: "File not found", error: errorMessage });
        return;
      }
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

    // Admin secret challenges endpoint
    if (url?.includes("/admin/secret-challenges") && method === "GET" && token) {
      const userSession = verifyToken(token);
      if (
        !userSession ||
        !["admin", "superuser", "elite_board"].includes(userSession.role)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      try {
        const challenges = await storage.getAllSecretChallenges();
        res.status(200).json(challenges);
        return;
      } catch (error) {
        console.error("Error getting secret challenges:", error);
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

    // Delete secret challenge endpoint
    if (
      url?.match(/\/admin\/secret-challenges\/[a-fA-F0-9]{24}$/) &&
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

      const challengeId = url.split("/admin/secret-challenges/")[1];
      try {
        await storage.deleteSecretChallenge(challengeId);
        res.status(200).json({ message: "Secret challenge deleted successfully" });
        return;
      } catch (error) {
        console.error("Error deleting secret challenge:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // COD Queue Management Endpoints.
    else if (url?.includes("/admin/cod-queue") && method === "GET" && token) {
      try {
        const queuedTeams = await Team.find({ status: "queued" }).sort({
          queuedAt: 1,
        });
        const serializedTeams = queuedTeams.map((team) => ({
          ...team.toObject(),
          _id: team._id.toString(),
          bankSlipFileId: team.bankSlipFileId
            ? team.bankSlipFileId.toString()
            : undefined,
        }));
        res.json(serializedTeams);
        return;
      } catch (error) {
        console.error("Error fetching COD queue:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }
    else if (url?.includes("/admin/approve-team/") && method === "POST" && token) {
      try {
        const teamId = url.split("/admin/approve-team/")[1];
        const { approvedBy } = req.body;

        const team = await Team.findByIdAndUpdate(
          teamId,
          {
            status: "approved",
            approvedBy,
            approvedAt: new Date(),
          },
          { new: true }
        );

        if (!team) {
          res.status(404).json({ message: "Team not found" });
          return;
        }

        res.json(team);
        return;
      } catch (error) {
        console.error("Error approving team:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }
    else if (url?.includes("/admin/reject-team/") && method === "POST" && token) {
      try {
        const teamId = url.split("/admin/reject-team/")[1];

        await Team.findByIdAndUpdate(teamId, { status: "rejected" });

        res.json({ message: "Team rejected successfully" });
        return;
      } catch (error) {
        console.error("Error rejecting team:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }
    // Check team availability endpoint
    else if (url?.includes("/teams/check-availability/") && method === "GET") {
      try {
        const game = url.split("/teams/check-availability/")[1];

        if (!["valorant", "cod"].includes(game)) {
          res.status(400).json({ message: "Invalid game type" });
          return;
        }

        if (game === "valorant") {
          const teamCount = await Team.countDocuments({
            game: "valorant",
            $or: [
              { status: 'confirmed' },
              { status: { $exists: false } },
              { status: null }
            ]
          });
          const maxTeams = 8;
          const isAvailable = teamCount < maxTeams;

          res.json({
            game,
            registered: teamCount,
            maxTeams,
            isAvailable,
            message: isAvailable
              ? `Registration is open. ${maxTeams - teamCount} spots remaining.`
              : "Registration is closed for this tournament."
          });
        } else {
          // COD queue system
          const confirmedCount = await Team.countDocuments({
            game: "cod",
            $or: [
              { status: 'confirmed' },
              { status: 'approved' },
              { status: { $exists: false } },
              { status: null }
            ]
          });
          const queuedCount = await Team.countDocuments({
            game: "cod",
            status: "queued"
          });
          const maxTeams = 12;
          const maxQueue = 5;

          const isRegistrationOpen = confirmedCount < maxTeams && queuedCount < maxQueue;

          res.json({
            game,
            confirmed: confirmedCount,
            queued: queuedCount,
            maxTeams,
            maxQueue,
            isAvailable: isRegistrationOpen,
            message: isRegistrationOpen
              ? "Registration is open. You will be added to the registration queue."
              : confirmedCount >= maxTeams
                ? "Registration is closed. Tournament is full."
                : "Registration queue is full. Please try again later."
          });
        }
        return;
      } catch (error) {
        console.error("Error in /api/teams/check-availability:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Excel export endpoint
    if (url?.includes("/admin/export-teams") && method === "GET" && token) {
      try {
        const XLSX = require('xlsx');

        // Get all teams with full details
        const teams = await Team.find({
          $or: [
            { status: { $in: ["confirmed", "approved"] } },
            { status: { $exists: false } },
            { status: null }
          ]
        }).sort({ registeredAt: -1 });

        // Format data for Excel
        const excelData = teams.map((team, index) => ({
          'S.No': index + 1,
          'Team Name': team.teamName,
          'Game': team.game.toUpperCase(),
          'Status': team.status || 'confirmed',
          'Captain Email': team.captainEmail,
          'Captain Phone': team.captainPhone,
          'Player 1 Name': team.player1Name,
          'Player 1 Gaming ID': team.player1GamingId,
          'Player 1 University Email': team.player1UniversityEmail,
          'Player 1 Valorant ID': team.player1ValorantId || 'N/A',
          'Player 2 Name': team.player2Name,
          'Player 2 Gaming ID': team.player2GamingId,
          'Player 2 University Email': team.player2UniversityEmail,
          'Player 2 Valorant ID': team.player2ValorantId || 'N/A',
          'Player 3 Name': team.player3Name,
          'Player 3 Gaming ID': team.player3GamingId,
          'Player 3 University Email': team.player3UniversityEmail,
          'Player 3 Valorant ID': team.player3ValorantId || 'N/A',
          'Player 4 Name': team.player4Name,
          'Player 4 Gaming ID': team.player4GamingId,
          'Player 4 University Email': team.player4UniversityEmail,
          'Player 4 Valorant ID': team.player4ValorantId || 'N/A',
          'Player 5 Name': team.player5Name,
          'Player 5 Gaming ID': team.player5GamingId,
          'Player 5 University Email': team.player5UniversityEmail,
          'Player 5 Valorant ID': team.player5ValorantId || 'N/A',
          'Bank Slip Uploaded': team.bankSlipFileId ? 'Yes' : 'No',
          'Registration Date': new Date(team.registeredAt).toLocaleDateString(),
          'Approved By': team.approvedBy || 'N/A',
          'Approved Date': team.approvedAt ? new Date(team.approvedAt).toLocaleDateString() : 'N/A',
          'Queued Date': team.queuedAt ? new Date(team.queuedAt).toLocaleDateString() : 'N/A'
        }));

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Auto-size columns
        const columnWidths = [
          { wch: 5 },   // S.No
          { wch: 20 },  // Team Name
          { wch: 10 },  // Game
          { wch: 12 },  // Status
          { wch: 25 },  // Captain Email
          { wch: 15 },  // Captain Phone
          { wch: 20 },  // Player names
          { wch: 20 },  // Gaming IDs
          { wch: 30 },  // University emails
          { wch: 20 },  // Valorant IDs
          { wch: 20 },  // Player names
          { wch: 20 },  // Gaming IDs
          { wch: 30 },  // University emails
          { wch: 20 },  // Valorant IDs
          { wch: 20 },  // Player names
          { wch: 20 },  // Gaming IDs
          { wch: 30 },  // University emails
          { wch: 20 },  // Valorant IDs
          { wch: 20 },  // Player names
          { wch: 20 },  // Gaming IDs
          { wch: 30 },  // University emails
          { wch: 20 },  // Valorant IDs
          { wch: 20 },  // Player names
          { wch: 20 },  // Gaming IDs
          { wch: 30 },  // University emails
          { wch: 20 },  // Valorant IDs
          { wch: 15 },  // Bank Slip
          { wch: 15 },  // Registration Date
          { wch: 15 },  // Approved By
          { wch: 15 },  // Approved Date
          { wch: 15 }   // Queued Date
        ];
        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Teams');

        // Generate Excel file buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set response headers
        const fileName = `game-night-teams-${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', excelBuffer.length);

        // Send file
        res.send(excelBuffer);
        return;
      } catch (error) {
        console.error("Error exporting teams:", error);
        res.status(500).json({ message: "Failed to export teams" });
        return;
      }
    }

    // COD Queue Excel export endpoint
    if (url?.includes("/admin/export-cod-queue") && method === "GET" && token) {
      try {
        const XLSX = require('xlsx');

        // Get all COD teams in queue or approved status
        const codTeams = await Team.find({
          game: 'cod',
          status: { $in: ["queued", "approved"] }
        }).sort({ queuedAt: 1 }); // Sort by queue time

        // Format data for Excel
        const excelData = codTeams.map((team, index) => ({
          'Queue Position': index + 1,
          'Team Name': team.teamName,
          'Status': team.status,
          'Captain Email': team.captainEmail,
          'Captain Phone': team.captainPhone,
          'Player 1 Name': team.player1Name,
          'Player 1 Gaming ID': team.player1GamingId,
          'Player 1 University Email': team.player1UniversityEmail,
          'Player 2 Name': team.player2Name,
          'Player 2 Gaming ID': team.player2GamingId,
          'Player 2 University Email': team.player2UniversityEmail,
          'Player 3 Name': team.player3Name,
          'Player 3 Gaming ID': team.player3GamingId,
          'Player 3 University Email': team.player3UniversityEmail,
          'Player 4 Name': team.player4Name,
          'Player 4 Gaming ID': team.player4GamingId,
          'Player 4 University Email': team.player4UniversityEmail,
          'Player 5 Name': team.player5Name,
          'Player 5 Gaming ID': team.player5GamingId,
          'Player 5 University Email': team.player5UniversityEmail,
          'Bank Slip Uploaded': team.bankSlipFileId ? 'Yes' : 'No',
          'Queued Date': team.queuedAt ? new Date(team.queuedAt).toLocaleDateString() : 'N/A',
          'Payment Deadline': team.paymentDeadline ? new Date(team.paymentDeadline).toLocaleDateString() : 'N/A',
          'Approved By': team.approvedBy || 'N/A',
          'Approved Date': team.approvedAt ? new Date(team.approvedAt).toLocaleDateString() : 'N/A'
        }));

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Auto-size columns
        const columnWidths = [
          { wch: 8 },   // Queue Position
          { wch: 20 },  // Team Name
          { wch: 12 },  // Status
          { wch: 25 },  // Captain Email
          { wch: 15 },  // Captain Phone
          { wch: 20 },  // Player names and gaming IDs
          { wch: 20 },
          { wch: 30 },  // University emails
          { wch: 20 },
          { wch: 20 },
          { wch: 30 },
          { wch: 20 },
          { wch: 20 },
          { wch: 30 },
          { wch: 20 },
          { wch: 20 },
          { wch: 30 },
          { wch: 20 },
          { wch: 20 },
          { wch: 30 },
          { wch: 15 },  // Bank Slip
          { wch: 15 },  // Queued Date
          { wch: 15 },  // Payment Deadline
          { wch: 15 },  // Approved By
          { wch: 15 }   // Approved Date
        ];
        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'COD Queue');

        // Generate Excel file buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set response headers
        const fileName = `cod-queue-${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', excelBuffer.length);

        // Send file
        res.send(excelBuffer);
        return;
      } catch (error) {
        console.error("Error exporting COD queue:", error);
        res.status(500).json({ message: "Failed to export COD queue" });
        return;
      }
    }

    // Leaderboard endpoint
    if (url?.includes("/api/leaderboard") && method === "GET") {
      try {
        const urlObj = new URL(req.url!, `http://${req.headers.host}`);
        const game = urlObj.searchParams.get('game');

        if (!game || (game !== "valorant" && game !== "cod")) {
          res.status(400).json({ message: "Valid game parameter required (valorant or cod)" });
          return;
        }

        await connectToDatabase();

        // Get leaderboard data
        const leaderboard = await LeaderboardScore.find({ game }).sort({ score: -1, matchesWon: -1 });

        res.json(leaderboard);
        return;
      } catch (error) {
        console.error("Error in /api/leaderboard:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Match endpoints
    if (url?.includes("/api/matches") && method === "GET") {
      try {
        const urlObj = new URL(req.url!, `http://${req.headers.host}`);
        const game = urlObj.searchParams.get('game');
        const status = urlObj.searchParams.get('status');

        if (!game || (game !== "valorant" && game !== "cod")) {
          res.status(400).json({ message: "Valid game parameter required (valorant or cod)" });
          return;
        }

        await connectToDatabase();

        // Build query
        const query: any = { game };
        if (status) {
          query.status = status;
        }

        const matches = await Match.find(query).sort({ scheduledTime: -1 });

        res.json(matches);
        return;
      } catch (error) {
        console.error("Error in /api/matches:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Create match endpoint (admin only)
    if (url === "/api/matches" && method === "POST") {
      try {
        if (!token) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }

        const body = req.body;

        await connectToDatabase();

        const newMatch = new Match(body);
        const savedMatch = await newMatch.save();

        res.json(savedMatch);
        return;
      } catch (error) {
        console.error("Error creating match:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Update match endpoint (admin only)
    if (url?.match(/\/api\/matches\/[a-fA-F0-9]{24}$/) && method === "PUT") {
      try {
        if (!token) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }

        const matchId = url.split('/').pop();
        const body = req.body;

        await connectToDatabase();

        const updatedMatch = await Match.findByIdAndUpdate(
          matchId,
          { ...body, lastUpdated: new Date() },
          { new: true }
        );

        if (!updatedMatch) {
          res.status(404).json({ message: "Match not found" });
          return;
        }

        res.json(updatedMatch);
        return;
      } catch (error) {
        console.error("Error updating match:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Delete match endpoint (admin only)
    if (url?.match(/\/api\/matches\/[a-fA-F0-9]{24}$/) && method === "DELETE") {
      try {
        if (!token) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }

        const matchId = url.split('/').pop();

        await connectToDatabase();

        const deletedMatch = await Match.findByIdAndDelete(matchId);

        if (!deletedMatch) {
          res.status(404).json({ message: "Match not found" });
          return;
        }

        res.json({ message: "Match deleted successfully" });
        return;
      } catch (error) {
        console.error("Error deleting match:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    }

    // Update leaderboard/team score endpoint (admin only)
    if (url === "/api/leaderboard" && method === "POST") {
      try {
        if (!token) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }

        const body = req.body;

        await connectToDatabase();

        // Check if score already exists for this team/game
        const existingScore = await LeaderboardScore.findOne({
          teamId: body.teamId,
          game: body.game
        });

        if (existingScore) {
          // Update existing score
          if (body.score !== undefined) existingScore.score = body.score;
          if (body.matchesWon !== undefined) existingScore.matchesWon = body.matchesWon;
          if (body.matchesLost !== undefined) existingScore.matchesLost = body.matchesLost;
          if (body.totalMatches !== undefined) existingScore.totalMatches = body.totalMatches;
          existingScore.lastUpdated = new Date();
          existingScore.updatedBy = body.updatedBy || 'admin';

          await existingScore.save();
          res.json(existingScore);
        } else {
          // Create new score
          const newScore = new LeaderboardScore(body);
          const savedScore = await newScore.save();
          res.json(savedScore);
        }
        return;
      } catch (error) {
        console.error("Error updating leaderboard:", error);
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
        "/images/* (GET) - Static image serving",
        "/uploads/* (GET) - Static file serving",
        "/api/admin/login (POST)",
        "/api/admin/me (GET)",
        "/api/admin/logout (POST)",
        "/api/admin/teams (GET)",
        "/api/admin/scores (GET)",
        "/api/admin/users (GET)",
        "/api/admin/files (GET)",
        "/api/admin/files/:id (GET)",
        "/api/admin/teams/:id (DELETE)",
        "/api/admin/scores/:id (DELETE)",
        "/api/admin/users/:id (DELETE)",
        "/api/admin/secret-challenges/:id (DELETE)",
        "/api/admin/cod-queue (GET)",
        "/api/admin/approve-team/:id (POST)",
        "/api/admin/reject-team/:id (POST)",
        "/api/admin/export-teams (GET)",
        "/api/admin/export-cod-queue (GET)",
        "/api/teams (POST)",
        "/api/teams/check/:teamName (GET)",
        "/api/teams/check-availability/:game (GET)",
        "/api/teams/stats (GET)",
        "/api/game-scores (POST)",
        "/api/game-scores/leaderboard/:gameType (GET)",
        "/api/secret-challenge (POST)",
        "/api/secret-challenge/leaderboard (GET)",
        "/api/secret-challenge/check/:email (GET)",
        "/api/admin/secret-challenges (GET)",
        "/api/files/:id (GET)",
        "/api/leaderboard?game=valorant|cod (GET)",
        "/api/leaderboard (POST)",
        "/api/matches?game=valorant|cod (GET)",
        "/api/matches (POST)",
        "/api/matches/:id (PUT)",
        "/api/matches/:id (DELETE)",
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
