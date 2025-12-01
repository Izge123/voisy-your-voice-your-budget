import { Mic, Brain, CheckCircle, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Mic,
      emoji: "🎤",
      title: "Нажми и скажи",
      description: "Тапни по кнопке и продиктуй расходы как угодно",
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Brain,
      emoji: "🧠",
      title: "AI Поймёт",
      description: "Распознает категории, валюту и дату",
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      icon: CheckCircle,
      emoji: "✅",
      title: "Готово",
      description: "Транзакция сохранена, аналитика обновлена",
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-center text-foreground mb-4">
          Магия в три шага
        </h2>
        <p className="text-center text-muted-foreground font-inter mb-12 md:mb-16 max-w-2xl mx-auto">
          Никаких сложных форм. Просто скажи — и деньги под контролем
        </p>

        {/* Steps Grid with Arrows */}
        <div className="relative grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Arrow Between Steps - Desktop Only */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 xl:-right-6 -translate-y-1/2 z-10">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 animate-pulse">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                )}

                <div 
                  className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in relative"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-bold font-manrope text-primary">
                      Шаг {index + 1}
                    </span>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${step.bgColor}`}>
                      <span className="text-2xl">{step.emoji}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${step.bgColor} mb-4`}>
                    <Icon className={`h-7 w-7 ${step.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold font-manrope text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base font-inter text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
