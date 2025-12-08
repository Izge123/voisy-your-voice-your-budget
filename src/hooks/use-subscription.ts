import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionStatus {
  status: 'trial' | 'expired' | 'active' | 'cancelled';
  plan: 'free' | 'pro';
  daysRemaining: number;
  isActive: boolean;
  endsAt: Date | null;
}

const CACHE_VERSION = 2;
const CACHE_KEY = `kapitallo_subscription_cache_v${CACHE_VERSION}`;

function clearOldCacheVersions() {
  try {
    localStorage.removeItem('kapitallo_subscription_cache');
    for (let i = 1; i < CACHE_VERSION; i++) {
      localStorage.removeItem(`kapitallo_subscription_cache_v${i}`);
    }
  } catch {
    // Ignore errors
  }
}

function getCachedSubscription(userId: string): SubscriptionStatus | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      if (data.userId === userId && data.subscription) {
        return {
          ...data.subscription,
          endsAt: data.subscription.endsAt ? new Date(data.subscription.endsAt) : null,
        };
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedSubscription(userId: string, subscription: SubscriptionStatus) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      userId,
      subscription,
      cachedAt: Date.now(),
    }));
  } catch {
    // Ignore cache errors
  }
}

async function fetchSubscriptionWithRetry(
  userId: string,
  maxRetries: number = 3
): Promise<SubscriptionStatus | null> {
  const delays = [0, 1000, 3000]; // Immediate, 1s, 3s
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise(resolve => setTimeout(resolve, delays[attempt]));
    }
    
    try {
      const { data, error } = await supabase
        .rpc('check_subscription_status', { p_user_id: userId });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          status: data[0].status as SubscriptionStatus['status'],
          plan: data[0].plan as SubscriptionStatus['plan'],
          daysRemaining: data[0].days_remaining,
          isActive: data[0].is_active,
          endsAt: data[0].ends_at ? new Date(data[0].ends_at) : null,
        };
      }
      return null;
    } catch (err) {
      console.error(`Subscription check attempt ${attempt + 1} failed:`, err);
      if (attempt === maxRetries - 1) {
        throw err;
      }
    }
  }
  return null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear old cache versions on mount
  useEffect(() => {
    clearOldCacheVersions();
  }, []);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      setError(null);
      return;
    }

    const checkSubscription = async () => {
      setError(null);
      
      try {
        const result = await fetchSubscriptionWithRetry(user.id);
        
        if (result) {
          setSubscription(result);
          setCachedSubscription(user.id, result);
        } else {
          // No subscription found in DB - check cache first
          const cached = getCachedSubscription(user.id);
          if (cached) {
            setSubscription(cached);
          } else {
            // New user without subscription record - give trial access
            setSubscription({
              status: 'trial',
              plan: 'free',
              daysRemaining: 30,
              isActive: true,
              endsAt: null,
            });
          }
        }
      } catch (err) {
        console.error("Error checking subscription after all retries:", err);
        setError("Не удалось проверить подписку");
        
        // On network error - use cache or give optimistic access
        const cached = getCachedSubscription(user.id);
        if (cached) {
          console.log("Using cached subscription data");
          setSubscription(cached);
        } else {
          // No cache available - give optimistic trial access
          // Better to let user work than block them due to network issues
          console.log("No cache, giving optimistic trial access");
          setSubscription({
            status: 'trial',
            plan: 'free',
            daysRemaining: 30,
            isActive: true,
            endsAt: null,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  const canPerformAction = subscription?.isActive ?? false;
  const isTrialActive = subscription?.status === 'trial';
  const isSubscriptionActive = subscription?.status === 'active';

  return {
    subscription,
    loading,
    error,
    canPerformAction,
    isTrialActive,
    isSubscriptionActive,
  };
}
