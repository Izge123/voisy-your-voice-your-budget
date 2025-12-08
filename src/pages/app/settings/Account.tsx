import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, AlertTriangle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import SettingsPageHeader from "@/components/SettingsPageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Account = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "УДАЛИТЬ") {
      toast.error("Введите УДАЛИТЬ для подтверждения");
      return;
    }

    setIsDeleting(true);
    try {
      // Delete user data from tables
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("transactions").delete().eq("user_id", user.id);
        await supabase.from("categories").delete().eq("user_id", user.id);
        await supabase.from("profiles").delete().eq("id", user.id);
      }
      
      // Sign out after deletion
      await signOut();
      toast.success("Аккаунт удалён");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Ошибка при удалении аккаунта");
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteContent = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Это действие необратимо. Все ваши данные будут удалены навсегда:
      </p>
      <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
        <li>Все транзакции</li>
        <li>Все категории</li>
        <li>Профиль и настройки</li>
      </ul>
      <p className="font-medium pt-2 text-sm">
        Введите <span className="text-destructive font-bold">УДАЛИТЬ</span> для подтверждения:
      </p>
      <Input
        value={deleteConfirmation}
        onChange={(e) => setDeleteConfirmation(e.target.value)}
        placeholder="УДАЛИТЬ"
      />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      <SettingsPageHeader title="Аккаунт" />

      {/* Install App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5" />
            Установка приложения
          </CardTitle>
          <CardDescription>
            Добавьте Kapitallo на главный экран
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate("/install")} className="w-full">
            Инструкция по установке
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LogOut className="h-5 w-5" />
            Выход из аккаунта
          </CardTitle>
          <CardDescription>
            Вы будете перенаправлены на главную страницу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            Выйти
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Опасная зона
          </CardTitle>
          <CardDescription>
            Действия в этом разделе необратимы
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setIsDeleteDrawerOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить аккаунт
              </Button>
              <Drawer open={isDeleteDrawerOpen} onOpenChange={(open) => {
                setIsDeleteDrawerOpen(open);
                if (!open) setDeleteConfirmation("");
              }}>
                <DrawerContent className="max-h-[85dvh]">
                  <DrawerHeader>
                    <DrawerTitle className="text-destructive">Удаление аккаунта</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-4 overflow-y-auto">
                    {deleteContent}
                  </div>
                  <DrawerFooter className="pt-2">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== "УДАЛИТЬ" || isDeleting}
                      className="w-full"
                    >
                      {isDeleting ? "Удаление..." : "Удалить навсегда"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDeleteDrawerOpen(false);
                        setDeleteConfirmation("");
                      }}
                      className="w-full"
                    >
                      Отмена
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить аккаунт
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удаление аккаунта</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div>{deleteContent}</div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                    Отмена
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== "УДАЛИТЬ" || isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? "Удаление..." : "Удалить навсегда"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;