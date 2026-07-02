import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import FlyBot from "@/components/FlyBot";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/auth/AuthCallback"));
const Index = lazy(() => import("./pages/Index"));
const Deals = lazy(() => import("./pages/Deals"));
const DealDetail = lazy(() => import("./pages/DealDetail"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Booking = lazy(() => import("./pages/Booking"));
const Account = lazy(() => import("./pages/Account"));
const Support = lazy(() => import("./pages/Support"));
const Terms = lazy(() => import("./pages/Terms"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const AgentConnect = lazy(() => import("./pages/AgentConnect"));
const AgentWallet = lazy(() => import("./pages/AgentWallet"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const PaymentOptions = lazy(() => import("./pages/PaymentOptions"));
const PaymentCard = lazy(() => import("./pages/PaymentCard"));
const PaymentProcessing = lazy(() => import("./pages/PaymentProcessing"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const AgentWillConnect = lazy(() => import("./pages/AgentWillConnect"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SiteReviews = lazy(() => import("./pages/SiteReviews"));
const ReviewsAnalytics = lazy(() => import("./pages/ReviewsAnalytics"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Careers = lazy(() => import("./pages/Careers"));
const AgentLogin = lazy(() => import("./pages/AgentLogin"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const DealsManagement = lazy(() => import("./pages/DealsManagement"));
const FxSavingsDashboard = lazy(() => import("./pages/FxSavingsDashboard"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const TaxesFees = lazy(() => import("./pages/TaxesFees"));
const CruiseDeals = lazy(() => import("./pages/CruiseDeals"));
const CruiseDestinationPage = lazy(() => import("./pages/CruiseDestinationPage"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const FlightRoutePage = lazy(() => import("./pages/seo/FlightRoutePage"));
const HotelCityPage = lazy(() => import("./pages/seo/HotelCityPage"));
const CarRentalCityPage = lazy(() => import("./pages/seo/CarRentalCityPage"));
const AirportLandingPage = lazy(() => import("./pages/seo/AirportLandingPage"));
const CityFlightPage = lazy(() => import("./pages/seo/CityFlightPage"));
const WebCheckIn = lazy(() => import("./pages/WebCheckIn"));
const FlightStatus = lazy(() => import("./pages/FlightStatus"));
const FlightsToDestination = lazy(() => import("./pages/FlightsToDestination"));
const AirlinePage = lazy(() => import("./pages/AirlinePage"));
const TravelChecklists = lazy(() => import("./pages/TravelChecklists"));
const FlightTracker = lazy(() => import("./pages/FlightTracker"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const PriceMatch = lazy(() => import("./pages/PriceMatch"));
const TripPlanner = lazy(() => import("./pages/TripPlanner"));
const Explore = lazy(() => import("./pages/Explore"));
const SearchHubPage = lazy(() => import("./pages/SearchHubPage"));
const TravelGuidesHub = lazy(() => import("./pages/guides/TravelGuidesHub"));
const CityGuidePage = lazy(() => import("./pages/guides/CityGuidePage"));
const CountryGuidePage = lazy(() => import("./pages/guides/CountryGuidePage"));

const FlybotWrapper = () => {
  const location = useLocation();
  const isFlybotEnabled = import.meta.env.VITE_ENABLE_FLYBOT !== "false";

  const shouldShowFlybot =
    isFlybotEnabled &&
    !location.pathname.includes("/support") &&
    !location.pathname.includes("/customer-support") &&
    !location.pathname.includes("/help/support");

  return shouldShowFlybot ? <FlyBot /> : null;
};

const RouteLoadingFallback = () => (
  <main className="min-h-[60vh] flex items-center justify-center px-4">
    <div className="text-center space-y-2">
      <div
        className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  </main>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="tripile-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <CookieConsentBanner />
              <Suspense fallback={<RouteLoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/flights" element={<SearchHubPage />} />
                  <Route path="/hotels" element={<SearchHubPage />} />
                  <Route path="/car-rentals" element={<SearchHubPage />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/deals/:id" element={<DealDetail />} />
                  <Route path="/search-results" element={<SearchResults />} />
                  <Route path="/booking/:id" element={<Booking />} />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/support" element={<Support />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/auth/signin" element={<SignIn />} />
                  <Route path="/auth/signup" element={<SignUp />} />
                  <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  {/* Legacy redirects */}
                  <Route path="/login" element={<Navigate to="/auth/signin" replace />} />
                  <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
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
                  {/* SEO: keep legacy/external inbound links working (fix 404s) */}
                  <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
                  <Route path="/contact-us" element={<Navigate to="/support" replace />} />
                  <Route path="/contact" element={<Navigate to="/support" replace />} />
                  {/* SEO: legacy/marketing landing paths that no longer exist → home (kills soft 404s) */}
                  <Route path="/lander" element={<Navigate to="/" replace />} />
                  <Route path="/landing" element={<Navigate to="/" replace />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/taxes-fees" element={<TaxesFees />} />
                  <Route path="/cruise-deals" element={<CruiseDeals />} />
                  <Route path="/cruises/:slug" element={<CruiseDestinationPage />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/destinations-checklist" element={<TravelChecklists />} />
                  {/* SEO Route Pages */}
                  <Route path="/airport/:slug" element={<AirportLandingPage />} />
                  <Route path="/cheap-flights-from-:slug" element={<FlightRoutePage />} />
                  <Route path="/cheap-hotels-in/:slug" element={<HotelCityPage />} />
                  <Route path="/cheap-car-rentals-in-:slug" element={<CarRentalCityPage />} />
                  <Route path="/webcheck-in" element={<WebCheckIn />} />
                  <Route path="/flight-status" element={<FlightStatus />} />
                  <Route path="/flight-tracker" element={<FlightTracker />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/price-match" element={<PriceMatch />} />
                  <Route path="/trip-planner" element={<TripPlanner />} />
                  <Route path="/explore" element={<Explore />} />
                  {/* Travel Guides (programmatic city & country guides) */}
                  <Route path="/travel-guides" element={<TravelGuidesHub />} />
                  <Route path="/travel-guide/country/:slug" element={<CountryGuidePage />} />
                  <Route path="/travel-guide/:slug" element={<CityGuidePage />} />
                  <Route path="/flights-to/:slug" element={<FlightsToDestination />} />
                  <Route path="/flights/:from-to-:to" element={<CityFlightPage />} />
                  <Route path="/airlines/:slug" element={<AirlinePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <FlybotWrapper />
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
