import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase auto-detects the PKCE code from the URL on initialization.
    // We just need to wait for the session to be established, then redirect.

    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled) return;
        if (event === 'SIGNED_IN' && session) {
          navigate('/', { replace: true });
        }
      }
    );

    // Also check if session was already established (race condition guard)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) {
        navigate('/', { replace: true });
      }
    });

    // Fallback: if nothing happens in 5s, try explicit code exchange
    const timer = setTimeout(async () => {
      if (cancelled) return;
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error('Auth exchange error:', exchangeError.message);
          setError(exchangeError.message);
          setTimeout(() => navigate('/', { replace: true }), 2000);
        } else {
          navigate('/', { replace: true });
        }
      } else {
        // No code and no session — something went wrong
        navigate('/', { replace: true });
      }
    }, 3000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Anchor className="w-12 h-12 text-cyan-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-semibold text-white mb-2">
          {error ? 'Sign-in failed' : 'Completing sign-in...'}
        </h2>
        <p className="text-slate-400">
          {error || "You'll be redirected in a moment."}
        </p>
      </div>
    </div>
  );
}
