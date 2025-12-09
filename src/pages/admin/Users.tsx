import { useState } from "react";
import { useAdminUsers } from "@/hooks/use-admin-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Search, Users as UsersIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trial: { label: "Trial", variant: "secondary" },
  active: { label: "PRO", variant: "default" },
  expired: { label: "Истёк", variant: "destructive" },
};

const AdminUsers = () => {
  const { data: users, isLoading } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      user.subscription?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Пользователи</h1>
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
        <h1 className="text-2xl font-bold text-white">Пользователи</h1>
        <div className="flex items-center gap-2 text-slate-400">
          <UsersIcon className="h-5 w-5" />
          <span>{users?.length || 0} всего</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Поиск по имени или email..."
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

      {/* Users Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Список пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">Пользователь</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Дата регистрации</TableHead>
                  <TableHead className="text-slate-400">Статус</TableHead>
                  <TableHead className="text-slate-400">Окончание</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white font-medium">
                          {user.full_name || "Без имени"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{user.email || "—"}</TableCell>
                    <TableCell className="text-slate-300">
                      {user.created_at 
                        ? format(new Date(user.created_at), "d MMM yyyy", { locale: ru })
                        : "—"
                      }
                    </TableCell>
                    <TableCell>
                      {user.subscription ? (
                        <Badge variant={statusLabels[user.subscription.status]?.variant || "outline"}>
                          {statusLabels[user.subscription.status]?.label || user.subscription.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Нет подписки</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.subscription?.status === "trial" && user.subscription.trial_ends_at
                        ? format(new Date(user.subscription.trial_ends_at), "d MMM yyyy", { locale: ru })
                        : user.subscription?.status === "active" && user.subscription.subscription_ends_at
                          ? format(new Date(user.subscription.subscription_ends_at), "d MMM yyyy", { locale: ru })
                          : "—"
                      }
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                      Пользователи не найдены
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

export default AdminUsers;
