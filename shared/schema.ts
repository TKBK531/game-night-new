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
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  registeredAt: true,
}).extend({
  teamName: z.string().min(3, "Team name must be at least 3 characters").max(20, "Team name must be at most 20 characters"),
  game: z.enum(["valorant", "cod"], { required_error: "Please select a game" }),
  captainEmail: z.string().email("Please enter a valid email address"),
  captainPhone: z.string().min(10, "Please enter a valid phone number"),
  player1Name: z.string().min(1, "Player 1 name is required"),
  player1GamingId: z.string().min(1, "Player 1 gaming ID is required"),
  player2Name: z.string().min(1, "Player 2 name is required"),
  player2GamingId: z.string().min(1, "Player 2 gaming ID is required"),
  player3Name: z.string().min(1, "Player 3 name is required"),
  player3GamingId: z.string().min(1, "Player 3 gaming ID is required"),
  player4Name: z.string().min(1, "Player 4 name is required"),
  player4GamingId: z.string().min(1, "Player 4 gaming ID is required"),
  player5Name: z.string().min(1, "Player 5 name is required"),
  player5GamingId: z.string().min(1, "Player 5 gaming ID is required"),
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
