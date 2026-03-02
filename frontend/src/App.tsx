import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { UserRole } from './types/enums';
import { useAuthStore } from './store/authStore';

// Public
import HomePage from './pages/home/HomePage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Guest
import MyBookingsPage from './pages/guest/MyBookingsPage';

// Staff pages
import DashboardPage from './pages/dashboard/DashboardPage';
import BookingsPage from './pages/bookings/BookingsPage';
import BookingDetailPage from './pages/bookings/BookingDetailPage';
import FrontDeskPage from './pages/frontDesk/FrontDeskPage';
import RoomsPage from './pages/rooms/RoomsPage';
import RoomTypesPage from './pages/roomTypes/RoomTypesPage';
import UsersPage from './pages/users/UsersPage';
import ServicesPage from './pages/services/ServicesPage';
import HousekeepingPage from './pages/housekeeping/HousekeepingPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import ReviewsPage from './pages/reviews/ReviewsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import ProfilePage from './pages/profile/ProfilePage';
import PricingRulesPage from './pages/pricingRules/PricingRulesPage';
import ReportsPage from './pages/reports/ReportsPage';

const STAFF_ROLES = [
  UserRole.Receptionist, UserRole.HousekeepingStaff,
  UserRole.MaintenanceStaff, UserRole.Manager, UserRole.SuperAdmin,
];

const MANAGER_ROLES = [UserRole.Manager, UserRole.SuperAdmin];

/** Redirects authenticated users to their home, shows landing for guests */
function SmartHome() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === UserRole.Guest ? '/my-bookings' : '/dashboard'} replace />;
  }
  return <HomePage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<SmartHome />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Guest cabinet */}
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={[UserRole.Guest]}><MyBookingsPage /></ProtectedRoute>
        } />

        {/* Staff area */}
        <Route element={<ProtectedRoute roles={STAFF_ROLES}><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/front-desk" element={<FrontDeskPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/room-types" element={<RoomTypesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/housekeeping" element={<HousekeepingPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/analytics" element={
            <ProtectedRoute roles={MANAGER_ROLES}><AnalyticsPage /></ProtectedRoute>
          } />
          <Route path="/pricing-rules" element={
            <ProtectedRoute roles={MANAGER_ROLES}><PricingRulesPage /></ProtectedRoute>
          } />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
