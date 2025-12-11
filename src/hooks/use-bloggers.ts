import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Blogger {
  id: string;
  name: string;
  promo_code: string;
  created_at: string;
  referred_count?: number;
}

export function useBloggers() {
  return useQuery({
    queryKey: ['admin-bloggers'],
    queryFn: async (): Promise<Blogger[]> => {
      // Fetch all bloggers
      const { data: bloggers, error: bloggersError } = await supabase
        .from('bloggers')
        .select('*')
        .order('created_at', { ascending: false });

      if (bloggersError) throw bloggersError;

      // Fetch profiles to count referrals per blogger
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('referred_by_blogger_id')
        .not('referred_by_blogger_id', 'is', null);

      if (profilesError) throw profilesError;

      // Count referrals per blogger
      const referralCounts = new Map<string, number>();
      profiles?.forEach(profile => {
        if (profile.referred_by_blogger_id) {
          const count = referralCounts.get(profile.referred_by_blogger_id) || 0;
          referralCounts.set(profile.referred_by_blogger_id, count + 1);
        }
      });

      return (bloggers || []).map(blogger => ({
        ...blogger,
        referred_count: referralCounts.get(blogger.id) || 0
      }));
    },
    refetchInterval: 30000,
  });
}

export function useCreateBlogger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, promo_code }: { name: string; promo_code: string }) => {
      const { data, error } = await supabase
        .from('bloggers')
        .insert({ name, promo_code: promo_code.toUpperCase() })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bloggers'] });
    },
  });
}

export function useDeleteBlogger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bloggers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bloggers'] });
    },
  });
}
