import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async (retryCount = 0) => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          setAuthenticated(true);
          setLoading(false);
        } else {
          // If 404, the server might be restarting, retry a few times
          if (res.status === 404 && retryCount < 3) {
            setTimeout(() => checkAuth(retryCount + 1), 2000);
            return;
          }
          const data = await res.json().catch(() => ({}));
          if (data.revoked) {
            setRevoked(true);
          }
          setAuthenticated(false);
          setLoading(false);
        }
      } catch (err) {
        if (retryCount < 3) {
          setTimeout(() => checkAuth(retryCount + 1), 2000);
        } else {
          setAuthenticated(false);
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Icons.Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to={`/login${revoked ? '?revoked=true' : ''}`} replace />;
  }

  return <>{children}</>;
};
