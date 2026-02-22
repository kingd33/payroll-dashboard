import React, { useMemo, useState, useEffect } from 'react';
import { type RegionData, getSortedRegions } from '../types';
import { cn } from '../utils';
import { AgentStatusIcon } from './AgentStatusIcon';

interface CountryProcessListProps {
  regions: RegionData[];
  showOnlyAlerts?: boolean;
  onRegionClick?: (gpcId: string, regionCode: string) => void;
}

export const CountryProcessList: React.FC<CountryProcessListProps> = ({ regions, showOnlyAlerts, onRegionClick }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [frozenRegions, setFrozenRegions] = useState(regions);

  useEffect(() => {
    if (!isHovering) {
      setFrozenRegions(regions);
    }
  }, [regions, isHovering]);

  const sortedRegions = useMemo(() => {
    let sorted = getSortedRegions(frozenRegions);
    if (showOnlyAlerts) {
      sorted = sorted.filter(r => r.state === 'ERROR' || r.state === 'AUTO_HEALING' || r.state === 'LATE');
    }
    // Map frozen order to freshest underlying data
    return sorted.map(frozenR => regions.find(r => r.id === frozenR.id) || frozenR);
  }, [frozenRegions, showOnlyAlerts, regions]);

  return (
    <div 
      className="flex flex-col gap-3"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {sortedRegions.map((region) => (
        <div 
          key={region.id} 
          onClick={() => onRegionClick?.(region.currentGpcId, region.countryCode)}
          className={`flex flex-col gap-2 p-3 bg-white rounded-lg border transition-colors cursor-pointer group shadow-sm ${
            region.state === 'LATE' ? 'border-slate-300 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <span className={`text-lg font-bold w-6 ${region.state === 'LATE' ? 'text-slate-400' : 'text-slate-700'}`}>{region.countryCode}</span>
               <div className="flex flex-col">
                 <span className={`text-sm font-medium ${region.state === 'LATE' ? 'text-slate-500' : 'text-slate-900'}`}>{region.name}</span>
                 <span className={`text-[10px] uppercase tracking-wider ${region.state === 'LATE' ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                   {region.state === 'LATE' ? 'SLA BREACH' : `${region.currentGpcId} - ${region.state}`}
                 </span>
               </div>
            </div>
            <AgentStatusIcon state={region.state} />
          </div>
          
          {region.state === 'LATE' ? (
             <div className="text-[10px] font-mono text-slate-500 bg-slate-200/50 rounded px-2 py-1 mt-1 border border-slate-200 w-fit">
               Action: Automated Reminder Sent
             </div>
          ) : (
             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1 relative z-0">
               <div 
                 className={cn(
                   "h-full rounded-full transition-all duration-1000",
                   region.state === 'ERROR' ? "bg-red-500" :
                   region.state === 'AUTO_HEALING' ? "bg-amber-500" :
                   region.state === 'PASSED' ? "bg-emerald-500" :
                   region.state === 'PROCESSING' ? "bg-blue-500" : "bg-slate-200"
                 )} 
                 style={{ width: `${region.progress}%` }}
               />
             </div>
          )}
        </div>
      ))}
    </div>
  );
};
