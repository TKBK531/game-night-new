import mongoose, { Document, Schema } from 'mongoose';

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
    game: 'valorant' | 'cod';
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
    bankSlipFileId?: mongoose.Types.ObjectId; // GridFS file ID for direct MongoDB storage
    bankSlipFileName?: string; // Original filename of the uploaded file
    bankSlipContentType?: string; // MIME type of the uploaded file
    registeredAt: Date;
}

// Game Score Interface
export interface IGameScore extends Document {
    _id: string;
    playerName: string;
    score: string;
    gameType: string;
    createdAt: Date;
}

// Team Schema
const TeamSchema = new Schema<ITeam>({
    teamName: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 20
    },
    game: {
        type: String,
        required: true,
        enum: ['valorant', 'cod']
    },
    captainEmail: {
        type: String,
        required: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    captainPhone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 15
    },
    player1Name: { type: String, required: true, maxlength: 50 },
    player1GamingId: { type: String, required: true, maxlength: 50 },
    player1ValorantId: { type: String, maxlength: 50 },
    player2Name: { type: String, required: true, maxlength: 50 },
    player2GamingId: { type: String, required: true, maxlength: 50 },
    player2ValorantId: { type: String, maxlength: 50 },
    player3Name: { type: String, required: true, maxlength: 50 },
    player3GamingId: { type: String, required: true, maxlength: 50 },
    player3ValorantId: { type: String, maxlength: 50 },
    player4Name: { type: String, required: true, maxlength: 50 },
    player4GamingId: { type: String, required: true, maxlength: 50 },
    player4ValorantId: { type: String, maxlength: 50 },
    player5Name: { type: String, required: true, maxlength: 50 },
    player5GamingId: { type: String, required: true, maxlength: 50 },
    player5ValorantId: { type: String, maxlength: 50 },
    // GridFS file storage fields
    bankSlipFileId: {
        type: Schema.Types.ObjectId,
        ref: 'fs.files' // GridFS collection reference
    },
    bankSlipFileName: {
        type: String,
        maxlength: 255
    },
    bankSlipContentType: {
        type: String,
        validate: {
            validator: function (v: string) {
                if (!v) return true; // Optional field
                // Only allow image and PDF MIME types
                const allowedTypes = [
                    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                    'image/bmp', 'image/webp', 'application/pdf'
                ];
                return allowedTypes.includes(v);
            },
            message: 'Bank slip must be an image file (JPEG, PNG, GIF, BMP, WebP) or PDF file'
        }
    },
    registeredAt: { type: Date, default: Date.now }
});

// Game Score Schema
const GameScoreSchema = new Schema<IGameScore>({
    playerName: {
        type: String,
        required: true,
        maxlength: 50
    },
    score: {
        type: String,
        required: true
    },
    gameType: {
        type: String,
        required: true,
        maxlength: 50
    },
    createdAt: { type: Date, default: Date.now }
});

// Create indexes for better performance
TeamSchema.index({ teamName: 1 });
TeamSchema.index({ game: 1 });
TeamSchema.index({ registeredAt: -1 });

GameScoreSchema.index({ gameType: 1, score: 1 });
GameScoreSchema.index({ createdAt: -1 });

// Export Models
export const Team = mongoose.model<ITeam>('Team', TeamSchema);
export const GameScore = mongoose.model<IGameScore>('GameScore', GameScoreSchema);

// Types for insertion (without MongoDB-specific fields)
export interface InsertTeam {
    teamName: string;
    game: 'valorant' | 'cod';
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
