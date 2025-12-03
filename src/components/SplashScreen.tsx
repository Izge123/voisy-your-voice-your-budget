import { useEffect, useState } from "react";
import { Mic } from "lucide-react";

interface SplashScreenProps {
  onFinished: () => void;
  minDisplayTime?: number;
}

export const SplashScreen = ({ onFinished, minDisplayTime = 1800 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onFinished();
        // Remove the HTML splash screen
        const htmlSplash = document.getElementById('splash-screen');
        if (htmlSplash) {
          htmlSplash.remove();
        }
      }, 300);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onFinished]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo Icon */}
      <div className="animate-pulse mb-6">
        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-[scale-in_0.4s_ease-out]">
          <Mic className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* App Name */}
      <h1 
        className="text-4xl font-manrope font-extrabold text-white mb-2 animate-[fade-in_0.4s_ease-out_0.2s_both]"
      >
        Voisy
      </h1>

      {/* Tagline */}
      <p 
        className="text-white/80 text-base font-inter animate-[fade-in_0.4s_ease-out_0.4s_both]"
      >
        Учёт финансов голосом
      </p>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-8 animate-[fade-in_0.4s_ease-out_0.6s_both]">
        <span className="w-2 h-2 bg-white/60 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
        <span className="w-2 h-2 bg-white/60 rounded-full animate-[pulse_1s_ease-in-out_0.2s_infinite]" />
        <span className="w-2 h-2 bg-white/60 rounded-full animate-[pulse_1s_ease-in-out_0.4s_infinite]" />
      </div>
    </div>
  );
};
