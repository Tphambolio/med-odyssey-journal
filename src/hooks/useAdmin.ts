import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Admin users identified by email or Supabase user ID
// Add your admin emails here
const ADMIN_EMAILS = [
  'travis@pham.dev',
  'tphambolio@gmail.com',
];

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Check by email first (fast path)
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    // Fallback: check user_profiles.is_admin column if it exists
    async function checkAdminFlag() {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('id', user!.id)
          .single();

        setIsAdmin(data?.is_admin === true);
      } catch {
        // Column doesn't exist yet or query failed - fall back to email check
        setIsAdmin(false);
      }
      setLoading(false);
    }

    checkAdminFlag();
  }, [user, authLoading]);

  return { isAdmin, loading };
}
