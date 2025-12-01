import { AudioWaveform, Mail } from "lucide-react";

const Footer = () => {
  const links = [
    { label: "Возможности", href: "#features" },
    { label: "Тарифы", href: "#pricing" },
    { label: "FAQ", href: "#faq" }
  ];

  const legal = [
    { label: "Оферта", href: "#" },
    { label: "Политика конфиденциальности", href: "#" }
  ];

  return (
    <footer className="w-full py-12 md:py-16 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <AudioWaveform className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold font-manrope text-primary">Voisy</span>
            </div>
            <p className="text-sm font-inter text-muted-foreground max-w-md mb-4">
              Умный учет финансов голосом. Забудь про Excel и ручной ввод — просто скажи, и AI запишет.
            </p>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a 
                href="mailto:hello@getvoisy.com" 
                className="text-sm font-inter text-muted-foreground hover:text-primary transition-colors"
              >
                hello@getvoisy.com
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-bold font-manrope text-foreground mb-4">Навигация</h3>
            <ul className="space-y-3">
              {links.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm font-inter text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-bold font-manrope text-foreground mb-4">Документы</h3>
            <ul className="space-y-3">
              {legal.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm font-inter text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-inter text-muted-foreground">
            © 2025 Voisy. Все права защищены.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://t.me/voisy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-inter text-muted-foreground hover:text-primary transition-colors"
            >
              Telegram
            </a>
            <a 
              href="https://twitter.com/voisy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-inter text-muted-foreground hover:text-primary transition-colors"
            >
              Twitter
            </a>
            <a 
              href="https://instagram.com/voisy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-inter text-muted-foreground hover:text-primary transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
