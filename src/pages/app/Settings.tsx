import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Crown, Check, LogOut, Trash2 } from "lucide-react";

const Settings = () => {
  const [name, setName] = useState("Иван Петров");
  const [email] = useState("ivan@example.com");
  const [currency, setCurrency] = useState("USD");
  const [monthlyBudget, setMonthlyBudget] = useState("50000");
  const [isEdited, setIsEdited] = useState(false);
  const [currentPlan] = useState<"free" | "pro">("free");

  const handleNameChange = (value: string) => {
    setName(value);
    setIsEdited(true);
  };

  const handleSave = () => {
    // Здесь будет логика сохранения
    setIsEdited(false);
  };

  const proFeatures = [
    "Безлимитный голосовой ввод",
    "Умный сплит транзакций",
    "Кастомные категории",
    "AI финансовый консультант",
    "Экспорт данных в Excel"
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground font-manrope">Настройки</h1>
      </div>

      {/* Профиль */}
      <Card>
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
          <CardDescription>Управление вашей личной информацией</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Нажмите на иконку камеры,</p>
              <p className="text-sm text-muted-foreground">чтобы изменить фото профиля</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Введите ваше имя"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email нельзя изменить</p>
            </div>
          </div>

          {isEdited && (
            <Button onClick={handleSave} className="w-full">
              Сохранить изменения
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Финансы */}
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
          <CardDescription>Настройка валюты и бюджета</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Основная валюта</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="RUB">RUB (₽)</SelectItem>
                <SelectItem value="KZT">KZT (₸)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">В этой валюте будет отображаться общий баланс</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Бюджет на месяц</Label>
            <Input
              id="budget"
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              placeholder="Введите сумму"
            />
            <p className="text-xs text-muted-foreground">Ваша финансовая цель на месяц</p>
          </div>
        </CardContent>
      </Card>

      {/* Подписка */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>Подписка</CardTitle>
          </div>
          <CardDescription>
            Текущий план: <span className="font-semibold text-foreground">
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

      {/* Опасная зона */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Опасная зона</CardTitle>
          <CardDescription>Необратимые действия с вашим аккаунтом</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить все данные
          </Button>
          <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
