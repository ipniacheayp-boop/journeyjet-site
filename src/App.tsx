import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import FlyBot from "@/components/FlyBot";
import Index from "./pages/Index";
import Deals from "./pages/Deals";
import DealDetail from "./pages/DealDetail";
import SearchResults from "./pages/SearchResults";
import Booking from "./pages/Booking";
import Account from "./pages/Account";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
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
import ReviewsAnalytics from "./pages/ReviewsAnalytics";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Careers from "./pages/Careers";
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import DealsManagement from "./pages/DealsManagement";

const queryClient = new QueryClient();

const FlybotWrapper = () => {
  const location = useLocation();
  const isFlybotEnabled = import.meta.env.VITE_ENABLE_FLYBOT !== 'false';
  
  const shouldShowFlybot = isFlybotEnabled && 
    !location.pathname.includes('/support') &&
    !location.pathname.includes('/customer-support') &&
    !location.pathname.includes('/help/support');
  
  return shouldShowFlybot ? <FlyBot /> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="cheapflights-theme">
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
                <Route path="/login" element={<UserLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/deals" element={<DealsManagement />} />
                <Route path="/payment-options" element={<PaymentOptions />} />
                <Route path="/payment/card" element={<PaymentCard />} />
                <Route path="/payment/upi" element={<PaymentUPI />} />
                <Route path="/payment/stripe-upi" element={<PaymentStripeUPI />} />
                <Route path="/payment/qr" element={<PaymentQR />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                <Route path="/agent-connect" element={<AgentConnect />} />
                <Route path="/agent/wallet" element={<AgentWallet />} />
                <Route path="/agent/login" element={<AgentLogin />} />
                <Route path="/agent/dashboard" element={<AgentDashboard />} />
                <Route path="/reviews" element={<SiteReviews />} />
                <Route path="/reviews/site" element={<SiteReviews />} />
                <Route path="/reviews/analytics" element={<ReviewsAnalytics />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <FlybotWrapper />
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;