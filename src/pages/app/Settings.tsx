import { useNavigate } from "react-router-dom";
import { User, Crown, Wallet, Sparkles, Settings2, ChevronRight, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { useUnreadCount } from "@/hooks/use-notifications";
import { getCurrencySymbol } from "@/lib/utils";

interface SettingsMenuItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
  danger?: boolean;
}

const SettingsMenuItem = ({ icon, iconBg, title, subtitle, onClick, danger }: SettingsMenuItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
      danger ? "text-destructive" : ""
    }`}
  >
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{title}</p>
      {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
  </button>
);

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { unreadCount } = useUnreadCount();

  const currency = profile?.currency || "USD";
  const currencySymbol = getCurrencySymbol(currency);
  const currencySubtitle = profileLoading ? "Загрузка..." : `${currency} (${currencySymbol})`;
  const notificationsSubtitle = unreadCount > 0 ? `${unreadCount} непрочитанных` : "Всё прочитано";

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground font-manrope">Настройки</h1>
      </div>

      {/* Main Settings */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden divide-y divide-border">
        <SettingsMenuItem
          icon={<User className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          title="Профиль"
          subtitle={user?.email || "Имя и фото"}
          onClick={() => navigate("/app/settings/profile")}
        />
        <SettingsMenuItem
          icon={<Crown className="h-5 w-5 text-amber-500" />}
          iconBg="bg-amber-500/10"
          title="Тариф"
          subtitle="Free"
          onClick={() => navigate("/app/settings/subscription")}
        />
        <SettingsMenuItem
          icon={<Wallet className="h-5 w-5 text-secondary" />}
          iconBg="bg-secondary/10"
          title="Валюта и бюджет"
          subtitle={currencySubtitle}
          onClick={() => navigate("/app/settings/currency")}
        />
        <SettingsMenuItem
          icon={<Sparkles className="h-5 w-5 text-violet-500" />}
          iconBg="bg-violet-500/10"
          title="AI Профиль"
          subtitle="Персонализация AI"
          onClick={() => navigate("/app/settings/ai-profile")}
        />
        <SettingsMenuItem
          icon={<Bell className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-500/10"
          title="Уведомления"
          subtitle={notificationsSubtitle}
          onClick={() => navigate("/app/settings/notifications")}
        />
      </div>

      {/* Account */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <SettingsMenuItem
          icon={<Settings2 className="h-5 w-5 text-muted-foreground" />}
          iconBg="bg-muted"
          title="Аккаунт"
          subtitle="Выход и удаление"
          onClick={() => navigate("/app/settings/account")}
        />
      </div>
    </div>
  );
};

export default Settings;
