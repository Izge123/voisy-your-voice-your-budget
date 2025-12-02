import { useState, useEffect } from "react";
import { Sparkles, Target, Clock, Tag, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import SettingsPageHeader from "@/components/SettingsPageHeader";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";

const LIFE_TAGS = [
  { id: "working", label: "Работаю", icon: "💼" },
  { id: "student", label: "Студент", icon: "📚" },
  { id: "family", label: "Семья", icon: "👨‍👩‍👧" },
  { id: "kids", label: "Дети", icon: "👶" },
  { id: "renting", label: "Аренда", icon: "🏠" },
  { id: "mortgage", label: "Ипотека", icon: "🏦" },
  { id: "car", label: "Авто", icon: "🚗" },
  { id: "saving", label: "Коплю", icon: "💰" },
  { id: "investing", label: "Инвестирую", icon: "📈" },
  { id: "freelance", label: "Фриланс", icon: "💻" },
];

const PLANNING_HORIZONS = [
  { value: "1month", label: "1 мес" },
  { value: "6months", label: "6 мес" },
  { value: "1year", label: "1 год" },
  { value: "3years", label: "3+ года" },
];

const LITERACY_LEVELS = [
  { value: "beginner", label: "Новичок", description: "Только начинаю" },
  { value: "intermediate", label: "Средний", description: "Понимаю базу" },
  { value: "advanced", label: "Продвинутый", description: "Разбираюсь хорошо" },
];

const AIProfile = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [bio, setBio] = useState("");
  const [financialGoal, setFinancialGoal] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [planningHorizon, setPlanningHorizon] = useState("6months");
  const [literacyLevel, setLiteracyLevel] = useState("beginner");
  const [lifeTags, setLifeTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setFinancialGoal(profile.financial_goal || "");
      setTargetAmount(profile.target_amount?.toString() || "");
      setPlanningHorizon(profile.planning_horizon || "6months");
      setLiteracyLevel(profile.financial_literacy_level || "beginner");
      setLifeTags(profile.life_tags || []);
    }
  }, [profile]);

  const toggleLifeTag = (tagId: string) => {
    setLifeTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        bio,
        financial_goal: financialGoal,
        target_amount: targetAmount ? parseFloat(targetAmount) : null,
        planning_horizon: planningHorizon,
        financial_literacy_level: literacyLevel,
        life_tags: lifeTags,
      });
      toast.success("AI профиль сохранён");
    } catch (error) {
      console.error("Error saving AI profile:", error);
      toast.error("Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <SettingsPageHeader title="AI Профиль" />
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="h-20 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      <SettingsPageHeader title="AI Профиль" />

      <p className="text-muted-foreground text-sm">
        Расскажите о себе, чтобы AI-консультант давал более персональные советы
      </p>

      {/* Bio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            О себе
          </CardTitle>
          <CardDescription>
            Опишите свою финансовую ситуацию
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Например: Работаю в IT, живу в Москве, снимаю квартиру. Хочу накопить на первый взнос по ипотеке..."
            className="min-h-[100px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Financial Goal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Финансовая цель
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Опишите цель</Label>
            <Input
              value={financialGoal}
              onChange={(e) => setFinancialGoal(e.target.value)}
              placeholder="Накопить на первый взнос по ипотеке"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Сумма цели (₽)</Label>
            <Input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="1000000"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Planning Horizon */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            Горизонт планирования
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={planningHorizon}
            onValueChange={(v) => v && setPlanningHorizon(v)}
            className="justify-start flex-wrap"
          >
            {PLANNING_HORIZONS.map((h) => (
              <ToggleGroupItem
                key={h.value}
                value={h.value}
                className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {h.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>

      {/* Financial Literacy Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4 text-primary" />
            Уровень финансовой грамотности
          </CardTitle>
          <CardDescription>
            AI адаптирует стиль общения под ваш уровень
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={literacyLevel}
            onValueChange={(v) => v && setLiteracyLevel(v)}
            className="justify-start flex-wrap"
          >
            {LITERACY_LEVELS.map((level) => (
              <ToggleGroupItem
                key={level.value}
                value={level.value}
                className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {level.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>

      {/* Life Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-primary" />
            Жизненная ситуация
          </CardTitle>
          <CardDescription>
            Выберите всё, что подходит
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LIFE_TAGS.map((tag) => (
              <Button
                key={tag.id}
                variant={lifeTags.includes(tag.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLifeTag(tag.id)}
                className="rounded-full"
              >
                <span className="mr-1">{tag.icon}</span>
                {tag.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
        size="lg"
      >
        {isSaving ? "Сохранение..." : "Сохранить"}
      </Button>
    </div>
  );
};

export default AIProfile;
