import { Link } from "react-router-dom";
import { Settings, Mic, TrendingUp, TrendingDown, Plus, BarChart3, Target, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useBalance } from "@/hooks/use-transactions";
import { useTransactions } from "@/hooks/use-transactions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { balance, isLoading: balanceLoading } = useBalance();
  const { transactions, isLoading: transactionsLoading } = useTransactions(4);

  const userName = user?.user_metadata?.full_name || "Пользователь";
  const userInitial = userName.charAt(0).toUpperCase();

  // Calculate income and expenses from transactions
  const income = transactions
    .filter(t => t.category?.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.category?.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* HEADER */}
      <header className="flex items-center justify-between p-4 md:p-6 mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 md:h-12 md:w-12">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">{userInitial}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg md:text-xl font-bold font-manrope text-foreground">
              Привет, {userName.split(' ')[0]}! 👋
            </h1>
            <p className="text-xs text-muted-foreground font-inter">Сегодня отличный день</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/settings">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={signOut}
            title="Выйти"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <div className="px-4 md:px-6 space-y-6">
        {/* BALANCE CARD */}
        <div className="relative bg-gradient-to-br from-primary via-indigo-600 to-indigo-700 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden animate-fade-in">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
          
          <div className="relative z-10">
            <p className="text-sm text-white/70 font-inter mb-2">Общий баланс</p>
            <h2 className="text-4xl md:text-5xl font-extrabold font-manrope text-white mb-6">
              {balanceLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              )}
            </h2>

            {/* Stats */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/20">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-white/70 font-inter">Доходы</p>
                  <p className="text-sm font-bold font-manrope text-secondary">+${income}</p>
                </div>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/20">
                  <TrendingDown className="h-4 w-4 text-rose-300" />
                </div>
                <div>
                  <p className="text-xs text-white/70 font-inter">Расходы</p>
                  <p className="text-sm font-bold font-manrope text-rose-300">-${expenses}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VOICE ACTION */}
        <div className="flex flex-col items-center justify-center py-8 md:py-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <button className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
            
            {/* Button */}
            <div className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary to-indigo-600 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
              <Mic className="h-10 w-10 md:h-12 md:w-12 text-white" strokeWidth={2.5} />
            </div>
          </button>

          <p className="mt-6 text-center text-sm md:text-base text-muted-foreground font-inter max-w-xs">
            Нажми и скажи: <span className="font-semibold text-foreground">"Такси 500 рублей"</span>
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Button variant="outline" className="rounded-full gap-2 whitespace-nowrap font-inter">
            <Plus className="h-4 w-4" />
            Добавить вручную
          </Button>
          <Link to="/app/analytics">
            <Button variant="outline" className="rounded-full gap-2 whitespace-nowrap font-inter">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </Button>
          </Link>
          <Button variant="outline" className="rounded-full gap-2 whitespace-nowrap font-inter">
            <Target className="h-4 w-4" />
            Цели
          </Button>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold font-manrope text-foreground">Сегодня</h3>
            <Link to="/app/transactions">
              <Button variant="ghost" size="sm" className="text-primary font-inter">
                Все
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-inter">Пока нет транзакций</p>
                <p className="text-sm text-muted-foreground font-inter mt-2">Добавьте первую транзакцию голосом или вручную</p>
              </div>
            ) : (
              transactions.map((transaction, index) => {
                const isExpense = transaction.category?.type === 'expense';
                const amount = transaction.amount;
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-md transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div 
                      className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl"
                      style={{ 
                        backgroundColor: `${transaction.category?.color || '#6b7280'}15`,
                      }}
                    >
                      {transaction.category?.icon || '💰'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold font-inter text-foreground truncate">
                        {transaction.description || transaction.category?.name || 'Транзакция'}
                      </p>
                      <p className="text-xs text-muted-foreground font-inter">
                        {transaction.category?.name || 'Без категории'} • {transaction.date ? format(new Date(transaction.date), 'HH:mm', { locale: ru }) : ''}
                      </p>
                    </div>

                    {/* Amount */}
                    <p className={`text-base font-bold font-manrope ${
                      isExpense ? 'text-rose-600' : 'text-secondary'
                    }`}>
                      {isExpense ? '-' : '+'}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
