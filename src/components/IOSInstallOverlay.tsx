import { useState, useEffect } from 'react';
import { X, Share, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const IOSInstallOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Check if already seen or installed
    const seen = localStorage.getItem('ios-install-overlay-seen');
    if (seen) return;

    // Check if running as standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    if (standalone) return;

    // Detect iOS Safari only
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      // Show after short delay
      const timer = setTimeout(() => setShowOverlay(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowOverlay(false);
    localStorage.setItem('ios-install-overlay-seen', 'true');
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  if (!showOverlay) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      <button 
        onClick={handleClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Logo */}
      <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-6 overflow-hidden">
        <img src="/kapitallo-logo.png" alt="Kapitallo" className="w-full h-full object-contain" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
        Установите Kapitallo
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Быстрый доступ с главного экрана
      </p>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-4 mb-8">
        {/* Step 1 */}
        <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
          currentStep === 1 ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/50'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            currentStep === 1 ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted'
          }`}>
            <Share className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${currentStep === 1 ? 'text-primary' : 'text-foreground'}`}>
              Шаг 1
            </p>
            <p className="text-sm text-muted-foreground">
              Нажмите кнопку <span className="font-medium">"Поделиться"</span> внизу Safari
            </p>
          </div>
          {currentStep === 1 && (
            <ChevronDown className="w-5 h-5 text-primary animate-bounce" />
          )}
        </div>

        {/* Step 2 */}
        <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
          currentStep === 2 ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/50'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            currentStep === 2 ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted'
          }`}>
            <Plus className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${currentStep === 2 ? 'text-primary' : 'text-foreground'}`}>
              Шаг 2
            </p>
            <p className="text-sm text-muted-foreground">
              Найдите <span className="font-medium">"На экран Домой"</span>
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
          currentStep === 3 ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/50'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            currentStep === 3 ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted'
          }`}>
            <span className="text-xl">✓</span>
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${currentStep === 3 ? 'text-primary' : 'text-foreground'}`}>
              Шаг 3
            </p>
            <p className="text-sm text-muted-foreground">
              Нажмите <span className="font-medium">"Добавить"</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((step) => (
          <div 
            key={step}
            className={`w-2 h-2 rounded-full transition-all ${
              step === currentStep ? 'w-6 bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full max-w-sm">
        <Button 
          variant="ghost" 
          className="flex-1"
          onClick={handleClose}
        >
          Позже
        </Button>
        <Button 
          className="flex-1 gap-2"
          onClick={handleNext}
        >
          {currentStep < 3 ? 'Далее' : 'Понятно'}
        </Button>
      </div>

      {/* Arrow pointing to Share button */}
      {currentStep === 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
          <ChevronDown className="w-8 h-8 text-primary" />
          <ChevronDown className="w-8 h-8 text-primary -mt-4" />
        </div>
      )}
    </div>
  );
};
