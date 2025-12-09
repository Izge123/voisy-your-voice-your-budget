import { useState, useEffect } from 'react';
import { Download, X, Share, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [isIOSOtherBrowser, setIsIOSOtherBrowser] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // Check if running as standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Detect iOS and browser type
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
    
    if (isIOSDevice) {
      const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent);
      const isChrome = /CriOS/.test(navigator.userAgent);
      const isFirefox = /FxiOS/.test(navigator.userAgent);
      
      setIsIOSSafari(isSafari);
      setIsIOSOtherBrowser(isChrome || isFirefox);
      
      // Show prompt after delay (iOS Safari overlay handles first visit)
      const overlaySeen = localStorage.getItem('ios-install-overlay-seen');
      if (overlaySeen || isChrome || isFirefox) {
        const timer = setTimeout(() => setShowPrompt(true), 2000);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Listen for beforeinstallprompt (Android/Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleOpenInSafari = () => {
    // Copy current URL to clipboard for user to paste in Safari
    navigator.clipboard.writeText(window.location.href);
    alert('Ссылка скопирована! Откройте Safari и вставьте её в адресную строку.');
  };

  if (!showPrompt || isStandalone) return null;

  // iOS other browser (Chrome/Firefox) - show "Open in Safari" message
  if (isIOSOtherBrowser) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border border-border rounded-2xl p-4 shadow-xl z-50 animate-in slide-in-from-bottom-4">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/kapitallo-logo.png" alt="Kapitallo" className="w-full h-full object-contain" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">Откройте в Safari</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Для установки приложения откройте эту страницу в Safari
            </p>
          </div>
        </div>

        <div className="mt-3">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleOpenInSafari}
          >
            <ExternalLink className="w-4 h-4" />
            Скопировать ссылку
          </Button>
        </div>
      </div>
    );
  }

  // iOS Safari - enhanced banner with arrow
  if (isIOSSafari) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl p-4 shadow-xl z-50 animate-in slide-in-from-bottom-4">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
            <img src="/kapitallo-logo.png" alt="Kapitallo" className="w-full h-full object-contain" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">Установите Kapitallo</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Нажмите <Share className="w-3 h-3 inline text-primary" /> внизу, затем "На экран Домой"
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={handleDismiss}
          >
            <Share className="w-4 h-4" />
            Понятно
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDismiss}
          >
            Позже
          </Button>
        </div>

        {/* Animated arrow pointing down to Safari share button */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <ChevronDown className="w-6 h-6 text-primary animate-bounce" />
        </div>
      </div>
    );
  }

  // Android/Desktop - native install prompt
  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border border-border rounded-2xl p-4 shadow-xl z-50 animate-in slide-in-from-bottom-4">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/kapitallo-logo.png" alt="Kapitallo" className="w-full h-full object-contain" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">Установите Kapitallo</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Быстрый доступ с главного экрана
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 gap-2"
          onClick={handleInstall}
        >
          <Download className="w-4 h-4" />
          Установить
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDismiss}
        >
          Позже
        </Button>
      </div>
    </div>
  );
};
