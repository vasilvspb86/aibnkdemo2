import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import OnboardingStatus from "./pages/OnboardingStatus";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Payments from "./pages/Payments";
import Cards from "./pages/Cards";
import Invoices from "./pages/Invoices";
import Expenses from "./pages/Expenses";
import Credit from "./pages/Credit";
import Rewards from "./pages/Rewards";
import Assistant from "./pages/Assistant";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Layout
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/onboarding/status" element={<OnboardingStatus />} />

              {/* Protected App Routes with Sidebar */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/credit" element={<Credit />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
