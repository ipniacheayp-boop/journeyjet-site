import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
import PaymentProcessing from "./pages/PaymentProcessing";
import BookingConfirmation from "./pages/BookingConfirmation";
import AgentWillConnect from "./pages/AgentWillConnect";
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
import FxSavingsDashboard from "./pages/FxSavingsDashboard";
import Sitemap from "./pages/Sitemap";
import TaxesFees from "./pages/TaxesFees";
import CruiseDeals from "./pages/CruiseDeals";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import FlightRoutePage from "./pages/seo/FlightRoutePage";
import HotelCityPage from "./pages/seo/HotelCityPage";
import CarRentalCityPage from "./pages/seo/CarRentalCityPage";
import AirportLandingPage from "./pages/seo/AirportLandingPage";

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
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/deals" element={<DealsManagement />} />
                <Route path="/admin/fx-savings" element={<FxSavingsDashboard />} />
                <Route path="/payment-options" element={<PaymentOptions />} />
                <Route path="/payment" element={<PaymentOptions />} />
                <Route path="/payment/processing" element={<PaymentProcessing />} />
                <Route path="/payment/card" element={<PaymentCard />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/agent-will-connect" element={<AgentWillConnect />} />
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
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/taxes-fees" element={<TaxesFees />} />
                <Route path="/cruise-deals" element={<CruiseDeals />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                {/* SEO Route Pages */}
                <Route path="/airport/:slug" element={<AirportLandingPage />} />
                <Route path="/cheap-flights-from-:slug" element={<FlightRoutePage />} />
                <Route path="/cheap-hotels-in-:slug" element={<HotelCityPage />} />
                <Route path="/cheap-car-rentals-in-:slug" element={<CarRentalCityPage />} />
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