import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionStatus {
  status: 'trial' | 'expired' | 'active' | 'cancelled';
  plan: 'free' | 'pro';
  daysRemaining: number;
  isActive: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase
          .rpc('check_subscription_status', { p_user_id: user.id });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSubscription({
            status: data[0].status as SubscriptionStatus['status'],
            plan: data[0].plan as SubscriptionStatus['plan'],
            daysRemaining: data[0].days_remaining,
            isActive: data[0].is_active,
          });
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
        // If no subscription found, set as expired
        setSubscription({
          status: 'expired',
          plan: 'free',
          daysRemaining: 0,
          isActive: false,
        });
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
    canPerformAction,
    isTrialActive,
    isSubscriptionActive,
  };
}
