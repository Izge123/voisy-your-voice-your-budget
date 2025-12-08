import { useState, useMemo } from "react";
import { Plus, CalendarIcon, Trash2, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
  
  // Month filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

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

  // Group transactions by date with month and type filter
  const transactionGroups = useMemo(() => {
    // First filter by selected month/year
    const monthFiltered = transactions.filter(t => {
      if (!t.date) return false;
      const tDate = new Date(t.date);
      return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
    });
    
    // Then filter by type
    const filtered = selectedFilter === 'all' 
      ? monthFiltered 
      : monthFiltered.filter(t => {
          if (selectedFilter === 'expenses') return t.type === 'expense';
          if (selectedFilter === 'income') return t.type === 'income';
          if (selectedFilter === 'savings') return t.type === 'savings';
          return true;
        });

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
  }, [transactions, selectedFilter, selectedMonth, selectedYear]);

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
        {/* First Line: Title + Calendar */}
        <div className="flex items-center justify-between p-4 md:p-6 pb-3">
          <h1 className="text-2xl font-bold font-manrope text-foreground">История</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-full gap-1.5 whitespace-nowrap text-sm px-3 h-9">
                <CalendarIcon className="h-4 w-4" />
                <span className="capitalize">{format(new Date(selectedYear, selectedMonth), 'LLL yyyy', { locale: ru })}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="flex items-center justify-between gap-4 mb-3">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold capitalize text-sm">
                  {format(new Date(selectedYear, selectedMonth), 'LLLL yyyy', { locale: ru })}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, i) => (
                  <Button
                    key={i}
                    variant={selectedMonth === i && selectedYear === new Date().getFullYear() ? "default" : "outline"}
                    size="sm"
                    className="text-xs capitalize"
                    onClick={() => setSelectedMonth(i)}
                  >
                    {format(new Date(2024, i), 'LLL', { locale: ru })}
                  </Button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t">
                <Button variant="ghost" size="sm" onClick={() => setSelectedYear(prev => prev - 1)}>
                  {selectedYear - 1}
                </Button>
                <span className="font-bold text-sm">{selectedYear}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedYear(prev => prev + 1)}>
                  {selectedYear + 1}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Second Line: Filter Tabs */}
        <div className="px-4 pb-4">
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-10 bg-muted/50 p-1 gap-1">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:bg-transparent data-[state=inactive]:shadow-none data-[state=active]:shadow-none font-semibold text-xs"
              >
                Все
              </TabsTrigger>
              <TabsTrigger 
                value="expenses"
                className="data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-600 data-[state=inactive]:bg-transparent data-[state=inactive]:shadow-none data-[state=active]:shadow-none font-semibold text-xs"
              >
                Расходы
              </TabsTrigger>
              <TabsTrigger 
                value="income"
                className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600 data-[state=inactive]:bg-transparent data-[state=inactive]:shadow-none data-[state=active]:shadow-none font-semibold text-xs"
              >
                Доходы
              </TabsTrigger>
              <TabsTrigger 
                value="savings"
                className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600 data-[state=inactive]:bg-transparent data-[state=inactive]:shadow-none data-[state=active]:shadow-none font-semibold text-xs"
              >
                Сбережения
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
                    const type = transaction.type;
                    const isExpense = type === 'expense';
                    const isSavings = type === 'savings';
                    const amount = transaction.amount;

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-2 p-2.5 bg-card rounded-xl border border-border transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {/* Icon */}
                        <div 
                          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-lg"
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
                            {transaction.created_at ? format(new Date(transaction.created_at), 'HH:mm', { locale: ru }) : ''}
                          </p>
                        </div>

                        {/* Amount */}
                        <p className={cn(
                          "text-sm font-bold font-manrope shrink-0",
                          isExpense ? "text-rose-600" : isSavings ? "text-blue-600" : "text-secondary"
                        )}>
                          {isExpense ? '-' : isSavings ? '' : '+'}{formatCurrency(amount, currency)}
                        </p>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-7 w-7"
                          onClick={() => handleDelete(transaction.id)}
                          disabled={isDeletingTransaction}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
