import { AudioWaveform } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <AudioWaveform className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-manrope text-primary">Voisy</span>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium font-inter text-foreground hover:text-primary transition-colors">
              Возможности
            </a>
            <a href="#pricing" className="text-sm font-medium font-inter text-foreground hover:text-primary transition-colors">
              Тарифы
            </a>
            <a href="#faq" className="text-sm font-medium font-inter text-foreground hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex font-inter">
              Войти
            </Button>
            <Button className="rounded-full bg-primary hover:bg-primary/90 font-inter">
              Начать бесплатно
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
