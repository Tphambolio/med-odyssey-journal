import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { Anchor } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Anchor className="w-10 h-10 text-cyan-500 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Admin access required</h2>
          <p className="text-slate-400 mb-4">You don't have permission to access this page.</p>
          <a href="/" className="text-cyan-400 hover:text-cyan-300">Back to map</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
