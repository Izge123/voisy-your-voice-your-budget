import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category_id: string | null;
  currency: string | null;
  date: string | null;
  description: string | null;
  created_at: string | null;
  type: 'income' | 'expense' | 'savings' | null;
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
          type: newTransaction.type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
    onError: (error) => {
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
    },
    onError: (error) => {
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
    },
    onError: (error) => {
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['balance', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get current month date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch transactions for current month with their categories and types
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          date,
          type,
          category:categories (
            type
          )
        `)
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (error) throw error;

      // Calculate income, expenses and savings for current month
      let income = 0;
      let expenses = 0;
      let savingsAmount = 0;

      transactions.forEach((transaction) => {
        const amount = transaction.amount;
        // Use transaction type if available, fallback to category type
        const type = transaction.type || (transaction.category as any)?.type;
        
        if (type === 'income') {
          income += amount;
        } else if (type === 'expense') {
          expenses += amount;
        } else if (type === 'savings') {
          savingsAmount += amount;
        }
      });

      const balance = income - expenses;
      const remainder = income - expenses; // Остаток = доходы - расходы

      return {
        balance,
        income,
        expenses,
        savingsAmount, // Реальные сбережения из транзакций типа 'savings'
        remainder,     // Остаток = доходы - расходы
      };
    },
    enabled: !!user,
  });

  return {
    balance: data?.balance || 0,
    income: data?.income || 0,
    expenses: data?.expenses || 0,
    savingsAmount: data?.savingsAmount || 0,
    remainder: data?.remainder || 0,
    isLoading,
    error,
  };
};
