import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import { AppLayout } from "./components/layout/AppLayout";
import OnboardingWelcome from "./pages/onboarding/OnboardingWelcome";
import OnboardingHubLocal from "./pages/onboarding/OnboardingHubLocal";
import CompanyTabLocal from "./pages/onboarding/CompanyTabLocal";
import OwnershipTabLocal from "./pages/onboarding/OwnershipTabLocal";
import ComplianceTabLocal from "./pages/onboarding/ComplianceTabLocal";
import DocumentsTabLocal from "./pages/onboarding/DocumentsTabLocal";
import ReviewTabLocal from "./pages/onboarding/ReviewTabLocal";
import OnboardingStatus from "./pages/OnboardingStatus";
import ApplicationSummary from "./pages/ApplicationSummary";

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
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/index" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Legacy redirects */}
              <Route path="/onboarding" element={<Navigate to="/start" replace />} />

              {/* New Onboarding Flow (localStorage-based, no auth required) */}
              <Route path="/start" element={<OnboardingWelcome />} />
              <Route path="/onboarding-local" element={<OnboardingHubLocal />}>
                <Route index element={<Navigate to="company" replace />} />
                <Route path="company" element={<CompanyTabLocal />} />
                <Route path="ownership" element={<OwnershipTabLocal />} />
                <Route path="compliance" element={<ComplianceTabLocal />} />
                <Route path="documents" element={<DocumentsTabLocal />} />
                <Route path="review" element={<ReviewTabLocal />} />
              </Route>

              {/* Protected routes with AppLayout */}
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
                <Route path="/onboarding-status" element={<OnboardingStatus />} />
                <Route path="/application-summary" element={<ApplicationSummary />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
