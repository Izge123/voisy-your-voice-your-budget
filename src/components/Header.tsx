import { useState } from "react";
import { AudioWaveform, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetClose, SheetTrigger } from "@/components/ui/sheet";

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
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <AudioWaveform className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-manrope text-primary">Voisy</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
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

          {/* Mobile Menu Button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 mt-8">
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 mb-4">
                  <AudioWaveform className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold font-manrope text-primary">Voisy</span>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-6">
                  {navLinks.map((link) => (
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
    </header>
  );
};

export default Header;
