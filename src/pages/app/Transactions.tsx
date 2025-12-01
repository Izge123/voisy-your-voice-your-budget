import { useState } from "react";
import { Search, Plus, Filter, Calendar as CalendarIcon, ShoppingCart, Coffee, Car, Home as HomeIcon, Utensils, Plane, Gift, Heart, TrendingUp, Trash2, ChevronDown } from "lucide-react";
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
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Transactions = () => {
  const isMobile = useIsMobile();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [comment, setComment] = useState("");

  // Categories
  const categories = [
    { id: "groceries", icon: ShoppingCart, label: "Продукты", color: "bg-rose-500/10 text-rose-600" },
    { id: "cafe", icon: Coffee, label: "Кафе", color: "bg-amber-500/10 text-amber-600" },
    { id: "transport", icon: Car, label: "Транспорт", color: "bg-blue-500/10 text-blue-600" },
    { id: "home", icon: HomeIcon, label: "Жильё", color: "bg-purple-500/10 text-purple-600" },
    { id: "food", icon: Utensils, label: "Еда", color: "bg-orange-500/10 text-orange-600" },
    { id: "travel", icon: Plane, label: "Путешествия", color: "bg-sky-500/10 text-sky-600" },
    { id: "gifts", icon: Gift, label: "Подарки", color: "bg-pink-500/10 text-pink-600" },
    { id: "health", icon: Heart, label: "Здоровье", color: "bg-red-500/10 text-red-600" },
  ];

  // Mock transactions grouped by date
  const transactionGroups = [
    {
      date: "Сегодня",
      transactions: [
        { id: 1, category: "groceries", title: "Пятёрочка", note: "Продукты на неделю", amount: -1250, time: "14:30", type: "expense" },
        { id: 2, category: "cafe", title: "Starbucks", note: "Латте", amount: -450, time: "10:15", type: "expense" },
        { id: 3, category: "transport", title: "Яндекс Такси", note: "До офиса", amount: -680, time: "08:45", type: "expense" },
      ]
    },
    {
      date: "Вчера",
      transactions: [
        { id: 4, category: "home", title: "Аренда", note: "Октябрь 2024", amount: -25000, time: "12:00", type: "expense" },
        { id: 5, category: "food", title: "Dodopizza", note: "Ужин", amount: -890, time: "19:20", type: "expense" },
        { id: 6, category: "cafe", title: "Coffee Bean", note: "Капучино", amount: -320, time: "09:30", type: "expense" },
      ]
    },
    {
      date: "30 Ноября",
      transactions: [
        { id: 7, category: "transport", title: "Метро", note: "5 поездок", amount: -250, time: "18:00", type: "expense" },
        { id: 8, category: "groceries", title: "Магнит", note: "Фрукты", amount: -580, time: "16:30", type: "expense" },
        { id: 9, category: "gifts", title: "Ozon", note: "Подарок маме", amount: -3200, time: "14:00", type: "expense" },
      ]
    },
    {
      date: "29 Ноября",
      transactions: [
        { id: 10, category: "health", title: "Аптека", note: "Витамины", amount: -1200, time: "11:00", type: "expense" },
        { id: 11, category: "food", title: "KFC", note: "Обед", amount: -650, time: "13:45", type: "expense" },
      ]
    }
  ];

  const getCategoryData = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const handleSave = () => {
    // Here would be API call to save transaction
    console.log({ type: transactionType, amount, category: selectedCategory, date, comment });
    setIsAddOpen(false);
    // Reset form
    setAmount("");
    setSelectedCategory("");
    setComment("");
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
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-center">{cat.label}</span>
              </button>
            );
          })}
        </div>
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
        disabled={!amount || !selectedCategory}
      >
        Сохранить
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
          {transactionGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              {/* Date Header - Sticky */}
              <div className="sticky top-0 z-10 bg-background py-2">
                <h2 className="text-sm font-bold font-inter text-muted-foreground uppercase tracking-wide">
                  {group.date}
                </h2>
              </div>

              {/* Transactions */}
              <div className="space-y-2">
                {group.transactions.map((transaction, index) => {
                  const categoryData = getCategoryData(transaction.category);
                  const Icon = categoryData.icon;

                  return (
                    <div
                      key={transaction.id}
                      className="group relative flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-md transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 ${categoryData.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold font-inter text-foreground truncate">
                          {transaction.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{transaction.note}</p>
                      </div>

                      {/* Amount & Time */}
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "text-base font-bold font-manrope",
                          transaction.type === "expense" ? "text-rose-600" : "text-secondary"
                        )}>
                          {transaction.amount < 0 ? '-' : '+'}₽{Math.abs(transaction.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">{transaction.time}</p>
                      </div>

                      {/* Delete Button (on hover) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
