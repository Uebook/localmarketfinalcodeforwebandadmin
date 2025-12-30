
import React, { useEffect, useState } from 'react';
import { Store } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const intervalTime = 30; // Update every 30ms
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-600 to-blue-600 flex flex-col items-center justify-center z-[100]">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 animate-bounce">
          <Store className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-wider drop-shadow-md mb-2">
          LOCAL
        </h1>
        <p className="text-red-100 text-sm font-medium tracking-wide">
          Your City, Your Market.
        </p>
      </div>

      {/* Loading Bar */}
      <div className="absolute bottom-20 w-64 h-1.5 bg-black/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white rounded-full transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="absolute bottom-12 text-red-100 text-xs font-medium animate-pulse">
        Loading Marketplace...
      </p>
    </div>
  );
};

export default SplashScreen;
