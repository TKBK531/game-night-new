import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { getTeamLogoUrl } from "../../../shared/team-logo-utils";

// Fallback image URL for when team logos fail to load
const FALLBACK_TEAM_LOGO = "https://raw.githubusercontent.com/TKBK531/game-night-new/refs/heads/leaderboard/images/TeamLogos/DefaultteamLogo.jpg";

export default function MatchDisplay() {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch all matches data (both Valorant and COD)
    const { data: valorantMatches = [], isLoading: isLoadingValorant } = useQuery<any[]>({
        queryKey: ['/api/matches', 'valorant'],
        queryFn: () => fetch('/api/matches?game=valorant').then(res => res.json()),
        refetchInterval: 30000, // Refetch every 30 seconds for live updates
    });

    const { data: codMatches = [], isLoading: isLoadingCod } = useQuery<any[]>({
        queryKey: ['/api/matches', 'cod'],
        queryFn: () => fetch('/api/matches?game=cod').then(res => res.json()),
        refetchInterval: 30000, // Refetch every 30 seconds for live updates
    });

    // Combine and filter matches by status
    const allMatches = [...valorantMatches, ...codMatches];
    const ongoingMatches = allMatches.filter(m => m.status === "in_progress");
    const upcomingMatches = allMatches.filter(m => m.status === "scheduled");

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

    // Use the utility function for team logos
    const getTeamLogo = getTeamLogoUrl;

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
                            <div className="flex items-center space-x-3">
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-2">
                                    {ongoingMatches.length} Active
                                </Badge>
                                {ongoingMatches.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        {ongoingMatches.filter(m => m.game === 'valorant').length > 0 && (
                                            <Badge className="bg-[#ff4654]/20 text-[#ff4654] border-[#ff4654]/30 text-sm px-3 py-1">
                                                <GamepadIcon className="h-4 w-4 mr-1" />
                                                VALORANT
                                            </Badge>
                                        )}
                                        {ongoingMatches.filter(m => m.game === 'cod').length > 0 && (
                                            <Badge className="bg-[#ba3a46]/20 text-[#ba3a46] border-[#ba3a46]/30 text-sm px-3 py-1">
                                                <Target className="h-4 w-4 mr-1" />
                                                COD
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
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
                        <LiveMatchCarousel matches={ongoingMatches} getTeamLogo={getTeamLogo} />
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

// Live Match Carousel Component
function LiveMatchCarousel({ matches, getTeamLogo }: { matches: any[]; getTeamLogo: (teamName: string) => string }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate carousel every 5 seconds
    useEffect(() => {
        if (matches.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % matches.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [matches.length]);

    if (matches.length === 1) {
        return <LiveMatchCard match={matches[0]} getTeamLogo={getTeamLogo} />;
    }

    return (
        <div className="relative">
            {/* Main Carousel */}
            <div className="overflow-hidden rounded-lg">
                <motion.div
                    className="flex"
                    animate={{
                        x: `-${currentIndex * 100}%`
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }}
                >
                    {matches.map((match) => (
                        <div key={match._id} className="w-full flex-shrink-0">
                            <LiveMatchCard match={match} getTeamLogo={getTeamLogo} />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 space-x-3">
                {matches.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-4 h-4 rounded-full transition-colors ${index === currentIndex ? 'bg-green-400' : 'bg-gray-600'
                            }`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                    />
                ))}
            </div>

            {/* Compact Match Preview Strip */}
            <div className="mt-8 bg-gradient-to-r from-gray-800/30 to-gray-900/30 border border-gray-600/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-400 mb-4 text-center">Live Matches Overview</h3>
                <div className="flex justify-center space-x-8">
                    {matches.map((match, index) => (
                        <motion.div
                            key={match._id}
                            className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-all cursor-pointer ${index === currentIndex
                                ? 'bg-green-500/20 border border-green-500/30'
                                : 'bg-gray-700/30 hover:bg-gray-600/30'
                                }`}
                            onClick={() => setCurrentIndex(index)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Team 1 Logo */}
                            <div className="relative">
                                <img
                                    src={getTeamLogo(match.team1Name)}
                                    alt={match.team1Name}
                                    className="w-12 h-12 rounded-lg object-cover border-2 border-green-400/50"
                                    onError={(e) => {
                                        e.currentTarget.src = FALLBACK_TEAM_LOGO;
                                    }}
                                />
                                {index === currentIndex && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                )}
                            </div>

                            {/* VS Indicator */}
                            <motion.div
                                className="text-sm font-bold text-green-400"
                                animate={index === currentIndex ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                VS
                            </motion.div>

                            {/* Team 2 Logo */}
                            <div className="relative">
                                <img
                                    src={getTeamLogo(match.team2Name)}
                                    alt={match.team2Name}
                                    className="w-12 h-12 rounded-lg object-cover border-2 border-green-400/50"
                                    onError={(e) => {
                                        e.currentTarget.src = "/images/DefaultTeamImage.jpg";
                                    }}
                                />
                                {index === currentIndex && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                )}
                            </div>

                            {/* Match Info */}
                            <div className="text-left">
                                <div className="text-xs text-gray-400">{match.round}</div>
                                {match.game && (
                                    <div className={`text-xs font-semibold ${match.game === 'valorant' ? 'text-[#ff4654]' : 'text-[#ba3a46]'
                                        }`}>
                                        {match.game === 'valorant' ? 'VAL' : 'COD'}
                                    </div>
                                )}
                                {(match.team1Score !== undefined && match.team2Score !== undefined) && (
                                    <div className="text-sm font-bold text-white">
                                        {match.team1Score} - {match.team2Score}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
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
                        {match.game && (
                            <Badge className={`text-sm px-3 py-1 ${match.game === 'valorant'
                                ? 'bg-[#ff4654]/20 text-[#ff4654] border-[#ff4654]/30'
                                : 'bg-[#ba3a46]/20 text-[#ba3a46] border-[#ba3a46]/30'
                                }`}>
                                {match.game === 'valorant' ? (
                                    <><GamepadIcon className="h-4 w-4 mr-1" />VALORANT</>
                                ) : (
                                    <><Target className="h-4 w-4 mr-1" />COD</>
                                )}
                            </Badge>
                        )}
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
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-xl">
                                <img
                                    src={getTeamLogo(match.team1Name)}
                                    alt={match.team1Name}
                                    className="w-24 h-24 rounded-lg object-cover border-3 border-green-400/70 shadow-lg shadow-green-400/20"
                                    onError={(e) => {
                                        e.currentTarget.src = "/images/DefaultTeamImage.jpg";
                                    }}
                                />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">{match.team1Name}</h3>
                        {match.team1Score !== undefined && (
                            <div className="text-7xl font-bold text-green-400">{match.team1Score}</div>
                        )}
                    </div>

                    <div className="text-center">
                        <div className="text-gray-400 text-3xl font-bold mb-4">VS</div>
                        <motion.div
                            className="w-4 h-4 bg-green-400 rounded-full mx-auto animate-pulse"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        ></motion.div>
                    </div>

                    <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-xl">
                                <img
                                    src={getTeamLogo(match.team2Name)}
                                    alt={match.team2Name}
                                    className="w-24 h-24 rounded-lg object-cover border-3 border-green-400/70 shadow-lg shadow-green-400/20"
                                    onError={(e) => {
                                        e.currentTarget.src = "/images/DefaultTeamImage.jpg";
                                    }}
                                />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
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
                    <div className="flex items-center space-x-2">
                        <Badge className={`${isStartingSoon
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            } text-sm px-3 py-1`}>
                            {match.round}
                        </Badge>
                        {match.game && (
                            <Badge className={`text-xs px-2 py-1 ${match.game === 'valorant'
                                ? 'bg-[#ff4654]/20 text-[#ff4654] border-[#ff4654]/30'
                                : 'bg-[#ba3a46]/20 text-[#ba3a46] border-[#ba3a46]/30'
                                }`}>
                                {match.game === 'valorant' ? (
                                    <><GamepadIcon className="h-3 w-3 mr-1" />VAL</>
                                ) : (
                                    <><Target className="h-3 w-3 mr-1" />COD</>
                                )}
                            </Badge>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Starting in</p>
                        <p className={`text-lg font-bold ${isStartingSoon ? 'text-orange-400' : 'text-yellow-400'
                            }`}>
                            {timeUntil}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 items-center">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative p-1 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg">
                                <img
                                    src={getTeamLogo(match.team1Name)}
                                    alt={match.team1Name}
                                    className="w-16 h-16 rounded-lg object-cover border-2 border-blue-400/60 shadow-md shadow-blue-400/20"
                                    onError={(e) => {
                                        e.currentTarget.src = "/images/DefaultTeamImage.jpg";
                                    }}
                                />
                            </div>
                        </div>
                        <h4 className="text-xl font-bold text-white">{match.team1Name}</h4>
                    </div>

                    <div className="text-center">
                        <div className="text-gray-400 text-xl font-bold">VS</div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative p-1 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg">
                                <img
                                    src={getTeamLogo(match.team2Name)}
                                    alt={match.team2Name}
                                    className="w-16 h-16 rounded-lg object-cover border-2 border-blue-400/60 shadow-md shadow-blue-400/20"
                                    onError={(e) => {
                                        e.currentTarget.src = "/images/DefaultTeamImage.jpg";
                                    }}
                                />
                            </div>
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
