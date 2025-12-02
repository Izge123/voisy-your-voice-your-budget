import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Redirect authenticated users to dashboard
        if (session?.user && window.location.pathname === "/auth") {
          setTimeout(() => navigate("/app/dashboard"), 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const errorMessages: { [key: string]: string } = {
        "Invalid login credentials": "Неверный email или пароль",
        "Email not confirmed": "Email не подтверждён. Проверьте почту.",
        "User not found": "Пользователь не найден",
      };
      
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: errorMessages[error.message] || error.message,
      });
    } else {
      toast({
        title: "Добро пожаловать!",
        description: "Вы успешно вошли в систему",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      const errorMessages: { [key: string]: string } = {
        "User already registered": "Этот email уже зарегистрирован",
        "Password should be at least 6 characters": "Пароль должен содержать минимум 6 символов",
        "Unable to validate email address: invalid format": "Некорректный формат email",
      };

      toast({
        variant: "destructive",
        title: "Ошибка регистрации",
        description: errorMessages[error.message] || error.message,
      });
    } else {
      toast({
        title: "Регистрация успешна!",
        description: "Проверьте почту для подтверждения аккаунта",
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка входа через Google",
        description: error.message,
      });
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка сброса пароля",
        description: error.message,
      });
    } else {
      toast({
        title: "Проверьте почту",
        description: "Мы отправили вам ссылку для сброса пароля",
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Вы вышли из системы",
      description: "До скорой встречи!",
    });
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signInWithGoogle, resetPassword, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
