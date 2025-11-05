
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Auth pages
import Login from "@/pages/auth/Login";
import Index from "@/pages/Index";

// Dashboard pages
import Dashboard from "@/pages/dashboard/Dashboard";
import Sessions from "@/pages/dashboard/Sessions";
import SessionDetails from "@/pages/dashboard/SessionDetails";
import Analytics from "@/pages/dashboard/Analytics";
import AdminAnalytics from "@/pages/dashboard/AdminAnalytics";
import Warmers from "@/pages/dashboard/Warmers";
import CreateWarmer from "@/pages/dashboard/CreateWarmer";
import StandardWarmer from "@/pages/dashboard/StandardWarmer";
import Contacts from "@/pages/dashboard/Contacts";
import Settings from "@/pages/dashboard/Settings";
import NotFound from "./pages/NotFound";
import Verifier from "@/pages/dashboard/Verifier";
import BulkSender from "@/pages/dashboard/BulkSender";
import Sales from "@/pages/Sales";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Sales />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/overview" element={<Dashboard />} />
                <Route path="/bulk-sender" element={<BulkSender />} />
                <Route path="/bulk-sender/:campaignId" element={<BulkSender />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/sessions/details/:sessionId" element={<SessionDetails />} />
                <Route path="/warmers" element={<Warmers />} />
                <Route path="/warmers/create" element={<CreateWarmer />} />
                <Route path="/warmers/standard" element={<StandardWarmer />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/verifier" element={<Verifier />} />
                <Route path="/analytics" element={<Analytics />} />
                
                {/* Admin-only routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                </Route>
              </Route>
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
