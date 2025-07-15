import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
    Trophy,
    Calendar,
    Clock,
    Users,
    Target,
    Crown,
    Medal,
    Award,
    Home,
    ArrowLeft,
    Image as ImageIcon,
    Play,
    Pause,
    CheckCircle,
    XCircle,
    Timer,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "../../../shared/config";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { staggerVariants } from "@/hooks/use-scroll-reveal";

interface LeaderboardScore {
    _id: string;
    teamId: string;
    teamName: string;
    game: "valorant" | "cod";
    score: number;
    matchesWon: number;
    matchesLost: number;
    totalMatches: number;
    lastUpdated: string;
    updatedBy: string;
}

interface Match {
    _id: string;
    game: "valorant" | "cod";
    team1Id: string;
    team1Name: string;
    team2Id: string;
    team2Name: string;
    status: "scheduled" | "in_progress" | "completed" | "cancelled";
    scheduledTime: string;
    actualStartTime?: string;
    actualEndTime?: string;
    winnerId?: string;
    winnerName?: string;
    team1Score?: number;
    team2Score?: number;
    round: string;
    createdBy: string;
    createdAt: string;
    lastUpdated: string;
}

const getTeamLogo = (teamName: string) => {
    // Try to find exact match first, fallback to placeholder
    const logoPath = `/images/TeamLogos/${teamName}.jpg`;
    return logoPath; // Browser will handle 404 and fallback through onError
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "scheduled":
            return <Calendar className="h-4 w-4 text-yellow-400" />;
        case "in_progress":
            return <Play className="h-4 w-4 text-green-400" />;
        case "completed":
            return <CheckCircle className="h-4 w-4 text-blue-400" />;
        case "cancelled":
            return <XCircle className="h-4 w-4 text-red-400" />;
        default:
            return <Timer className="h-4 w-4 text-gray-400" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "scheduled":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        case "in_progress":
            return "bg-green-500/20 text-green-400 border-green-500/30";
        case "completed":
            return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        case "cancelled":
            return "bg-red-500/20 text-red-400 border-red-500/30";
        default:
            return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
};

const getRankIcon = (index: number) => {
    switch (index) {
        case 0:
            return <Crown className="h-6 w-6 text-yellow-400" />;
        case 1:
            return <Medal className="h-6 w-6 text-gray-300" />;
        case 2:
            return <Award className="h-6 w-6 text-orange-400" />;
        default:
            return <Trophy className="h-5 w-5 text-[#ff4654]" />;
    }
};

const getRankColors = (index: number) => {
    switch (index) {
        case 0:
            return "bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border-yellow-500/50";
        case 1:
            return "bg-gradient-to-r from-gray-600/20 to-gray-500/20 border-gray-400/50";
        case 2:
            return "bg-gradient-to-r from-orange-700/20 to-orange-600/20 border-orange-500/50";
        default:
            return "bg-[#1a2332] border-[#ff4654]/20";
    }
};

