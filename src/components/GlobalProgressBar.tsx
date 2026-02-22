import React from 'react';

interface GlobalProgressBarProps {
  cycleCompletionPercentage: number;
}

export const GlobalProgressBar: React.FC<GlobalProgressBarProps> = ({ cycleCompletionPercentage }) => {
  return (
    <div className="h-1.5 w-full bg-slate-200 z-10 relative">
      <div 
         className="h-full bg-blue-500 transition-all duration-1000 ease-in-out" 
         style={{ width: `${cycleCompletionPercentage}%` }}
      />
      <div className="absolute top-2 left-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm border border-slate-200/50">
         Maker / Checker Cycle: {cycleCompletionPercentage}%
      </div>
    </div>
  );
};
