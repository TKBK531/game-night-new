import { teams, gameScores, type Team, type InsertTeam, type GameScore, type InsertGameScore } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private teams: Map<number, Team>;
  private gameScores: Map<number, GameScore>;
  private currentTeamId: number;
  private currentScoreId: number;

  constructor() {
    this.teams = new Map();
    this.gameScores = new Map();
    this.currentTeamId = 1;
    this.currentScoreId = 1;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const team: Team = {
      ...insertTeam,
      id,
      registeredAt: new Date(),
    };
    this.teams.set(id, team);
    return team;
  }

  async getTeamByName(teamName: string): Promise<Team | undefined> {
    return Array.from(this.teams.values()).find(
      (team) => team.teamName.toLowerCase() === teamName.toLowerCase(),
    );
  }

  async getTeamsByGame(game: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(
      (team) => team.game === game,
    );
  }

  async getAllTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeamCount(game: string): Promise<number> {
    return Array.from(this.teams.values()).filter(
      (team) => team.game === game,
    ).length;
  }

  async createGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const id = this.currentScoreId++;
    const score: GameScore = {
      ...insertScore,
      id,
      createdAt: new Date(),
    };
    this.gameScores.set(id, score);
    return score;
  }

  async getTopScores(gameType: string, limit: number): Promise<GameScore[]> {
    const scores = Array.from(this.gameScores.values())
      .filter((score) => score.gameType === gameType)
      .sort((a, b) => {
        // For reaction game, lower time is better
        const aTime = parseFloat(a.score.replace('s', ''));
        const bTime = parseFloat(b.score.replace('s', ''));
        return aTime - bTime;
      })
      .slice(0, limit);
    return scores;
  }
}

export const storage = new MemStorage();