export default function LeaderboardPage() {
    const [selectedGame, setSelectedGame] = useState<"valorant" | "cod">("valorant");

    // Fetch leaderboard data
    const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery<LeaderboardScore[]>({
        queryKey: ['/api/leaderboard', selectedGame],
        queryFn: () => fetch(`/api/leaderboard?game=${selectedGame}`).then(res => res.json()),
    });

    // Fetch matches data
    const { data: matches = [], isLoading: isLoadingMatches } = useQuery<Match[]>({
        queryKey: ['/api/matches', selectedGame],
        queryFn: () => fetch(`/api/matches?game=${selectedGame}`).then(res => res.json()),
    });

    // Filter matches by status
    const inProgressMatches = matches.filter(m => m.status === "in_progress");
    const upcomingMatches = matches.filter(m => m.status === "scheduled").slice(0, 5);
    const recentMatches = matches.filter(m => m.status === "completed").slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#111823] via-[#0a0f1a] to-[#1a2332] text-white">
            {/* Navigation */}
            <nav className="border-b border-[#ff4654]/30 bg-[#111823]/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <motion.div
                                className="flex items-center"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Trophy className="h-8 w-8 text-[#ff4654] mr-3" />
                                <div>
                                    <h1 className="text-2xl font-orbitron font-bold text-[#ff4654]">
                                        Leaderboard
                                    </h1>
                                    <p className="text-sm text-gray-400">
                                        Live Tournament Standings
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                        <Link href="/">
                            <motion.div
                                className="flex items-center text-gray-300 hover:text-[#ff4654] transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                <span>Back to Home</span>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <ScrollReveal variant="fadeInUp">
                    <div className="text-center mb-12">
                        <motion.h2
                            className="text-4xl md:text-5xl font-orbitron font-bold mb-6"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="bg-gradient-to-r from-[#ff4654] to-[#ba3a46] bg-clip-text text-transparent">
                                Tournament Leaderboard
                            </span>
                        </motion.h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Track the progress of elite teams as they battle for ultimate gaming supremacy
                        </p>
                    </div>
                </ScrollReveal>

                {/* Game Selector */}
                <ScrollReveal variant="fadeInUp" delay={0.2}>
                    <div className="flex justify-center mb-8">
                        <Tabs
                            value={selectedGame}
                            onValueChange={(value) => setSelectedGame(value as "valorant" | "cod")}
                            className="w-full max-w-md"
                        >
                            <TabsList className="grid w-full grid-cols-2 bg-[#1a2332] border border-[#ff4654]/30">
                                <TabsTrigger
                                    value="valorant"
                                    className="data-[state=active]:bg-[#ff4654] data-[state=active]:text-white font-semibold"
                                >
                                    <Target className="h-4 w-4 mr-2" />
                                    Valorant
                                </TabsTrigger>
                                <TabsTrigger
                                    value="cod"
                                    className="data-[state=active]:bg-[#ba3a46] data-[state=active]:text-white font-semibold"
                                >
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Call of Duty
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Leaderboard */}
                    <div className="lg:col-span-2">
                        <ScrollReveal variant="fadeInLeft" delay={0.3}>
                            <Card className="bg-[#111823]/80 backdrop-blur-lg border-[#ff4654]/30">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-orbitron text-[#ff4654] flex items-center">
                                        <Trophy className="h-6 w-6 mr-3" />
                                        {selectedGame === "valorant" ? "Valorant" : "Call of Duty"} Standings
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Current tournament rankings and statistics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingLeaderboard ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4654]"></div>
                                        </div>
                                    ) : leaderboard.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <Trophy className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                            <p>No teams in the leaderboard yet</p>
                                            <p className="text-sm mt-2 opacity-60">
                                                Scores will appear here as matches are played
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {leaderboard.map((team, index) => (
                                                <motion.div
                                                    key={team._id}
                                                    className={`flex items-center p-4 rounded-lg border ${getRankColors(index)}`}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.02, x: 5 }}
                                                >
                                                    <div className="flex items-center space-x-4 flex-1">
                                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#ff4654]/20 text-[#ff4654] font-bold">
                                                            {getRankIcon(index)}
                                                        </div>

                                                        <div className="relative">
                                                            <img
                                                                src={getTeamLogo(team.teamName)}
                                                                alt={team.teamName}
                                                                className="w-12 h-12 rounded-lg object-cover border-2 border-[#ff4654]/30"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzFhMjMzMiIvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHJ4PSI0IiBmaWxsPSIjMTExODIzIiBzdHJva2U9IiNmZjQ2NTQiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjAgMjRoMjRjMy4zMTQgMCA2IDIuNjg2IDYgNnY4YzAgMy4zMTQtMi42ODYgNi02IDZIMjBjLTMuMzE0IDAtNi0yLjY4Ni02LTZ2LThjMC0zLjMxNCAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZjQ2NTQiIG9wYWNpdHk9IjAuOCIvPgo8cmVjdCB4PSIyMiIgeT0iMjgiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmZmZmYiLz4KPHJlY3QgeD0iMTgiIHk9IjMwIiB3aWR0aD0iOCIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzAiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPGNpcmNsZSBjeD0iMzgiIGN5PSIzNCIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIvPgo8Y2lyY2xlIGN4PSI0NiIgY3k9IjM0IiByPSIyIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iMzgiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPHR5eHQgeD0iMzIiIHk9IjUyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmY0NjU0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPlRFQU08L3RleHQ+Cjwvc3ZnPg==";
                                                                }}
                                                            />
                                                            {index === 0 && (
                                                                <div className="absolute -top-1 -right-1">
                                                                    <Crown className="h-4 w-4 text-yellow-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold text-white text-lg">
                                                                {team.teamName}
                                                            </h3>
                                                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                                <span>{team.matchesWon}W</span>
                                                                <span>•</span>
                                                                <span>{team.matchesLost}L</span>
                                                                <span>•</span>
                                                                <span>{team.totalMatches} matches</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-[#ff4654]">
                                                            {team.score}
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            points
                                                        </div>
                                                    </div>

                                                    <div className="ml-4 text-right">
                                                        <div className="text-lg font-bold text-white">
                                                            #{index + 1}
                                                        </div>
                                                        {team.matchesWon > 0 && (
                                                            <div className="text-xs text-green-400">
                                                                {Math.round((team.matchesWon / team.totalMatches) * 100)}% win rate
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    </div>

                    {/* Matches Sidebar */}
                    <div className="space-y-6">
                        {/* Live Matches */}
                        <ScrollReveal variant="fadeInRight" delay={0.4}>
                            <Card className="bg-[#111823]/80 backdrop-blur-lg border-[#ba3a46]/30">
                                <CardHeader>
                                    <CardTitle className="text-lg font-orbitron text-[#ba3a46] flex items-center">
                                        <Play className="h-5 w-5 mr-2" />
                                        Live Matches
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {inProgressMatches.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400">
                                            <Pause className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                            <p className="text-sm">No live matches</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {inProgressMatches.map((match) => (
                                                <motion.div
                                                    key={match._id}
                                                    className="p-3 bg-[#1a2332]/50 rounded-lg border border-green-500/30"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                            <Play className="h-3 w-3 mr-1" />
                                                            LIVE
                                                        </Badge>
                                                        <span className="text-xs text-gray-400">{match.round}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-white">{match.team1Name}</span>
                                                            <span className="text-sm text-[#ff4654]">{match.team1Score || 0}</span>
                                                        </div>
                                                        <div className="flex items-center justify-center">
                                                            <div className="text-xs text-gray-400">VS</div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-white">{match.team2Name}</span>
                                                            <span className="text-sm text-[#ff4654]">{match.team2Score || 0}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </ScrollReveal>

                        {/* Upcoming Matches */}
                        <ScrollReveal variant="fadeInRight" delay={0.5}>
                            <Card className="bg-[#111823]/80 backdrop-blur-lg border-[#ff4654]/30">
                                <CardHeader>
                                    <CardTitle className="text-lg font-orbitron text-[#ff4654] flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Upcoming Matches
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {upcomingMatches.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400">
                                            <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                            <p className="text-sm">No upcoming matches</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {upcomingMatches.map((match) => (
                                                <motion.div
                                                    key={match._id}
                                                    className="p-3 bg-[#1a2332]/50 rounded-lg border border-[#ff4654]/20"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge className={getStatusColor(match.status)}>
                                                            {getStatusIcon(match.status)}
                                                            <span className="ml-1">{match.status.toUpperCase()}</span>
                                                        </Badge>
                                                        <span className="text-xs text-gray-400">{match.round}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-white">{match.team1Name}</div>
                                                        <div className="flex items-center justify-center">
                                                            <div className="text-xs text-gray-400">VS</div>
                                                        </div>
                                                        <div className="text-sm font-medium text-white">{match.team2Name}</div>
                                                    </div>
                                                    <div className="mt-2 text-xs text-gray-400 flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {new Date(match.scheduledTime).toLocaleString()}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </ScrollReveal>

                        {/* Recent Results */}
                        <ScrollReveal variant="fadeInRight" delay={0.6}>
                            <Card className="bg-[#111823]/80 backdrop-blur-lg border-[#ba3a46]/30">
                                <CardHeader>
                                    <CardTitle className="text-lg font-orbitron text-[#ba3a46] flex items-center">
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Recent Results
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentMatches.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400">
                                            <Trophy className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                            <p className="text-sm">No completed matches</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentMatches.map((match) => (
                                                <motion.div
                                                    key={match._id}
                                                    className="p-3 bg-[#1a2332]/50 rounded-lg border border-blue-500/20"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            COMPLETED
                                                        </Badge>
                                                        <span className="text-xs text-gray-400">{match.round}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-sm font-medium ${match.winnerId === match.team1Id ? 'text-green-400' : 'text-white'}`}>
                                                                {match.team1Name}
                                                            </span>
                                                            <span className="text-sm text-[#ff4654]">{match.team1Score || 0}</span>
                                                        </div>
                                                        <div className="flex items-center justify-center">
                                                            <div className="text-xs text-gray-400">VS</div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-sm font-medium ${match.winnerId === match.team2Id ? 'text-green-400' : 'text-white'}`}>
                                                                {match.team2Name}
                                                            </span>
                                                            <span className="text-sm text-[#ff4654]">{match.team2Score || 0}</span>
                                                        </div>
                                                    </div>
                                                    {match.winnerName && (
                                                        <div className="mt-2 text-xs text-green-400 flex items-center justify-center">
                                                            <Crown className="h-3 w-3 mr-1" />
                                                            Winner: {match.winnerName}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    </div>
                </div>

                {/* Tournament Info */}
                <ScrollReveal variant="fadeInUp" delay={0.7}>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-[#111823]/80 backdrop-blur-lg border-[#ff4654]/30">
                            <CardContent className="p-6 text-center">
                                <Trophy className="h-12 w-12 text-[#ff4654] mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Prize Pool</h3>
                                <p className="text-2xl font-bold text-[#ff4654]">
                                    {selectedGame === "valorant"
                                        ? siteConfig.tournaments.valorant.prizePool
                                        : siteConfig.tournaments.cod.prizePool}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111823]/80 backdrop-blur-lg border-[#ff4654]/30">
                            <CardContent className="p-6 text-center">
                                <Users className="h-12 w-12 text-[#ba3a46] mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Teams</h3>
                                <p className="text-2xl font-bold text-[#ba3a46]">
                                    {leaderboard.length}/{selectedGame === "valorant"
                                        ? siteConfig.tournaments.valorant.maxTeams
                                        : siteConfig.tournaments.cod.maxTeams}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111823]/80 backdrop-blur-lg border-[#ff4654]/30">
                            <CardContent className="p-6 text-center">
                                <Calendar className="h-12 w-12 text-[#ff4654] mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Event Date</h3>
                                <p className="text-lg font-bold text-[#ff4654]">
                                    {siteConfig.schedule.eventDateFormatted}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}
