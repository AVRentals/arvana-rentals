import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { getTheme, setTheme } from '@/lib/utils';

import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import CarDetail from '@/pages/CarDetail';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Book from '@/pages/Book';
import BookingConfirmation from '@/pages/BookingConfirmation';
import Dashboard from '@/pages/Dashboard';
import FleetManager from '@/pages/FleetManager';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Careers from '@/pages/Careers';
import Blog from '@/pages/Blog';
import NotFound from '@/pages/NotFound';

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Initialize theme
const ThemeInitializer: React.FC = () => {
  useEffect(() => {
    const theme = getTheme();
    setTheme(theme);
  }, []);
  return null;
};

// Layout wrapper (navbar shown on all pages except auth)
const Layout: React.FC<{ children: React.ReactNode; hideNav?: boolean }> = ({ children, hideNav }) => {
  return (
    <>
      {!hideNav && <Navbar />}
      <main>{children}</main>
    </>
  );
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <Layout hideNav={isAuthPage}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cars/:id" element={<CarDetail />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Booking */}
        <Route path="/book/:carId" element={<Book />} />
        <Route path="/bookings/:bookingId" element={<BookingConfirmation />} />

        {/* Dashboards */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<FleetManager />} />

        {/* Company / Info pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/blog" element={<Blog />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeInitializer />
        <ScrollToTop />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--background, #fff)',
              color: 'var(--foreground, #1A1A2E)',
              border: '1px solid var(--border, #e2e8f0)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#E94560', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
