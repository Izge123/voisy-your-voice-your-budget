import { useState } from "react";
import { useBloggers, useCreateBlogger, useDeleteBlogger } from "@/hooks/use-bloggers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Megaphone, Plus, Trash2, Copy, Check, Users } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const AdminBloggers = () => {
  const { data: bloggers, isLoading } = useBloggers();
  const createBlogger = useCreateBlogger();
  const deleteBlogger = useDeleteBlogger();

  const [newName, setNewName] = useState("");
  const [newPromoCode, setNewPromoCode] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newName.trim() || !newPromoCode.trim()) {
      setError("Заполните все поля");
      return;
    }

    // Check if promo code already exists
    const exists = bloggers?.some(
      b => b.promo_code.toUpperCase() === newPromoCode.toUpperCase()
    );
    if (exists) {
      setError("Промокод уже существует");
      return;
    }

    try {
      await createBlogger.mutateAsync({
        name: newName.trim(),
        promo_code: newPromoCode.trim()
      });
      setNewName("");
      setNewPromoCode("");
    } catch (err: any) {
      setError(err.message || "Ошибка создания");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBlogger.mutateAsync(deleteId);
    } catch (err) {
      console.error("Delete error:", err);
    }
    setDeleteId(null);
  };

  const copyLink = async (promoCode: string, bloggerId: string) => {
    const link = `https://kapitallo.com/auth?tab=register`;
    const text = `Ссылка: ${link}\nПромокод: ${promoCode}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(bloggerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalReferred = bloggers?.reduce((sum, b) => sum + (b.referred_count || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Блогеры</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 bg-slate-700" />
          <Skeleton className="h-64 bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Блогеры</h1>
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            <span>{bloggers?.length || 0} блогеров</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>{totalReferred} привлечено</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create Form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Добавить блогера
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Имя блогера</Label>
                <Input
                  placeholder="Иван Иванов"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  disabled={createBlogger.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Промокод</Label>
                <Input
                  placeholder="IVAN2024"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                  className="bg-slate-900 border-slate-600 text-white uppercase"
                  disabled={createBlogger.isPending}
                />
              </div>
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full"
                disabled={createBlogger.isPending}
              >
                {createBlogger.isPending ? "Создание..." : "Создать"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bloggers Table */}
        <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Список блогеров</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Имя</TableHead>
                    <TableHead className="text-slate-400">Промокод</TableHead>
                    <TableHead className="text-slate-400">Привлечено</TableHead>
                    <TableHead className="text-slate-400">Дата</TableHead>
                    <TableHead className="text-slate-400 text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bloggers?.map((blogger) => (
                    <TableRow key={blogger.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white font-medium">
                        {blogger.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-primary border-primary/50">
                          {blogger.promo_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                          {blogger.referred_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {format(new Date(blogger.created_at), "d MMM yyyy", { locale: ru })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyLink(blogger.promo_code, blogger.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedId === blogger.id ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(blogger.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bloggers?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                        Блогеры не добавлены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Удалить блогера?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Промокод будет удалён. Связь с пользователями, которые его использовали, будет сохранена для истории.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBloggers;
