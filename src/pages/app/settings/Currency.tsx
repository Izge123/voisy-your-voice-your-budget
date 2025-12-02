import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SettingsPageHeader from "@/components/SettingsPageHeader";

const CurrencySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currency, setCurrency] = useState("USD");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user.id)
        .single();

      if (data?.currency) {
        setCurrency(data.currency);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ currency })
      .eq("id", user.id);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Сохранено",
        description: "Настройки валюты обновлены",
      });
      setIsEdited(false);
    }
  };

  return (
    <div className="p-4 md:p-6 pb-24">
      <SettingsPageHeader title="Валюта и бюджет" />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Основная валюта</Label>
            <Select
              value={currency}
              onValueChange={(value) => {
                setCurrency(value);
                setIsEdited(true);
              }}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="RUB">RUB (₽)</SelectItem>
                <SelectItem value="KZT">KZT (₸)</SelectItem>
                <SelectItem value="UZS">UZS (сўм)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              В этой валюте будет отображаться общий баланс
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Бюджет на месяц</Label>
            <Input
              id="budget"
              type="number"
              value={monthlyBudget}
              onChange={(e) => {
                setMonthlyBudget(e.target.value);
                setIsEdited(true);
              }}
              placeholder="Введите сумму"
            />
            <p className="text-xs text-muted-foreground">Ваша финансовая цель на месяц</p>
          </div>

          {isEdited && (
            <Button onClick={handleSave} className="w-full" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencySettings;
