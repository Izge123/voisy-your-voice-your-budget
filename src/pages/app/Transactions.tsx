import { useState, useMemo } from "react";
import { Search, Plus, Filter, Calendar as CalendarIcon, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay, isSameDay, isYesterday, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/contexts/AuthContext";

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

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    addTransaction, 
    deleteTransaction,
    isAddingTransaction,
    isDeletingTransaction 
  } = useTransactions();

  // Filter categories by transaction type
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.type === transactionType);
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
      currency: 'USD',
      date: format(date, 'yyyy-MM-dd'),
      description: comment || null,
    });

    setIsAddOpen(false);
    setAmount("");
    setSelectedCategory("");
    setComment("");
    setTransactionType("expense");
  };

  const handleDelete = (id: string) => {
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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-muted-foreground">₽</span>
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
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Нет категорий для {transactionType === 'expense' ? 'расходов' : 'доходов'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {filteredCategories.map((cat) => {
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                    selectedCategory === cat.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-xs font-medium text-center">{cat.name}</span>
                </button>
              );
            })}
          </div>
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

      {/* Comment */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Комментарий (опционально)</Label>
        <Textarea
          placeholder="Например: Продукты на неделю"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none"
          rows={3}
        />
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
                            {transaction.category?.name || 'Без категории'} • {transaction.date ? format(new Date(transaction.date), 'HH:mm', { locale: ru }) : ''}
                          </p>
                        </div>

                        {/* Amount & Time */}
                        <div className="text-right shrink-0">
                          <p className={cn(
                            "text-base font-bold font-manrope",
                            isExpense ? "text-rose-600" : "text-secondary"
                          )}>
                            {isExpense ? '-' : '+'}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.date ? format(new Date(transaction.date), 'HH:mm', { locale: ru }) : ''}
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
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
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
    </div>
  );
};

export default Transactions;
