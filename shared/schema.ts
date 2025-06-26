import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  teamName: text("team_name").notNull().unique(),
  game: text("game").notNull(), // 'valorant' or 'cod'
  captainEmail: text("captain_email").notNull(),
  captainPhone: text("captain_phone").notNull(),
  player1Name: text("player1_name").notNull(),
  player1GamingId: text("player1_gaming_id").notNull(),
  player2Name: text("player2_name").notNull(),
  player2GamingId: text("player2_gaming_id").notNull(),
  player3Name: text("player3_name").notNull(),
  player3GamingId: text("player3_gaming_id").notNull(),
  player4Name: text("player4_name").notNull(),
  player4GamingId: text("player4_gaming_id").notNull(),
  player5Name: text("player5_name").notNull(),
  player5GamingId: text("player5_gaming_id").notNull(),
  bankSlipUrl: text("bank_slip_url"), // Store the uploaded bank slip URL
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  registeredAt: true,
  bankSlipUrl: true,
}).extend({
  teamName: z.string().min(3, "Team name must be at least 3 characters").max(20, "Team name must be at most 20 characters"),
  game: z.enum(["valorant", "cod"], { required_error: "Please select a game" }),
  captainEmail: z.string().email("Please enter a valid email address"),
  captainPhone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be at most 15 digits"),
  player1Name: z.string().min(1, "Player 1 name is required").max(50, "Player name too long"),
  player1GamingId: z.string().min(1, "Player 1 gaming ID is required").max(50, "Gaming ID too long"),
  player2Name: z.string().min(1, "Player 2 name is required").max(50, "Player name too long"),
  player2GamingId: z.string().min(1, "Player 2 gaming ID is required").max(50, "Gaming ID too long"),
  player3Name: z.string().min(1, "Player 3 name is required").max(50, "Player name too long"),
  player3GamingId: z.string().min(1, "Player 3 gaming ID is required").max(50, "Gaming ID too long"),
  player4Name: z.string().min(1, "Player 4 name is required").max(50, "Player name too long"),
  player4GamingId: z.string().min(1, "Player 4 gaming ID is required").max(50, "Gaming ID too long"),
  player5Name: z.string().min(1, "Player 5 name is required").max(50, "Player name too long"),
  player5GamingId: z.string().min(1, "Player 5 gaming ID is required").max(50, "Gaming ID too long"),
  bankSlip: z.any().optional(), // Handle file uploads as any type since File objects can't be JSON stringified
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Game scores table
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: text("score").notNull(), // Store as text for reaction times like "0.234s"
  gameType: text("game_type").notNull().default("reaction"), // Currently only reaction game
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({
  id: true,
  createdAt: true,
}).extend({
  playerName: z.string().min(1, "Player name is required").max(20, "Name must be at most 20 characters"),
  score: z.string().min(1, "Score is required"),
  gameType: z.string().default("reaction"),
});

export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;
