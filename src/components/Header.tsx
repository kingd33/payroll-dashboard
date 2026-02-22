import React from 'react';
import { Lock, User, Menu, Settings, Clock } from 'lucide-react';
import { usePipeline } from '../context/PipelineContext';

export const Header: React.FC = () => {
  const { virtualTime } = usePipeline();

  const formatVirtualTime = (vt: number) => {
    if (vt < 0) return "BOOTING...";
    const day = Math.floor(vt / 24) + 1;
    const hour = vt % 24;
    return `DAY ${day} - ${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-20 shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <div className="size-7 rounded-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
          <span className="text-[12px] font-bold tracking-tighter">PCC</span>
        </div>
        <h1 className="text-lg font-medium text-slate-900 tracking-wide">Payroll Command Center</h1>
      </div>
      
      <div className="flex items-center gap-6 text-slate-500">
        <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-1 border border-amber-200/60 shadow-inner h-8 animate-in fade-in slide-in-from-top-2 duration-500 mr-2">
          <Clock size={14} className="text-amber-600 animate-pulse" />
          <span className="font-mono text-xs font-bold text-amber-700 tracking-wider">
            {formatVirtualTime(virtualTime)}
          </span>
        </div>
        
        <button className="hover:text-slate-900 transition-colors"><Lock size={18} strokeWidth={1.5} /></button>
        <button className="hover:text-slate-900 transition-colors"><User size={18} strokeWidth={1.5} /></button>
        <button className="hover:text-slate-900 transition-colors"><Settings size={18} strokeWidth={1.5} /></button>
        <button className="hover:text-slate-900 transition-colors"><Menu size={18} strokeWidth={1.5} /></button>
      </div>
    </header>
  );
};
