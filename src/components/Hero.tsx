import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Mic } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full py-12 md:py-20 lg:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-manrope text-foreground leading-tight mb-6">
              Учёт финансов голосом.{" "}
              <span className="text-primary">Просто скажи</span> — AI запишет.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-inter mb-8">
              Забудь про Excel и ручной ввод. Voisy распознает твои траты, разделит чек на категории и покажет, куда уходят деньги.
            </p>

            {/* CTA Button */}
            <Button 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg font-semibold font-inter bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-90 shadow-lg hover:shadow-xl transition-all mb-6"
            >
              Попробовать бесплатно
            </Button>

            {/* Social Proof */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter mb-8 justify-center lg:justify-start">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>
              <span>Уже 1000+ пользователей навели порядок в финансах</span>
            </div>

            {/* Arrow pointing to phone - only on desktop */}
            <div className="hidden lg:flex items-center gap-2 text-primary font-inter font-medium">
              <span>Посмотри, как это работает</span>
              <ArrowRight className="h-5 w-5 animate-pulse" />
            </div>
          </div>

          {/* Right Column - iPhone Mockup */}
          <div className="relative w-full max-w-sm mx-auto lg:max-w-md">
            {/* Floating Icons */}
            <div className="absolute -left-8 top-20 w-16 h-16 rounded-2xl bg-background/40 backdrop-blur-md border border-border shadow-lg flex items-center justify-center animate-in fade-in zoom-in duration-700 delay-300">
              <span className="text-3xl">🍔</span>
            </div>
            <div className="absolute -right-8 top-40 w-16 h-16 rounded-2xl bg-background/40 backdrop-blur-md border border-border shadow-lg flex items-center justify-center animate-in fade-in zoom-in duration-700 delay-500">
              <span className="text-3xl">✈️</span>
            </div>
            <div className="absolute left-4 bottom-20 w-16 h-16 rounded-2xl bg-background/40 backdrop-blur-md border border-border shadow-lg flex items-center justify-center animate-in fade-in zoom-in duration-700 delay-700">
              <span className="text-3xl">🛒</span>
            </div>

            <div className="relative mx-auto">
              {/* Glow Effect Behind Phone */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/30 via-emerald-500/30 to-indigo-600/30 blur-3xl opacity-60"></div>

              {/* iPhone Frame */}
              <div className="relative bg-card rounded-[3rem] shadow-2xl border-8 border-foreground/10 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-foreground/10 rounded-b-3xl z-10"></div>
                
                {/* Screen - Chat Interface */}
                <div className="bg-gradient-to-b from-background to-muted/20 aspect-[9/19.5] p-6 pt-12 flex flex-col gap-4">
                  
                  {/* User Message (Right - Audio bubble) */}
                  <div className="flex justify-end animate-in slide-in-from-right duration-500">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Mic className="h-4 w-4" />
                        <div className="flex gap-1">
                          <div className="w-1 h-3 bg-primary-foreground/60 rounded-full animate-pulse"></div>
                          <div className="w-1 h-4 bg-primary-foreground/80 rounded-full animate-pulse delay-75"></div>
                          <div className="w-1 h-3 bg-primary-foreground/60 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                      <p className="text-xs font-inter font-medium">
                        Потратил 2500 на такси и кофе
                      </p>
                    </div>
                  </div>

                  {/* AI Typing Indicator (Left) */}
                  <div className="flex justify-start animate-in slide-in-from-left duration-500 delay-300">
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>

                  {/* AI Response Card - "Распознано" */}
                  <div className="animate-in slide-in-from-bottom duration-500 delay-700">
                    <div className="bg-card rounded-2xl shadow-xl p-4 border border-border">
                      <p className="text-xs font-semibold font-inter text-muted-foreground mb-3">Распознано:</p>
                      
                      {/* Transaction 1 - Taxi */}
                      <div className="flex items-center gap-3 mb-2 pb-2 border-b border-border">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10">
                          <span className="text-lg">🚕</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-xs font-semibold font-inter text-foreground">Такси</p>
                          <p className="text-[10px] font-medium font-inter text-muted-foreground">Транспорт</p>
                        </div>
                        <p className="text-sm font-bold font-inter text-destructive">2000 ₽</p>
                      </div>

                      {/* Transaction 2 - Coffee */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10">
                          <span className="text-lg">☕</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-xs font-semibold font-inter text-foreground">Кофе</p>
                          <p className="text-[10px] font-medium font-inter text-muted-foreground">Еда и напитки</p>
                        </div>
                        <p className="text-sm font-bold font-inter text-destructive">500 ₽</p>
                      </div>

                      {/* Save Button */}
                      <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl py-2 text-xs font-semibold font-inter transition-colors shadow-sm">
                        Сохранить
                      </button>
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

export default Hero;
