import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  trialUsers: number;
  proUsers: number;
  expiredUsers: number;
  conversionRate: number;
  churnRate: number;
  mrr: number;
  arr: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  promoCodeUsers: number;
}

interface UserWithSubscription {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  promo_code_used: string | null;
  subscription: {
    status: string;
    plan: string;
    trial_ends_at: string | null;
    subscription_ends_at: string | null;
  } | null;
}

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  plan: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  payment_provider: string | null;
  payment_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  user?: {
    email: string | null;
    full_name: string | null;
  };
}

const PRO_PRICE_MONTHLY = 4.99;

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, promo_code_used');

      if (profilesError) throw profilesError;

      // Fetch all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subsError) throw subsError;

      const totalUsers = profiles?.length || 0;
      const promoCodeUsers = profiles?.filter(p => p.promo_code_used).length || 0;
      const trialUsers = subscriptions?.filter(s => s.status === 'trial').length || 0;
      const proUsers = subscriptions?.filter(s => s.status === 'active').length || 0;
      const expiredUsers = subscriptions?.filter(s => s.status === 'expired').length || 0;

      // Calculate conversion rate (trial -> pro)
      const totalNonTrial = proUsers + expiredUsers;
      const conversionRate = totalNonTrial > 0 ? (proUsers / totalNonTrial) * 100 : 0;

      // Calculate churn rate (expired / total who finished trial)
      const churnRate = totalNonTrial > 0 ? (expiredUsers / totalNonTrial) * 100 : 0;

      // Calculate MRR and ARR
      const mrr = proUsers * PRO_PRICE_MONTHLY;
      const arr = mrr * 12;

      // New users calculations
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const newUsersToday = profiles?.filter(p => 
        p.created_at && new Date(p.created_at) >= todayStart
      ).length || 0;

      const newUsersThisWeek = profiles?.filter(p => 
        p.created_at && new Date(p.created_at) >= weekStart
      ).length || 0;

      const newUsersThisMonth = profiles?.filter(p => 
        p.created_at && new Date(p.created_at) >= monthStart
      ).length || 0;

      return {
        totalUsers,
        trialUsers,
        proUsers,
        expiredUsers,
        conversionRate,
        churnRate,
        mrr,
        arr,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        promoCodeUsers,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserWithSubscription[]> => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at, promo_code_used')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Create a map of user_id -> subscription
      const subscriptionMap = new Map<string, typeof subscriptions[0]>();
      subscriptions?.forEach(sub => {
        subscriptionMap.set(sub.user_id, sub);
      });

      // Combine profiles with subscriptions
      return (profiles || []).map(profile => ({
        ...profile,
        subscription: subscriptionMap.get(profile.id) ? {
          status: subscriptionMap.get(profile.id)!.status,
          plan: subscriptionMap.get(profile.id)!.plan,
          trial_ends_at: subscriptionMap.get(profile.id)!.trial_ends_at,
          subscription_ends_at: subscriptionMap.get(profile.id)!.subscription_ends_at,
        } : null,
      }));
    },
    refetchInterval: 30000,
  });
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async (): Promise<Subscription[]> => {
      // Fetch all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Fetch profiles to get user info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      // Create a map of user_id -> profile
      const profileMap = new Map<string, typeof profiles[0]>();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Combine subscriptions with user info
      return (subscriptions || []).map(sub => ({
        ...sub,
        user: profileMap.get(sub.user_id) ? {
          email: profileMap.get(sub.user_id)!.email,
          full_name: profileMap.get(sub.user_id)!.full_name,
        } : undefined,
      }));
    },
    refetchInterval: 30000,
  });
}
