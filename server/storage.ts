import { teams, type Team, type InsertTeam } from "@shared/schema";

export interface IStorage {
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamByName(teamName: string): Promise<Team | undefined>;
  getTeamsByGame(game: string): Promise<Team[]>;
  getAllTeams(): Promise<Team[]>;
  getTeamCount(game: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private teams: Map<number, Team>;
  private currentId: number;

  constructor() {
    this.teams = new Map();
    this.currentId = 1;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentId++;
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
}

export const storage = new MemStorage();
