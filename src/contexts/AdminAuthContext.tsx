import { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isCodeVerified: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  verifyCode: (code: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  clearCodeVerification: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const CODE_VERIFIED_KEY = 'admin_code_verified';

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if code was verified in this session
  useEffect(() => {
    const verified = sessionStorage.getItem(CODE_VERIFIED_KEY) === 'true';
    setIsCodeVerified(verified);
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user has admin role
          setTimeout(async () => {
            await checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(data === true);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    }
  };

  const verifyCode = async (code: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-code', {
        body: { code }
      });

      if (error) {
        console.error('Error verifying code:', error);
        return false;
      }

      const isValid = data?.valid === true;
      if (isValid) {
        sessionStorage.setItem(CODE_VERIFIED_KEY, 'true');
        setIsCodeVerified(true);
      }
      return isValid;
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    sessionStorage.removeItem(CODE_VERIFIED_KEY);
    setIsCodeVerified(false);
    setIsAdmin(false);
    await supabase.auth.signOut();
  };

  const clearCodeVerification = () => {
    sessionStorage.removeItem(CODE_VERIFIED_KEY);
    setIsCodeVerified(false);
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      session,
      isCodeVerified,
      isAdmin,
      isLoading,
      verifyCode,
      signIn,
      signOut,
      clearCodeVerification
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
