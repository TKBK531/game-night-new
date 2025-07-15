import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AdminLogin from "@/components/admin-login";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  insertUserSchema,
  type InsertUser,
} from "../../../shared/mongo-validation";
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
  Settings,
  Medal,
  Calendar,
  Tv,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  role: "superuser" | "elite_board" | "top_board";
}

interface Team {
  _id: string;
  teamName: string;
  game: string;
  captainEmail: string;
  captainPhone: string;
  player1Name: string;
  player1GamingId: string;
  player1UniversityEmail: string;
  player1ValorantId?: string;
  player2Name: string;
  player2GamingId: string;
  player2UniversityEmail: string;
  player2ValorantId?: string;
  player3Name: string;
  player3GamingId: string;
  player3UniversityEmail: string;
  player3ValorantId?: string;
  player4Name: string;
  player4GamingId: string;
  player4UniversityEmail: string;
  player4ValorantId?: string;
  player5Name: string;
  player5GamingId: string;
  player5UniversityEmail: string;
  player5ValorantId?: string;
  bankSlipFileId?: string;
  bankSlipFileName?: string;
  bankSlipContentType?: string;
  registeredAt: string;
  status?: "confirmed" | "queued" | "approved" | "rejected";
  queuedAt?: string;
  paymentDeadline?: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface Score {
  _id: string;
  playerName: string;
  score: string;
  gameType: string;
  createdAt: string;
}

interface SecretChallenge {
  _id: string;
  playerEmail: string;
  score: number;
  completedAt: string;
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [queuedTeams, setQueuedTeams] = useState<Team[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [secretChallenges, setSecretChallenges] = useState<SecretChallenge[]>([]);
  const [secretChallengeSortBy, setSecretChallengeSortBy] = useState<'score' | 'date'>('score');
  const [secretChallengeSortOrder, setSecretChallengeSortOrder] = useState<'asc' | 'desc'>('desc');
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamDetailsDialogOpen, setIsTeamDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "top_board",
    },
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/admin/me", {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentUser(result.user);
        await loadDashboardData(result.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (user: User) => {
    try {
      // Load teams
      const teamsResponse = await fetch("/api/admin/teams", {
        credentials: "include",
      });
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
      }

      // Load COD queued teams
      const queueResponse = await fetch("/api/admin/cod-queue", {
        credentials: "include",
      });
      if (queueResponse.ok) {
        const queueData = await queueResponse.json();
        setQueuedTeams(queueData);
      }

      // Load scores
      const scoresResponse = await fetch("/api/admin/scores", {
        credentials: "include",
      });
      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json();
        setScores(scoresData);
      }

      // Load secret challenges
      const secretChallengesResponse = await fetch("/api/admin/secret-challenges", {
        credentials: "include",
      });
      if (secretChallengesResponse.ok) {
        const secretChallengesData = await secretChallengesResponse.json();
        setSecretChallenges(secretChallengesData);
      }

      // Load users (only for superuser and elite_board)
      if (user.role === "superuser" || user.role === "elite_board") {
        const usersResponse = await fetch("/api/admin/users", {
          credentials: "include",
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    loadDashboardData(user);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      setCurrentUser(null);
      setTeams([]);
      setQueuedTeams([]);
      setScores([]);
      setUsers([]);

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!window.confirm("Are you sure you want to delete this team?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setTeams(teams.filter((team) => team._id !== teamId));
        toast({
          title: "Team deleted",
          description: "Team has been deleted successfully",
        });
      } else {
        throw new Error("Failed to delete team");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    }
  };

  const deleteScore = async (scoreId: string) => {
    if (!window.confirm("Are you sure you want to delete this score?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/scores/${scoreId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setScores(scores.filter((score) => score._id !== scoreId));
        toast({
          title: "Score deleted",
          description: "Score has been deleted successfully",
        });
      } else {
        throw new Error("Failed to delete score");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete score",
        variant: "destructive",
      });
    }
  };

  const deleteSecretChallenge = async (challengeId: string) => {
    if (!window.confirm("Are you sure you want to delete this secret challenge score?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/secret-challenges/${challengeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSecretChallenges(secretChallenges.filter((challenge) => challenge._id !== challengeId));
        toast({
          title: "Secret challenge deleted",
          description: "Secret challenge score has been deleted successfully",
        });
      } else {
        throw new Error("Failed to delete secret challenge");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete secret challenge",
        variant: "destructive",
      });
    }
  };

  // Sort secret challenges based on current sort settings
  const sortedSecretChallenges = [...secretChallenges].sort((a, b) => {
    if (secretChallengeSortBy === 'score') {
      const scoreA = a.score;
      const scoreB = b.score;
      return secretChallengeSortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    } else {
      const dateA = new Date(a.completedAt).getTime();
      const dateB = new Date(b.completedAt).getTime();
      return secretChallengeSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    }
  });

  const handleSecretChallengeSort = (sortBy: 'score' | 'date') => {
    if (secretChallengeSortBy === sortBy) {
      setSecretChallengeSortOrder(secretChallengeSortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSecretChallengeSortBy(sortBy);
      setSecretChallengeSortOrder('desc');
    }
  };

  const createUser = async (data: InsertUser) => {
    setIsCreatingUser(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        setUsers([...users, result.user]);
        setIsCreateUserDialogOpen(false);
        createUserForm.reset();
        toast({
          title: "User created",
          description: `User ${data.username} has been created successfully`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
        toast({
          title: "User deleted",
          description: "User has been deleted successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superuser":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "elite_board":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "top_board":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleViewTeamDetails = (team: Team) => {
    console.log("Viewing team details for:", team.teamName);
    console.log("Team data:", team);
    console.log("Bank slip file ID:", team.bankSlipFileId);
    console.log("Bank slip file name:", team.bankSlipFileName);
    setSelectedTeam(team);
    setIsTeamDetailsDialogOpen(true);
  };

  const downloadBankSlip = async (team: Team) => {
    if (!team.bankSlipFileId) {
      toast({
        title: "No document",
        description: "This team has no uploaded bank slip",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/files/${team.bankSlipFileId}?download=true`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = team.bankSlipFileName || `${team.teamName}_bank_slip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download started",
          description: "Bank slip document is being downloaded",
        });
      } else {
        throw new Error("Failed to download file");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download bank slip",
        variant: "destructive",
      });
    }
  };

  const previewBankSlip = (team: Team) => {
    console.log("Preview bank slip called for team:", team.teamName);
    console.log("Bank slip file ID:", team.bankSlipFileId);

    if (!team.bankSlipFileId) {
      toast({
        title: "No document",
        description: "This team has no uploaded bank slip",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = `/api/files/${team.bankSlipFileId}`;
    console.log("Opening preview URL:", previewUrl);
    window.open(
      previewUrl,
      "_blank",
      "width=800,height=600,scrollbars=yes,resizable=yes"
    );
  };

  // COD Queue Management Functions
  const approveTeamRegistration = async (teamId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-team/${teamId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approvedBy: currentUser?.username }),
      });

      if (response.ok) {
        toast({
          title: "Team Approved",
          description:
            "Team registration has been approved after payment verification.",
        });

        // Reload data
        if (currentUser) {
          loadDashboardData(currentUser);
        }

        // Invalidate stats query to update main page
        queryClient.invalidateQueries({ queryKey: ['/api/teams/stats'] });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to approve team",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve team",
        variant: "destructive",
      });
    }
  };

  const rejectTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/admin/reject-team/${teamId}`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Team Rejected",
          description: "Team has been rejected.",
        });

        // Reload data
        if (currentUser) {
          loadDashboardData(currentUser);
        }

        // Invalidate stats query to update main page
        queryClient.invalidateQueries({ queryKey: ['/api/teams/stats'] });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to reject team",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject team",
        variant: "destructive",
      });
    }
  };

  // Download teams as Excel
  const downloadTeamsExcel = async () => {
    try {
      const response = await fetch("/api/admin/export-teams", {
        credentials: "include",
      });

      if (response.ok) {
        // Get the filename from response headers or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'game-night-teams.xlsx';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: "Teams data has been downloaded as Excel file.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to export teams",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download teams data",
        variant: "destructive",
      });
    }
  };

  // Function to export COD queue teams
  const downloadCodQueueExcel = async () => {
    try {
      const response = await fetch("/api/admin/export-cod-queue", {
        credentials: "include",
      });

      if (response.ok) {
        // Get the filename from response headers or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'cod-queue-teams.xlsx';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: "COD queue data has been downloaded as Excel file.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to export COD queue",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download COD queue data",
        variant: "destructive",
      });
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
              <Button
                onClick={() => window.open('/matches', '_blank')}
                variant="outline"
                size="sm"
                className="border-[#ba3a46]/30 text-[#ba3a46] hover:bg-[#ba3a46]/10"
              >
                <Tv className="h-4 w-4 mr-2" />
                Match Display
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium">{currentUser.username}</p>
                <Badge className={getRoleBadgeColor(currentUser.role)}>
                  {currentUser.role.replace("_", " ").toUpperCase()}
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
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#ff4654]"
            >
              <Settings className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="data-[state=active]:bg-[#ff4654]"
            >
              <Users className="h-4 w-4 mr-2" />
              Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger
              value="cod-queue"
              className="data-[state=active]:bg-[#ba3a46]"
            >
              <Target className="h-4 w-4 mr-2" />
              COD Queue ({queuedTeams.length})
            </TabsTrigger>
            <TabsTrigger
              value="scores"
              className="data-[state=active]:bg-[#ff4654]"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Scores ({scores.length})
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-[#ff4654]"
            >
              <Medal className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="data-[state=active]:bg-[#ba3a46]"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger
              value="secret"
              className="data-[state=active]:bg-[#ff4654]"
            >
              <Target className="h-4 w-4 mr-2" />
              Secret Challenge
            </TabsTrigger>
            {(currentUser.role === "superuser" ||
              currentUser.role === "elite_board") && (
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-[#ff4654]"
                >
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
                  <div className="text-2xl font-bold text-[#ff4654]">
                    {teams.length}
                  </div>
                  <p className="text-xs text-gray-400">
                    Valorant:{" "}
                    {teams.filter((t) => t.game === "valorant").length} | COD:{" "}
                    {teams.filter((t) => t.game === "cod").length}
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
                  <div className="text-2xl font-bold text-[#ff4654]">
                    {scores.length}
                  </div>
                  <p className="text-xs text-gray-400">
                    Total reaction time entries
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#111823] border-purple-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    Secret Challenge
                  </CardTitle>
                  <div className="text-purple-400">🎮</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {secretChallenges.length}
                  </div>
                  <p className="text-xs text-gray-400">
                    Elite gamers discovered
                  </p>
                </CardContent>
              </Card>

              {(currentUser.role === "superuser" ||
                currentUser.role === "elite_board") && (
                  <Card className="bg-[#111823] border-[#ff4654]/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-200">
                        Admin Users
                      </CardTitle>
                      <Shield className="h-4 w-4 text-[#ff4654]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-[#ff4654]">
                        {users.length}
                      </div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#ff4654]">
                      Registered Teams
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage tournament team registrations
                    </CardDescription>
                  </div>
                  <Button
                    onClick={downloadTeamsExcel}
                    variant="outline"
                    size="sm"
                    className="border-[#ff4654]/30 text-[#ff4654] hover:bg-[#ff4654]/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
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
                          <h3 className="font-semibold text-white">
                            {team.teamName}
                          </h3>
                          <Badge
                            className={
                              team.game === "valorant"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                            }
                          >
                            {team.game.toUpperCase()}
                          </Badge>
                          {team.status === "approved" && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Approved
                            </Badge>
                          )}
                          {(team.status === "confirmed" || !team.status) && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Confirmed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {team.captainEmail} • {team.captainPhone}
                        </p>
                        <p className="text-xs text-gray-500">
                          Registered:{" "}
                          {new Date(team.registeredAt).toLocaleDateString()}
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
                        {(currentUser.role === "superuser" ||
                          currentUser.role === "elite_board") && (
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
                <CardTitle className="text-[#ff4654]">
                  Reaction Game Scores
                </CardTitle>
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
                          <h3 className="font-semibold text-white">
                            {score.playerName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {score.gameType} •{" "}
                            {new Date(score.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#ff4654]">
                            {score.score}ms
                          </p>
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

          <TabsContent value="secret" className="space-y-6">
            <Card className="bg-[#111823] border-[#ff4654]/30">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-[#ff4654]">
                      Secret Challenge Leaderboard
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Elite gamers who discovered the hidden Konami Code challenge
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSecretChallengeSort('score')}
                      variant="outline"
                      size="sm"
                      className={`border-purple-500/50 text-purple-200 hover:bg-purple-800/50 ${secretChallengeSortBy === 'score' ? 'bg-purple-800/50' : ''
                        }`}
                    >
                      Score {secretChallengeSortBy === 'score' && (secretChallengeSortOrder === 'desc' ? '↓' : '↑')}
                    </Button>
                    <Button
                      onClick={() => handleSecretChallengeSort('date')}
                      variant="outline"
                      size="sm"
                      className={`border-purple-500/50 text-purple-200 hover:bg-purple-800/50 ${secretChallengeSortBy === 'date' ? 'bg-purple-800/50' : ''
                        }`}
                    >
                      Date {secretChallengeSortBy === 'date' && (secretChallengeSortOrder === 'desc' ? '↓' : '↑')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedSecretChallenges.map((challenge, index) => (
                    <div
                      key={challenge._id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${index === 0
                        ? "bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/50"
                        : index === 1
                          ? "bg-gradient-to-r from-gray-600/20 to-gray-500/20 border-gray-400/50"
                          : index === 2
                            ? "bg-gradient-to-r from-orange-700/20 to-orange-600/20 border-orange-500/50"
                            : "bg-[#1a2332] border-[#ff4654]/20"
                        }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                          index === 1 ? "bg-gray-500/20 text-gray-300" :
                            index === 2 ? "bg-orange-500/20 text-orange-400" :
                              "bg-[#ff4654]/20 text-[#ff4654]"
                          }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {challenge.playerEmail}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Completed: {new Date(challenge.completedAt).toLocaleDateString()} at{" "}
                            {new Date(challenge.completedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#ff4654]">
                            {challenge.score} pts
                          </p>
                          {index === 0 && (
                            <p className="text-xs text-yellow-400 font-medium">
                              🏆 Prize Winner!
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => deleteSecretChallenge(challenge._id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {sortedSecretChallenges.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
                      <p>No one has discovered the secret challenge yet...</p>
                      <p className="text-sm mt-2 opacity-60">
                        The Konami Code holds the key: ↑↑↓↓←→←→BA 🎮
                      </p>
                      <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                        <p className="text-xs text-purple-300">
                          <strong>For players to discover:</strong><br />
                          • Look for hints in the footer, CSS comments, and HTML source<br />
                          • Enter the classic Konami Code on any page<br />
                          • Complete the 30-second target challenge<br />
                          • First place wins the exclusive prize!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {(currentUser.role === "superuser" ||
            currentUser.role === "elite_board") && (
              <TabsContent value="users" className="space-y-6">
                <Card className="bg-[#111823] border-[#ff4654]/30">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-[#ff4654]">
                          Admin Users
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Manage system administrator accounts
                        </CardDescription>
                      </div>
                      {currentUser.role === "superuser" && (
                        <Dialog
                          open={isCreateUserDialogOpen}
                          onOpenChange={setIsCreateUserDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button className="gaming-button">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add User
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#111823] border-[#ff4654]/30 text-white">
                            <DialogHeader>
                              <DialogTitle className="text-[#ff4654]">
                                Create New Admin User
                              </DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Add a new administrator to the system
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...createUserForm}>
                              <form
                                onSubmit={createUserForm.handleSubmit(createUser)}
                                className="space-y-4"
                              >
                                <FormField
                                  control={createUserForm.control}
                                  name="username"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-200">
                                        Username
                                      </FormLabel>
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
                                      <FormLabel className="text-gray-200">
                                        Password
                                      </FormLabel>
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
                                      <FormLabel className="text-gray-200">
                                        Role
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="bg-[#1a2332] border-[#ff4654]/30 text-white focus:border-[#ff4654]">
                                            <SelectValue placeholder="Select a role" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-[#1a2332] border-[#ff4654]/30">
                                          <SelectItem
                                            value="elite_board"
                                            className="text-white hover:bg-[#ff4654]/20"
                                          >
                                            Elite Board - Full data access
                                          </SelectItem>
                                          <SelectItem
                                            value="top_board"
                                            className="text-white hover:bg-[#ff4654]/20"
                                          >
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
                                    onClick={() =>
                                      setIsCreateUserDialogOpen(false)
                                    }
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
                              <h3 className="font-semibold text-white">
                                {user.username}
                              </h3>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {currentUser.role === "superuser" &&
                              user.id !== currentUser.id && (
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

          {/* COD Queue Management */}
          <TabsContent value="cod-queue" className="space-y-6">
            <Card className="bg-[#111823] border-[#ba3a46]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#ba3a46]">
                      COD Registration Queue
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage COD team registration queue and approve teams for payment
                    </CardDescription>
                  </div>
                  <Button
                    onClick={downloadCodQueueExcel}
                    variant="outline"
                    size="sm"
                    className="border-[#ba3a46]/30 text-[#ba3a46] hover:bg-[#ba3a46]/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Queue
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {queuedTeams.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">
                      No teams in COD queue
                    </p>
                  ) : (
                    queuedTeams.map((team) => (
                      <div
                        key={team._id}
                        className="flex items-center justify-between p-4 bg-[#1a2332] rounded-lg border border-[#ba3a46]/20"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-white">
                              {team.teamName}
                            </h3>
                            <Badge
                              className={
                                team.status === "queued"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : team.status === "approved"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              }
                            >
                              {team.status?.toUpperCase()}
                            </Badge>
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              COD
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {team.captainEmail} • {team.captainPhone}
                          </p>
                          <p className="text-xs text-gray-500">
                            Queued:{" "}
                            {team.queuedAt
                              ? new Date(team.queuedAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                          {team.paymentDeadline && (
                            <p className="text-xs text-yellow-400">
                              Payment deadline:{" "}
                              {new Date(team.paymentDeadline).toLocaleString()}
                            </p>
                          )}
                          {team.approvedBy && (
                            <p className="text-xs text-blue-400">
                              Approved by: {team.approvedBy}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleViewTeamDetails(team)}
                            variant="outline"
                            size="sm"
                            className="border-[#ba3a46]/30 text-[#ba3a46] hover:bg-[#ba3a46]/10"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>

                          {team.status === "queued" && (
                            <>
                              <Button
                                onClick={() => approveTeamRegistration(team._id)}
                                variant="outline"
                                size="sm"
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              >
                                Approve Team
                              </Button>
                              <Button
                                onClick={() => rejectTeam(team._id)}
                                variant="outline"
                                size="sm"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Management Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <LeaderboardManager />
          </TabsContent>

          {/* Match Management Tab */}
          <TabsContent value="matches" className="space-y-6">
            <MatchManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Team Details Dialog */}
      <Dialog
        open={isTeamDetailsDialogOpen}
        onOpenChange={setIsTeamDetailsDialogOpen}
      >
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
                    <CardTitle className="text-[#ff4654] text-lg">
                      Team Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Team Name
                      </label>
                      <p className="text-white font-semibold">
                        {selectedTeam.teamName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Game
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          className={
                            selectedTeam.game === "valorant"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          }
                        >
                          {selectedTeam.game.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Registration Date
                      </label>
                      <p className="text-white">
                        {new Date(selectedTeam.registeredAt).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a2332] border-[#ff4654]/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#ff4654] text-lg">
                      Captain Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <p className="text-white">{selectedTeam.captainEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Phone
                      </label>
                      <p className="text-white">{selectedTeam.captainPhone}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Players */}
              <Card className="bg-[#1a2332] border-[#ff4654]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#ff4654] text-lg">
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5].map((playerNum) => {
                      const playerName = selectedTeam[
                        `player${playerNum}Name` as keyof Team
                      ] as string;
                      const gamingId = selectedTeam[
                        `player${playerNum}GamingId` as keyof Team
                      ] as string;
                      const universityEmail = selectedTeam[
                        `player${playerNum}UniversityEmail` as keyof Team
                      ] as string;
                      const valorantId = selectedTeam[
                        `player${playerNum}ValorantId` as keyof Team
                      ] as string;

                      if (!playerName) return null;

                      return (
                        <div
                          key={playerNum}
                          className="p-3 bg-[#0a0f1a] rounded-lg border border-[#ff4654]/10"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-[#ff4654] flex items-center justify-center text-xs font-bold">
                              {playerNum}
                            </div>
                            <span className="text-sm font-medium text-gray-300">
                              Player {playerNum}{" "}
                              {playerNum === 1 && "(Captain)"}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-white font-medium text-sm">
                              {playerName}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Gaming ID: {gamingId}
                            </p>
                            <p className="text-[hsl(185,100%,50%)] text-xs">
                              📧 {universityEmail}
                            </p>
                            {valorantId && (
                              <p className="text-gray-400 text-xs">
                                Valorant: {valorantId}
                              </p>
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
                  <CardTitle className="text-[#ff4654] text-lg">
                    Bank Slip Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTeam.bankSlipFileId ? (
                    <div className="flex items-center justify-between p-4 bg-[#0a0f1a] rounded-lg border border-[#ff4654]/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#ff4654]/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-[#ff4654]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {selectedTeam.bankSlipFileName ||
                              "Bank Slip Document"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {selectedTeam.bankSlipContentType ||
                              "Document file"}
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
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
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

// Leaderboard Manager Component
function LeaderboardManager() {
  const [selectedGame, setSelectedGame] = useState<"valorant" | "cod">("valorant");
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/leaderboard', selectedGame],
    queryFn: () => fetch(`/api/leaderboard?game=${selectedGame}`).then(res => res.json()),
  });

  // Fetch teams for dropdown
  const { data: teams = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/teams'],
    queryFn: () => fetch('/api/admin/teams', { credentials: 'include' }).then(res => res.json()),
  });

  const gameTeams = teams.filter(team => team.game === selectedGame);

  const updateTeamScore = async (scoreData: any) => {
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) throw new Error('Failed to update score');

      toast({
        title: 'Success',
        description: 'Team score updated successfully',
      });

      refetch();
      setIsScoreDialogOpen(false);
      setEditingTeam(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update score',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-white font-semibold">Game:</label>
        <Tabs value={selectedGame} onValueChange={(value) => setSelectedGame(value as "valorant" | "cod")}>
          <TabsList className="bg-[#1a2332] border border-[#ff4654]/30">
            <TabsTrigger value="valorant" className="data-[state=active]:bg-[#ff4654]">Valorant</TabsTrigger>
            <TabsTrigger value="cod" className="data-[state=active]:bg-[#ba3a46]">Call of Duty</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          onClick={() => {
            setEditingTeam({ game: selectedGame });
            setIsScoreDialogOpen(true);
          }}
          className="bg-[#ff4654] hover:bg-[#ba3a46] text-white"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Add/Update Score
        </Button>
      </div>

      {/* Leaderboard Table */}
      <Card className="bg-[#1a2332] border-[#ff4654]/20">
        <CardHeader>
          <CardTitle className="text-white">{selectedGame === 'valorant' ? 'Valorant' : 'Call of Duty'} Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4654]"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Trophy className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No scores recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ff4654]/20">
                    <th className="text-left py-3 px-4 text-white">Rank</th>
                    <th className="text-left py-3 px-4 text-white">Team</th>
                    <th className="text-left py-3 px-4 text-white">Score</th>
                    <th className="text-left py-3 px-4 text-white">Matches</th>
                    <th className="text-left py-3 px-4 text-white">Win Rate</th>
                    <th className="text-left py-3 px-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((team, index) => (
                    <tr key={team._id} className="border-b border-[#ff4654]/10 hover:bg-[#ff4654]/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {index === 0 && <Medal className="h-5 w-5 text-yellow-400 mr-2" />}
                          {index === 1 && <Medal className="h-5 w-5 text-gray-300 mr-2" />}
                          {index === 2 && <Medal className="h-5 w-5 text-orange-400 mr-2" />}
                          <span className="text-white font-bold">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">{team.teamName}</td>
                      <td className="py-3 px-4 text-[#ff4654] font-bold text-lg">{team.score}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {team.matchesWon}W - {team.matchesLost}L ({team.totalMatches} total)
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {team.totalMatches > 0 ? Math.round((team.matchesWon / team.totalMatches) * 100) : 0}%
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => {
                            setEditingTeam(team);
                            setIsScoreDialogOpen(true);
                          }}
                          size="sm"
                          className="bg-[#ba3a46] hover:bg-[#ff4654] text-white"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Update Dialog */}
      <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
        <DialogContent className="bg-[#111823] border-[#ff4654]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-[#ff4654]">
              {editingTeam?._id ? 'Update Team Score' : 'Add Team Score'}
            </DialogTitle>
          </DialogHeader>
          <ScoreUpdateForm
            team={editingTeam}
            teams={gameTeams}
            onSubmit={updateTeamScore}
            onCancel={() => {
              setIsScoreDialogOpen(false);
              setEditingTeam(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Score Update Form Component
function ScoreUpdateForm({ team, teams, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    teamId: team?.teamId || '',
    teamName: team?.teamName || '',
    game: team?.game || 'valorant',
    score: team?.score || 0,
    matchesWon: team?.matchesWon || 0,
    matchesLost: team?.matchesLost || 0,
    totalMatches: team?.totalMatches || 0,
    updatedBy: 'admin', // This should come from current user
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-calculate total matches
    const calculatedTotal = formData.matchesWon + formData.matchesLost;

    onSubmit({
      ...formData,
      totalMatches: calculatedTotal,
    });
  };

  const handleTeamSelect = (teamId: string) => {
    const selectedTeam = teams.find((t: any) => t._id === teamId);
    if (selectedTeam) {
      setFormData(prev => ({
        ...prev,
        teamId: selectedTeam._id,
        teamName: selectedTeam.teamName,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!team?._id && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Team</label>
          <Select onValueChange={handleTeamSelect} value={formData.teamId}>
            <SelectTrigger className="bg-[#1a2332] border-[#ff4654]/30 text-white">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#ff4654]/30">
              {teams.map((t: any) => (
                <SelectItem key={t._id} value={t._id} className="text-white hover:bg-[#ff4654]/20">
                  {t.teamName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.teamName && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team</label>
            <Input
              value={formData.teamName}
              disabled
              className="bg-[#1a2332] border-[#ff4654]/30 text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Score</label>
              <Input
                type="number"
                value={formData.score}
                onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                className="bg-[#1a2332] border-[#ff4654]/30 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Matches Won</label>
              <Input
                type="number"
                value={formData.matchesWon}
                onChange={(e) => setFormData(prev => ({ ...prev, matchesWon: parseInt(e.target.value) || 0 }))}
                className="bg-[#1a2332] border-[#ff4654]/30 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Matches Lost</label>
            <Input
              type="number"
              value={formData.matchesLost}
              onChange={(e) => setFormData(prev => ({ ...prev, matchesLost: parseInt(e.target.value) || 0 }))}
              className="bg-[#1a2332] border-[#ff4654]/30 text-white"
            />
          </div>

          <div className="text-sm text-gray-400">
            Total Matches: {formData.matchesWon + formData.matchesLost}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="bg-[#ff4654] hover:bg-[#ba3a46] text-white">
              {team?._id ? 'Update Score' : 'Add Score'}
            </Button>
            <Button type="button" onClick={onCancel} variant="outline" className="border-gray-500 text-gray-300">
              Cancel
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

// Match Manager Component
function MatchManager() {
  const [selectedGame, setSelectedGame] = useState<"valorant" | "cod">("valorant");
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const { toast } = useToast();

  // Fetch matches data
  const { data: allMatches = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/matches', selectedGame],
    queryFn: () => fetch(`/api/matches?game=${selectedGame}`).then(res => res.json()),
  });

  // Fetch teams for dropdowns
  const { data: teams = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/teams'],
    queryFn: () => fetch('/api/admin/teams', { credentials: 'include' }).then(res => res.json()),
  });

  const gameTeams = teams.filter(team => team.game === selectedGame);

  // Filter matches by status
  const ongoingMatches = allMatches.filter(m => m.status === "in_progress").slice(0, 3);
  const upcomingMatches = allMatches.filter(m => m.status === "scheduled");
  const completedMatches = allMatches.filter(m => m.status === "completed").slice(0, 10);

  const createMatch = async (matchData: any) => {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(matchData),
      });

      if (!response.ok) throw new Error('Failed to create match');

      toast({
        title: 'Success',
        description: 'Match created successfully',
      });

      refetch();
      setIsMatchDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create match',
        variant: 'destructive',
      });
    }
  };

  const updateMatch = async (matchId: string, updateData: any) => {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update match');

      toast({
        title: 'Success',
        description: 'Match updated successfully',
      });

      refetch();
      setIsMatchDialogOpen(false);
      setEditingMatch(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update match',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "in_progress": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Selector and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="text-white font-semibold">Game:</label>
          <Tabs value={selectedGame} onValueChange={(value) => setSelectedGame(value as "valorant" | "cod")}>
            <TabsList className="bg-[#1a2332] border border-[#ba3a46]/30">
              <TabsTrigger value="valorant" className="data-[state=active]:bg-[#ff4654]">Valorant</TabsTrigger>
              <TabsTrigger value="cod" className="data-[state=active]:bg-[#ba3a46]">Call of Duty</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button
          onClick={() => {
            setEditingMatch({ game: selectedGame });
            setIsMatchDialogOpen(true);
          }}
          className="bg-[#ba3a46] hover:bg-[#ff4654] text-white"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Match
        </Button>
      </div>

      {/* Ongoing Matches (Max 3) */}
      <Card className="bg-[#1a2332] border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            Ongoing Matches ({ongoingMatches.length}/3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ongoingMatches.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
              <p>No ongoing matches</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ongoingMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  onEdit={(match: any) => {
                    setEditingMatch(match);
                    setIsMatchDialogOpen(true);
                  }}
                  onUpdate={updateMatch}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Matches */}
      <Card className="bg-[#1a2332] border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center">
            <Calendar className="h-5 w-5 mr-3" />
            Upcoming Matches ({upcomingMatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMatches.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No upcoming matches scheduled</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  onEdit={(match: any) => {
                    setEditingMatch(match);
                    setIsMatchDialogOpen(true);
                  }}
                  onUpdate={updateMatch}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Completed Matches */}
      <Card className="bg-[#1a2332] border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center">
            <Trophy className="h-5 w-5 mr-3" />
            Recent Results ({completedMatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedMatches.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Trophy className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No completed matches</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {completedMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  onEdit={(match: any) => {
                    setEditingMatch(match);
                    setIsMatchDialogOpen(true);
                  }}
                  onUpdate={updateMatch}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="bg-[#111823] border-[#ba3a46]/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#ba3a46]">
              {editingMatch?._id ? 'Update Match' : 'Schedule New Match'}
            </DialogTitle>
          </DialogHeader>
          <MatchForm
            match={editingMatch}
            teams={gameTeams}
            onSubmit={editingMatch?._id ?
              (data: any) => updateMatch(editingMatch._id, data) :
              createMatch
            }
            onCancel={() => {
              setIsMatchDialogOpen(false);
              setEditingMatch(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Match Card Component
function MatchCard({ match, onEdit, onUpdate, getStatusColor }: any) {
  const [isUpdating, setIsUpdating] = useState(false);

  const quickStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    const updateData: any = { status: newStatus };

    if (newStatus === "in_progress" && !match.actualStartTime) {
      updateData.actualStartTime = new Date().toISOString();
    } else if (newStatus === "completed" && !match.actualEndTime) {
      updateData.actualEndTime = new Date().toISOString();
    }

    await onUpdate(match._id, updateData);
    setIsUpdating(false);
  };

  return (
    <div className="border border-[#ff4654]/20 rounded-lg p-4 bg-[#111823]/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(match.status)}>
            {match.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <span className="text-sm text-gray-400">{match.round}</span>
        </div>
        <div className="flex space-x-2">
          {match.status === "scheduled" && (
            <Button
              size="sm"
              onClick={() => quickStatusUpdate("in_progress")}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              Start
            </Button>
          )}
          {match.status === "in_progress" && (
            <Button
              size="sm"
              onClick={() => quickStatusUpdate("completed")}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              Finish
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onEdit(match)}
            className="bg-[#ba3a46] hover:bg-[#ff4654] text-white text-xs"
          >
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="text-center">
          <div className="font-semibold text-white">{match.team1Name}</div>
          {match.team1Score !== undefined && (
            <div className="text-2xl font-bold text-[#ff4654]">{match.team1Score}</div>
          )}
        </div>

        <div className="text-center">
          <div className="text-gray-400 text-sm">VS</div>
          {match.status === "completed" && match.winnerName && (
            <div className="text-xs text-green-400 mt-1">
              Winner: {match.winnerName}
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="font-semibold text-white">{match.team2Name}</div>
          {match.team2Score !== undefined && (
            <div className="text-2xl font-bold text-[#ff4654]">{match.team2Score}</div>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400 text-center">
        Scheduled: {new Date(match.scheduledTime).toLocaleString()}
      </div>
    </div>
  );
}

// Match Form Component
function MatchForm({ match, teams, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    game: match?.game || 'valorant',
    team1Id: match?.team1Id || '',
    team1Name: match?.team1Name || '',
    team2Id: match?.team2Id || '',
    team2Name: match?.team2Name || '',
    scheduledTime: match?.scheduledTime ? new Date(match.scheduledTime).toISOString().slice(0, 16) : '',
    round: match?.round || '',
    status: match?.status || 'scheduled',
    team1Score: match?.team1Score || '',
    team2Score: match?.team2Score || '',
    winnerId: match?.winnerId || '',
    winnerName: match?.winnerName || '',
    createdBy: 'admin', // Should come from current user
  });

  const handleTeamSelect = (teamId: string, teamNumber: 1 | 2) => {
    const selectedTeam = teams.find((t: any) => t._id === teamId);
    if (selectedTeam) {
      setFormData(prev => ({
        ...prev,
        [`team${teamNumber}Id`]: selectedTeam._id,
        [`team${teamNumber}Name`]: selectedTeam.teamName,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      scheduledTime: new Date(formData.scheduledTime).toISOString(),
      team1Score: formData.team1Score ? parseInt(formData.team1Score.toString()) : undefined,
      team2Score: formData.team2Score ? parseInt(formData.team2Score.toString()) : undefined,
    };

    // Auto-determine winner if scores are provided
    if (submitData.team1Score !== undefined && submitData.team2Score !== undefined) {
      if (submitData.team1Score > submitData.team2Score) {
        submitData.winnerId = formData.team1Id;
        submitData.winnerName = formData.team1Name;
      } else if (submitData.team2Score > submitData.team1Score) {
        submitData.winnerId = formData.team2Id;
        submitData.winnerName = formData.team2Name;
      }
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Team 1</label>
          <Select onValueChange={(value) => handleTeamSelect(value, 1)} value={formData.team1Id}>
            <SelectTrigger className="bg-[#1a2332] border-[#ba3a46]/30 text-white">
              <SelectValue placeholder="Select Team 1" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#ba3a46]/30">
              {teams.map((team: any) => (
                <SelectItem key={team._id} value={team._id} className="text-white hover:bg-[#ba3a46]/20">
                  {team.teamName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Team 2</label>
          <Select onValueChange={(value) => handleTeamSelect(value, 2)} value={formData.team2Id}>
            <SelectTrigger className="bg-[#1a2332] border-[#ba3a46]/30 text-white">
              <SelectValue placeholder="Select Team 2" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#ba3a46]/30">
              {teams.filter((team: any) => team._id !== formData.team1Id).map((team: any) => (
                <SelectItem key={team._id} value={team._id} className="text-white hover:bg-[#ba3a46]/20">
                  {team.teamName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Time</label>
          <Input
            type="datetime-local"
            value={formData.scheduledTime}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
            className="bg-[#1a2332] border-[#ba3a46]/30 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Round</label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, round: value }))} value={formData.round}>
            <SelectTrigger className="bg-[#1a2332] border-[#ba3a46]/30 text-white">
              <SelectValue placeholder="Select Round" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#ba3a46]/30">
              <SelectItem value="Qualifier" className="text-white">Qualifier</SelectItem>
              <SelectItem value="Round of 16" className="text-white">Round of 16</SelectItem>
              <SelectItem value="Quarter-Final" className="text-white">Quarter-Final</SelectItem>
              <SelectItem value="Semi-Final" className="text-white">Semi-Final</SelectItem>
              <SelectItem value="Final" className="text-white">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {match?._id && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))} value={formData.status}>
              <SelectTrigger className="bg-[#1a2332] border-[#ba3a46]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#ba3a46]/30">
                <SelectItem value="scheduled" className="text-white">Scheduled</SelectItem>
                <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                <SelectItem value="completed" className="text-white">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Team 1 Score</label>
              <Input
                type="number"
                value={formData.team1Score}
                onChange={(e) => setFormData(prev => ({ ...prev, team1Score: e.target.value }))}
                className="bg-[#1a2332] border-[#ba3a46]/30 text-white"
                placeholder="Score"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Team 2 Score</label>
              <Input
                type="number"
                value={formData.team2Score}
                onChange={(e) => setFormData(prev => ({ ...prev, team2Score: e.target.value }))}
                className="bg-[#1a2332] border-[#ba3a46]/30 text-white"
                placeholder="Score"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex space-x-3 pt-4">
        <Button type="submit" className="bg-[#ba3a46] hover:bg-[#ff4654] text-white">
          {match?._id ? 'Update Match' : 'Schedule Match'}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="border-gray-500 text-gray-300">
          Cancel
        </Button>
      </div>
    </form>
  );
}
