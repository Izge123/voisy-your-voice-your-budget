import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import SettingsPageHeader from "@/components/SettingsPageHeader";

const SubscriptionSettings = () => {
  const [currentPlan] = useState<"free" | "pro">("free");

  const proFeatures = [
    "Безлимитный голосовой ввод",
    "Умный сплит транзакций",
    "Кастомные категории",
    "AI финансовый консультант",
    "Экспорт данных в Excel",
  ];

  return (
    <div className="p-4 md:p-6 pb-24">
      <SettingsPageHeader title="Тариф" />

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>Подписка</CardTitle>
          </div>
          <CardDescription>
            Текущий план:{" "}
            <span className="font-semibold text-foreground">
              {currentPlan === "pro" ? "Voisy PRO" : "Free"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlan === "free" ? (
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Преимущества Voisy PRO:</p>
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
              <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Crown className="h-4 w-4 mr-2" />
                Улучшить до PRO - $4.99/мес
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Crown className="h-4 w-4 text-secondary" />
                  Вы используете Voisy PRO
                </p>
                <p className="text-xs text-muted-foreground mt-1">Спасибо за поддержку!</p>
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
