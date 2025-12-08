import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, Mic, TrendingUp, TrendingDown, BarChart3, Bell, Loader2, PiggyBank, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useBalance } from "@/hooks/use-transactions";
import { useTransactions } from "@/hooks/use-transactions";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn, formatCurrency } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import { useNotifications, useUnreadCount, useMarkAsRead } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, income, expenses, savings, isLoading: balanceLoading } = useBalance();
  const { transactions, isLoading: transactionsLoading } = useTransactions(10);
  const { profile, loading: profileLoading } = useProfile();
  const { notifications: recentNotifications } = useNotifications(5);
  const { unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const { subscription, canPerformAction } = useSubscription();
  const currency = profile?.currency || 'USD';

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Handler for voice button that checks subscription
  const handleVoiceClick = () => {
    if (!canPerformAction) {
      setShowPaywall(true);
      return;
    }
    setIsVoiceOpen(true);
  };

  // Обработка запроса голосового ввода через sessionStorage + event
  const lastProcessedClickId = useRef<string | null>(null);
  
  useEffect(() => {
    const openVoice = (clickId: string) => {
      if (clickId === lastProcessedClickId.current || isVoiceOpen) return;
      
      lastProcessedClickId.current = clickId;
      sessionStorage.removeItem('voiceStartRequest'); // Удаляем сразу!
      
      if (!canPerformAction) {
        setShowPaywall(true);
      } else {
        setIsVoiceOpen(true);
      }
    };
    
    // Проверяем при монтировании (навигация с другой страницы)
    const clickId = sessionStorage.getItem('voiceStartRequest');
    if (clickId) {
      openVoice(clickId);
    }
    
    // Слушаем событие (когда уже на dashboard)
    const handleEvent = (e: CustomEvent<string>) => {
      if (e.detail) {
        openVoice(e.detail);
      }
    };
    
    window.addEventListener('startVoiceRecording', handleEvent as EventListener);
    return () => window.removeEventListener('startVoiceRecording', handleEvent as EventListener);
  }, [canPerformAction, isVoiceOpen]);

  const userName = user?.user_metadata?.full_name || "Пользователь";
  const userInitial = userName.charAt(0).toUpperCase();

  // Get current month and year for display
  const currentMonthYear = format(new Date(), "LLLL yyyy", { locale: ru });

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* HEADER */}
      <header className="flex items-center justify-between p-4 md:p-6 mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 md:h-12 md:w-12">
            <AvatarImage src={profile?.avatar_url || ""} />
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b">
                <h4 className="font-semibold text-sm">Уведомления</h4>
              </div>
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Нет уведомлений</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {recentNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b last:border-b-0",
                        !notification.is_read && "bg-primary/5"
                      )}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead.mutate(notification.id);
                        }
                      }}
                    >
                      <span className="text-xl shrink-0">{notification.icon || "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", !notification.is_read && "font-semibold")}>
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ru })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => navigate("/app/settings/notifications")}
                >
                  Все уведомления
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Link to="/app/settings">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </header>

      <div className="px-4 md:px-6 space-y-6">
        {/* TRIAL BANNER */}
        {subscription?.status === 'trial' && subscription.daysRemaining <= 5 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-fade-in">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-600 font-medium">
                Триал заканчивается через {subscription.daysRemaining} дн.
              </p>
              <Link to="/app/settings/subscription" className="ml-auto">
                <Button size="sm" variant="outline" className="text-xs h-7 border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                  Подписаться
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* EXPIRED BANNER */}
        {subscription?.status === 'expired' && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 animate-fade-in">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive font-medium">
                Ваш пробный период закончился
              </p>
              <Link to="/app/settings/subscription" className="ml-auto">
                <Button size="sm" className="text-xs h-7 bg-primary hover:bg-primary/90">
                  Подписаться
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* BALANCE CARD */}
        <div className="relative bg-gradient-to-br from-primary via-indigo-600 to-indigo-700 rounded-3xl p-4 md:p-8 shadow-xl overflow-hidden animate-fade-in">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
          
          <div className="relative z-10">
            <p className="text-xs text-white/70 font-inter mb-1 capitalize">Баланс за {currentMonthYear}</p>
            <h2 className="text-3xl md:text-5xl font-extrabold font-manrope text-white mb-3 md:mb-6">
              {balanceLoading || profileLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                formatCurrency(balance, currency)
              )}
            </h2>

            {/* Stats - Compact for mobile */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              {/* Mobile: Income and Expenses in one row */}
              <div className="flex items-center gap-4 mb-3 md:hidden">
                <div className="flex items-start gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/20">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/60 font-inter">Доходы</p>
                    <p className="text-sm font-bold font-manrope text-secondary">
                      {profileLoading ? "..." : `+${formatCurrency(income, currency)}`}
                    </p>
                  </div>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/20">
                    <TrendingDown className="h-4 w-4 text-rose-300" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-inter">Расходы</p>
                    <p className="text-sm font-bold font-manrope text-rose-300">
                      {profileLoading ? "..." : `-${formatCurrency(expenses, currency)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile: Savings centered below */}
              <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/20 md:hidden">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400/20">
                  <PiggyBank className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs text-white/60 font-inter">Остаток</p>
                  <p className="text-sm font-bold font-manrope text-amber-300">
                    {profileLoading ? "..." : formatCurrency(savings, currency)}
                  </p>
                </div>
              </div>

              {/* Desktop: 3 columns grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-4">
                {/* Доходы */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/20">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-inter mb-1">Доходы</p>
                    <p className="text-lg font-bold font-manrope text-secondary">
                      {profileLoading ? "..." : `+${formatCurrency(income, currency)}`}
                    </p>
                  </div>
                </div>

                {/* Расходы */}
                <div className="flex flex-col items-center gap-2 text-center border-x border-white/20">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/20">
                    <TrendingDown className="h-5 w-5 text-rose-300" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-inter mb-1">Расходы</p>
                    <p className="text-lg font-bold font-manrope text-rose-300">
                      {profileLoading ? "..." : `-${formatCurrency(expenses, currency)}`}
                    </p>
                  </div>
                </div>

                {/* Экономия */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-400/20">
                    <PiggyBank className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-inter mb-1">Остаток</p>
                    <p className="text-lg font-bold font-manrope text-amber-300">
                      {profileLoading ? "..." : formatCurrency(savings, currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VOICE ACTION */}
        <div className="flex flex-col items-center justify-center py-6 md:py-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <button 
            className="relative group"
            onClick={handleVoiceClick}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
            
            {/* Button */}
            <div className="relative flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary to-indigo-600 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
              <Mic className="h-9 w-9 md:h-12 md:w-12 text-white" strokeWidth={2.5} />
            </div>
          </button>

          <p className="mt-4 text-center text-sm md:text-base text-muted-foreground font-inter max-w-xs">
            Нажми и скажи: <span className="font-semibold text-foreground">"Такси 500 рублей"</span>
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Link to="/app/analytics">
            <Button variant="outline" className="rounded-full gap-2 whitespace-nowrap font-inter">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </Button>
          </Link>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold font-manrope text-foreground">Недавние</h3>
            <Link to="/app/transactions">
              <Button variant="ghost" size="sm" className="text-primary font-inter">
                См. все
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {transactionsLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-14" />
                  </div>
                ))}
              </>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 px-4 bg-card rounded-2xl border border-border border-dashed">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <p className="text-base font-semibold text-foreground font-inter mb-2">Нет операций</p>
                <p className="text-sm text-muted-foreground font-inter">
                  Нажмите на микрофон выше, чтобы добавить первую транзакцию голосом!
                </p>
              </div>
            ) : (
              transactions.map((transaction, index) => {
                const type = transaction.type;
                const isExpense = type === 'expense';
                const isSavings = type === 'savings';
                const amount = transaction.amount;
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:shadow-md transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-xl text-xl"
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
                        {transaction.category?.name || 'Без категории'} • {transaction.created_at ? format(new Date(transaction.created_at), 'HH:mm', { locale: ru }) : ''}
                      </p>
                    </div>

                    {/* Amount */}
                    <p className={cn(
                      "text-sm font-bold font-manrope",
                      isExpense ? 'text-rose-600' : isSavings ? 'text-blue-600' : 'text-secondary'
                    )}>
                      {isExpense ? '-' : isSavings ? '' : '+'}{formatCurrency(amount, currency)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* VOICE RECORDER MODAL */}
      <VoiceRecorder open={isVoiceOpen} onOpenChange={setIsVoiceOpen} />

      {/* SUBSCRIPTION PAYWALL */}
      <SubscriptionPaywall 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        daysRemaining={subscription?.daysRemaining}
      />
    </div>
  );
};

export default Dashboard;
