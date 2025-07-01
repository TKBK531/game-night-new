import { connectToDatabase } from "./mongodb";
import { Team, GameScore, type ITeam, type IGameScore, type InsertTeam, type InsertGameScore } from "../shared/mongo-schema";
import { uploadFileToGridFS, downloadFileFromGridFS, deleteFileFromGridFS, validateBankSlipFile } from "./gridfs";
import { ObjectId } from 'mongodb';

export interface IStorage {
    createTeam(team: InsertTeam): Promise<ITeam>;
    getTeamByName(teamName: string): Promise<ITeam | null>;
    getTeamsByGame(game: string): Promise<ITeam[]>;
    getAllTeams(): Promise<ITeam[]>;
    getTeamCount(game: string): Promise<number>;

    // Game scores
    createGameScore(score: InsertGameScore): Promise<IGameScore>;
    getTopScores(gameType: string, limit: number): Promise<IGameScore[]>;

    // File operations
    getBankSlipFile(fileId: string): Promise<{ buffer: Buffer; filename: string; contentType: string }>;
    deleteBankSlipFile(fileId: string): Promise<void>;
}

export class MongoDBStorage implements IStorage {
    async createTeam(insertTeam: InsertTeam): Promise<ITeam> {
        await connectToDatabase();

        const { bankSlip, bankSlipFile, bankSlipFileName, bankSlipContentType, ...teamData } = insertTeam;

        let teamDoc: any = { ...teamData };

        // Handle file upload to GridFS if file buffer is provided
        if (bankSlipFile && bankSlipFileName && bankSlipContentType) {
            // Validate file type
            if (!validateBankSlipFile(bankSlipContentType, bankSlipFileName)) {
                throw new Error('Invalid file type. Only images (JPEG, PNG, GIF, BMP, WebP) and PDF files are allowed.');
            }

            try {
                // Upload file to GridFS
                const fileId = await uploadFileToGridFS(bankSlipFile, bankSlipFileName, bankSlipContentType);

                // Store GridFS file information
                teamDoc.bankSlipFileId = fileId;
                teamDoc.bankSlipFileName = bankSlipFileName;
                teamDoc.bankSlipContentType = bankSlipContentType;
            } catch (error) {
                console.error('Failed to upload bank slip file:', error);
                throw new Error('Failed to upload bank slip file');
            }
        }

        const team = new Team(teamDoc);
        await team.save();

        return team;
    }

    async getTeamByName(teamName: string): Promise<ITeam | null> {
        await connectToDatabase();

        // Case-insensitive search
        const team = await Team.findOne({
            teamName: { $regex: new RegExp(`^${teamName}$`, 'i') }
        });

        return team;
    }

    async getTeamsByGame(game: string): Promise<ITeam[]> {
        await connectToDatabase();

        const teams = await Team.find({ game }).sort({ registeredAt: -1 });
        return teams;
    }

    async getAllTeams(): Promise<ITeam[]> {
        await connectToDatabase();

        const teams = await Team.find({}).sort({ registeredAt: -1 });
        return teams;
    }

    async getTeamCount(game: string): Promise<number> {
        await connectToDatabase();

        const count = await Team.countDocuments({ game });
        return count;
    }

    async createGameScore(insertScore: InsertGameScore): Promise<IGameScore> {
        await connectToDatabase();

        const score = new GameScore(insertScore);
        await score.save();

        return score;
    }

    async getTopScores(gameType: string, limit: number): Promise<IGameScore[]> {
        await connectToDatabase();

        // For reaction time, lower scores are better, so sort ascending
        // For other games, higher scores might be better, so sort descending
        const sortOrder = gameType === 'reaction' ? 1 : -1;

        const scores = await GameScore.find({ gameType })
            .sort({ score: sortOrder, createdAt: -1 })
            .limit(limit);

        return scores;
    }

    // File operations for GridFS
    async getBankSlipFile(fileId: string): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
        try {
            const file = await downloadFileFromGridFS(fileId);
            return {
                buffer: file.buffer,
                filename: file.filename,
                contentType: file.contentType
            };
        } catch (error) {
            console.error('Failed to download bank slip file:', error);
            throw new Error('File not found or failed to download');
        }
    }

    async deleteBankSlipFile(fileId: string): Promise<void> {
        try {
            await deleteFileFromGridFS(fileId);
        } catch (error) {
            console.error('Failed to delete bank slip file:', error);
            throw new Error('Failed to delete file');
        }
    }
}

// Create and export storage instance
export const storage = new MongoDBStorage();
