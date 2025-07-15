import mongoose, { Document, Schema } from "mongoose";

// Bank Slip File Interface for GridFS
export interface IBankSlipFile {
  _id: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadDate: Date;
}

// Team Interface
export interface ITeam extends Document {
  _id: string;
  teamName: string;
  game: "valorant" | "cod";
  captainEmail: string;
  captainPhone: string;
  player1Name: string;
  player1GamingId: string;
  player1UniversityEmail: string;
  player1ValorantId?: string;
  player2Name: string;
  player2GamingId: string;
  player2UniversityEmail: string;
  player2ValorantId?: string;
  player3Name: string;
  player3GamingId: string;
  player3UniversityEmail: string;
  player3ValorantId?: string;
  player4Name: string;
  player4GamingId: string;
  player4UniversityEmail: string;
  player4ValorantId?: string;
  player5Name: string;
  player5GamingId: string;
  player5UniversityEmail: string;
  player5ValorantId?: string;
  bankSlipFileId?: mongoose.Types.ObjectId; // GridFS file ID for direct MongoDB storage
  bankSlipFileName?: string; // Original filename of the uploaded file
  bankSlipContentType?: string; // MIME type of the uploaded file
  registeredAt: Date;
  // New fields for COD queue system
  status: "confirmed" | "queued" | "approved" | "rejected";
  queuedAt?: Date;
  paymentDeadline?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

// Game Score Interface
export interface IGameScore extends Document {
  _id: string;
  playerName: string;
  score: string;
  gameType: string;
  createdAt: Date;
}

// Secret Konami Code Challenge Interface
export interface ISecretChallenge extends Document {
  _id: string;
  playerEmail: string;
  score: number;
  completedAt: Date;
}

// User Interface for Admin System
export interface IUser extends Document {
  _id: string;
  username: string;
  password: string; // Hashed password
  role: "superuser" | "elite_board" | "top_board";
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// Leaderboard Score Interface
export interface ILeaderboardScore extends Document {
  _id: string;
  teamId: string;
  teamName: string;
  game: "valorant" | "cod";
  score: number;
  matchesWon: number;
  matchesLost: number;
  totalMatches: number;
  lastUpdated: Date;
  updatedBy: string; // Admin username who last updated
}

// Match Interface
export interface IMatch extends Document {
  _id: string;
  game: "valorant" | "cod";
  team1Id: string;
  team1Name: string;
  team2Id: string;
  team2Name: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  winnerId?: string;
  winnerName?: string;
  team1Score?: number;
  team2Score?: number;
  round: string; // e.g., "Qualifier", "Quarter-Final", "Semi-Final", "Final"
  createdBy: string; // Admin username
  createdAt: Date;
  lastUpdated: Date;
}

// Team Schema
const TeamSchema = new Schema<ITeam>({
  teamName: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
  },
  game: {
    type: String,
    required: true,
    enum: ["valorant", "cod"],
  },
  captainEmail: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  captainPhone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 15,
  },
  player1Name: { type: String, required: true, maxlength: 50 },
  player1GamingId: { type: String, required: true, maxlength: 50 },
  player1UniversityEmail: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return v.endsWith("pdn.ac.lk");
      },
      message: "University email must end with pdn.ac.lk",
    },
  },
  player1ValorantId: { type: String, maxlength: 50 },
  player2Name: { type: String, required: true, maxlength: 50 },
  player2GamingId: { type: String, required: true, maxlength: 50 },
  player2UniversityEmail: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return v.endsWith("pdn.ac.lk");
      },
      message: "University email must end with pdn.ac.lk",
    },
  },
  player2ValorantId: { type: String, maxlength: 50 },
  player3Name: { type: String, required: true, maxlength: 50 },
  player3GamingId: { type: String, required: true, maxlength: 50 },
  player3UniversityEmail: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return v.endsWith("pdn.ac.lk");
      },
      message: "University email must end with pdn.ac.lk",
    },
  },
  player3ValorantId: { type: String, maxlength: 50 },
  player4Name: { type: String, required: true, maxlength: 50 },
  player4GamingId: { type: String, required: true, maxlength: 50 },
  player4UniversityEmail: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return v.endsWith("pdn.ac.lk");
      },
      message: "University email must end with pdn.ac.lk",
    },
  },
  player4ValorantId: { type: String, maxlength: 50 },
  player5Name: { type: String, required: true, maxlength: 50 },
  player5GamingId: { type: String, required: true, maxlength: 50 },
  player5UniversityEmail: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return v.endsWith("pdn.ac.lk");
      },
      message: "University email must end with pdn.ac.lk",
    },
  },
  player5ValorantId: { type: String, maxlength: 50 },
  // GridFS file storage fields
  bankSlipFileId: {
    type: Schema.Types.ObjectId,
    ref: "fs.files", // GridFS collection reference
  },
  bankSlipFileName: {
    type: String,
    maxlength: 255,
  },
  bankSlipContentType: {
    type: String,
    validate: {
      validator: function (v: string) {
        if (!v) return true; // Optional field
        // Only allow image and PDF MIME types
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/bmp",
          "image/webp",
          "application/pdf",
        ];
        return allowedTypes.includes(v);
      },
      message:
        "Bank slip must be an image file (JPEG, PNG, GIF, BMP, WebP) or PDF file",
    },
  },
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

