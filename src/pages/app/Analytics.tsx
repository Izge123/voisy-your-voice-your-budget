import { useState, useMemo } from "react";
import { TrendingDown, TrendingUp, DollarSign, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { startOfMonth, startOfYear, endOfMonth, endOfYear, format, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Analytics = () => {
  const [period, setPeriod] = useState<"month" | "year" | "custom">("month");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    return {
      from: startOfMonth(now),
      to: endOfMonth(now),
    };
  });
  const { transactions, isLoading } = useTransactions();
  const { categories } = useCategories();

  // Handle period change
  const handlePeriodChange = (newPeriod: "month" | "year") => {
    setPeriod(newPeriod);
    const now = new Date();
    
    if (newPeriod === "month") {
      setDateRange({
        from: startOfMonth(now),
        to: endOfMonth(now),
      });
    } else if (newPeriod === "year") {
      setDateRange({
        from: startOfYear(now),
        to: endOfYear(now),
      });
    }
  };

  // Handle custom date range selection
  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
      setPeriod("custom");
    }
  };

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date) return false;
      const transactionDate = new Date(t.date);
      return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    });
  }, [transactions, dateRange]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expenses;

    return [
      { label: "Доходы", value: `$${income.toFixed(0)}`, icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10" },
      { label: "Расходы", value: `$${expenses.toFixed(0)}`, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-500/10" },
      { label: "Экономия", value: `$${savings.toFixed(0)}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    ];
  }, [filteredTransactions]);

  // Hierarchical expenses by parent categories
  const hierarchicalExpenses = useMemo(() => {
    const categoryMap = new Map<string, string>(); // child -> parent mapping
    const parentMap = new Map<string, {
      id: string;
      name: string;
      icon: string;
      color: string;
      totalAmount: number;
      subcategories: Map<string, { id: string; name: string; icon: string; amount: number }>;
    }>();

    // Build category parent mapping
    categories.forEach(cat => {
      if (cat.parent_id && cat.parent_id !== cat.id) {
        categoryMap.set(cat.id, cat.parent_id);
      }
    });

    // Process transactions
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!t.category) return;

        // Determine parent category
        const parentId = t.category.parent_id && t.category.parent_id !== t.category.id 
          ? t.category.parent_id 
          : t.category.id;
        
        const parentCategory = categories.find(c => c.id === parentId);
        if (!parentCategory) return;

        // Initialize parent if not exists
        if (!parentMap.has(parentId)) {
          parentMap.set(parentId, {
            id: parentId,
            name: parentCategory.name,
            icon: parentCategory.icon || '💰',
            color: parentCategory.color || '#6b7280',
            totalAmount: 0,
            subcategories: new Map(),
          });
        }

        const parent = parentMap.get(parentId)!;
        parent.totalAmount += t.amount;

        // If this is a subcategory, track it separately
        if (t.category.parent_id && t.category.parent_id !== t.category.id) {
          if (!parent.subcategories.has(t.category.id)) {
            parent.subcategories.set(t.category.id, {
              id: t.category.id,
              name: t.category.name,
              icon: t.category.icon || '💰',
              amount: 0,
            });
          }
          const sub = parent.subcategories.get(t.category.id)!;
          sub.amount += t.amount;
        }
      });

    // Convert to array and sort
    return Array.from(parentMap.values())
      .map(parent => ({
        ...parent,
        subcategories: Array.from(parent.subcategories.values()).sort((a, b) => b.amount - a.amount),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredTransactions, categories]);

  // Expenses by category (for pie chart)
  const expensesByCategory = useMemo(() => {
    return hierarchicalExpenses.map(parent => ({
      name: parent.name,
      value: parent.totalAmount,
      color: parent.color,
      icon: parent.icon,
    }));
  }, [hierarchicalExpenses]);

  const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.value, 0);

  // Dynamic expenses for bar chart (days or months)
  const dynamicExpenses = useMemo(() => {
    const diffInDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    // If range is more than 60 days, group by months
    if (diffInDays > 60) {
      const months = eachMonthOfInterval({
        start: dateRange.from,
        end: dateRange.to,
      });

      return months.map(month => {
        const monthExpenses = filteredTransactions
          .filter(t => {
            if (!t.date || t.type !== 'expense') return false;
            const transactionDate = new Date(t.date);
            return format(transactionDate, 'yyyy-MM') === format(month, 'yyyy-MM');
          })
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          label: format(month, 'MMM', { locale: ru }),
          amount: monthExpenses,
        };
      });
    } else {
      // Group by days
      const days = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to,
      });

      return days.map(day => {
        const dayExpenses = filteredTransactions
          .filter(t => {
            if (!t.date || t.type !== 'expense') return false;
            const transactionDate = format(new Date(t.date), 'yyyy-MM-dd');
            const targetDate = format(day, 'yyyy-MM-dd');
            return transactionDate === targetDate;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          label: format(day, 'd', { locale: ru }),
          amount: dayExpenses,
        };
      });
    }
  }, [filteredTransactions, dateRange]);

  // Top parent categories with progress
  const topCategories = useMemo(() => {
    return hierarchicalExpenses
      .slice(0, 5)
      .map(parent => ({
        name: parent.name,
        icon: parent.icon,
        color: parent.color,
        value: parent.totalAmount,
        percentage: totalExpenses > 0 ? Math.round((parent.totalAmount / totalExpenses) * 100) : 0,
      }));
  }, [hierarchicalExpenses, totalExpenses]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-sm text-primary font-bold">${payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* HEADER */}
      <header className="p-4 md:p-6 space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold font-manrope text-foreground">Аналитика</h1>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Period Tabs */}
          <Tabs value={period === "custom" ? "" : period} className="w-full sm:w-auto">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="month" onClick={() => handlePeriodChange("month")}>
                Месяц
              </TabsTrigger>
              <TabsTrigger value="year" onClick={() => handlePeriodChange("year")}>
                Год
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-auto justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "d MMM", { locale: ru })} -{" "}
                      {format(dateRange.to, "d MMM yyyy", { locale: ru })}
                    </>
                  ) : (
                    format(dateRange.from, "d MMM yyyy", { locale: ru })
                  )
                ) : (
                  <span>Выбрать даты</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
                locale={ru}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {filteredTransactions.length === 0 ? (
        <div className="px-4 md:px-6">
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground font-inter">Нет данных за выбранный период</p>
            <p className="text-sm text-muted-foreground font-inter mt-2">Добавьте транзакции, чтобы увидеть аналитику</p>
          </div>
        </div>
      ) : (
        <div className="px-4 md:px-6 space-y-6">
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          {summaryStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-inter">{stat.label}</p>
                      <p className={`text-2xl font-bold font-manrope ${stat.color}`}>{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* EXPENSES STRUCTURE - PIE CHART */}
        <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold font-manrope">Структура расходов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={800}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Hierarchical Legend with Accordion */}
            <Accordion type="multiple" className="w-full mt-6">
              {hierarchicalExpenses.map((parent) => {
                const parentPercentage = totalExpenses > 0 ? Math.round((parent.totalAmount / totalExpenses) * 100) : 0;
                const hasSubcategories = parent.subcategories.length > 0;

                return (
                  <AccordionItem key={parent.id} value={parent.id} className="border-b border-border">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-xl shrink-0"
                            style={{ backgroundColor: `${parent.color}15` }}
                          >
                            {parent.icon}
                          </div>
                          <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                            <span className="text-sm font-semibold font-inter text-foreground truncate">
                              {parent.name}
                              {hasSubcategories && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({parent.subcategories.length})
                                </span>
                              )}
                            </span>
                            <Progress
                              value={parentPercentage}
                              className="h-1.5 w-full"
                              style={
                                {
                                  '--progress-background': parent.color,
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-bold font-manrope text-muted-foreground">
                            {parentPercentage}%
                          </span>
                          <span className="text-base font-bold font-manrope text-foreground">
                            ${parent.totalAmount.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    {hasSubcategories && (
                      <AccordionContent className="pb-4">
                        <div className="space-y-3 pl-4 border-l-2 border-border ml-5">
                          {parent.subcategories.map((sub) => {
                            const subPercentage = parent.totalAmount > 0 
                              ? Math.round((sub.amount / parent.totalAmount) * 100) 
                              : 0;
                            
                            return (
                              <div key={sub.id} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-muted-foreground shrink-0">↳</span>
                                  <span className="text-lg shrink-0">{sub.icon}</span>
                                  <span className="text-sm font-inter text-foreground truncate">
                                    {sub.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs font-bold font-manrope text-muted-foreground">
                                    {subPercentage}%
                                  </span>
                                  <span className="text-sm font-semibold font-manrope text-foreground">
                                    ${sub.amount.toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    )}
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* DYNAMICS - BAR CHART */}
        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold font-manrope">Динамика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-semibold text-foreground">{payload[0].payload.label}</p>
                            <p className="text-sm text-primary font-bold">${payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* TOP SPENDING WITH HIERARCHY */}
        <Card className="animate-fade-in" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold font-manrope">Топ категорий</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {hierarchicalExpenses.slice(0, 5).map((parent, index) => {
                const parentPercentage = totalExpenses > 0 ? Math.round((parent.totalAmount / totalExpenses) * 100) : 0;
                const hasSubcategories = parent.subcategories.length > 0;

                return (
                  <AccordionItem 
                    key={parent.id} 
                    value={parent.id} 
                    className="border-b border-border animate-fade-in"
                    style={{ animationDelay: `${250 + index * 50}ms` }}
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-xl shrink-0"
                            style={{ backgroundColor: `${parent.color}15` }}
                          >
                            {parent.icon}
                          </div>
                          <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                            <span className="text-sm font-semibold font-inter text-foreground truncate">
                              {parent.name}
                              {hasSubcategories && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({parent.subcategories.length})
                                </span>
                              )}
                            </span>
                            <Progress
                              value={parentPercentage}
                              className="h-1.5 w-full"
                              style={
                                {
                                  '--progress-background': parent.color,
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-bold font-manrope text-muted-foreground">
                            {parentPercentage}%
                          </span>
                          <span className="text-base font-bold font-manrope text-foreground">
                            ${parent.totalAmount.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    {hasSubcategories && (
                      <AccordionContent className="pb-4">
                        <div className="space-y-3 pl-4 border-l-2 border-border ml-5">
                          {parent.subcategories.map((sub) => {
                            const subPercentage = parent.totalAmount > 0 
                              ? Math.round((sub.amount / parent.totalAmount) * 100) 
                              : 0;
                            
                            return (
                              <div key={sub.id} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-muted-foreground shrink-0">↳</span>
                                  <span className="text-lg shrink-0">{sub.icon}</span>
                                  <span className="text-sm font-inter text-foreground truncate">
                                    {sub.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs font-bold font-manrope text-muted-foreground">
                                    {subPercentage}%
                                  </span>
                                  <span className="text-sm font-semibold font-manrope text-foreground">
                                    ${sub.amount.toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    )}
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;
