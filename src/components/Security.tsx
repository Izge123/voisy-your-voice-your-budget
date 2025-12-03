import { Shield, Lock, Cloud } from "lucide-react";

const Security = () => {
  const features = [
    {
      icon: Shield,
      title: "Анонимность",
      description: "Мы не требуем привязки банковских карт",
      details: "Никаких паспортных данных, номеров карт и банковских выписок. Только email для входа.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Lock,
      title: "Шифрование",
      description: "Все данные передаются по SSL/TLS",
      details: "Транзакции зашифрованы на уровне AES-256. Даже мы не видим суммы без твоего согласия.",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: Cloud,
      title: "Синхронизация",
      description: "Телефон потерялся — данные остались",
      details: "Безопасное облачное хранилище с резервными копиями каждые 24 часа. Восстановление в один клик.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold font-inter mb-4">
            <Shield className="h-4 w-4" />
            <span>Безопасность превыше всего</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-foreground mb-4">
            Ваши деньги — ваша тайна
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-inter max-w-3xl mx-auto">
            Мы серьезно относимся к приватности. Никаких продаж данных рекламодателям.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-card rounded-3xl p-6 md:p-8 shadow-lg border border-border hover:shadow-xl md:hover:scale-105 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bgColor} mb-6`}>
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-bold font-manrope text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-base font-semibold font-inter text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <p className="text-sm font-inter text-muted-foreground leading-relaxed">
                  {feature.details}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12 md:mt-16">
          <div className="flex items-center gap-2 text-sm font-inter text-muted-foreground">
            <Lock className="h-4 w-4 text-secondary" />
            <span>SSL/TLS сертификат</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-inter text-muted-foreground">
            <Shield className="h-4 w-4 text-secondary" />
            <span>GDPR compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-inter text-muted-foreground">
            <Cloud className="h-4 w-4 text-secondary" />
            <span>Ежедневный бэкап</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
