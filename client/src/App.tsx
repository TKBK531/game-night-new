import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import RulesPage from "@/pages/rules";
import AdminFiles from "@/pages/admin-files";
import AdminDashboard from "@/pages/admin";
import SupportUsPage from "@/pages/support-us";
import LeaderboardPage from "@/pages/leaderboard";
import MatchDisplayPage from "@/pages/match-display";
import KonamiCodeChallenge from "@/components/konami-code";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/rules" component={() => <RulesPage />} />
      <Route path="/support-us" component={() => <SupportUsPage />} />
      <Route path="/leaderboard" component={() => <LeaderboardPage />} />
      <Route path="/matches" component={() => <MatchDisplayPage />} />
      <Route path="/admin" component={() => <AdminDashboard />} />
      <Route path="/admin/files" component={() => <AdminFiles />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <KonamiCodeChallenge />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
