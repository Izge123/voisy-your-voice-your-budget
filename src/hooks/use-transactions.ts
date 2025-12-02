import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category_id: string | null;
  currency: string | null;
  date: string | null;
  description: string | null;
  created_at: string | null;
}

export interface TransactionWithCategory extends Transaction {
  category?: {
    id: string;
    name: string;
    type: string;
    icon: string | null;
    color: string | null;
    parent_id: string | null;
  };
}

export const useTransactions = (limit?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions', user?.id, limit],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:categories (
            id,
            name,
            type,
            icon,
            color,
            parent_id
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TransactionWithCategory[];
    },
    enabled: !!user,
  });

  const addTransaction = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: newTransaction.amount,
          category_id: newTransaction.category_id,
          currency: newTransaction.currency,
          date: newTransaction.date,
          description: newTransaction.description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Транзакция добавлена');
    },
    onError: (error) => {
      toast.error('Ошибка при добавлении транзакции');
      console.error('Add transaction error:', error);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Transaction> }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Транзакция обновлена');
    },
    onError: (error) => {
      toast.error('Ошибка при обновлении транзакции');
      console.error('Update transaction error:', error);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Транзакция удалена');
    },
    onError: (error) => {
      toast.error('Ошибка при удалении транзакции');
      console.error('Delete transaction error:', error);
    },
  });

  return {
    transactions,
    isLoading,
    error,
    addTransaction: addTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
    isAddingTransaction: addTransaction.isPending,
    isUpdatingTransaction: updateTransaction.isPending,
    isDeletingTransaction: deleteTransaction.isPending,
  };
};

export const useBalance = () => {
  const { user } = useAuth();

  const { data: balance = 0, isLoading, error } = useQuery({
    queryKey: ['balance', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Fetch all transactions with their categories
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          category:categories!inner (
            type
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate balance: income - expenses
      const total = transactions.reduce((acc, transaction) => {
        const amount = transaction.amount;
        const type = (transaction.category as any)?.type;
        
        if (type === 'income') {
          return acc + amount;
        } else if (type === 'expense') {
          return acc - amount;
        }
        return acc;
      }, 0);

      return total;
    },
    enabled: !!user,
  });

  return {
    balance,
    isLoading,
    error,
  };
};
