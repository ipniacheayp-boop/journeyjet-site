import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Deals from "./pages/Deals";
import DealDetail from "./pages/DealDetail";
import SearchResults from "./pages/SearchResults";
import Booking from "./pages/Booking";
import Account from "./pages/Account";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import MyBookings from "./pages/MyBookings";
import PaymentSuccess from "./pages/PaymentSuccess";
import AgentConnect from "./pages/AgentConnect";
import AgentWallet from "./pages/AgentWallet";
import PaymentCancel from "./pages/PaymentCancel";
import PaymentOptions from "./pages/PaymentOptions";
import PaymentCard from "./pages/PaymentCard";
import PaymentUPI from "./pages/PaymentUPI";
import PaymentStripeUPI from "./pages/PaymentStripeUPI";
import PaymentQR from "./pages/PaymentQR";
import ErrorPage from "./pages/ErrorPage";
import NotFound from "./pages/NotFound";
import SiteReviews from "./pages/SiteReviews";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Careers from "./pages/Careers";
import AgentDashboard from "./pages/AgentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/deals/:id" element={<DealDetail />} />
              <Route path="/search-results" element={<SearchResults />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/account" element={<Account />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/support" element={<Support />} />
              <Route path="/terms" element={<Terms />} />
              
              {/* Unified Login Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Admin Routes - Protected */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin" redirectTo="/login">
                  <Admin />
                </ProtectedRoute>
              } />
              
              {/* Agent Routes - Protected */}
              <Route path="/agent-connect" element={<AgentConnect />} />
              <Route path="/agent/wallet" element={
                <ProtectedRoute requiredRole="agent" redirectTo="/login">
                  <AgentWallet />
                </ProtectedRoute>
              } />
              <Route path="/agent/dashboard" element={
                <ProtectedRoute requiredRole="agent" redirectTo="/login">
                  <AgentDashboard />
                </ProtectedRoute>
              } />
              
              {/* Payment Routes */}
              <Route path="/payment-options" element={<PaymentOptions />} />
              <Route path="/payment/card" element={<PaymentCard />} />
              <Route path="/payment/upi" element={<PaymentUPI />} />
              <Route path="/payment/stripe-upi" element={<PaymentStripeUPI />} />
              <Route path="/payment/qr" element={<PaymentQR />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancel" element={<PaymentCancel />} />
              <Route path="/reviews/site" element={<SiteReviews />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
