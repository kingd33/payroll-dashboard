import React, { useState, useMemo, useEffect, useRef } from 'react';
import { type RegionData, type AgentState, PIPELINE_PHASES, getSortedRegions } from '../types';
import { AgentStatusIcon } from './AgentStatusIcon';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { usePipeline } from '../context/PipelineContext';

type ZoomMode = 'macro' | 'auto' | 'micro';

interface ConcurrentLanesProps {
  regions: RegionData[];
  onGpcClick?: (gpcId: string, regionCode: string) => void;
  showOnlyAlerts?: boolean;
}

export const ConcurrentLanes: React.FC<ConcurrentLanesProps> = ({ regions, onGpcClick, showOnlyAlerts }) => {
  const [zoomMode, setZoomMode] = useState<ZoomMode>('auto');
  const { virtualTime } = usePipeline();
  const [isHovering, setIsHovering] = useState(false);
  const [frozenRegions, setFrozenRegions] = useState(regions);

  const headerRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target === headerRef.current && lanesRef.current) {
      lanesRef.current.scrollLeft = target.scrollLeft;
    } else if (target === lanesRef.current && headerRef.current) {
      headerRef.current.scrollLeft = target.scrollLeft;
    }
  };

  useEffect(() => {
    if (!isHovering) {
      setFrozenRegions(regions);
    }
  }, [regions, isHovering]);

  const sortedRegions = useMemo(() => {
    let sorted = getSortedRegions(frozenRegions);
    if (showOnlyAlerts) {
      sorted = sorted.filter(r => r.state === 'ERROR' || r.state === 'AUTO_HEALING');
    }
    // Map frozen order to freshest underlying data
    return sorted.map(frozenR => regions.find(r => r.id === frozenR.id) || frozenR);
  }, [frozenRegions, showOnlyAlerts, regions]);

  // Determine which phases are expanded based on zoom mode
  const expandedPhases = useMemo(() => {
    if (zoomMode === 'macro') return [];
    if (zoomMode === 'micro') return PIPELINE_PHASES.map(p => p.id);
    
    // Auto mode: only expand phases that contain an active alert
    const alertPhases = new Set<string>();
    sortedRegions.forEach(r => {
      if (r.state === 'ERROR' || r.state === 'AUTO_HEALING' || r.state === 'LATE') {
        alertPhases.add(r.currentPhaseId);
      }
    });
    return Array.from(alertPhases);
  }, [zoomMode, sortedRegions]);

  // Generate the unified columns array
  const columns = PIPELINE_PHASES.flatMap(phase => {
    if (expandedPhases.includes(phase.id)) {
      return phase.gpcs.map(gpc => ({ type: 'gpc', id: gpc.id, name: gpc.name, phaseId: phase.id, shortName: gpc.id }));
    } else {
      return [{ type: 'phase', id: phase.id, name: phase.name, phaseId: phase.id, shortName: phase.shortName }];
    }
  });

  const ALL_GPCS = PIPELINE_PHASES.flatMap(p => p.gpcs);


  return (
    <div 
      className="flex flex-col h-full w-full relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
       {/* Top Controls */}
       <div className="flex justify-between items-center mb-4 pl-14 pr-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pipeline Execution View
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['macro', 'auto', 'micro'] as ZoomMode[]).map(mode => (
              <button 
                key={mode} 
                onClick={() => setZoomMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  zoomMode === mode 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
       </div>

       {/* Master Scroll wrapper */}
       <div className="flex-1 w-full relative shadow-inner rounded-xl border border-slate-200/50 bg-white/50">
            {/* Column Headers (Sticky Top to the document) */}
            <div className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 shadow-sm rounded-t-xl">
               <div 
                 ref={headerRef} 
                 className="flex w-full overflow-x-auto scrollbar-hide pt-4 pb-4" 
                 onScroll={handleScroll}
               >
                 {/* Sticky top-left corner spacer */}
                 <div className="w-14 flex-shrink-0 sticky left-1 z-50 bg-white/95 border-r-2 border-transparent mr-1"></div>
                 
                 {/* Headers flex container */}
                 <div className="flex-1 flex pl-1 pr-8 min-w-max">
                   {columns.map((col, idx) => (
                      <div key={`${col.type}-${col.id}-${idx}`} className="flex-1 min-w-[80px] w-[80px] max-w-[80px] text-xs font-semibold text-slate-500 uppercase flex flex-col items-center text-center gap-1">
                        <span className={col.type === 'phase' ? 'text-blue-600 font-bold' : ''}>
                          {col.shortName}
                        </span>
                        <span className="px-2 truncate w-full text-[10px]" title={col.name}>{col.name}</span>
                      </div>
                   ))}
                 </div>
               </div>
            </div>

            {/* Lanes Container */}
            <div 
              ref={lanesRef}
              className="w-full overflow-x-auto pb-6"
              onScroll={handleScroll}
            >
              <div className="flex flex-col gap-8 relative pt-10 min-w-max">
          {sortedRegions.map((region) => {
             const currentPhaseIndex = PIPELINE_PHASES.findIndex(p => p.id === region.currentPhaseId);
             const currentGpcIndex = ALL_GPCS.findIndex(g => g.id === region.currentGpcId);

             return (
               <div key={region.id} className="flex items-center relative group min-h-[40px] pl-1 w-full">
                   {/* Region Label - Sticky Left */}
                  <div className={`w-14 text-sm font-bold font-mono tracking-wider flex-shrink-0 z-30 border-r-2 flex items-center justify-center h-full rounded-l-md mr-1 py-3 shadow-sm sticky left-1 transition-colors duration-300 ${
                    region.state === 'ERROR' ? 'bg-red-50 text-red-700 border-red-300' :
                    region.state === 'AUTO_HEALING' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                    region.state === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                    region.state === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                    region.state === 'LATE' ? 'bg-slate-200 text-slate-500 border-slate-300' :
                    region.state === 'SCHEDULED' ? 'bg-slate-50 text-slate-400 border-slate-200' :
                    'bg-slate-100 text-slate-800 border-slate-300'
                  }`}>
                    {region.countryCode}
                  </div>

                  {/* Row Content (Unified Scroll) */}
                  <div className="flex-1 flex pr-8 pb-4 pt-4 -mt-4 -mb-4 relative z-10 w-full">
                    {/* Progress Track */}
                    <div className="absolute left-16 right-0 h-1 bg-slate-200 top-1/2 -translate-y-1/2 z-0 hidden"></div>
                    
                    {/* Stages/Phases for this region */}
                    <div className={`flex-1 flex min-w-max relative z-10 pt-2 pb-2 ${region.state === 'SCHEDULED' ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300' : ''}`}>
                       {/* Actual visible progress track */}
                       <div className="absolute left-0 right-10 h-1 bg-slate-200 top-1/2 -translate-y-1/2 mt-0 z-0"></div>
                     {columns.map((col, idx) => {
                        let stateToRender = 'IDLE';
                        let isActive = false;
                        let isPast = false;

                        if (col.type === 'phase') {
                          const colPhaseIndex = PIPELINE_PHASES.findIndex(p => p.id === col.id);
                          if (colPhaseIndex < currentPhaseIndex) isPast = true;
                          if (colPhaseIndex === currentPhaseIndex) isActive = true;
                        } else {
                          const colGpcIndex = ALL_GPCS.findIndex(g => g.id === col.id);
                          if (colGpcIndex < currentGpcIndex) isPast = true;
                          if (colGpcIndex === currentGpcIndex) isActive = true;
                        }

                        if (isPast) stateToRender = 'PASSED';
                        if (isActive) stateToRender = region.state;

                        return (
                          <div key={`${col.type}-${col.id}-${idx}`} className="flex-1 min-w-[80px] w-[80px] max-w-[80px] flex justify-center relative group/btn">
                              {/* Connector Line Fill */}
                              {idx !== 0 && (
                                  <div className={`absolute top-1/2 right-1/2 left-[-50%] h-1 -translate-y-1/2 z-0
                                    ${isPast ? 'bg-emerald-500/50' : isActive ? 'bg-blue-500/30' : 'bg-slate-200'}
                                  `} />
                              )}
                              
                              <motion.button 
                                 onClick={() => {
                                   if (col.type === 'gpc') {
                                     onGpcClick?.(col.id, region.countryCode);
                                   } else {
                                     // Provide a relevant GPC for the clicked Phase in macro view
                                     const phaseIndex = PIPELINE_PHASES.findIndex(p => p.id === col.id);
                                     if (phaseIndex === currentPhaseIndex) {
                                       // If clicking active phase, show current GPC
                                       onGpcClick?.(region.currentGpcId, region.countryCode);
                                     } else if (phaseIndex < currentPhaseIndex) {
                                       // If clicking past phase, show the last GPC of that phase
                                       const phase = PIPELINE_PHASES[phaseIndex];
                                       onGpcClick?.(phase.gpcs[phase.gpcs.length - 1].id, region.countryCode);
                                     } else {
                                       // If clicking future phase, show the first GPC of that phase
                                       const phase = PIPELINE_PHASES[phaseIndex];
                                       onGpcClick?.(phase.gpcs[0].id, region.countryCode);
                                     }
                                   }
                                 }}
                                 whileHover={{ scale: 1.1 }}
                                 whileTap={{ scale: 0.95 }}
                                 className={`
                                    relative z-10 flex items-center justify-center group/btn
                                    ${isActive ? 'cursor-pointer' : ''}
                                    cursor-pointer
                                 `}
                              >
                                 <AgentStatusIcon 
                                   state={stateToRender as AgentState} 
                                   className={col.type === 'phase' ? 'scale-125 shadow-md' : ''} 
                                 />
                              </motion.button>
                              
                              {/* Hover Tooltip for Processing State - Positioned relative to col container to escape button clipping */}
                              {isActive && region.state === 'PROCESSING' && (
                                 <div className="absolute bottom-[calc(50%+20px)] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] whitespace-nowrap px-2 py-1 rounded shadow-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none z-[100] border border-slate-700">
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                    <span className="font-semibold text-blue-300">Processing:</span> {col.name}
                                 </div>
                              )}

                               {/* SLA Timer rendering only on the active node */}
                               {isActive && region.state === 'SCHEDULED' && region.scheduleDropTime !== undefined && (
                                  <div className="absolute -top-7 whitespace-nowrap z-20 shadow-sm animate-in zoom-in duration-300">
                                     <div className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] text-slate-400 font-mono flex items-center gap-1.5 opacity-60">
                                        <Clock size={12} />
                                        T-MINUS {Math.max(0, region.scheduleDropTime - (virtualTime || 0))} HRS
                                     </div>
                                  </div>
                               )}
                          </div>
                        )
                     })}
                  </div>
                 </div>
              </div>
            )
         })}
              </div>
            </div>
       </div>
    </div>
  );
};
