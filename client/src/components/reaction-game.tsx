import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Trophy, Play, RotateCcw, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { GameScore } from "@shared/schema";

type GameState = "waiting" | "ready" | "go" | "finished" | "early";

export default function ReactionGame() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [playerName, setPlayerName] = useState("");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<GameScore[]>({
    queryKey: ['/api/game-scores/leaderboard/reaction'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/game-scores/leaderboard/reaction");
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    initialData: [], // Provide empty array as initial data
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (data: { playerName: string; score: string; gameType: string }) => {
      const response = await apiRequest("POST", "/api/game-scores", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Score Submitted!",
        description: "Your reaction time has been added to the leaderboard.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/game-scores/leaderboard/reaction'] });
      setShowNameInput(false);
      setPlayerName("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Submit Score",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startGame = () => {
    if (gameState !== "waiting") return;

    setGameState("ready");
    setReactionTime(null);

    // Random delay between 2-6 seconds
    const delay = Math.random() * 4000 + 2000;

    timeoutRef.current = setTimeout(() => {
      setGameState("go");
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === "ready") {
      // Clicked too early
      setGameState("early");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else if (gameState === "go") {
      // Good reaction
      const endTime = Date.now();
      const reaction = (endTime - (startTime || 0)) / 1000;
      setReactionTime(reaction);
      setGameState("finished");
      setShowNameInput(true);
    }
  };

  const resetGame = () => {
    setGameState("waiting");
    setReactionTime(null);
    setStartTime(null);
    setShowNameInput(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const submitScore = () => {
    if (!playerName.trim() || !reactionTime) return;

    submitScoreMutation.mutate({
      playerName: playerName.trim(),
      score: `${reactionTime.toFixed(3)}s`,
      gameType: "reaction",
    });
  };

  const getGameContent = () => {
    switch (gameState) {
      case "waiting":
        return (
          <div className="text-center">
            <Target className="text-6xl text-[#ff4654] mx-auto mb-4" />
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">Ready to Test Your Reflexes?</h3>
            <p className="text-gray-300 mb-6">Click the button below to start, then click again when the screen turns green!</p>
            <Button onClick={startGame} className="gaming-button px-8 py-4 text-lg">
              <Play className="mr-2" />
              Start Game
            </Button>
          </div>
        );

      case "ready":
        return (
          <div className="text-center">
            <div className="text-6xl text-[#ba3a46] mb-4">⏱️</div>
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-[#ba3a46]">Get Ready...</h3>
            <p className="text-gray-300 mb-6">Wait for the green signal, then click as fast as you can!</p>
            <div className="text-lg text-gray-400">Don't click yet...</div>
          </div>
        );

      case "go":
        return (
          <div className="text-center">
            <Zap className="text-6xl text-[#ffffff] mx-auto mb-4 animate-pulse" />
            <h3 className="text-3xl font-orbitron font-bold mb-4 text-[#ffffff]">CLICK NOW!</h3>
            <div className="text-xl text-[#ffffff]">⚡ GO GO GO! ⚡</div>
          </div>
        );

      case "early":
        return (
          <div className="text-center">
            <div className="text-6xl text-red-500 mb-4">❌</div>
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-red-500">Too Early!</h3>
            <p className="text-gray-300 mb-6">You clicked before the green signal. Wait for it next time!</p>
            <Button onClick={resetGame} className="gaming-button px-6 py-3">
              <RotateCcw className="mr-2" />
              Try Again
            </Button>
          </div>
        );

      case "finished":
        return (
          <div className="text-center">
            <Trophy className="text-6xl text-[#ff4654] mx-auto mb-4" />
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-[#ff4654]">Great Reflexes!</h3>
            <div className="text-4xl font-orbitron font-bold text-[#ff4654] mb-6">
              {reactionTime?.toFixed(3)}s
            </div>
            {showNameInput && (
              <div className="space-y-4">
                <div>
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name for leaderboard"
                    className="gaming-input max-w-xs mx-auto"
                    maxLength={20}
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={submitScore}
                    disabled={!playerName.trim() || submitScoreMutation.isPending}
                    className="gaming-button px-6 py-2"
                  >
                    Submit Score
                  </Button>
                  <Button onClick={resetGame} variant="outline" className="px-6 py-2">
                    <RotateCcw className="mr-2" />
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="game" className="py-20 bg-[#1a2332]/50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ba3a46] animate-glow">
            Reaction Speed Challenge
          </h2>
          <p className="text-xl text-gray-300">
            Test your gaming reflexes and compete on the leaderboard!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Game Area */}
          <div className="gaming-border rounded-xl p-8">
            <div
              className={`min-h-[400px] flex items-center justify-center rounded-lg cursor-pointer transition-all ${gameState === "go" ? "bg-[#ffffff]/20" :
                  gameState === "ready" ? "bg-[#ba3a46]/20" :
                    gameState === "early" ? "bg-red-500/20" :
                      "bg-[#242d3d]/50"
                }`}
              onClick={handleClick}
            >
              {getGameContent()}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="gaming-border rounded-xl p-8">
            <h3 className="text-2xl font-orbitron font-bold mb-6 text-[#ff4654] flex items-center">
              <Trophy className="mr-2" />
              Leaderboard
            </h3>

            {leaderboardLoading ? (
              <div className="text-center text-gray-400">Loading leaderboard...</div>
            ) : (
              <div className="space-y-3">
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.slice(0, 10).map((score: GameScore, index: number) => (
                    <div
                      key={score.id}
                      className={`flex items-center justify-between p-3 rounded-lg hover-lift ${index === 0 ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20" :
                          index === 1 ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20" :
                            index === 2 ? "bg-gradient-to-r from-orange-500/20 to-orange-600/20" :
                              "bg-[#242d3d]/30"
                        }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold ${index === 0 ? "bg-yellow-500/30 text-yellow-400" :
                            index === 1 ? "bg-gray-400/30 text-gray-300" :
                              index === 2 ? "bg-orange-500/30 text-orange-400" :
                                "bg-[#ff4654]/20 text-[#ff4654]"
                          }`}>
                          {index + 1}
                        </div>
                        <div className="text-white font-semibold">{score.playerName}</div>
                      </div>
                      <div className="text-[#ffffff] font-orbitron font-bold">
                        {score.score}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No scores yet. Be the first to play!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}