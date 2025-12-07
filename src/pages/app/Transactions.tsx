import { useState, useMemo } from "react";
import { Search, Plus, Filter, Calendar as CalendarIcon, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay, isSameDay, isYesterday, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { cn, formatCurrency, getCurrencySymbol } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";

const Transactions = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [comment, setComment] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    addTransaction, 
    deleteTransaction,
    isAddingTransaction,
    isDeletingTransaction 
  } = useTransactions();
  const { profile } = useProfile();
  const { subscription, canPerformAction } = useSubscription();
  const currency = profile?.currency || 'USD';

  // Filter categories by transaction type and build tree
  const filteredCategoriesTree = useMemo(() => {
    const filtered = categories.filter(cat => cat.type === transactionType);
    const parentCategories = filtered.filter(cat => !cat.parent_id || cat.parent_id === cat.id);
    
    return parentCategories.map(parent => ({
      ...parent,
      children: filtered.filter(cat => cat.parent_id === parent.id && cat.id !== parent.id)
    }));
  }, [categories, transactionType]);

  // Group transactions by date
  const transactionGroups = useMemo(() => {
    const filtered = selectedFilter === 'all' 
      ? transactions 
      : transactions.filter(t => 
          selectedFilter === 'expenses' 
            ? t.category?.type === 'expense' 
            : t.category?.type === 'income'
        );

    const grouped = filtered.reduce((acc, transaction) => {
      if (!transaction.date) return acc;
      
      const transactionDate = startOfDay(new Date(transaction.date));
      const dateKey = transactionDate.toISOString();
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: transactionDate,
          transactions: []
        };
      }
      
      acc[dateKey].transactions.push(transaction);
      return acc;
    }, {} as Record<string, { date: Date; transactions: typeof transactions }>);

    return Object.values(grouped)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(group => ({
        dateLabel: isToday(group.date) 
          ? 'Сегодня' 
          : isYesterday(group.date) 
            ? 'Вчера' 
            : format(group.date, 'd MMMM', { locale: ru }),
        transactions: group.transactions.sort((a, b) => 
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        )
      }));
  }, [transactions, selectedFilter]);

  const handleSave = () => {
    if (!user || !amount || !selectedCategory) return;

    addTransaction({
      amount: parseFloat(amount),
      category_id: selectedCategory,
      currency: currency,
      date: format(date, 'yyyy-MM-dd'),
      description: comment || null,
      type: transactionType as 'income' | 'expense',
    });

    setIsAddOpen(false);
    setAmount("");
    setSelectedCategory("");
    setComment("");
    setTransactionType("expense");
  };

  const handleDelete = (id: string) => {
    if (!canPerformAction) {
      setShowPaywall(true);
      return;
    }
    
    if (confirm('Удалить транзакцию?')) {
      deleteTransaction(id);
    }
  };

  const AddTransactionForm = () => (
    <div className="space-y-6">
      <Tabs value={transactionType} onValueChange={setTransactionType} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expense">Расход</TabsTrigger>
          <TabsTrigger value="income">Доход</TabsTrigger>
          <TabsTrigger value="transfer">Перевод</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Сумма</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-muted-foreground">{getCurrencySymbol(currency)}</span>
          <Input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-4xl font-bold h-20 pl-14 text-center border-2"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">Категория</Label>
        {categoriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredCategoriesTree.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Нет категорий для {transactionType === 'expense' ? 'расходов' : 'доходов'}</p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {filteredCategoriesTree.map((parent) => (
              <AccordionItem key={parent.id} value={parent.id} className="border-b">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${parent.color}15` }}
                    >
                      {parent.icon}
                    </div>
                    <span className="text-sm font-semibold">{parent.name}</span>
                    {parent.children && parent.children.length > 0 && (
                      <span className="text-xs text-muted-foreground">({parent.children.length})</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-4 border-l-2 border-border ml-5">
                    {parent.children && parent.children.length > 0 ? (
                      parent.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedCategory(child.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all w-full text-left",
                            selectedCategory === child.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="text-muted-foreground shrink-0">↳</span>
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${child.color}15` }}
                          >
                            {child.icon}
                          </div>
                          <span className="text-sm font-medium">{child.name}</span>
                        </button>
                      ))
                    ) : (
                      <button
                        onClick={() => setSelectedCategory(parent.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 transition-all w-full text-left",
                          selectedCategory === parent.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="text-sm font-medium">Использовать "{parent.name}"</span>
                      </button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Дата</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full h-12 text-base font-semibold rounded-2xl"
        disabled={!amount || !selectedCategory || isAddingTransaction}
      >
        {isAddingTransaction ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Сохранение...
          </>
        ) : (
          'Сохранить'
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4 md:p-6">
          <h1 className="text-2xl font-bold font-manrope text-foreground">История</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* FILTER BAR */}
        <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-full gap-2 whitespace-nowrap">
                <CalendarIcon className="h-4 w-4" />
                Декабрь 2024
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Badge
            variant={selectedFilter === "all" ? "default" : "outline"}
            className="rounded-full px-4 py-2 cursor-pointer hover:bg-primary/90"
            onClick={() => setSelectedFilter("all")}
          >
            Все
          </Badge>
          <Badge
            variant={selectedFilter === "expenses" ? "default" : "outline"}
            className="rounded-full px-4 py-2 cursor-pointer hover:bg-primary/90"
            onClick={() => setSelectedFilter("expenses")}
          >
            Расходы
          </Badge>
          <Badge
            variant={selectedFilter === "income" ? "default" : "outline"}
            className="rounded-full px-4 py-2 cursor-pointer hover:bg-primary/90"
            onClick={() => setSelectedFilter("income")}
          >
            Доходы
          </Badge>

          <Button variant="outline" size="icon" className="rounded-full shrink-0 ml-auto">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* TRANSACTION LIST */}
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="px-4 md:px-6 py-4 space-y-6">
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transactionGroups.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground font-inter">Нет транзакций</p>
              <p className="text-sm text-muted-foreground font-inter mt-2">Добавьте первую транзакцию</p>
            </div>
          ) : (
            transactionGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                {/* Date Header - Sticky */}
                <div className="sticky top-0 z-10 bg-background py-2">
                  <h2 className="text-sm font-bold font-inter text-muted-foreground uppercase tracking-wide">
                    {group.dateLabel}
                  </h2>
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                  {group.transactions.map((transaction, index) => {
                    const isExpense = transaction.category?.type === 'expense';
                    const amount = transaction.amount;

                    return (
                      <div
                        key={transaction.id}
                        className="group relative flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-md transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {/* Icon */}
                        <div 
                          className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 text-2xl"
                          style={{ backgroundColor: `${transaction.category?.color || '#6b7280'}15` }}
                        >
                          {transaction.category?.icon || '💰'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold font-inter text-foreground truncate">
                            {transaction.description || transaction.category?.name || 'Транзакция'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {transaction.category?.name || 'Без категории'} • {transaction.created_at ? format(new Date(transaction.created_at), 'HH:mm', { locale: ru }) : ''}
                          </p>
                        </div>

                        {/* Amount & Time */}
                        <div className="text-right shrink-0">
                          <p className={cn(
                            "text-base font-bold font-manrope",
                            isExpense ? "text-rose-600" : "text-secondary"
                          )}>
                            {isExpense ? '-' : '+'}{formatCurrency(amount, currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.created_at ? format(new Date(transaction.created_at), 'HH:mm', { locale: ru }) : ''}
                          </p>
                        </div>

                        {/* Delete Button (on hover) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(transaction.id)}
                          disabled={isDeletingTransaction}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* FAB - Floating Action Button */}
      {isMobile ? (
        <Drawer open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DrawerTrigger asChild>
            <Button
              size="icon"
              className="fixed bottom-20 right-6 md:bottom-6 w-14 h-14 rounded-full shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] z-50 animate-fade-in"
              onClick={(e) => {
                if (!canPerformAction) {
                  e.preventDefault();
                  setShowPaywall(true);
                }
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85dvh]">
            <DrawerHeader className="shrink-0">
              <DrawerTitle className="text-2xl font-bold font-manrope">Добавить операцию</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto">
              <AddTransactionForm />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] z-50 animate-fade-in"
              onClick={(e) => {
                if (!canPerformAction) {
                  e.preventDefault();
                  setShowPaywall(true);
                }
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-manrope">Добавить операцию</DialogTitle>
            </DialogHeader>
            <AddTransactionForm />
          </DialogContent>
        </Dialog>
      )}
      
      <SubscriptionPaywall 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        daysRemaining={subscription?.daysRemaining}
      />
    </div>
  );
};

export default Transactions;
