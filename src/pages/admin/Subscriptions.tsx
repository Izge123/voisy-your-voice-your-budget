import { useState } from "react";
import { useAdminSubscriptions } from "@/hooks/use-admin-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trial: { label: "Trial", variant: "secondary" },
  active: { label: "PRO", variant: "default" },
  expired: { label: "Истёк", variant: "destructive" },
};

const planLabels: Record<string, string> = {
  free: "Free",
  pro: "PRO",
};

const AdminSubscriptions = () => {
  const { data: subscriptions, isLoading } = useAdminSubscriptions();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredSubscriptions = subscriptions?.filter(sub => {
    const matchesSearch = 
      sub.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      sub.user?.full_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Подписки</h1>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-slate-700" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Подписки</h1>
        <div className="flex items-center gap-2 text-slate-400">
          <CreditCard className="h-5 w-5" />
          <span>{subscriptions?.length || 0} всего</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Поиск по пользователю..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">Все статусы</SelectItem>
            <SelectItem value="trial" className="text-white">Trial</SelectItem>
            <SelectItem value="active" className="text-white">PRO</SelectItem>
            <SelectItem value="expired" className="text-white">Истёк</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Список подписок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">Пользователь</TableHead>
                  <TableHead className="text-slate-400">План</TableHead>
                  <TableHead className="text-slate-400">Статус</TableHead>
                  <TableHead className="text-slate-400">Начало триала</TableHead>
                  <TableHead className="text-slate-400">Окончание</TableHead>
                  <TableHead className="text-slate-400">Провайдер</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions?.map((sub) => (
                  <TableRow key={sub.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {sub.user?.full_name || "Без имени"}
                        </span>
                        <span className="text-sm text-slate-400">
                          {sub.user?.email || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {planLabels[sub.plan] || sub.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[sub.status]?.variant || "outline"}>
                        {statusLabels[sub.status]?.label || sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {sub.trial_started_at 
                        ? format(new Date(sub.trial_started_at), "d MMM yyyy", { locale: ru })
                        : "—"
                      }
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {sub.status === "trial" && sub.trial_ends_at
                        ? format(new Date(sub.trial_ends_at), "d MMM yyyy", { locale: ru })
                        : sub.status === "active" && sub.subscription_ends_at
                          ? format(new Date(sub.subscription_ends_at), "d MMM yyyy", { locale: ru })
                          : "—"
                      }
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {sub.payment_provider || "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSubscriptions?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      Подписки не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
