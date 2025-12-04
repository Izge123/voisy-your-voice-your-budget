import { useEffect, useState } from "react";
import logo from "@/assets/kapitallo-logo.svg";

interface SplashScreenProps {
  onFinished: () => void;
  minDisplayTime?: number;
}

export const SplashScreen = ({ onFinished, minDisplayTime = 1800 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showDots, setShowDots] = useState(false);

  useEffect(() => {
    // Staggered animation sequence
    const iconTimer = setTimeout(() => setShowIcon(true), 100);
    const titleTimer = setTimeout(() => setShowTitle(true), 300);
    const subtitleTimer = setTimeout(() => setShowSubtitle(true), 500);
    const dotsTimer = setTimeout(() => setShowDots(true), 700);

    const finishTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onFinished();
        // Remove the HTML splash screen
        const htmlSplash = document.getElementById('splash-screen');
        if (htmlSplash) {
          htmlSplash.remove();
        }
      }, 400);
    }, minDisplayTime);

    return () => {
      clearTimeout(iconTimer);
      clearTimeout(titleTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(dotsTimer);
      clearTimeout(finishTimer);
    };
  }, [minDisplayTime, onFinished]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary transition-all duration-400 ${
        isFadingOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Logo Icon */}
      <div 
        className={`mb-6 transition-all duration-500 ${
          showIcon ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl overflow-hidden">
          <img src={logo} alt="Kapitallo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* App Name */}
      <h1 
        className={`text-5xl font-manrope font-extrabold text-white mb-3 transition-all duration-500 ${
          showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        Kapitallo
      </h1>

      {/* Tagline */}
      <p 
        className={`text-white/80 text-lg font-inter transition-all duration-500 ${
          showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        Учёт финансов голосом
      </p>

      {/* Loading dots */}
      <div 
        className={`flex gap-2 mt-10 transition-all duration-500 ${
          showDots ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span 
          className="w-2.5 h-2.5 bg-white/70 rounded-full animate-bounce-dot"
          style={{ animationDelay: '0ms' }}
        />
        <span 
          className="w-2.5 h-2.5 bg-white/70 rounded-full animate-bounce-dot"
          style={{ animationDelay: '150ms' }}
        />
        <span 
          className="w-2.5 h-2.5 bg-white/70 rounded-full animate-bounce-dot"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
};
