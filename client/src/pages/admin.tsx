import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import AdminLogin from '@/components/admin-login';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { insertUserSchema, type InsertUser } from '../../../shared/mongo-validation';
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
    player1Name: string;
    player1GamingId: string;
    player1ValorantId?: string;
    player2Name: string;
    player2GamingId: string;
    player2ValorantId?: string;
    player3Name: string;
    player3GamingId: string;
    player3ValorantId?: string;
    player4Name: string;
    player4GamingId: string;
    player4ValorantId?: string;
    player5Name: string;
    player5GamingId: string;
    player5ValorantId?: string;
    bankSlipFileId?: string;
    bankSlipFileName?: string;
    bankSlipContentType?: string;
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
    const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [isTeamDetailsDialogOpen, setIsTeamDetailsDialogOpen] = useState(false);
    const { toast } = useToast();

    const createUserForm = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            username: '',
            password: '',
            role: 'top_board'
        }
    });

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

    const createUser = async (data: InsertUser) => {
        setIsCreatingUser(true);

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                setUsers([...users, result.user]);
                setIsCreateUserDialogOpen(false);
                createUserForm.reset();
                toast({
                    title: 'User created',
                    description: `User ${data.username} has been created successfully`
                });
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create user');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create user',
                variant: 'destructive'
            });
        } finally {
            setIsCreatingUser(false);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setUsers(users.filter(user => user.id !== userId));
                toast({
                    title: 'User deleted',
                    description: 'User has been deleted successfully'
                });
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete user');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete user',
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

    const handleViewTeamDetails = (team: Team) => {
        setSelectedTeam(team);
        setIsTeamDetailsDialogOpen(true);
    };

    const downloadBankSlip = async (team: Team) => {
        if (!team.bankSlipFileId) {
            toast({
                title: 'No document',
                description: 'This team has no uploaded bank slip',
                variant: 'destructive'
            });
            return;
        }

        try {
            const response = await fetch(`/api/files/${team.bankSlipFileId}?download=true`, {
                credentials: 'include'
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = team.bankSlipFileName || `${team.teamName}_bank_slip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                toast({
                    title: 'Download started',
                    description: 'Bank slip document is being downloaded'
                });
            } else {
                throw new Error('Failed to download file');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to download bank slip',
                variant: 'destructive'
            });
        }
    };

    const previewBankSlip = (team: Team) => {
        if (!team.bankSlipFileId) {
            toast({
                title: 'No document',
                description: 'This team has no uploaded bank slip',
                variant: 'destructive'
            });
            return;
        }

        const previewUrl = `/api/files/${team.bankSlipFileId}`;
        window.open(previewUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
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
                                                <Button
                                                    onClick={() => handleViewTeamDetails(team)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-[#ff4654]/30 text-[#ff4654] hover:bg-[#ff4654]/10"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Details
                                                </Button>
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
                                            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button className="gaming-button">
                                                        <UserPlus className="h-4 w-4 mr-2" />
                                                        Add User
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-[#111823] border-[#ff4654]/30 text-white">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-[#ff4654]">Create New Admin User</DialogTitle>
                                                        <DialogDescription className="text-gray-400">
                                                            Add a new administrator to the system
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <Form {...createUserForm}>
                                                        <form onSubmit={createUserForm.handleSubmit(createUser)} className="space-y-4">
                                                            <FormField
                                                                control={createUserForm.control}
                                                                name="username"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-gray-200">Username</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                placeholder="Enter username"
                                                                                className="bg-[#1a2332] border-[#ff4654]/30 text-white placeholder:text-gray-400 focus:border-[#ff4654]"
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage className="text-[#ff4654]" />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={createUserForm.control}
                                                                name="password"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-gray-200">Password</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                type="password"
                                                                                placeholder="Enter password"
                                                                                className="bg-[#1a2332] border-[#ff4654]/30 text-white placeholder:text-gray-400 focus:border-[#ff4654]"
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage className="text-[#ff4654]" />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={createUserForm.control}
                                                                name="role"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-gray-200">Role</FormLabel>
                                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger className="bg-[#1a2332] border-[#ff4654]/30 text-white focus:border-[#ff4654]">
                                                                                    <SelectValue placeholder="Select a role" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent className="bg-[#1a2332] border-[#ff4654]/30">
                                                                                <SelectItem value="elite_board" className="text-white hover:bg-[#ff4654]/20">
                                                                                    Elite Board - Full data access
                                                                                </SelectItem>
                                                                                <SelectItem value="top_board" className="text-white hover:bg-[#ff4654]/20">
                                                                                    Top Board - Limited access
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage className="text-[#ff4654]" />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <div className="flex justify-end space-x-2 pt-4">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => setIsCreateUserDialogOpen(false)}
                                                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    type="submit"
                                                                    disabled={isCreatingUser}
                                                                    className="gaming-button"
                                                                >
                                                                    {isCreatingUser ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                            Creating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <UserPlus className="h-4 w-4 mr-2" />
                                                                            Create User
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </Form>
                                                </DialogContent>
                                            </Dialog>
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
                                                            onClick={() => deleteUser(user.id)}
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

            {/* Team Details Dialog */}
            <Dialog open={isTeamDetailsDialogOpen} onOpenChange={setIsTeamDetailsDialogOpen}>
                <DialogContent className="bg-[#111823] border-[#ff4654]/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#ff4654] text-xl">
                            Team Details: {selectedTeam?.teamName}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Complete information for registered team
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTeam && (
                        <div className="space-y-6">
                            {/* Team Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-[#1a2332] border-[#ff4654]/20">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-[#ff4654] text-lg">Team Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">Team Name</label>
                                            <p className="text-white font-semibold">{selectedTeam.teamName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">Game</label>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge
                                                    className={
                                                        selectedTeam.game === 'valorant'
                                                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                                    }
                                                >
                                                    {selectedTeam.game.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">Registration Date</label>
                                            <p className="text-white">{new Date(selectedTeam.registeredAt).toLocaleString()}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-[#1a2332] border-[#ff4654]/20">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-[#ff4654] text-lg">Captain Contact</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">Email</label>
                                            <p className="text-white">{selectedTeam.captainEmail}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">Phone</label>
                                            <p className="text-white">{selectedTeam.captainPhone}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Players */}
                            <Card className="bg-[#1a2332] border-[#ff4654]/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-[#ff4654] text-lg">Team Members</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[1, 2, 3, 4, 5].map((playerNum) => {
                                            const playerName = selectedTeam[`player${playerNum}Name` as keyof Team] as string;
                                            const gamingId = selectedTeam[`player${playerNum}GamingId` as keyof Team] as string;
                                            const valorantId = selectedTeam[`player${playerNum}ValorantId` as keyof Team] as string;

                                            if (!playerName) return null;

                                            return (
                                                <div key={playerNum} className="p-3 bg-[#0a0f1a] rounded-lg border border-[#ff4654]/10">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <div className="w-6 h-6 rounded-full bg-[#ff4654] flex items-center justify-center text-xs font-bold">
                                                            {playerNum}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-300">Player {playerNum}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-white font-medium text-sm">{playerName}</p>
                                                        <p className="text-gray-400 text-xs">Gaming ID: {gamingId}</p>
                                                        {valorantId && (
                                                            <p className="text-gray-400 text-xs">Valorant: {valorantId}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bank Slip */}
                            <Card className="bg-[#1a2332] border-[#ff4654]/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-[#ff4654] text-lg">Bank Slip Document</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {selectedTeam.bankSlipFileId ? (
                                        <div className="flex items-center justify-between p-4 bg-[#0a0f1a] rounded-lg border border-[#ff4654]/10">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-[#ff4654]/20 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-[#ff4654]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {selectedTeam.bankSlipFileName || 'Bank Slip Document'}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        {selectedTeam.bankSlipContentType || 'Document file'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={() => previewBankSlip(selectedTeam)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-[#ff4654]/30 text-[#ff4654] hover:bg-[#ff4654]/10"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview
                                                </Button>
                                                <Button
                                                    onClick={() => downloadBankSlip(selectedTeam)}
                                                    className="gaming-button"
                                                    size="sm"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p>No bank slip document uploaded</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
