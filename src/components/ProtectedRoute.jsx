import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const [moderatorCheck, setModeratorCheck] = useState({ loading: true, exists: false });

  useEffect(() => {
    const checkModeratorExists = async () => {
      if (user?.id && !loading) {
        try {
          const { data, error } = await supabase
            .from('moderators')
            .select('id, status')
            .eq('user_id', user.id)
            .single();

          if (error || !data || data.status !== 'active') {
            // Moderator doesn't exist or is inactive, sign out
            await signOut();
            setModeratorCheck({ loading: false, exists: false });
          } else {
            setModeratorCheck({ loading: false, exists: true });
          }
        } catch (error) {
          console.error('Error checking moderator:', error);
          await signOut();
          setModeratorCheck({ loading: false, exists: false });
        }
      } else if (!loading) {
        setModeratorCheck({ loading: false, exists: false });
      }
    };

    if (isAuthenticated && user && !loading) {
      checkModeratorExists();
    } else if (!loading) {
      setModeratorCheck({ loading: false, exists: false });
    }
  }, [user, isAuthenticated, loading, signOut]);

  if (loading || (moderatorCheck.loading && isAuthenticated)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !moderatorCheck.exists) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;