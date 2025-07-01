import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLogin from '@/components/admin-login';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Users,
    UserPlus,
    Trophy,
    Target,
    LogOut,
    Trash2,
    Download,
    Eye,
    Settings
} from 'lucide-react';

interface User {
    id: string;
    username: string;
    role: 'superuser' | 'elite_board' | 'top_board';
}

interface Team {
    _id: string;
    teamName: string;
    game: string;
    captainEmail: string;
    captainPhone: string;
    registeredAt: string;
}

interface Score {
    _id: string;
    playerName: string;
    score: string;
    gameType: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [teams, setTeams] = useState<Team[]>([]);
    const [scores, setScores] = useState<Score[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/admin/me', {
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                setCurrentUser(result.user);
                await loadDashboardData(result.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDashboardData = async (user: User) => {
        try {
            // Load teams
            const teamsResponse = await fetch('/api/admin/teams', {
                credentials: 'include'
            });
            if (teamsResponse.ok) {
                const teamsData = await teamsResponse.json();
                setTeams(teamsData);
            }

            // Load scores
            const scoresResponse = await fetch('/api/admin/scores', {
                credentials: 'include'
            });
            if (scoresResponse.ok) {
                const scoresData = await scoresResponse.json();
                setScores(scoresData);
            }

            // Load users (only for superuser and elite_board)
            if (user.role === 'superuser' || user.role === 'elite_board') {
                const usersResponse = await fetch('/api/admin/users', {
                    credentials: 'include'
                });
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUsers(usersData);
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        loadDashboardData(user);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', {
                method: 'POST',
                credentials: 'include'
            });

            setCurrentUser(null);
            setTeams([]);
            setScores([]);
            setUsers([]);

            toast({
                title: 'Logged out',
                description: 'You have been logged out successfully'
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const deleteTeam = async (teamId: string) => {
        if (!window.confirm('Are you sure you want to delete this team?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/teams/${teamId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setTeams(teams.filter(team => team._id !== teamId));
                toast({
                    title: 'Team deleted',
                    description: 'Team has been deleted successfully'
                });
            } else {
                throw new Error('Failed to delete team');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete team',
                variant: 'destructive'
            });
        }
    };

    const deleteScore = async (scoreId: string) => {
        if (!window.confirm('Are you sure you want to delete this score?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/scores/${scoreId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setScores(scores.filter(score => score._id !== scoreId));
                toast({
                    title: 'Score deleted',
                    description: 'Score has been deleted successfully'
                });
            } else {
                throw new Error('Failed to delete score');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete score',
                variant: 'destructive'
            });
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superuser':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'elite_board':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'top_board':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4654]"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-white">
            {/* Header */}
            <div className="border-b border-[#ff4654]/30 bg-[#111823]/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-[#ff4654] mr-3" />
                            <div>
                                <h1 className="text-2xl font-orbitron font-bold text-[#ff4654]">
                                    Admin Dashboard
                                </h1>
                                <p className="text-sm text-gray-400">
                                    Game Night Administration Panel
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium">{currentUser.username}</p>
                                <Badge className={getRoleBadgeColor(currentUser.role)}>
                                    {currentUser.role.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="border-[#ff4654]/30 text-gray-300 hover:bg-[#ff4654]/10"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-[#111823] border-[#ff4654]/30">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-[#ff4654]">
                            <Settings className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="teams" className="data-[state=active]:bg-[#ff4654]">
                            <Users className="h-4 w-4 mr-2" />
                            Teams ({teams.length})
                        </TabsTrigger>
                        <TabsTrigger value="scores" className="data-[state=active]:bg-[#ff4654]">
                            <Trophy className="h-4 w-4 mr-2" />
                            Scores ({scores.length})
                        </TabsTrigger>
                        {(currentUser.role === 'superuser' || currentUser.role === 'elite_board') && (
                            <TabsTrigger value="users" className="data-[state=active]:bg-[#ff4654]">
                                <Shield className="h-4 w-4 mr-2" />
                                Users ({users.length})
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-[#111823] border-[#ff4654]/30">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-200">
                                        Total Teams
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-[#ff4654]" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#ff4654]">{teams.length}</div>
                                    <p className="text-xs text-gray-400">
                                        Valorant: {teams.filter(t => t.game === 'valorant').length} |
                                        COD: {teams.filter(t => t.game === 'cod').length}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-[#111823] border-[#ff4654]/30">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-200">
                                        Game Scores
                                    </CardTitle>
                                    <Target className="h-4 w-4 text-[#ff4654]" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#ff4654]">{scores.length}</div>
                                    <p className="text-xs text-gray-400">
                                        Total reaction time entries
                                    </p>
                                </CardContent>
                            </Card>

                            {(currentUser.role === 'superuser' || currentUser.role === 'elite_board') && (
                                <Card className="bg-[#111823] border-[#ff4654]/30">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-200">
                                            Admin Users
                                        </CardTitle>
                                        <Shield className="h-4 w-4 text-[#ff4654]" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-[#ff4654]">{users.length}</div>
                                        <p className="text-xs text-gray-400">
                                            System administrators
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="teams" className="space-y-6">
                        <Card className="bg-[#111823] border-[#ff4654]/30">
                            <CardHeader>
                                <CardTitle className="text-[#ff4654]">Registered Teams</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Manage tournament team registrations
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {teams.map((team) => (
                                        <div
                                            key={team._id}
                                            className="flex items-center justify-between p-4 bg-[#1a2332] rounded-lg border border-[#ff4654]/20"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="font-semibold text-white">{team.teamName}</h3>
                                                    <Badge
                                                        className={
                                                            team.game === 'valorant'
                                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                                : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                                        }
                                                    >
                                                        {team.game.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {team.captainEmail} • {team.captainPhone}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Registered: {new Date(team.registeredAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {(currentUser.role === 'superuser' || currentUser.role === 'elite_board') && (
                                                    <Button
                                                        onClick={() => deleteTeam(team._id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {teams.length === 0 && (
                                        <p className="text-center text-gray-400 py-8">
                                            No teams registered yet
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="scores" className="space-y-6">
                        <Card className="bg-[#111823] border-[#ff4654]/30">
                            <CardHeader>
                                <CardTitle className="text-[#ff4654]">Reaction Game Scores</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Manage reaction time game leaderboard
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {scores.map((score, index) => (
                                        <div
                                            key={score._id}
                                            className="flex items-center justify-between p-4 bg-[#1a2332] rounded-lg border border-[#ff4654]/20"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ff4654]/20 text-[#ff4654] font-bold text-sm">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{score.playerName}</h3>
                                                    <p className="text-sm text-gray-400">
                                                        {score.gameType} • {new Date(score.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-[#ff4654]">{score.score}ms</p>
                                                </div>
                                                <Button
                                                    onClick={() => deleteScore(score._id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {scores.length === 0 && (
                                        <p className="text-center text-gray-400 py-8">
                                            No scores recorded yet
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {(currentUser.role === 'superuser' || currentUser.role === 'elite_board') && (
                        <TabsContent value="users" className="space-y-6">
                            <Card className="bg-[#111823] border-[#ff4654]/30">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-[#ff4654]">Admin Users</CardTitle>
                                            <CardDescription className="text-gray-400">
                                                Manage system administrator accounts
                                            </CardDescription>
                                        </div>
                                        {currentUser.role === 'superuser' && (
                                            <Button className="gaming-button">
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Add User
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-4 bg-[#1a2332] rounded-lg border border-[#ff4654]/20"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div>
                                                        <h3 className="font-semibold text-white">{user.username}</h3>
                                                        <Badge className={getRoleBadgeColor(user.role)}>
                                                            {user.role.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {currentUser.role === 'superuser' && user.id !== currentUser.id && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
