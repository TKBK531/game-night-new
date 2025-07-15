import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Trophy,
    Calendar,
    Clock,
    GamepadIcon,
    Tv,
    Users,
    Zap,
    Target
} from "lucide-react";

export default function MatchDisplay() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedGame, setSelectedGame] = useState<"valorant" | "cod">("valorant");

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch matches data
    const { data: allMatches = [], isLoading, refetch } = useQuery<any[]>({
        queryKey: ['/api/matches', selectedGame],
        queryFn: () => fetch(`/api/matches?game=${selectedGame}`).then(res => res.json()),
        refetchInterval: 30000, // Refetch every 30 seconds for live updates
    });

    // Filter matches by status
    const ongoingMatches = allMatches.filter(m => m.status === "in_progress").slice(0, 3);
    const upcomingMatches = allMatches.filter(m => m.status === "scheduled").slice(0, 6);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "in_progress": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const getTimeUntilMatch = (scheduledTime: string) => {
        const matchTime = new Date(scheduledTime);
        const now = new Date();
        const diff = matchTime.getTime() - now.getTime();

        if (diff <= 0) return "Starting now";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const getTeamLogo = (teamName: string) => {
        // Try to find exact match first, fallback to placeholder
        const logoPath = `/images/TeamLogos/${teamName}.jpg`;
        return logoPath; // Browser will handle 404 and fallback through onError
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#111823] to-[#1a2332] text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#ff4654]/20 to-[#ba3a46]/20 border-b border-[#ff4654]/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex justify-between items-center">
                        <motion.div
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center space-x-3">
                                <Tv className="h-12 w-12 text-[#ff4654]" />
                                <div>
                                    <h1 className="text-4xl font-orbitron font-bold text-[#ff4654]">
                                        Match Display
                                    </h1>
                                    <p className="text-lg text-gray-300">Live Tournament Updates</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="text-right"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="text-3xl font-mono font-bold text-[#ff4654]">
                                {currentTime.toLocaleTimeString()}
                            </div>
                            <div className="text-lg text-gray-300">
                                {currentTime.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Game Selector */}
                    <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Tabs value={selectedGame} onValueChange={(value) => setSelectedGame(value as "valorant" | "cod")}>
                            <TabsList className="bg-[#1a2332] border border-[#ff4654]/30 p-1 h-auto">
                                <TabsTrigger
                                    value="valorant"
                                    className="data-[state=active]:bg-[#ff4654] data-[state=active]:text-white text-xl px-8 py-3"
                                >
                                    <GamepadIcon className="h-6 w-6 mr-3" />
                                    VALORANT
                                </TabsTrigger>
                                <TabsTrigger
                                    value="cod"
                                    className="data-[state=active]:bg-[#ba3a46] data-[state=active]:text-white text-xl px-8 py-3"
                                >
                                    <Target className="h-6 w-6 mr-3" />
                                    CALL OF DUTY
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Live Matches Section */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <div className="flex items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                                <h2 className="text-3xl font-orbitron font-bold text-green-400">
                                    LIVE MATCHES
                                </h2>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-2">
                                {ongoingMatches.length}/3 Active
                            </Badge>
                        </div>
                    </div>

                    {ongoingMatches.length === 0 ? (
                        <Card className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-600/30">
                            <CardContent className="text-center py-16">
                                <Zap className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                                <h3 className="text-2xl font-bold text-gray-400 mb-2">No Live Matches</h3>
                                <p className="text-gray-500 text-lg">Matches will appear here when they start</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            <AnimatePresence>
                                {ongoingMatches.map((match, index) => (
                                    <motion.div
                                        key={match._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <LiveMatchCard match={match} getTeamLogo={getTeamLogo} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Matches Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <div className="flex items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-10 w-10 text-yellow-400" />
                                <h2 className="text-3xl font-orbitron font-bold text-yellow-400">
                                    UPCOMING MATCHES
                                </h2>
                            </div>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-lg px-4 py-2">
                                {upcomingMatches.length} Scheduled
                            </Badge>
                        </div>
                    </div>

                    {upcomingMatches.length === 0 ? (
                        <Card className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-600/30">
                            <CardContent className="text-center py-16">
                                <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                                <h3 className="text-2xl font-bold text-gray-400 mb-2">No Upcoming Matches</h3>
                                <p className="text-gray-500 text-lg">Schedule will be updated soon</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AnimatePresence>
                                {upcomingMatches.map((match, index) => (
                                    <motion.div
                                        key={match._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <UpcomingMatchCard match={match} getTimeUntilMatch={getTimeUntilMatch} getTeamLogo={getTeamLogo} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

// Live Match Card Component
function LiveMatchCard({ match, getTeamLogo }: { match: any; getTeamLogo: (teamName: string) => string }) {
    return (
        <Card className="bg-gradient-to-r from-green-900/40 to-green-800/40 border-green-500/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent"></div>
            <CardContent className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-2">
                            🔴 LIVE
                        </Badge>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Started</p>
                        <p className="text-lg text-white">
                            {match.actualStartTime ? new Date(match.actualStartTime).toLocaleTimeString() : 'Recently'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <img
                                src={getTeamLogo(match.team1Name)}
                                alt={match.team1Name}
                                className="w-16 h-16 rounded-lg object-cover border-2 border-green-400/50"
                                onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzFhMjMzMiIvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHJ4PSI0IiBmaWxsPSIjMTExODIzIiBzdHJva2U9IiNmZjQ2NTQiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjAgMjRoMjRjMy4zMTQgMCA2IDIuNjg2IDYgNnY4YzAgMy4zMTQtMi42ODYgNi02IDZIMjBjLTMuMzE0IDAtNi0yLjY4Ni02LTZ2LThjMC0zLjMxNCAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZjQ2NTQiIG9wYWNpdHk9IjAuOCIvPgo8cmVjdCB4PSIyMiIgeT0iMjgiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmZmZmYiLz4KPHJlY3QgeD0iMTgiIHk9IjMwIiB3aWR0aD0iOCIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzAiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPGNpcmNsZSBjeD0iMzgiIGN5PSIzNCIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIvPgo8Y2lyY2xlIGN4PSI0NiIgY3k9IjM0IiByPSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzgiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPHR5eHQgeD0iMzIiIHk9IjUyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmY0NjU0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPlRFQU08L3RleHQ+Cjwvc3ZnPg==";
                                }}
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{match.team1Name}</h3>
                        {match.team1Score !== undefined && (
                            <div className="text-6xl font-bold text-green-400">{match.team1Score}</div>
                        )}
                    </div>

                    <div className="text-center">
                        <div className="text-gray-400 text-2xl font-bold mb-2">VS</div>
                        <motion.div
                            className="w-3 h-3 bg-green-400 rounded-full mx-auto animate-pulse"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        ></motion.div>
                    </div>

                    <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <img
                                src={getTeamLogo(match.team2Name)}
                                alt={match.team2Name}
                                className="w-16 h-16 rounded-lg object-cover border-2 border-green-400/50"
                                onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzFhMjMzMiIvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHJ4PSI0IiBmaWxsPSIjMTExODIzIiBzdHJva2U9IiNmZjQ2NTQiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjAgMjRoMjRjMy4zMTQgMCA2IDIuNjg2IDYgNnY4YzAgMy4zMTQtMi42ODYgNi02IDZIMjBjLTMuMzE0IDAtNi0yLjY4Ni02LTZ2LThjMC0zLjMxNCAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZjQ2NTQiIG9wYWNpdHk9IjAuOCIvPgo8cmVjdCB4PSIyMiIgeT0iMjgiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmZmZmYiLz4KPHJlY3QgeD0iMTgiIHk9IjMwIiB3aWR0aD0iOCIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzAiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPGNpcmNsZSBjeD0iMzgiIGN5PSIzNCIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIvPgo8Y2lyY2xlIGN4PSI0NiIgY3k9IjM0IiByPSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzgiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPHR5eHQgeD0iMzIiIHk9IjUyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmY0NjU0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPlRFQU08L3RleHQ+Cjwvc3ZnPg==";
                                }}
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{match.team2Name}</h3>
                        {match.team2Score !== undefined && (
                            <div className="text-6xl font-bold text-green-400">{match.team2Score}</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Upcoming Match Card Component
function UpcomingMatchCard({ match, getTimeUntilMatch, getTeamLogo }: {
    match: any;
    getTimeUntilMatch: (time: string) => string;
    getTeamLogo: (teamName: string) => string;
}) {
    const timeUntil = getTimeUntilMatch(match.scheduledTime);
    const isStartingSoon = timeUntil.includes('m') && !timeUntil.includes('h');

    return (
        <Card className={`${isStartingSoon
                ? 'bg-gradient-to-r from-orange-900/40 to-orange-800/40 border-orange-500/50'
                : 'bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 border-yellow-500/50'
            } relative overflow-hidden`}>
            <div className={`absolute inset-0 ${isStartingSoon ? 'bg-gradient-to-r from-orange-500/10' : 'bg-gradient-to-r from-yellow-500/10'
                } to-transparent`}></div>
            <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <Badge className={`${isStartingSoon
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        } text-sm px-3 py-1`}>
                        {match.round}
                    </Badge>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Starting in</p>
                        <p className={`text-lg font-bold ${isStartingSoon ? 'text-orange-400' : 'text-yellow-400'
                            }`}>
                            {timeUntil}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                            <img
                                src={getTeamLogo(match.team1Name)}
                                alt={match.team1Name}
                                className="w-12 h-12 rounded-lg object-cover border-2 border-white/30"
                                onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzFhMjMzMiIvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHJ4PSI0IiBmaWxsPSIjMTExODIzIiBzdHJva2U9IiNmZjQ2NTQiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjAgMjRoMjRjMy4zMTQgMCA2IDIuNjg2IDYgNnY4YzAgMy4zMTQtMi42ODYgNi02IDZIMjBjLTMuMzE0IDAtNi0yLjY4Ni02LTZ2LThjMC0zLjMxNCAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZjQ2NTQiIG9wYWNpdHk9IjAuOCIvPgo8cmVjdCB4PSIyMiIgeT0iMjgiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmZmZmYiLz4KPHJlY3QgeD0iMTgiIHk9IjMwIiB3aWR0aD0iOCIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzAiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPGNpcmNsZSBjeD0iMzgiIGN5PSIzNCIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIvPgo8Y2lyY2xlIGN4PSI0NiIgY3k9IjM0IiByPSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzgiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPHR5eHQgeD0iMzIiIHk9IjUyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmY0NjU0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPlRFQU08L3RleHQ+Cjwvc3ZnPg==";
                                }}
                            />
                        </div>
                        <h4 className="text-lg font-bold text-white">{match.team1Name}</h4>
                    </div>

                    <div className="text-center">
                        <div className="text-gray-400 text-lg font-bold">VS</div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                            <img
                                src={getTeamLogo(match.team2Name)}
                                alt={match.team2Name}
                                className="w-12 h-12 rounded-lg object-cover border-2 border-white/30"
                                onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzFhMjMzMiIvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHJ4PSI0IiBmaWxsPSIjMTExODIzIiBzdHJva2U9IiNmZjQ2NTQiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjAgMjRoMjRjMy4zMTQgMCA2IDIuNjg2IDYgNnY4YzAgMy4zMTQtMi42ODYgNi02IDZIMjBjLTMuMzE0IDAtNi0yLjY4Ni02LTZ2LThjMC0zLjMxNCAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZjQ2NTQiIG9wYWNpdHk9IjAuOCIvPgo8cmVjdCB4PSIyMiIgeT0iMjgiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmZmZmYiLz4KPHJlY3QgeD0iMTgiIHk9IjMwIiB3aWR0aD0iOCIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzAiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPGNpcmNsZSBjeD0iMzgiIGN5PSIzNCIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIvPgo8Y2lyY2xlIGN4PSI0NiIgY3k9IjM0IiByPSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzgiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPHR5eHQgeD0iMzIiIHk9IjUyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmY0NjU0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPlRFQU08L3RleHQ+Cjwvc3ZnPg==";
                                }}
                            />
                        </div>
                        <h4 className="text-lg font-bold text-white">{match.team2Name}</h4>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">
                        Scheduled: {new Date(match.scheduledTime).toLocaleString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
