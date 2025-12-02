import { useState, useMemo } from "react";
import { TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTransactions } from "@/hooks/use-transactions";
import { startOfWeek, startOfMonth, startOfYear, format, eachDayOfInterval, subDays } from "date-fns";
import { ru } from "date-fns/locale";

const Analytics = () => {
  const [period, setPeriod] = useState("month");
  const { transactions, isLoading } = useTransactions();

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { locale: ru });
        break;
      case 'year':
        startDate = startOfYear(now);
        break;
      case 'month':
      default:
        startDate = startOfMonth(now);
    }

    return transactions.filter(t => {
      if (!t.date) return false;
      return new Date(t.date) >= startDate;
    });
  }, [transactions, period]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const expenses = filteredTransactions
      .filter(t => t.category?.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseCount = filteredTransactions.filter(t => t.category?.type === 'expense').length;
    const avgExpense = expenseCount > 0 ? expenses / expenseCount : 0;

    const income = filteredTransactions
      .filter(t => t.category?.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const saved = income - expenses;

    return [
      { label: "Всего трат", value: `$${expenses.toFixed(0)}`, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-500/10" },
      { label: "Средний чек", value: `$${avgExpense.toFixed(0)}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
      { label: "Сэкономлено", value: `$${saved.toFixed(0)}`, icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10" },
    ];
  }, [filteredTransactions]);

  // Expenses by category
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, { name: string; value: number; color: string; icon: string }>();

    filteredTransactions
      .filter(t => t.category?.type === 'expense')
      .forEach(t => {
        if (!t.category) return;
        
        const existing = categoryMap.get(t.category.id);
        if (existing) {
          existing.value += t.amount;
        } else {
          categoryMap.set(t.category.id, {
            name: t.category.name,
            value: t.amount,
            color: t.category.color || '#6b7280',
            icon: t.category.icon || '💰',
          });
        }
      });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.value, 0);

  // Daily expenses for bar chart
  const dailyExpenses = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return days.map(day => {
      const dayExpenses = filteredTransactions
        .filter(t => {
          if (!t.date || t.category?.type !== 'expense') return false;
          const transactionDate = format(new Date(t.date), 'yyyy-MM-dd');
          const targetDate = format(day, 'yyyy-MM-dd');
          return transactionDate === targetDate;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        day: format(day, 'EEE', { locale: ru }),
        amount: dayExpenses,
      };
    });
  }, [filteredTransactions]);

  // Top categories with progress
  const topCategories = useMemo(() => {
    return expensesByCategory
      .slice(0, 5)
      .map(cat => ({
        ...cat,
        percentage: totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0,
      }));
  }, [expensesByCategory, totalExpenses]);

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

        {/* Period Tabs */}
        <Tabs value={period} onValueChange={setPeriod} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="week">Неделя</TabsTrigger>
            <TabsTrigger value="month">Месяц</TabsTrigger>
            <TabsTrigger value="year">Год</TabsTrigger>
          </TabsList>
        </Tabs>
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

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {expensesByCategory.map((category, index) => {
                const percentage = totalExpenses > 0 ? Math.round((category.value / totalExpenses) * 100) : 0;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-xl shrink-0">{category.icon}</span>
                      <span className="text-sm font-inter text-foreground truncate">{category.name}</span>
                    </div>
                    <span className="text-sm font-bold font-manrope text-muted-foreground">{percentage}%</span>
                  </div>
                );
              })}
            </div>
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
                <BarChart data={dailyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
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
                            <p className="text-sm font-semibold text-foreground">{payload[0].payload.day}</p>
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

        {/* TOP SPENDING */}
        <Card className="animate-fade-in" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold font-manrope">Топ категорий</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.map((category, index) => {
              return (
                <div
                  key={index}
                  className="space-y-2 animate-fade-in"
                  style={{ animationDelay: `${250 + index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl text-xl"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        {category.icon}
                      </div>
                      <span className="text-sm font-semibold font-inter text-foreground">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-manrope text-muted-foreground">
                        {category.percentage}%
                      </span>
                      <span className="text-base font-bold font-manrope text-foreground">
                        ${category.value.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={category.percentage}
                    className="h-2"
                    style={
                      {
                        '--progress-background': category.color,
                      } as React.CSSProperties
                    }
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;
