import { useAdminStats } from "@/hooks/use-admin-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Clock, 
  Crown, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  UserPlus
} from "lucide-react";

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle,
  color = "text-primary"
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  subtitle?: string;
  color?: string;
}) => (
  <Card className="bg-slate-800 border-slate-700">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Дашборд</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Всего пользователей" 
          value={stats?.totalUsers || 0}
          icon={Users}
          color="text-blue-400"
        />
        <StatCard 
          title="На триале" 
          value={stats?.trialUsers || 0}
          icon={Clock}
          subtitle="Активные триалы"
          color="text-yellow-400"
        />
        <StatCard 
          title="PRO подписчики" 
          value={stats?.proUsers || 0}
          icon={Crown}
          subtitle="Оплаченные подписки"
          color="text-emerald-400"
        />
        <StatCard 
          title="Истёкшие" 
          value={stats?.expiredUsers || 0}
          icon={XCircle}
          color="text-red-400"
        />
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="MRR" 
          value={`$${stats?.mrr.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          subtitle="Monthly Recurring Revenue"
          color="text-emerald-400"
        />
        <StatCard 
          title="ARR" 
          value={`$${stats?.arr.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          subtitle="Annual Recurring Revenue"
          color="text-emerald-400"
        />
        <StatCard 
          title="Конверсия" 
          value={`${stats?.conversionRate.toFixed(1) || '0'}%`}
          icon={TrendingUp}
          subtitle="Trial → PRO"
          color="text-blue-400"
        />
        <StatCard 
          title="Churn Rate" 
          value={`${stats?.churnRate.toFixed(1) || '0'}%`}
          icon={TrendingDown}
          subtitle="Отток пользователей"
          color="text-red-400"
        />
      </div>

      {/* New Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Новых сегодня" 
          value={stats?.newUsersToday || 0}
          icon={UserPlus}
          color="text-blue-400"
        />
        <StatCard 
          title="Новых за неделю" 
          value={stats?.newUsersThisWeek || 0}
          icon={UserPlus}
          color="text-blue-400"
        />
        <StatCard 
          title="Новых за месяц" 
          value={stats?.newUsersThisMonth || 0}
          icon={UserPlus}
          color="text-blue-400"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
