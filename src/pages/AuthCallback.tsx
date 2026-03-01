import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase auth handles the token exchange automatically via onAuthStateChange.
    // Once the session is established, redirect home after a short delay.
    const timer = setTimeout(() => navigate('/', { replace: true }), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Anchor className="w-12 h-12 text-cyan-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-semibold text-white mb-2">Completing sign-in...</h2>
        <p className="text-slate-400">You'll be redirected in a moment.</p>
      </div>
    </div>
  );
}
