import { z } from "zod";

// Re-export types from mongo-schema for convenience
export type { ITeam, IGameScore, IUser, ISecretChallenge } from "./mongo-schema";

// Team validation schema
export const insertTeamSchema = z
  .object({
    teamName: z
      .string()
      .min(3, "Team name must be at least 3 characters")
      .max(20, "Team name must be at most 20 characters"),
    game: z.enum(["valorant", "cod"], {
      required_error: "Please select a tournament to register for",
      invalid_type_error: "Please select a valid tournament",
    }),
    captainEmail: z.string().email("Please enter a valid email address"),
    captainPhone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be at most 15 digits"),
    player1Name: z
      .string()
      .min(1, "Player 1 name is required")
      .max(50, "Player name too long"),
    player1GamingId: z
      .string()
      .min(1, "Player 1 gaming ID is required")
      .max(50, "Gaming ID too long"),
    player1UniversityEmail: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => email.endsWith("pdn.ac.lk"), {
        message: "University email must end with pdn.ac.lk",
      }),
    player1ValorantId: z.string().optional().or(z.literal("")),
    player2Name: z
      .string()
      .min(1, "Player 2 name is required")
      .max(50, "Player name too long"),
    player2GamingId: z
      .string()
      .min(1, "Player 2 gaming ID is required")
      .max(50, "Gaming ID too long"),
    player2UniversityEmail: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => email.endsWith("pdn.ac.lk"), {
        message: "University email must end with pdn.ac.lk",
      }),
    player2ValorantId: z.string().optional().or(z.literal("")),
    player3Name: z
      .string()
      .min(1, "Player 3 name is required")
      .max(50, "Player name too long"),
    player3GamingId: z
      .string()
      .min(1, "Player 3 gaming ID is required")
      .max(50, "Gaming ID too long"),
    player3UniversityEmail: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => email.endsWith("pdn.ac.lk"), {
        message: "University email must end with pdn.ac.lk",
      }),
    player3ValorantId: z.string().optional().or(z.literal("")),
    player4Name: z
      .string()
      .min(1, "Player 4 name is required")
      .max(50, "Player name too long"),
    player4GamingId: z
      .string()
      .min(1, "Player 4 gaming ID is required")
      .max(50, "Gaming ID too long"),
    player4UniversityEmail: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => email.endsWith("pdn.ac.lk"), {
        message: "University email must end with pdn.ac.lk",
      }),
    player4ValorantId: z.string().optional().or(z.literal("")),
    player5Name: z
      .string()
      .min(1, "Player 5 name is required")
      .max(50, "Player name too long"),
    player5GamingId: z
      .string()
      .min(1, "Player 5 gaming ID is required")
      .max(50, "Gaming ID too long"),
    player5UniversityEmail: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => email.endsWith("pdn.ac.lk"), {
        message: "University email must end with pdn.ac.lk",
      }),
    player5ValorantId: z.string().optional().or(z.literal("")),
    bankSlip: z.any().optional(), // Handle file uploads as any type since File objects can't be JSON stringified
  })
  .refine(
    (data) => {
      // If game is Valorant, require Valorant user IDs for all players
      if (data.game === "valorant") {
        return (
          data.player1ValorantId &&
          data.player1ValorantId.trim() !== "" &&
          data.player2ValorantId &&
          data.player2ValorantId.trim() !== "" &&
          data.player3ValorantId &&
          data.player3ValorantId.trim() !== "" &&
          data.player4ValorantId &&
          data.player4ValorantId.trim() !== "" &&
          data.player5ValorantId &&
          data.player5ValorantId.trim() !== ""
        );
      }
      return true;
    },
    {
      message:
        "Valorant user IDs are required for all players when registering for Valorant tournament",
      path: ["game"],
    }
  )
  .refine(
    (data) => {
      // If game is Valorant, require bank slip
      if (data.game === "valorant") {
        return data.bankSlip !== undefined && data.bankSlip !== null;
      }
      // COD doesn't require bank slip initially
      return true;
    },
    {
      message: "Bank slip is required for Valorant tournament registration",
      path: ["bankSlip"],
    }
  );

// Game score validation schema
export const insertGameScoreSchema = z.object({
  playerName: z
    .string()
    .min(1, "Player name is required")
    .max(50, "Player name too long"),
  score: z.string().min(1, "Score is required"),
  gameType: z
    .string()
    .min(1, "Game type is required")
    .max(50, "Game type too long"),
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;

// Secret challenge validation schema
export const insertSecretChallengeSchema = z.object({
  playerEmail: z.string().email("Please enter a valid email address").min(5, "Email too short").max(100, "Email too long"),
  score: z.number().min(0, "Score must be a positive number").max(2000, "Score seems too high"),
});

export type InsertSecretChallenge = z.infer<typeof insertSecretChallengeSchema>;

// User validation schemas
export const loginUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
  role: z.enum(["superuser", "elite_board", "top_board"], {
    required_error: "Please select a user role",
  }),
});

export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
