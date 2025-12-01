import { ArrowDown, Mic } from "lucide-react";

const KillerFeature = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="order-2 md:order-1">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold font-inter mb-4">
              PRO Feature
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-foreground mb-6">
              Один чек — много категорий
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-inter leading-relaxed mb-6">
              Бывало такое: сходил в супермаркет, чек на 10 000, а там и еда, и бытовая химия, и алкоголь? 
              Обычные приложения запишут всё в "Еду". <span className="font-semibold text-foreground">Voisy умнее.</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium font-inter">
                ✓ Точная аналитика
              </div>
              <div className="px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium font-inter">
                ✓ Нет ручного труда
              </div>
            </div>
          </div>

          {/* Visual Example */}
          <div className="order-1 md:order-2">
            <div className="relative">
              {/* Voice Bubble */}
              <div className="bg-primary/10 rounded-2xl p-6 mb-6 border border-primary/20 animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold font-inter text-primary">Вы сказали:</span>
                </div>
                <p className="text-base font-inter text-foreground font-medium pl-13">
                  "Потратил 2000: 1500 на такси и 500 на кофе"
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20 animate-pulse">
                  <ArrowDown className="h-6 w-6 text-secondary" />
                </div>
              </div>

              {/* Result Cards */}
              <div className="space-y-4">
                <div className="bg-card rounded-2xl p-4 shadow-lg border border-border hover:shadow-xl transition-shadow animate-fade-in" style={{ animationDelay: "200ms" }}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10">
                      <span className="text-2xl">🚖</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold font-inter text-foreground">Такси</p>
                      <p className="text-xs text-muted-foreground font-inter">Транспорт</p>
                    </div>
                    <div className="text-lg font-bold font-manrope text-destructive">
                      $1,500
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-4 shadow-lg border border-border hover:shadow-xl transition-shadow animate-fade-in" style={{ animationDelay: "400ms" }}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10">
                      <span className="text-2xl">☕</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold font-inter text-foreground">Кофе</p>
                      <p className="text-xs text-muted-foreground font-inter">Кафе и рестораны</p>
                    </div>
                    <div className="text-lg font-bold font-manrope text-destructive">
                      $500
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KillerFeature;
