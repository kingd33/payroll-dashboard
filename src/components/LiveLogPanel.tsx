import React, { useState, useEffect } from 'react';
import { Play, Pause, ExternalLink } from 'lucide-react';
import { type LogMessage } from '../hooks/useSimulation';

interface LiveLogPanelProps {
  logs: LogMessage[];
  isRunning: boolean;
  onToggleRun: () => void;
  onGpcClick: (gpcId: string, regionCode: string) => void;
}

export const LiveLogPanel: React.FC<LiveLogPanelProps> = ({ 
  logs, 
  isRunning, 
  onToggleRun, 
  onGpcClick 
}) => {
  const [isLogHovering, setIsLogHovering] = useState(false);
  const [frozenLogs, setFrozenLogs] = useState(logs);

  // Freeze the log feed while the user is hovering over it to allow them to click
  useEffect(() => {
    if (!isLogHovering) {
      setFrozenLogs(logs);
    }
  }, [logs, isLogHovering]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col font-mono text-xs shadow-sm h-40 shrink-0">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-3">
           <h3 className="text-slate-700 font-sans font-bold uppercase text-[10px] tracking-wider pl-2 border-l-2 border-emerald-500">Live Orchestrator Log</h3>
           <button 
             onClick={onToggleRun}
             className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors shadow-sm ${isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
           >
             {isRunning ? <><Pause size={10} /> Pause</> : <><Play size={10} /> Resume</>}
           </button>
        </div>
        <span className={`flex items-center gap-2 ${isRunning ? 'text-emerald-600' : 'text-slate-400'}`}>
           <span className={`size-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
           {isRunning ? 'System Bound' : 'Simulation Paused'}
        </span>
      </div>
      <div 
         className="flex-1 text-slate-600 overflow-y-auto space-y-1.5 pb-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200"
         onMouseEnter={() => setIsLogHovering(true)}
         onMouseLeave={() => setIsLogHovering(false)}
      >
         {frozenLogs.map((log) => {
            const isClickable = Boolean(log.regionCode && log.gpcId);
            return (
              <div 
                key={log.id} 
                className={`animate-in fade-in slide-in-from-left-2 duration-300 flex items-start py-0.5 ${isClickable ? 'cursor-pointer hover:bg-slate-100 rounded px-1 -mx-1 transition-colors group' : ''}`}
                onClick={() => isClickable && log.gpcId && log.regionCode && onGpcClick(log.gpcId, log.regionCode)}
              >
                <span className="text-slate-400 font-mono text-[10px] mr-2 shrink-0 mt-0.5">[{log.timestamp}]</span>
                <div className="flex-1 leading-relaxed">
                  {log.type === 'SYSTEM' && <span className="text-slate-500 font-semibold mr-1.5 shadow-sm bg-white border border-slate-200 px-1 rounded-sm text-[10px] py-0.5">SYS</span>}
                  {log.type === 'PASSED' && <span className="text-emerald-600 font-semibold mr-1.5 shadow-sm bg-emerald-50 border border-emerald-200 px-1 rounded-sm text-[10px] py-0.5">PASS</span>}
                  {log.type === 'PROCESSING' && <span className="text-blue-500 font-semibold mr-1.5 shadow-sm bg-blue-50 border border-blue-200 px-1 rounded-sm text-[10px] py-0.5 animate-pulse-blue">PROC</span>}
                  {log.type === 'ERROR' && <span className="text-red-500 font-semibold mr-1.5 shadow-sm bg-red-50 border border-red-200 px-1 rounded-sm text-[10px] py-0.5">ERR</span>}
                  {log.type === 'LATE' && <span className="text-slate-500 font-semibold mr-1.5 shadow-sm bg-slate-100 border border-slate-300 px-1 rounded-sm text-[10px] py-0.5">SLA</span>}
                  {log.type === 'AUTO_HEALING' && <span className="text-amber-600 font-semibold mr-1.5 shadow-sm bg-amber-50 border border-amber-200 px-1 rounded-sm text-[10px] py-0.5">A-HEAL</span>}
                  
                  <span className="text-slate-600 group-hover:text-slate-900 transition-colors align-middle">{log.message}</span>
                </div>
                
                {isClickable && (
                   <button className="opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-slate-200 text-[9px] font-bold uppercase tracking-wider text-blue-600 px-1.5 py-1 rounded leading-none shrink-0 self-start transition-opacity ml-2 flex items-center gap-1 mt-0.5 hover:bg-blue-50">
                     <ExternalLink size={10} /> Jump
                   </button>
                )}
              </div>
            );
         })}
         {frozenLogs.length === 0 && <p className="text-slate-400 italic">Waiting for telemetry...</p>}
      </div>
    </div>
  );
};
