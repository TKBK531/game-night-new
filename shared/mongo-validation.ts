import { z } from "zod";

// Team validation schema
export const insertTeamSchema = z.object({
    teamName: z.string()
        .min(3, "Team name must be at least 3 characters")
        .max(20, "Team name must be at most 20 characters"),
    game: z.enum(["valorant", "cod"], {
        required_error: "Please select a game"
    }),
    captainEmail: z.string()
        .email("Please enter a valid email address"),
    captainPhone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits"),
    player1Name: z.string()
        .min(1, "Player 1 name is required")
        .max(50, "Player name too long"),
    player1GamingId: z.string()
        .min(1, "Player 1 gaming ID is required")
        .max(50, "Gaming ID too long"),
    player1ValorantId: z.string().optional().or(z.literal("")),
    player2Name: z.string()
        .min(1, "Player 2 name is required")
        .max(50, "Player name too long"),
    player2GamingId: z.string()
        .min(1, "Player 2 gaming ID is required")
        .max(50, "Gaming ID too long"),
    player2ValorantId: z.string().optional().or(z.literal("")),
    player3Name: z.string()
        .min(1, "Player 3 name is required")
        .max(50, "Player name too long"),
    player3GamingId: z.string()
        .min(1, "Player 3 gaming ID is required")
        .max(50, "Gaming ID too long"),
    player3ValorantId: z.string().optional().or(z.literal("")),
    player4Name: z.string()
        .min(1, "Player 4 name is required")
        .max(50, "Player name too long"),
    player4GamingId: z.string()
        .min(1, "Player 4 gaming ID is required")
        .max(50, "Gaming ID too long"),
    player4ValorantId: z.string().optional().or(z.literal("")),
    player5Name: z.string()
        .min(1, "Player 5 name is required")
        .max(50, "Player name too long"),
    player5GamingId: z.string()
        .min(1, "Player 5 gaming ID is required")
        .max(50, "Gaming ID too long"),
    player5ValorantId: z.string().optional().or(z.literal("")),
    bankSlip: z.any().optional(), // Handle file uploads as any type since File objects can't be JSON stringified
    // GridFS file fields (used internally)
    bankSlipFile: z.instanceof(Buffer).optional(),
    bankSlipFileName: z.string().optional(),
    bankSlipContentType: z.string().optional()
}).refine((data) => {
    // If game is Valorant, require Valorant user IDs for all players
    if (data.game === "valorant") {
        return data.player1ValorantId && data.player1ValorantId.trim() !== "" &&
            data.player2ValorantId && data.player2ValorantId.trim() !== "" &&
            data.player3ValorantId && data.player3ValorantId.trim() !== "" &&
            data.player4ValorantId && data.player4ValorantId.trim() !== "" &&
            data.player5ValorantId && data.player5ValorantId.trim() !== "";
    }
    return true;
}, {
    message: "Valorant user IDs are required for all players when registering for Valorant tournament",
    path: ["game"],
});

// Game score validation schema
export const insertGameScoreSchema = z.object({
    playerName: z.string()
        .min(1, "Player name is required")
        .max(50, "Player name too long"),
    score: z.string()
        .min(1, "Score is required"),
    gameType: z.string()
        .min(1, "Game type is required")
        .max(50, "Game type too long"),
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
