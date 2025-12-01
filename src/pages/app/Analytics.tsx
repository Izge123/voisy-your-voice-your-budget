import { useState } from "react";
import { TrendingDown, TrendingUp, DollarSign, ShoppingCart, Coffee, Car, Home as HomeIcon, Utensils, Plane, Gift, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const Analytics = () => {
  const [period, setPeriod] = useState("month");

  // Summary data
  const summaryStats = [
    { label: "Всего трат", value: "$2,450", icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-500/10" },
    { label: "Средний чек", value: "$45", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Сэкономлено", value: "$320", icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10" },
  ];

  // Pie chart data (Expenses by category)
  const expensesByCategory = [
    { name: "Продукты", value: 850, color: "#ef4444", icon: ShoppingCart },
    { name: "Транспорт", value: 420, color: "#3b82f6", icon: Car },
    { name: "Еда", value: 380, color: "#f59e0b", icon: Utensils },
    { name: "Кафе", value: 320, color: "#f97316", icon: Coffee },
    { name: "Жильё", value: 280, color: "#8b5cf6", icon: HomeIcon },
    { name: "Другое", value: 200, color: "#6b7280", icon: Gift },
  ];

  const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.value, 0);

  // Bar chart data (Daily expenses)
  const dailyExpenses = [
    { day: "Пн", amount: 120 },
    { day: "Вт", amount: 250 },
    { day: "Ср", amount: 180 },
    { day: "Чт", amount: 350 },
    { day: "Пт", amount: 420 },
    { day: "Сб", amount: 280 },
    { day: "Вс", amount: 150 },
  ];

  // Top categories with progress
  const topCategories = expensesByCategory
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(cat => ({
      ...cat,
      percentage: Math.round((cat.value / totalExpenses) * 100)
    }));

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
                const Icon = category.icon;
                const percentage = Math.round((category.value / totalExpenses) * 100);
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
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
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="space-y-2 animate-fade-in"
                  style={{ animationDelay: `${250 + index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: category.color }} />
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
                        ${category.value}
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
    </div>
  );
};

export default Analytics;
