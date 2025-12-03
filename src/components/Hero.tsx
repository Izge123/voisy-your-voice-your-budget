import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, ArrowRight, Mic, Settings, TrendingUp, Home, PieChart, Plus, Bell, User } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full py-8 md:py-16 lg:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-manrope text-foreground leading-tight mb-4 md:mb-6">
              Учёт финансов голосом.{" "}
              <span className="text-primary">Просто скажи</span> — AI запишет.
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-inter mb-6 md:mb-8">
              Забудь про Excel и ручной ввод. Voisy распознает твои траты, разделит чек на категории и покажет, куда уходят деньги.
            </p>

            {/* CTA Button */}
            <Button 
              size="lg" 
              className="rounded-full px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold font-inter bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-90 shadow-lg hover:shadow-xl transition-all mb-4 md:mb-6"
              asChild
            >
              <Link to="/auth?tab=register">
                Попробовать бесплатно
              </Link>
            </Button>

            {/* Social Proof */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-inter mb-6 md:mb-8 justify-center lg:justify-start">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-secondary text-secondary" />
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
          <div className="relative w-full max-w-[280px] sm:max-w-xs mx-auto lg:max-w-sm">
            {/* Floating Icons - Positioned in front of phone */}
            <div className="absolute -left-12 md:-left-16 top-16 md:top-20 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-slate-800 border border-border/50 shadow-xl flex items-center justify-center z-20">
              <span className="text-2xl md:text-3xl">🍔</span>
            </div>
            <div className="absolute -right-12 md:-right-16 top-32 md:top-40 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-slate-800 border border-border/50 shadow-xl flex items-center justify-center z-20">
              <span className="text-2xl md:text-3xl">✈️</span>
            </div>

            <div className="relative mx-auto">
              {/* Glow Effect Behind Phone - simplified for iOS */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 rounded-full scale-150 opacity-50"></div>

              {/* iPhone Frame */}
              <div className="relative bg-card rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border-4 md:border-8 border-foreground/10 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 md:w-40 h-6 md:h-7 bg-foreground/10 rounded-b-3xl z-30"></div>
                
                {/* Screen Container */}
                <div className="relative bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 aspect-[9/19.5] overflow-hidden">
                  
                  {/* LAYER 1 - Dashboard Background */}
                  <div className="absolute inset-0 p-4 md:p-6 pt-10 md:pt-12 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500"></div>
                        <div>
                          <p className="text-[10px] md:text-xs font-inter text-muted-foreground">Привет,</p>
                          <p className="text-xs md:text-sm font-semibold font-manrope text-foreground">Алекс!</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted/50 flex items-center justify-center">
                        <Settings className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl md:rounded-3xl p-4 md:p-5 mb-4 md:mb-6 shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-white/80" />
                        <p className="text-[10px] md:text-xs font-inter text-white/80">Общий баланс</p>
                      </div>
                      <p className="text-2xl md:text-3xl font-bold font-manrope text-white">$12,450</p>
                      <p className="text-[10px] md:text-xs font-inter text-white/70 mt-1">+$340 за неделю</p>
                    </div>

                    {/* Recent Transactions */}
                    <div className="flex-1 overflow-hidden pb-16">
                      <p className="text-xs md:text-sm font-semibold font-manrope text-foreground mb-2 md:mb-3">Сегодня</p>
                      <div className="space-y-2 opacity-40">
                        {/* Transaction 1 */}
                        <div className="bg-white/60 dark:bg-slate-700/30 rounded-xl p-2.5 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <span className="text-base">🛒</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] md:text-xs font-semibold font-inter text-foreground">Пятерочка</p>
                            <p className="text-[8px] md:text-[10px] font-medium font-inter text-muted-foreground">Продукты</p>
                          </div>
                          <p className="text-[10px] md:text-xs font-bold font-inter text-destructive">-$120</p>
                        </div>
                        {/* Transaction 2 */}
                        <div className="bg-white/60 dark:bg-slate-700/30 rounded-xl p-2.5 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <span className="text-base">🎬</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] md:text-xs font-semibold font-inter text-foreground">Netflix</p>
                            <p className="text-[8px] md:text-[10px] font-medium font-inter text-muted-foreground">Подписки</p>
                          </div>
                          <p className="text-[10px] md:text-xs font-bold font-inter text-destructive">-$12</p>
                        </div>
                        {/* Transaction 3 */}
                        <div className="bg-white/60 dark:bg-slate-700/30 rounded-xl p-2.5 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <span className="text-base">🏋️</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] md:text-xs font-semibold font-inter text-foreground">Спортзал</p>
                            <p className="text-[8px] md:text-[10px] font-medium font-inter text-muted-foreground">Спорт</p>
                          </div>
                          <p className="text-[10px] md:text-xs font-bold font-inter text-destructive">-$50</p>
                        </div>
                        {/* Transaction 4 */}
                        <div className="bg-white/60 dark:bg-slate-700/30 rounded-xl p-2.5 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <span className="text-base">🍔</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] md:text-xs font-semibold font-inter text-foreground">Burger King</p>
                            <p className="text-[8px] md:text-[10px] font-medium font-inter text-muted-foreground">Еда</p>
                          </div>
                          <p className="text-[10px] md:text-xs font-bold font-inter text-destructive">-$15</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Tab Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-border/50 px-4 py-2 flex items-center justify-around">
                      <div className="flex flex-col items-center gap-0.5">
                        <Home className="h-5 w-5 text-primary" />
                        <span className="text-[8px] font-inter text-primary">Главная</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <PieChart className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[8px] font-inter text-muted-foreground">Аналитика</span>
                      </div>
                      <div className="relative -top-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg">
                          <Plus className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[8px] font-inter text-muted-foreground">Уведомления</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[8px] font-inter text-muted-foreground">Профиль</span>
                      </div>
                    </div>
                  </div>

                  {/* LAYER 2 - AI Overlay */}
                  <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 z-10 flex flex-col justify-center p-4 md:p-6">
                    
                    {/* User Message (Right - Audio bubble) */}
                    <div className="flex justify-end mb-3 md:mb-4 animate-in slide-in-from-right duration-500">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 md:px-4 py-2 md:py-3 max-w-[85%] shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Mic className="h-3 w-3 md:h-4 md:w-4" />
                          <div className="flex gap-1">
                            <div className="w-0.5 md:w-1 h-2 md:h-3 bg-primary-foreground/60 rounded-full"></div>
                            <div className="w-0.5 md:w-1 h-3 md:h-4 bg-primary-foreground/80 rounded-full"></div>
                            <div className="w-0.5 md:w-1 h-2 md:h-3 bg-primary-foreground/60 rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-[10px] md:text-xs font-inter font-medium">
                          Потратил 2500 на такси и кофе
                        </p>
                      </div>
                    </div>

                    {/* AI Typing Indicator (Left) */}
                    <div className="flex justify-start mb-3 md:mb-4 animate-in slide-in-from-left duration-500 delay-300">
                      <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl rounded-tl-sm px-3 md:px-4 py-2 md:py-3 shadow-md">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-muted-foreground rounded-full opacity-60"></div>
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-muted-foreground rounded-full opacity-80"></div>
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-muted-foreground rounded-full opacity-60"></div>
                        </div>
                      </div>
                    </div>

                    {/* AI Response Card - "Распознано" */}
                    <div className="animate-in slide-in-from-bottom duration-500 delay-700">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-3 md:p-4 border border-border">
                        <p className="text-[10px] md:text-xs font-semibold font-inter text-muted-foreground mb-2 md:mb-3">Распознано:</p>
                        
                        {/* Transaction 1 - Taxi */}
                        <div className="flex items-center gap-2 md:gap-3 mb-2 pb-2 border-b border-border">
                          <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/10">
                            <span className="text-base md:text-lg">🚕</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-[10px] md:text-xs font-semibold font-inter text-foreground">Такси</p>
                            <p className="text-[8px] md:text-[10px] font-medium font-inter text-muted-foreground">Транспорт</p>
                          </div>
                          <p className="text-xs md:text-sm font-bold font-inter text-destructive">2000 ₽</p>
                        </div>

                        {/* Transaction 2 - Coffee */}
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                          <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/10">
                            <span className="text-base md:text-lg">☕</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-[10px] md:text-xs font-semibold font-inter text-foreground">Кофе</p>
                            <p className="text-[8px] md:text-[10px] font-medium font-inter text-muted-foreground">Еда и напитки</p>
                          </div>
                          <p className="text-xs md:text-sm font-bold font-inter text-destructive">500 ₽</p>
                        </div>

                        {/* Save Button */}
                        <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl py-1.5 md:py-2 text-[10px] md:text-xs font-semibold font-inter transition-colors shadow-sm">
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
      </div>
    </section>
  );
};

export default Hero;
