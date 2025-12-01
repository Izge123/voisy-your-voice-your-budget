import { Bot, User } from "lucide-react";

const AIConsultant = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/20 text-white text-sm font-semibold font-inter mb-4">
            PRO Feature
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-white mb-4">
            Личный финансовый аналитик в кармане
          </h2>
          <p className="text-base md:text-lg text-slate-300 font-inter max-w-3xl mx-auto">
            Задавай вопросы, как живому человеку. Voisy анализирует твои привычки и дает советы.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-700/50 shadow-2xl">
            {/* Chat Messages */}
            <div className="space-y-6">
              {/* User Message */}
              <div className="flex justify-end animate-fade-in">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="bg-primary rounded-2xl rounded-tr-sm px-5 py-4">
                    <p className="text-sm md:text-base font-inter text-white">
                      Сколько я могу тратить в день до зарплаты?
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-slate-700/80 rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold font-inter text-secondary">Voisy AI</span>
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                    </div>
                    <p className="text-sm md:text-base font-inter text-slate-100 leading-relaxed">
                      У тебя осталось <span className="font-bold text-white">$500</span> до 25-го числа. 
                      Рекомендуемый лимит — <span className="font-bold text-secondary">$40 в день</span>.{" "}
                      <span className="text-destructive font-medium">Вчера ты превысил его на 40%.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Typing Indicator */}
              <div className="flex justify-start animate-fade-in" style={{ animationDelay: "600ms" }}>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-slate-700/80 rounded-2xl rounded-tl-sm px-5 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <p className="text-2xl mb-2">🧠</p>
              <p className="text-sm font-inter text-slate-300">Умный анализ</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-2">💡</p>
              <p className="text-sm font-inter text-slate-300">Персональные советы</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-2">📊</p>
              <p className="text-sm font-inter text-slate-300">Прогнозы трат</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIConsultant;
