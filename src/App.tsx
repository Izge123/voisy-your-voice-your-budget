import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import Transactions from "./pages/app/Transactions";
import Categories from "./pages/app/Categories";
import Analytics from "./pages/app/Analytics";
import AIChat from "./pages/app/AIChat";
import Settings from "./pages/app/Settings";
import ProfileSettings from "./pages/app/settings/Profile";
import SubscriptionSettings from "./pages/app/settings/Subscription";
import CurrencySettings from "./pages/app/settings/Currency";
import AccountSettings from "./pages/app/settings/Account";
import AIProfileSettings from "./pages/app/settings/AIProfile";
import NotificationsSettings from "./pages/app/settings/Notifications";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAUpdatePrompt />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />
            
            {/* Protected App Routes */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="categories" element={<Categories />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="ai-chat" element={<AIChat />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/profile" element={<ProfileSettings />} />
              <Route path="settings/subscription" element={<SubscriptionSettings />} />
              <Route path="settings/currency" element={<CurrencySettings />} />
              <Route path="settings/account" element={<AccountSettings />} />
              <Route path="settings/ai-profile" element={<AIProfileSettings />} />
              <Route path="settings/notifications" element={<NotificationsSettings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PWAInstallPrompt />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
