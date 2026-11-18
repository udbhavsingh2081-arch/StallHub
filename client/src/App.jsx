import React, { useState, useEffect } from 'react';
import { apiRequest, getCurrentUser, setCurrentUser, setAuthToken } from './api';
import CustomerMenu from './components/CustomerMenu';
import LoginPage from './components/LoginPage';
import StallAdmin from './components/StallAdmin';
import SuperAdmin from './components/SuperAdmin';

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [user, setUser] = useState(getCurrentUser());
  const [authChecking, setAuthChecking] = useState(true);

  // Sync route on hashchange
  useEffect(() => {
    const handleHash = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Verify auth session on initial mount
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await apiRequest('/auth/me');
        if (isMounted) {
          if (res.user) {
            setUser(res.user);
            setCurrentUser(res.user);
          } else {
            setUser(null);
            setCurrentUser(null);
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) setAuthChecking(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  const navigate = (newHash) => {
    window.location.hash = newHash;
    setRoute(newHash);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setAuthToken(null);
      setCurrentUser(null);
      setUser(null);
      navigate('#/login');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Route: /login
  if (route.startsWith('#/login')) {
    return (
      <LoginPage
        onLoginSuccess={(u) => setUser(u)}
        onNavigate={navigate}
      />
    );
  }

  // Route: /super-admin
  if (route.startsWith('#/super-admin')) {
    if (!user || user.role !== 'super_admin') {
      return (
        <LoginPage
          onLoginSuccess={(u) => setUser(u)}
          onNavigate={navigate}
        />
      );
    }
    return (
      <SuperAdmin
        user={user}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
    );
  }

  // Route: /stall-admin
  if (route.startsWith('#/stall-admin')) {
    if (!user) {
      return (
        <LoginPage
          onLoginSuccess={(u) => setUser(u)}
          onNavigate={navigate}
        />
      );
    }
    return (
      <StallAdmin
        user={user}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
    );
  }

  // Route: /menu/:slug or default Customer Menu
  let slug = 'pizza-corner';
  if (route.startsWith('#/menu/')) {
    slug = route.replace('#/menu/', '').split('?')[0] || 'pizza-corner';
  } else if (window.location.pathname.startsWith('/menu/')) {
    slug = window.location.pathname.replace('/menu/', '').split('/')[0] || 'pizza-corner';
  }

  return (
    <CustomerMenu
      slug={slug}
      onNavigate={navigate}
    />
  );
}