// Game Score Schema
const GameScoreSchema = new Schema<IGameScore>({
  playerName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  score: {
    type: String,
    required: true,
  },
  gameType: {
    type: String,
    required: true,
    maxlength: 50,
  },
  createdAt: { type: Date, default: Date.now },
});

// Secret Challenge Schema
const SecretChallengeSchema = new Schema<ISecretChallenge>({
  playerEmail: { type: String, required: true },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
});

// Leaderboard Score Schema
const LeaderboardScoreSchema = new Schema<ILeaderboardScore>({
  teamId: { type: String, required: true },
  teamName: { type: String, required: true },
  game: { type: String, required: true, enum: ["valorant", "cod"] },
  score: { type: Number, default: 0 },
  matchesWon: { type: Number, default: 0 },
  matchesLost: { type: Number, default: 0 },
  totalMatches: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: String, required: true },
});

// Match Schema
const MatchSchema = new Schema<IMatch>({
  game: { type: String, required: true, enum: ["valorant", "cod"] },
  team1Id: { type: String, required: true },
  team1Name: { type: String, required: true },
  team2Id: { type: String, required: true },
  team2Name: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["scheduled", "in_progress", "completed", "cancelled"],
    default: "scheduled",
  },
  scheduledTime: { type: Date, required: true },
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },
  winnerId: { type: String },
  winnerName: { type: String },
  team1Score: { type: Number },
  team2Score: { type: Number },
  round: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["superuser", "elite_board", "top_board"]
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
});

// Indexes for performance
TeamSchema.index({ teamName: 1 });
TeamSchema.index({ game: 1 });
TeamSchema.index({ status: 1 });
TeamSchema.index({ registeredAt: -1 });

GameScoreSchema.index({ createdAt: -1 });

SecretChallengeSchema.index({ playerEmail: 1 });

LeaderboardScoreSchema.index({ game: 1, score: -1 });
LeaderboardScoreSchema.index({ teamId: 1 });

MatchSchema.index({ game: 1, status: 1 });
MatchSchema.index({ scheduledTime: -1 });
MatchSchema.index({ status: 1, scheduledTime: 1 });

// Note: username index is automatically created by unique: true in schema definition
UserSchema.index({ role: 1 });

// Export Models
export const Team = mongoose.model<ITeam>("Team", TeamSchema);
export const GameScore = mongoose.model<IGameScore>(
  "GameScore",
  GameScoreSchema
);
export const SecretChallenge = mongoose.model<ISecretChallenge>(
  "SecretChallenge",
  SecretChallengeSchema
);
export const LeaderboardScore = mongoose.model<ILeaderboardScore>(
  "LeaderboardScore",
  LeaderboardScoreSchema
);
export const Match = mongoose.model<IMatch>("Match", MatchSchema);
export const User = mongoose.model<IUser>("User", UserSchema);

// Types for insertion (without MongoDB-specific fields)
export interface InsertTeam {
  teamName: string;
  game: "valorant" | "cod";
  captainEmail: string;
  captainPhone: string;
  player1Name: string;
  player1GamingId: string;
  player1ValorantId?: string;
  player2Name: string;
  player2GamingId: string;
  player2ValorantId?: string;
  player3Name: string;
  player3GamingId: string;
  player3ValorantId?: string;
  player4Name: string;
  player4GamingId: string;
  player4ValorantId?: string;
  player5Name: string;
  player5GamingId: string;
  player5ValorantId?: string;
  bankSlip?: string; // File upload - will be converted to bankSlipUrl (image or PDF only)
  bankSlipFile?: Buffer; // Direct file buffer for MongoDB GridFS storage
  bankSlipFileName?: string; // Original filename
  bankSlipContentType?: string; // MIME type
}

export interface InsertGameScore {
  playerName: string;
  score: string;
  gameType: string;
}

// User insertion types
export interface InsertUser {
  username: string;
  password: string;
  role: "superuser" | "elite_board" | "top_board";
  isActive?: boolean;
}

export interface LoginUser {
  username: string;
  password: string;
}

// Secret challenge insertion types
export interface InsertSecretChallenge {
  playerEmail: string;
  score: number;
}

// Leaderboard insertion types
export interface InsertLeaderboardScore {
  teamId: string;
  teamName: string;
  game: "valorant" | "cod";
  score?: number;
  matchesWon?: number;
  matchesLost?: number;
  totalMatches?: number;
  updatedBy: string;
}

export interface UpdateLeaderboardScore {
  score?: number;
  matchesWon?: number;
  matchesLost?: number;
  totalMatches?: number;
  updatedBy: string;
}

// Match insertion types
export interface InsertMatch {
  game: "valorant" | "cod";
  team1Id: string;
  team1Name: string;
  team2Id: string;
  team2Name: string;
  scheduledTime: string; // ISO date string
  round: string;
  createdBy: string;
}

export interface UpdateMatch {
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  winnerId?: string;
  winnerName?: string;
  team1Score?: number;
  team2Score?: number;
  round?: string;
}
