import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, WifiOff, Zap, HardDrive, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const AndroidInstallOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already seen or already installed
    const alreadySeen = localStorage.getItem('android-install-overlay-seen');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (alreadySeen || isStandalone) return;

    // Detect Android
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    
    if (!isAndroid) return;

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay for better UX
      setTimeout(() => setShowOverlay(true), 1000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('android-install-overlay-seen', 'true');
      setShowOverlay(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('android-install-overlay-seen', 'true');
    setShowOverlay(false);
  };

  if (!showOverlay || !deferredPrompt) return null;

  const benefits = [
    { icon: Rocket, text: 'Мгновенный запуск с главного экрана' },
    { icon: WifiOff, text: 'Работает без интернета' },
    { icon: Zap, text: 'Быстрее чем браузер' },
    { icon: HardDrive, text: 'Занимает меньше 1 МБ' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-emerald-600 p-6">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Закрыть"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Logo */}
        <div className="w-24 h-24 mb-6 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-4">
          <img 
            src="/kapitallo-logo.svg" 
            alt="Kapitallo" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2 font-manrope">
          Установите Kapitallo
        </h1>
        <p className="text-white/80 mb-8 text-sm">
          Добавьте приложение на главный экран
        </p>

        {/* Benefits */}
        <div className="w-full space-y-3 mb-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-sm text-left">{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* Install button */}
        <Button
          onClick={handleInstall}
          className="w-full h-14 text-lg font-semibold bg-white text-primary hover:bg-white/90 shadow-xl animate-pulse"
          style={{ animationDuration: '2s' }}
        >
          Установить бесплатно
        </Button>

        {/* Later link */}
        <button
          onClick={handleDismiss}
          className="mt-4 text-white/60 text-sm hover:text-white/80 transition-colors"
        >
          Позже
        </button>
      </div>
    </div>
  );
};
