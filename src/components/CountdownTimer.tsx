import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../utils';

interface CountdownTimerProps {
  dueDate: string; // ISO String
  isLate: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ dueDate, isLate }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(dueDate).getTime() - Date.now();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        const lateAmount = Math.abs(difference);
        setTimeLeft({
           hours: Math.floor((lateAmount / (1000 * 60 * 60)) % 24),
           minutes: Math.floor((lateAmount / 1000 / 60) % 60),
           seconds: Math.floor((lateAmount / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [dueDate]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap border",
      isLate 
        ? "bg-slate-100 text-slate-500 border-slate-200" 
        : "bg-blue-50 text-blue-600 border-blue-100"
    )}>
      <Clock size={10} className={isLate ? "animate-none" : "animate-pulse"} />
      {isLate ? '-' : ''}{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </div>
  );
};
