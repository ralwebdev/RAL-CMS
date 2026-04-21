import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/AppLayout";
import RoleDashboard from "@/pages/RoleDashboard";
import CampaignsPage from "@/pages/CampaignsPage";
import LeadsPage from "@/pages/LeadsPage";
import TelecallingPage from "@/pages/TelecallingPage";
import FollowUpsPage from "@/pages/FollowUpsPage";
import AdmissionsPage from "@/pages/AdmissionsPage";
import CounselingPage from "@/pages/CounselingPage";
import InstitutionalSalesPage from "@/pages/InstitutionalSalesPage";
import RevenueAnalyticsPage from "@/pages/RevenueAnalyticsPage";
import AccountsPage from "@/pages/AccountsPage";
import AlliancesPage from "@/pages/AlliancesPage";
import AllianceInstitutionProfile from "@/pages/AllianceInstitutionProfile";
import ApprovalsPage from "@/pages/ApprovalsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<RoleDashboard />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/telecalling" element={<TelecallingPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/counseling" element={<CounselingPage />} />
        <Route path="/revenue" element={<RevenueAnalyticsPage />} />
        <Route path="/institutional" element={<InstitutionalSalesPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/alliances" element={<AlliancesPage />} />
        <Route path="/alliance-profile/:id" element={<AllianceInstitutionProfile />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
