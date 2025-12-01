import { X, Check, ArrowRight, Activity } from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    "Забывал внести траты к вечеру",
    "Лень выбирать категории вручную",
    "В приложении банка каша из переводов",
    "Excel-таблицы — это долго и скучно"
  ];

  const solutions = [
    "Сказал на ходу — записано за 3 секунды",
    "AI сам понял, что это 'Продукты', а не 'Машина'",
    "Учитывает наличку, карты и крипту в одном месте",
    "Красивая аналитика вместо цифр"
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-center text-foreground mb-4">
          Почему вы бросали вести бюджет раньше?
        </h2>
        <p className="text-center text-muted-foreground font-inter text-lg mb-12 md:mb-16">
          Сравните старый подход и новую магию
        </p>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 max-w-7xl mx-auto items-center">
          
          {/* LEFT CARD - "Раньше / Другие приложения" */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                <X className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-manrope text-foreground">Рутина и Хаос</h3>
                <p className="text-sm font-inter text-muted-foreground">Другие приложения</p>
              </div>
            </div>

            {/* Visual - Excel Table Mock */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-6 border border-slate-300 dark:border-slate-600 opacity-60">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground border-b border-slate-200 dark:border-slate-700 pb-1">
                  <span>Дата</span>
                  <span>Категория</span>
                  <span>Сумма</span>
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between text-[9px] font-mono text-muted-foreground/70">
                    <span>01.12.2025</span>
                    <span>???</span>
                    <span>₽ {(Math.random() * 1000).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Problems List */}
            <ul className="space-y-3">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-sm font-inter text-muted-foreground">{problem}</span>
                </li>
              ))}
            </ul>

            {/* Emotion Badge */}
            <div className="mt-6 inline-block px-4 py-2 bg-destructive/5 rounded-full border border-destructive/20">
              <p className="text-xs font-inter font-semibold text-destructive">😫 Сложно, долго</p>
            </div>
          </div>

          {/* CENTER ELEMENT - Arrow */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-xl animate-pulse">
                <ArrowRight className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/30 to-emerald-500/30 blur-xl rounded-full scale-150"></div>
            </div>
          </div>

          {/* Arrow for mobile - between cards */}
          <div className="lg:hidden flex justify-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg rotate-90">
                <ArrowRight className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* RIGHT CARD - "Voisy" */}
          <div className="bg-card rounded-3xl p-8 md:p-10 shadow-[0_20px_70px_-15px_rgba(79,70,229,0.3)] border-2 border-transparent bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/20 relative overflow-hidden">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-emerald-500/20 to-indigo-600/20 -z-10"></div>
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10">
                <Check className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-manrope text-foreground">Магия AI</h3>
                <p className="text-sm font-inter text-primary font-semibold">Voisy</p>
              </div>
            </div>

            {/* Visual - Voice Wave / Pie Chart */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 rounded-xl p-6 mb-6 border border-primary/20 relative overflow-hidden">
              <div className="flex items-center justify-center gap-2">
                <Activity className="h-12 w-12 text-primary animate-pulse" strokeWidth={3} />
                <div className="flex gap-1 items-end h-12">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-indigo-500 to-emerald-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 48 + 16}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-center text-xs font-inter font-semibold text-primary mt-3">AI распознает речь за секунды</p>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 blur-2xl opacity-50 -z-10"></div>
            </div>

            {/* Solutions List */}
            <ul className="space-y-3">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-sm font-inter text-foreground font-semibold">{solution}</span>
                </li>
              ))}
            </ul>

            {/* Emotion Badge */}
            <div className="mt-6 inline-block px-4 py-2 bg-secondary/10 rounded-full border border-secondary/30">
              <p className="text-xs font-inter font-semibold text-secondary">✨ Легко, быстро, красиво</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
