import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Zap, Sprout } from "lucide-react";

const UseCases = () => {
  const useCases = [
    {
      id: "forgetful",
      label: "Забывчивым",
      icon: Brain,
      emoji: "🧠",
      title: "Голосовой ввод — просто скажи",
      description: "Забыл записать? Просто проговори расход голосом — AI сам всё разберёт.",
      features: [
        "Голосовой ввод в один тап",
        "AI автоматически распознаёт категорию",
        "Сплит-транзакции: «2000 — такси 500, кофе 200»"
      ],
      gradient: "from-purple-500/10 to-violet-500/10"
    },
    {
      id: "busy",
      label: "Занятым",
      icon: Zap,
      emoji: "⚡",
      title: "Учёт за 5 секунд",
      description: "Нет времени открывать Excel? Тап → говоришь → готово.",
      features: [
        "Никаких форм и ручного ввода",
        "Автокатегоризация расходов",
        "Мгновенная аналитика по периодам"
      ],
      gradient: "from-amber-500/10 to-orange-500/10"
    },
    {
      id: "beginners",
      label: "Начинающим",
      icon: Sprout,
      emoji: "🌱",
      title: "Финансовый помощник с AI",
      description: "Не знаешь с чего начать? AI-консультант подскажет и проанализирует траты.",
      features: [
        "AI-чат с персональными советами",
        "Понятная аналитика без графиков Excel",
        "Гибкие категории под твой стиль жизни"
      ],
      gradient: "from-green-500/10 to-emerald-500/10"
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-center text-foreground mb-4">
          Идеально подходит для...
        </h2>
        <p className="text-center text-muted-foreground font-inter mb-12 md:mb-16 max-w-2xl mx-auto">
          Какой бы ни была твоя финансовая ситуация — Kapitallo адаптируется под тебя
        </p>

        {/* Tabs */}
        <Tabs defaultValue="forgetful" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-muted">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <TabsTrigger 
                  key={useCase.id} 
                  value={useCase.id}
                  className="flex flex-col sm:flex-row items-center gap-2 py-3 data-[state=active]:bg-background"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-inter">{useCase.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <TabsContent key={useCase.id} value={useCase.id} className="mt-0">
                <div className={`bg-gradient-to-br ${useCase.gradient} rounded-3xl p-8 md:p-12 border border-border`}>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Content */}
                    <div>
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background/80 backdrop-blur-sm mb-6">
                        <span className="text-4xl">{useCase.emoji}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold font-manrope text-foreground mb-4">
                        {useCase.title}
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground font-inter mb-6">
                        {useCase.description}
                      </p>
                      <ul className="space-y-3">
                        {useCase.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/20 shrink-0 mt-0.5">
                              <span className="text-secondary text-xs">✓</span>
                            </div>
                            <span className="text-sm font-inter text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Visual */}
                    <div className="hidden md:flex items-center justify-center">
                      <div className="relative">
                        <div className="w-64 h-64 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center">
                          <Icon className="h-32 w-32 text-primary opacity-20" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-8xl">{useCase.emoji}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
};

export default UseCases;
