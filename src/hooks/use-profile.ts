import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  currency: string | null;
  bio: string | null;
  financial_goal: string | null;
  monthly_income: number | null;
  planning_horizon: string | null;
  life_tags: string[] | null;
}

interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
  currency?: string;
  bio?: string;
  financial_goal?: string;
  monthly_income?: number | null;
  planning_horizon?: string;
  life_tags?: string[];
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        
        // Cast to Profile type since Supabase types may not include new columns yet
        setProfile(data as unknown as Profile);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: UpdateProfileData) => {
    if (!user) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates as any)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    
    setProfile(data as unknown as Profile);
    return data;
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}
