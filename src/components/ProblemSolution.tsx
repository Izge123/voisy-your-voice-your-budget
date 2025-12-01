import { X, Check } from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    "Забывал внести траты к вечеру",
    "Лень выбирать категории вручную",
    "В приложении банка каша из переводов"
  ];

  const solutions = [
    "Сказал на ходу — записано за 3 секунды",
    "AI сам понял, что это 'Продукты', а не 'Машина'",
    "Учитывает наличку, карты и крипту в одном месте"
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-center text-foreground mb-12 md:mb-16">
          Почему вы бросали вести бюджет раньше?
        </h2>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Problems Column */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
                <X className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-xl font-bold font-manrope text-foreground">Раньше</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-base font-inter text-muted-foreground">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="bg-gradient-to-br from-primary/5 to-background rounded-2xl p-6 md:p-8 shadow-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10">
                <Check className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="text-xl font-bold font-manrope text-foreground">С Voisy</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-base font-inter text-foreground font-medium">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
