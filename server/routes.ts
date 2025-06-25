import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTeamSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Team registration endpoint
  app.post("/api/teams", async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      
      // Check if team name is unique
      const existingTeam = await storage.getTeamByName(teamData.teamName);
      if (existingTeam) {
        return res.status(400).json({ 
          message: "Team name already exists. Please choose a different name." 
        });
      }

      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check team name availability
  app.get("/api/teams/check/:teamName", async (req, res) => {
    try {
      const { teamName } = req.params;
      const existingTeam = await storage.getTeamByName(teamName);
      res.json({ available: !existingTeam });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get team statistics
  app.get("/api/teams/stats", async (req, res) => {
    try {
      const valorantCount = await storage.getTeamCount("valorant");
      const codCount = await storage.getTeamCount("cod");
      
      res.json({
        valorant: { registered: valorantCount, total: 32 },
        cod: { registered: codCount, total: 32 }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
