import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SettingsPageHeader from "@/components/SettingsPageHeader";
const CurrencySettings = () => {
  const {
    user
  } = useAuth();
  const [currency, setCurrency] = useState("USD");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isEdited, setIsEdited] = useState(false);
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setIsDataLoading(true);
      const {
        data
      } = await supabase.from("profiles").select("currency, monthly_budget").eq("id", user.id).single();
      if (data) {
        if (data.currency) setCurrency(data.currency);
        if (data.monthly_budget) setMonthlyBudget(String(data.monthly_budget));
      }
      setIsDataLoading(false);
    };
    loadProfile();
  }, [user]);
  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    const {
      error
    } = await supabase.from("profiles").update({
      currency,
      monthly_budget: monthlyBudget ? Number(monthlyBudget) : null
    }).eq("id", user.id);
    setIsLoading(false);
    if (!error) {
      setIsEdited(false);
    }
  };
  return <div className="p-4 md:p-6 pb-24">
      <SettingsPageHeader title="Валюта и бюджет" />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Основная валюта</Label>
            {isDataLoading ? <Skeleton className="h-10 w-full" /> : <Select value={currency} onValueChange={value => {
            setCurrency(value);
            setIsEdited(true);
          }}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* International */}
                  <SelectItem value="USD">USD ($) — Доллар США</SelectItem>
                  <SelectItem value="EUR">EUR (€) — Евро</SelectItem>
                  {/* CIS */}
                  <SelectItem value="RUB">RUB (₽) — Российский рубль</SelectItem>
                  <SelectItem value="BYN">BYN (Br) — Белорусский рубль</SelectItem>
                  <SelectItem value="UAH">UAH (₴) — Украинская гривна</SelectItem>
                  <SelectItem value="KZT">KZT (₸) — Казахстанский тенге</SelectItem>
                  <SelectItem value="UZS">UZS (сўм) — Узбекский сум</SelectItem>
                  <SelectItem value="AZN">AZN (₼) — Азербайджанский манат</SelectItem>
                  <SelectItem value="AMD">AMD (֏) — Армянский драм</SelectItem>
                  <SelectItem value="MDL">MDL (L) — Молдавский лей</SelectItem>
                  <SelectItem value="KGS">KGS (с) — Кыргызский сом</SelectItem>
                  <SelectItem value="TJS">TJS (смн) — Таджикский сомони</SelectItem>
                  <SelectItem value="TMT">TMT (m) — Туркменский манат</SelectItem>
                  <SelectItem value="GEL">GEL (₾) — Грузинский лари</SelectItem>
                </SelectContent>
              </Select>}
            <p className="text-xs text-muted-foreground">
              В этой валюте будет отображаться общий баланс
            </p>
          </div>

          

          {isEdited && <Button onClick={handleSave} className="w-full" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>}
        </CardContent>
      </Card>
    </div>;
};
export default CurrencySettings;