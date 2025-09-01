import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ⚠️ PROTECTED FUNCTION - DO NOT MODIFY OR ADD ASYNC OPERATIONS
  // This is a Supabase auth state change listener that must remain synchronous
  const handleAuthStateChange = (event, session) => {
    // SYNC OPERATIONS ONLY - NO ASYNC/AWAIT ALLOWED
    if (session?.user) {
      setUser(session?.user)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  
  useEffect(() => {
    // Get initial session - Use Promise chain
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session?.user)
        }
        setLoading(false)
      })

    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(handleAuthStateChange)

    return () => subscription?.unsubscribe()
  }, [])

  // Authentication methods
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      // Get user's company from moderators table
      const { data: moderatorData } = await supabase
        .from('moderators')
        .select('company')
        .eq('user_id', data.user.id)
        .single()

      return { 
        success: true, 
        user: { ...data?.user, company: moderatorData?.company || 'oasis_outfit' }, 
        session: data?.session 
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error?.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, company = 'oasis_outfit') => {
    try {
      setLoading(true)
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password
      })

      if (error) {
        throw error
      }

      // Create moderator record with company
      if (data?.user) {
        await supabase.from('moderators').insert({
          user_id: data.user.id,
          name: email.split('@')[0],
          email: email,
          status: 'active',
          role: 'moderator',
          company: company
        })
      }

      return { success: true, user: data?.user, session: data?.session }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: error?.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase?.auth?.signOut()

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error?.message }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: error?.message }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase?.auth?.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, error: error?.message }
    }
  }

  // Get user profile data
  const getUserProfile = async () => {
    try {
      if (!user?.id) return null

      // You can extend this to fetch additional profile data from your tables
      // Example: fetching from a user_profiles table if it exists
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', user?.id)?.single()

      if (error && error?.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    getUserProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}