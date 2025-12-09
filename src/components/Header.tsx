import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/kapitallo-logo.svg";

const Header = () => {
  const [open, setOpen] = useState(false);
  const navLinks = [
    { href: "#features", label: "Возможности" },
    { href: "#pricing", label: "Тарифы" },
    { href: "#faq", label: "FAQ" }
  ];

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <header role="banner" className="sticky top-0 z-50 w-full bg-background/95 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2" aria-label="Kapitallo - На главную">
            <img src={logo} alt="Kapitallo логотип" className="h-8 w-8" width="32" height="32" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Основная навигация">
            {navLinks.map(link => (
              <a 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium font-inter text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="font-inter" 
              onClick={() => window.location.href = '/auth?tab=login'}
            >
              Войти
            </Button>
            <Button 
              className="rounded-full bg-primary hover:bg-primary/90 font-inter" 
              onClick={() => window.location.href = '/auth?tab=register'}
            >
              Начать бесплатно
            </Button>
          </div>

          {/* Mobile Button + Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Button 
              size="sm" 
              className="rounded-full bg-primary hover:bg-primary/90 font-inter text-xs px-3" 
              onClick={() => window.location.href = '/auth?tab=register'}
            >
              Начать бесплатно
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Открыть меню навигации">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-8 mt-8">
                  {/* Mobile Logo */}
                  <div className="flex items-center gap-2 mb-4">
                    <img src={logo} alt="Kapitallo логотип" className="h-8 w-8" width="32" height="32" />
                    <span className="text-xl font-bold font-manrope text-primary">Kapitallo</span>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-6" aria-label="Мобильная навигация">
                    {navLinks.map(link => (
                      <SheetClose asChild key={link.href}>
                        <a 
                          href={link.href} 
                          onClick={handleLinkClick} 
                          className="text-lg font-medium font-inter text-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </a>
                      </SheetClose>
                    ))}
                  </nav>

                  {/* Mobile Buttons */}
                  <div className="flex flex-col gap-3 mt-4">
                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full font-inter" 
                        onClick={() => {
                          handleLinkClick();
                          window.location.href = '/auth?tab=login';
                        }}
                      >
                        Войти
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button 
                        className="w-full rounded-full bg-primary hover:bg-primary/90 font-inter" 
                        onClick={() => {
                          handleLinkClick();
                          window.location.href = '/auth?tab=register';
                        }}
                      >
                        Начать бесплатно
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
