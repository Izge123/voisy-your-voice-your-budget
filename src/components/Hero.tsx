import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full py-12 md:py-20 lg:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Heading */}
          <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-manrope text-foreground leading-tight mb-6">
            Учёт финансов голосом.{" "}
            <span className="text-primary">Просто скажи</span> — AI запишет.
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground font-inter mb-8">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter mb-12">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
              ))}
            </div>
            <span>Уже 1000+ пользователей навели порядок в финансах</span>
          </div>

          {/* iPhone Mockup */}
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
            <div className="relative mx-auto">
              {/* iPhone Frame */}
              <div className="relative bg-card rounded-[3rem] shadow-2xl border-8 border-foreground/10 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-foreground/10 rounded-b-3xl z-10"></div>
                
                {/* Screen */}
                <div className="bg-background aspect-[9/19.5] p-8 pt-12">
                  {/* Notification Card */}
                  <div className="bg-card rounded-2xl shadow-lg p-4 border border-border animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10">
                        <span className="text-2xl">🥦</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold font-inter text-foreground">
                          Транзакция добавлена
                        </p>
                        <p className="text-xs font-medium font-inter text-muted-foreground">
                          Продукты - $50
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
