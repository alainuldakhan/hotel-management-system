import { ConfigProvider, theme } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { RoomsPage } from './pages/rooms/RoomsPage';
import { RoomTypesPage } from './pages/roomTypes/RoomTypesPage';
import { BookingsPage } from './pages/bookings/BookingsPage';
import { BookingDetailPage } from './pages/bookings/BookingDetailPage';
import { CreateBookingPage } from './pages/bookings/CreateBookingPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { MaintenanceDetailPage } from './pages/maintenance/MaintenanceDetailPage';
import { ServicesPage } from './pages/services/ServicesPage';
import { InvoicesPage } from './pages/invoices/InvoicesPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { UsersPage } from './pages/users/UsersPage';
import { HousekeepingPage } from './pages/housekeeping/HousekeepingPage';
import { BookingGridPage } from './pages/bookings/BookingGridPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ReviewsPage } from './pages/reviews/ReviewsPage';
import { HomePage } from './pages/home/HomePage';
import { UserRole } from './types/enums';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={ruRU}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#0071c2',
            colorBgLayout: '#f2f6fa',
            colorBgContainer: '#ffffff',
            borderRadius: 8,
            fontFamily: "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: 14,
            colorLink: '#0071c2',
            colorSuccess: '#008234',
            colorError: '#cc0000',
            colorWarning: '#FFB700',
          },
          components: {
            Menu: {
              itemBg: 'transparent',
              itemColor: 'rgba(255,255,255,0.85)',
              itemHoverColor: '#FFB700',
              itemSelectedColor: '#FFB700',
              itemSelectedBg: 'rgba(255,255,255,0.1)',
              horizontalItemSelectedColor: '#FFB700',
              horizontalItemHoverColor: '#FFB700',
            },
            Button: {
              primaryColor: '#ffffff',
            },
            Table: {
              headerBg: '#003580',
              headerColor: '#ffffff',
            },
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route
                path="room-types"
                element={
                  <ProtectedRoute roles={[UserRole.Manager, UserRole.SuperAdmin]}>
                    <RoomTypesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="bookings/new" element={<CreateBookingPage />} />
              <Route path="bookings/:id" element={<BookingDetailPage />} />
              <Route
                path="bookings/grid"
                element={
                  <ProtectedRoute
                    roles={[UserRole.Receptionist, UserRole.Manager, UserRole.SuperAdmin]}
                  >
                    <BookingGridPage />
                  </ProtectedRoute>
                }
              />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="maintenance/:id" element={<MaintenanceDetailPage />} />
              <Route
                path="housekeeping"
                element={
                  <ProtectedRoute
                    roles={[
                      UserRole.HousekeepingStaff,
                      UserRole.Receptionist,
                      UserRole.Manager,
                      UserRole.SuperAdmin,
                    ]}
                  >
                    <HousekeepingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="services"
                element={
                  <ProtectedRoute roles={[UserRole.Manager, UserRole.SuperAdmin]}>
                    <ServicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoices"
                element={
                  <ProtectedRoute
                    roles={[UserRole.Receptionist, UserRole.Manager, UserRole.SuperAdmin]}
                  >
                    <InvoicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <ProtectedRoute roles={[UserRole.Manager, UserRole.SuperAdmin]}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute roles={[UserRole.Manager, UserRole.SuperAdmin]}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="profile" element={<ProfilePage />} />
              <Route
                path="reviews"
                element={
                  <ProtectedRoute roles={[UserRole.Manager, UserRole.SuperAdmin]}>
                    <ReviewsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
