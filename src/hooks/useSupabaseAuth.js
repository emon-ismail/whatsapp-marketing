import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase?.auth?.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setError(error?.message);
        } else if (session?.user) {
          setUser(session?.user);
        }
      } catch (err) {
        console.error('Session error:', err);
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session?.user);
        } else {
          setUser(null);
        }
        
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error?.message);
        return { success: false, error: error?.message };
      }

      return { success: true, user: data?.user, session: data?.session };
    } catch (err) {
      const errorMsg = err?.message || 'An unexpected error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        setError(error?.message);
        return { success: false, error: error?.message };
      }

      return { success: true, user: data?.user, session: data?.session };
    } catch (err) {
      const errorMsg = err?.message || 'An unexpected error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase?.auth?.signOut();

      if (error) {
        setError(error?.message);
        return { success: false, error: error?.message };
      }

      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMsg = err?.message || 'An unexpected error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      });

      if (error) {
        setError(error?.message);
        return { success: false, error: error?.message };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err?.message || 'An unexpected error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase?.auth?.updateUser({
        password: newPassword
      });

      if (error) {
        setError(error?.message);
        return { success: false, error: error?.message };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err?.message || 'An unexpected error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with OAuth provider
  const signInWithProvider = async (provider) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location?.origin
        }
      });

      if (error) {
        setError(error?.message);
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (err) {
      const errorMsg = err?.message || 'An unexpected error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithProvider,
    isAuthenticated: !!user
  };
};

export default useSupabaseAuth;