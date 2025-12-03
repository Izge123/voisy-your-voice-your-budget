import { useState, useEffect } from 'react';
import { ArrowLeft, Share, PlusSquare, MoreVertical, Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsAndroid(/Android/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Уже установлено!</h1>
        <p className="text-muted-foreground mb-6">Voisy работает как приложение</p>
        <Link to="/app/dashboard">
          <Button>Перейти в приложение</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 border-b border-border z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 hover:bg-accent rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg">Установка Voisy</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">V</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Установите приложение</h2>
          <p className="text-muted-foreground">
            Быстрый доступ к Voisy прямо с главного экрана
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-8">
          <h3 className="font-semibold text-foreground mb-3">Преимущества</h3>
          <ul className="space-y-3">
            {[
              'Мгновенный запуск с главного экрана',
              'Работает как нативное приложение',
              'Быстрая загрузка благодаря кэшированию',
              'Не занимает много места'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Android/Desktop with prompt */}
        {deferredPrompt && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6 text-center">
            <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Установить сейчас</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Нажмите кнопку ниже для быстрой установки
            </p>
            <Button onClick={handleInstall} className="gap-2">
              <Download className="w-4 h-4" />
              Установить Voisy
            </Button>
          </div>
        )}

        {/* iOS Instructions */}
        {(isIOS || !isAndroid) && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center">
                <span className="text-white text-xs">🍎</span>
              </div>
              <h3 className="font-semibold text-foreground">iPhone / iPad (Safari)</h3>
            </div>
            
            <ol className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</div>
                <div>
                  <p className="text-sm text-foreground">Нажмите кнопку <strong>Поделиться</strong></p>
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg">
                    <Share className="w-4 h-4" />
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</div>
                <div>
                  <p className="text-sm text-foreground">Прокрутите вниз и выберите <strong>На экран «Домой»</strong></p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
                    <PlusSquare className="w-4 h-4" />
                    На экран «Домой»
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</div>
                <div>
                  <p className="text-sm text-foreground">Нажмите <strong>Добавить</strong></p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Android Instructions */}
        {(isAndroid || !isIOS) && !deferredPrompt && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs">🤖</span>
              </div>
              <h3 className="font-semibold text-foreground">Android (Chrome)</h3>
            </div>
            
            <ol className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</div>
                <div>
                  <p className="text-sm text-foreground">Нажмите на <strong>меню</strong> (три точки)</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</div>
                <div>
                  <p className="text-sm text-foreground">Выберите <strong>Установить приложение</strong> или <strong>Добавить на главный экран</strong></p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
                    <Download className="w-4 h-4" />
                    Установить приложение
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</div>
                <div>
                  <p className="text-sm text-foreground">Подтвердите установку</p>
                </div>
              </li>
            </ol>
          </div>
        )}
      </main>
    </div>
  );
};

export default Install;
