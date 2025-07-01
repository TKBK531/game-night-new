import { connectToDatabase } from "./mongodb";
import { Team, GameScore, User, type ITeam, type IGameScore, type IUser, type InsertTeam, type InsertGameScore, type InsertUser, type LoginUser } from "../shared/mongo-schema";
import { uploadFileToGridFS, downloadFileFromGridFS, deleteFileFromGridFS, validateBankSlipFile } from "./gridfs";
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

export interface IStorage {
    // Teams
    createTeam(team: InsertTeam): Promise<ITeam>;
    getTeamByName(teamName: string): Promise<ITeam | null>;
    getTeamsByGame(game: string): Promise<ITeam[]>;
    getAllTeams(): Promise<ITeam[]>;
    getTeamCount(game: string): Promise<number>;
    deleteTeam(teamId: string): Promise<void>;

    // Game scores
    createGameScore(score: InsertGameScore): Promise<IGameScore>;
    getTopScores(gameType: string, limit: number): Promise<IGameScore[]>;
    getAllScores(): Promise<IGameScore[]>;
    deleteGameScore(scoreId: string): Promise<void>;

    // Users
    createUser(user: InsertUser): Promise<IUser>;
    authenticateUser(credentials: LoginUser): Promise<IUser | null>;
    getUserById(userId: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    updateUser(userId: string, updates: Partial<IUser>): Promise<IUser>;
    deleteUser(userId: string): Promise<void>;
    updateLastLogin(userId: string): Promise<void>;

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

    async getTopScores(gameType: string, limit = 10): Promise<IGameScore[]> {
        await connectToDatabase();

        const scores = await GameScore.find({ gameType })
            .sort({ score: 1 }) // Lower is better for reaction time
            .limit(limit);
        return scores;
    }

    async getAllScores(): Promise<IGameScore[]> {
        await connectToDatabase();

        const scores = await GameScore.find({}).sort({ createdAt: -1 });
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

    async createUser(insertUser: InsertUser): Promise<IUser> {
        await connectToDatabase();

        // Check if the username already exists
        const existingUser = await User.findOne({ username: insertUser.username });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(insertUser.password, 10);

        const userDoc = new User({
            ...insertUser,
            password: hashedPassword
        });
        await userDoc.save();

        return userDoc;
    }

    async authenticateUser(credentials: LoginUser): Promise<IUser | null> {
        await connectToDatabase();

        const { username, password } = credentials;

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return null;
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async getUserById(userId: string): Promise<IUser | null> {
        await connectToDatabase();

        const user = await User.findById(userId);
        return user;
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        await connectToDatabase();

        const user = await User.findOne({ username });
        return user;
    }

    async getAllUsers(): Promise<IUser[]> {
        await connectToDatabase();

        const users = await User.find({});
        return users;
    }

    async updateUser(userId: string, updates: Partial<IUser>): Promise<IUser> {
        await connectToDatabase();

        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async deleteUser(userId: string): Promise<void> {
        await connectToDatabase();

        await User.findByIdAndDelete(userId);
    }

    async updateLastLogin(userId: string): Promise<void> {
        await connectToDatabase();

        await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    }

    async deleteGameScore(scoreId: string): Promise<void> {
        await connectToDatabase();

        await GameScore.findByIdAndDelete(scoreId);
    }

    async deleteTeam(teamId: string): Promise<void> {
        await connectToDatabase();

        const team = await Team.findById(teamId);
        if (team && team.bankSlipFileId) {
            // Delete associated bank slip file from GridFS
            try {
                await this.deleteBankSlipFile(team.bankSlipFileId.toString());
            } catch (error) {
                console.warn('Failed to delete bank slip file:', error);
            }
        }

        await Team.findByIdAndDelete(teamId);
    }
}

// Create and export storage instance
export const storage = new MongoDBStorage();
