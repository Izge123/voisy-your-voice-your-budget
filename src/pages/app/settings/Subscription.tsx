import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, Clock, Loader2 } from "lucide-react";
import SettingsPageHeader from "@/components/SettingsPageHeader";
import { useSubscription } from "@/hooks/use-subscription";

const SubscriptionSettings = () => {
  const { subscription, loading } = useSubscription();

  const proFeatures = [
    "Безлимитный голосовой ввод",
    "Умный сплит транзакций",
    "Кастомные категории",
    "AI финансовый консультант",
    "Экспорт данных в Excel",
  ];

  const getStatusDisplay = () => {
    if (!subscription) return { label: "Загрузка...", color: "text-muted-foreground" };
    
    switch (subscription.status) {
      case 'trial':
        return { 
          label: `Пробный период (${subscription.daysRemaining} дн. осталось)`, 
          color: "text-amber-600" 
        };
      case 'active':
        return { label: "Kapitallo PRO", color: "text-secondary" };
      case 'expired':
        return { label: "Истёк", color: "text-destructive" };
      case 'cancelled':
        return { label: "Отменена", color: "text-muted-foreground" };
      default:
        return { label: "Free", color: "text-foreground" };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (loading) {
    return (
      <div className="p-4 md:p-6 pb-24">
        <SettingsPageHeader title="Тариф" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-24">
      <SettingsPageHeader title="Тариф" />

      {/* Current Status */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {subscription?.status === 'active' ? (
                <Crown className="h-5 w-5 text-primary" />
              ) : (
                <Clock className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Текущий статус</p>
              <p className={`font-semibold ${statusDisplay.color}`}>
                {statusDisplay.label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PRO Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>Kapitallo PRO</CardTitle>
          </div>
          <CardDescription>
            Полный доступ ко всем функциям
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.status !== 'active' ? (
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Преимущества PRO:</p>
                <ul className="space-y-2">
                  {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-5 w-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-secondary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
                <p className="text-2xl font-bold text-foreground">$4.99</p>
                <p className="text-sm text-muted-foreground">в месяц</p>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Crown className="h-4 w-4 mr-2" />
                Оформить подписку
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Оплата будет подключена в ближайшее время
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Crown className="h-4 w-4 text-secondary" />
                  Вы используете Kapitallo PRO
                </p>
                <p className="text-xs text-muted-foreground mt-1">Спасибо за поддержку!</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Ваши преимущества:</p>
                <ul className="space-y-2">
                  {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button variant="outline" className="w-full">
                Управление подпиской
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSettings;
