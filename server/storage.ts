import { eq, desc, sql, count } from "drizzle-orm";
import { teams, gameScores, type Team, type InsertTeam, type GameScore, type InsertGameScore } from "@shared/schema";
import { db } from "./database";

export interface IStorage {
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamByName(teamName: string): Promise<Team | undefined>;
  getTeamsByGame(game: string): Promise<Team[]>;
  getAllTeams(): Promise<Team[]>;
  getTeamCount(game: string): Promise<number>;

  // Game scores
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  getTopScores(gameType: string, limit: number): Promise<GameScore[]>;
}

export class PostgreSQLStorage implements IStorage {
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const { bankSlip, ...teamData } = insertTeam;

    // Handle bank slip filename (multer saves file and provides filename)
    const bankSlipUrl = bankSlip ? `uploads/${bankSlip}` : null;

    const [team] = await db
      .insert(teams)
      .values({
        ...teamData,
        bankSlipUrl,
      })
      .returning();

    return team;
  }

  async getTeamByName(teamName: string): Promise<Team | undefined> {
    const [team] = await db
      .select()
      .from(teams)
      .where(sql`LOWER(${teams.teamName}) = LOWER(${teamName})`)
      .limit(1);

    return team;
  }

  async getTeamsByGame(game: string): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.game, game));
  }

  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeamCount(game: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(teams)
      .where(eq(teams.game, game));

    return result[0]?.count || 0;
  }

  async createGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const [score] = await db
      .insert(gameScores)
      .values(insertScore)
      .returning();

    return score;
  }

  async getTopScores(gameType: string, limit: number): Promise<GameScore[]> {
    // For reaction game, we need custom sorting logic since scores are stored as text
    const allScores = await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.gameType, gameType));

    // Sort scores manually (for reaction game, lower time is better)
    const sortedScores = allScores
      .sort((a, b) => {
        const aTime = parseFloat(a.score.replace('s', ''));
        const bTime = parseFloat(b.score.replace('s', ''));
        return aTime - bTime;
      })
      .slice(0, limit);

    return sortedScores;
  }
}

export const storage = new PostgreSQLStorage();
