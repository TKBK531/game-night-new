import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Mail, Target, Zap, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

// Konami Code sequence: ↑↑↓↓←→←→BA
const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "KeyB", "KeyA"
];

interface SecretChallenge {
  _id: string;
  playerEmail: string;
  score: number;
  completedAt: string;
}

type GameState = "hidden" | "revealed" | "playing" | "completed";

export default function KonamiCodeChallenge() {
  const { toast } = useToast();
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>("hidden");
  const [playerEmail, setPlayerEmail] = useState("");
  const [gameScore, setGameScore] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [targets, setTargets] = useState<{ id: number; x: number; y: number; clicked: boolean }[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if player has already completed the challenge
  const { data: hasCompleted } = useQuery<{hasCompleted: boolean}>({
    queryKey: ['/api/secret-challenge/check', playerEmail],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/secret-challenge/check/${encodeURIComponent(playerEmail)}`);
      return response.json();
    },
    enabled: !!playerEmail && playerEmail.includes('@'),
    initialData: { hasCompleted: false },
  });

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: async (data: { playerEmail: string; score: number }) => {
      const response = await apiRequest("POST", "/api/secret-challenge", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🏆 Congratulations!",
        description: `You've completed the secret challenge! Your score: ${gameScore} points. Your ranking will be visible to admins.`,
      });
      setGameState("completed");
    },
    onError: (error: any) => {
      if (error.message?.includes("already completed")) {
        toast({
          title: "Already Completed",
          description: "You've already completed this challenge! Only one attempt per email is allowed.",
          variant: "destructive",
        });
        setGameState("completed");
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to submit score. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Konami code detection
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState !== "hidden") return;

    const newSequence = [...inputSequence, event.code];
    
    // Keep only the last 10 keys (length of Konami code)
    if (newSequence.length > KONAMI_CODE.length) {
      newSequence.shift();
    }
    
    setInputSequence(newSequence);
    
    // Check if the sequence matches Konami code
    if (newSequence.length === KONAMI_CODE.length) {
      const matches = KONAMI_CODE.every((key, index) => key === newSequence[index]);
      if (matches) {
        setGameState("revealed");
        toast({
          title: "🎮 Secret Unlocked!",
          description: "You've discovered the secret challenge! Get ready to prove your gaming skills.",
        });
        // Reset sequence after successful activation
        setInputSequence([]);
      }
    }
  }, [inputSequence, gameState, toast]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Generate random targets for the mini-game
  const generateTargets = () => {
    const newTargets = [];
    for (let i = 0; i < 15; i++) {
      newTargets.push({
        id: i,
        x: Math.random() * 80 + 10, // 10-90% of container width
        y: Math.random() * 80 + 10, // 10-90% of container height
        clicked: false,
      });
    }
    setTargets(newTargets);
  };

  // Start the mini-game
  const startGame = () => {
    if (!playerEmail || !playerEmail.includes('@') || !playerEmail.includes('.')) {
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address to start the challenge.",
        variant: "destructive",
      });
      return;
    }

    if (!playerEmail.endsWith('pdn.ac.lk')) {
      toast({
        title: "University Email Required",
        description: "Only university emails ending with 'pdn.ac.lk' are allowed to participate in this secret challenge.",
        variant: "destructive",
      });
      return;
    }

    if (hasCompleted?.hasCompleted) {
      toast({
        title: "Already Completed",
        description: "You've already completed this challenge! Only one attempt per email is allowed.",
        variant: "destructive",
      });
      return;
    }

    setGameState("playing");
    setGameScore(0);
    setTimeRemaining(30);
    setGameStartTime(Date.now());
    generateTargets();

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // End the game
  const endGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState("completed");
  };

  // Handle target click
  const handleTargetClick = (targetId: number) => {
    setTargets((prev) =>
      prev.map((target) =>
        target.id === targetId ? { ...target, clicked: true } : target
      )
    );
    setGameScore((prev) => prev + 100);

    // Check if all targets are clicked
    const allClicked = targets.every((target) => target.id === targetId || target.clicked);
    if (allClicked) {
      // Bonus points for completing early
      const timeBonus = timeRemaining * 10;
      setGameScore((prev) => prev + timeBonus);
      endGame();
    }
  };

  // Submit final score
  const submitScore = () => {
    submitScoreMutation.mutate({
      playerEmail: playerEmail.trim(),
      score: gameScore,
    });
  };

  // Reset to hidden state
  const resetChallenge = () => {
    setGameState("hidden");
    setPlayerEmail("");
    setGameScore(0);
    setTargets([]);
    setTimeRemaining(30);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  if (gameState === "hidden") {
    return null; // Component is completely hidden until Konami code is entered
  }

  return (
    <Dialog open={gameState === "revealed" || gameState === "playing" || gameState === "completed"} onOpenChange={() => resetChallenge()}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 border-purple-500/50 text-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron text-center flex items-center justify-center gap-2">
            <Star className="text-yellow-400" />
            Secret Gaming Challenge
            <Star className="text-yellow-400" />
          </DialogTitle>
          <DialogDescription className="text-purple-200 text-center">
            You've unlocked the hidden challenge! Test your reflexes and compete for the ultimate prize!
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {gameState === "revealed" && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">🎮</div>
                <h3 className="text-xl font-bold text-purple-200">
                  Welcome to the Elite Challenge!
                </h3>
                <p className="text-purple-300">
                  Only true gamers who know the legendary Konami Code can access this challenge.
                  You have 30 seconds to click all the targets that appear. The faster you are, the higher your score!
                </p>
                <div className="bg-purple-800/50 p-4 rounded-lg border border-purple-500/50">
                  <h4 className="font-bold text-yellow-400 mb-2">🏆 Prize for #1:</h4>
                  <p className="text-purple-200">The first place winner gets an exclusive gaming prize!</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-200">Your Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your university email (ending with pdn.ac.lk)"
                    value={playerEmail}
                    onChange={(e) => setPlayerEmail(e.target.value)}
                    className="bg-purple-800/50 border-purple-500/50 text-white placeholder:text-purple-300"
                  />
                  <p className="text-xs text-purple-300">
                    📧 Only university emails ending with 'pdn.ac.lk' are allowed
                  </p>
                  {hasCompleted?.hasCompleted && (
                    <p className="text-sm text-yellow-400">
                      ⚠️ This email has already completed the challenge!
                    </p>
                  )}
                </div>

                <Button
                  onClick={startGame}
                  disabled={!playerEmail || hasCompleted?.hasCompleted}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Start Challenge
                </Button>
              </div>
            </motion.div>
          )}

          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center bg-purple-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-400" />
                  <span className="font-bold">Score: {gameScore}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Time: {timeRemaining}s</span>
                </div>
              </div>

              <div
                ref={gameAreaRef}
                className="relative w-full h-96 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg border-2 border-purple-500/50 overflow-hidden"
                style={{ cursor: "crosshair" }}
              >
                {targets.map((target) => (
                  <motion.button
                    key={target.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: target.clicked ? 0 : 1 }}
                    className={`absolute w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-white shadow-lg ${
                      target.clicked ? "pointer-events-none" : "hover:scale-110"
                    }`}
                    style={{
                      left: `${target.x}%`,
                      top: `${target.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => handleTargetClick(target.id)}
                  />
                ))}
              </div>

              <p className="text-center text-purple-300 text-sm">
                Click all the golden targets as fast as you can! Each target = 100 points + time bonus
              </p>
            </motion.div>
          )}

          {gameState === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl">🎉</div>
              <h3 className="text-2xl font-bold text-yellow-400">Challenge Complete!</h3>
              <div className="bg-purple-800/50 p-6 rounded-lg border border-purple-500/50">
                <div className="text-3xl font-bold text-white mb-2">{gameScore} Points</div>
                <p className="text-purple-200">
                  Targets Hit: {targets.filter(t => t.clicked).length} / {targets.length}
                </p>
                {timeRemaining > 0 && (
                  <p className="text-purple-200">Time Bonus: {timeRemaining * 10} points</p>
                )}
                <p className="text-sm text-purple-300 mt-4">
                  Your score will be recorded in the admin leaderboard for prize consideration.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={submitScore}
                  disabled={submitScoreMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  {submitScoreMutation.isPending ? "Submitting..." : "Submit Score"}
                </Button>
                <Button
                  onClick={() => {
                    setGameState("revealed");
                    setGameScore(0);
                  }}
                  variant="outline"
                  className="border-purple-500/50 text-purple-200 hover:bg-purple-800/50"
                >
                  Try Again
                </Button>
                <Button
                  onClick={resetChallenge}
                  variant="outline"
                  className="border-purple-500/50 text-purple-200 hover:bg-purple-800/50"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
