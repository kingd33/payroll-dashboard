import React from 'react';
import { Sparkles, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../utils';

import { type AgentState } from '../types';

interface AgentStatusIconProps {
  state: AgentState;
  className?: string;
}

export const AgentStatusIcon: React.FC<AgentStatusIconProps> = ({ state, className }) => {
  switch (state) {
    case 'PROCESSING':
      return (
        <div className={cn("relative flex items-center justify-center size-8 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 animate-pulse-blue", className)}>
          <Sparkles size={16} className="animate-spin-slow" style={{ animationDuration: '3s' }} />
        </div>
      );
    case 'AUTO_HEALING':
      return (
        <div className={cn("relative flex items-center justify-center size-8 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30", className)}>
          {/* Slide-in transition handled via parent framer-motion if needed, or simple CSS here */}
          <Wrench size={16} className="animate-bounce" style={{ animationDuration: '2s' }} />
        </div>
      );
    case 'ERROR':
      return (
        <div className={cn("relative flex items-center justify-center size-8 rounded-full bg-red-500/20 border border-red-500/50 animate-shake overflow-hidden shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]", className)}>
          <AlertTriangle size={16} className="text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)] stroke-[2.5px]" />
        </div>
      );
    case 'PASSED':
      return (
        <div className={cn("relative flex items-center justify-center size-8 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30", className)}>
          <CheckCircle2 size={16} />
        </div>
      );
    case 'SCHEDULED':
      return (
        <div className={cn("relative flex items-center justify-center size-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 border-dashed", className)}>
          <div className="size-2 rounded-full bg-slate-300" />
        </div>
      );
    case 'LATE':
      return (
        <div className={cn("relative flex items-center justify-center size-8 rounded-full bg-slate-200 text-slate-500 border border-slate-300", className)}>
          <AlertTriangle size={14} className="text-slate-500" />
        </div>
      );
    case 'IDLE':
    default:
      return (
        <div className={cn("relative flex items-center justify-center size-8 rounded-full bg-slate-100/80 text-slate-400 border border-slate-200", className)}>
          <div className="size-2.5 rounded-full bg-slate-400" />
        </div>
      );
  }
};
