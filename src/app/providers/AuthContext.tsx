import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabase';

// Get the site URL from environment or window location
const getSiteUrl = () => {
  const url = import.meta.env.VITE_SITE_URL || window.location.origin;
  return url.replace(/\/$/, ''); // Remove trailing slash if present
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithFacebook: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('Starting sign up process...', { email, fullName });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${getSiteUrl()}/auth/callback`,
          // Add this to skip email confirmation
          gotrue_meta_security: {
            captcha_token: null
          }
        },
      });
      
      if (error) throw error;
      
      // If signup successful, immediately sign in
      if (data.user) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
      }
      
      return { error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      return { error: err as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    console.log('Starting Google OAuth sign-in...');
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log('Redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to:', data.url);
        window.location.href = data.url;
      }
      
      return { error: null };
    } catch (err) {
      console.error('Google OAuth error:', err);
      return { error: err as AuthError };
    }
  };

  const signInWithFacebook = async () => {
    console.log('Starting Facebook OAuth sign-in...');
    try {
      const redirectTo = `${getSiteUrl()}/auth/callback`;
      console.log('Redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo,
          queryParams: {
            display: 'popup'
          },
          skipBrowserRedirect: false
        }
      });
      
      console.log('Facebook OAuth response:', { data, error });
      return { error };
    } catch (err) {
      console.error('Facebook OAuth error:', err);
      return { error: err as AuthError };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsAuthenticated(false);
      setUser(null);
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/reset-password`,
    });
    return { error };
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 