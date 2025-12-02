import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";
import { Bell, Check, Trash2, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsPageHeader from "@/components/SettingsPageHeader";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useUnreadCount } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const getNotificationIcon = (type: string, icon: string | null) => {
  if (icon) return icon;
  switch (type) {
    case "budget": return "💰";
    case "ai": return "🤖";
    case "reminder": return "⏰";
    case "system": return "🔔";
    default: return "📢";
  }
};

const formatNotificationDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Сегодня";
  if (isYesterday(date)) return "Вчера";
  return format(date, "d MMMM", { locale: ru });
};

const groupNotificationsByDate = (notifications: any[]) => {
  const groups: Record<string, any[]> = {};
  
  notifications.forEach((notification) => {
    const dateKey = formatNotificationDate(notification.created_at);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
  });
  
  return groups;
};

const NotificationsSettings = () => {
  const { notifications, isLoading } = useNotifications();
  const { unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <SettingsPageHeader title="Уведомления" />

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <Button
          variant="outline"
          className="w-full mb-4 gap-2"
          onClick={() => markAllAsRead.mutate()}
          disabled={markAllAsRead.isPending}
        >
          {markAllAsRead.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          Отметить все как прочитанные ({unreadCount})
        </Button>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Нет уведомлений</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Здесь будут появляться уведомления о бюджете, рекомендации AI и системные сообщения
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{dateLabel}</h3>
              <div className="space-y-2">
                {items.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-2xl border transition-colors",
                      notification.is_read
                        ? "bg-background border-border"
                        : "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="text-2xl shrink-0">
                      {getNotificationIcon(notification.type, notification.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "text-sm",
                          notification.is_read ? "font-medium" : "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {format(new Date(notification.created_at), "HH:mm")}
                        </span>
                      </div>
                      {notification.message && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => markAsRead.mutate(notification.id)}
                            disabled={markAsRead.isPending}
                          >
                            <Check className="h-3 w-3" />
                            Прочитано
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                          onClick={() => deleteNotification.mutate(notification.id)}
                          disabled={deleteNotification.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsSettings;
