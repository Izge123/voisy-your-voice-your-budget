import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Start",
      price: 0,
      period: "мес",
      description: "Попробуй бесплатно",
      features: [
        "15 голосовых вводов/мес",
        "Ручной ввод безлимитно",
        "Базовая аналитика",
        "Стандартные категории"
      ],
      cta: "Начать сейчас",
      variant: "outline" as const,
      popular: false
    },
    {
      name: "Voisy PRO",
      price: isYearly ? 3.99 : 4.99,
      period: "мес",
      originalPrice: isYearly ? 4.99 : null,
      description: "Полный контроль",
      features: [
        "Безлимитный голос",
        "Умный сплит чеков",
        "Свои категории",
        "AI-ассистент",
        "Экспорт в CSV",
        "Приоритетная поддержка"
      ],
      cta: "Попробовать PRO",
      variant: "default" as const,
      popular: true
    }
  ];

  return (
    <section id="pricing" className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-center text-foreground mb-4">
          Простые и честные цены
        </h2>
        <p className="text-center text-muted-foreground font-inter mb-8 max-w-2xl mx-auto">
          Начни бесплатно. Апгрейдь, когда будешь готов.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium font-inter ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Месяц
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isYearly ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                isYearly ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium font-inter ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Год
            </span>
            <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-semibold">
              -20%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-3xl p-8 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                plan.popular
                  ? "border-primary bg-gradient-to-br from-primary/5 to-secondary/5"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold font-inter shadow-lg">
                    Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold font-manrope text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground font-inter mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-2">
                  {plan.originalPrice && (
                    <span className="text-2xl font-bold text-muted-foreground line-through">
                      ${plan.originalPrice}
                    </span>
                  )}
                  <span className="text-5xl font-extrabold font-manrope text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-lg text-muted-foreground font-inter">
                    /{plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary/20 shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-secondary" />
                    </div>
                    <span className="text-sm font-inter text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.variant}
                className={`w-full rounded-full py-6 text-base font-semibold font-inter ${
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-90"
                    : ""
                }`}
                onClick={() => window.location.href = '/auth?tab=register'}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-inter">
            Принимаем карты РФ, Мир, Crypto
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
