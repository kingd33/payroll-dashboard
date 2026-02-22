import React from 'react';
import { CheckCircle2, Activity, AlertTriangle, ExternalLink } from 'lucide-react';
import { type RegionData } from '../types';

interface GlobalIssuesPanelProps {
  completedCount: number;
  processingCount: number;
  issueRegions: RegionData[];
  onGpcClick: (gpcId: string, regionCode: string) => void;
  openDiffView: () => void;
}

export const GlobalIssuesPanel: React.FC<GlobalIssuesPanelProps> = ({ 
  completedCount, 
  processingCount, 
  issueRegions, 
  onGpcClick, 
  openDiffView 
}) => {
  return (
    <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-6">
      {/* Stats Section */}
      <div className="flex items-center gap-6 pl-2">
        <div className="flex items-center gap-3">
           <div className="size-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-200/50">
              <CheckCircle2 size={16} />
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 leading-none">{completedCount}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="size-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200/50">
              <Activity size={16} />
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 leading-none">{processingCount}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Processing</span>
           </div>
        </div>

        <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
           <div className={`size-8 rounded-lg flex items-center justify-center border ${issueRegions.length > 0 ? 'bg-red-50 text-red-600 border-red-200/50' : 'bg-slate-50 text-slate-400 border-slate-200/50'}`}>
              <AlertTriangle size={16} />
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 leading-none">{issueRegions.length}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issues</span>
           </div>
        </div>
      </div>

      {/* Active Issues Ticker/List */}
      <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide py-1">
        {issueRegions.map(region => (
          <div key={region.id} className="flex-shrink-0 flex items-center gap-3 bg-slate-50 border border-slate-200/70 rounded-lg px-3 py-1.5 w-[240px]">
              <div className="flex flex-col w-full">
               <div className="flex items-center gap-2">
                 <span className={`size-2 shrink-0 rounded-full ${region.state === 'ERROR' ? 'bg-red-500' : region.state === 'LATE' ? 'bg-slate-400' : 'bg-amber-500'}`} />
                 <span className="font-mono text-xs font-bold text-slate-800">{region.countryCode}</span>
                 {region.issueDetails && (
                   <span className="text-[10px] font-mono text-blue-600 bg-white border border-blue-100 shadow-sm px-1.5 py-0.5 rounded leading-none">{region.issueDetails.ticketId}</span>
                 )}
                 <button 
                   onClick={() => region.state === 'ERROR' ? onGpcClick(region.currentGpcId, region.countryCode) : openDiffView()} 
                   className="ml-auto p-1 bg-white border border-slate-200 rounded text-slate-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                   title={region.state === 'ERROR' ? 'View Logs' : 'View Diff'}
                 >
                   <ExternalLink size={12} />
                 </button>
               </div>
               <span className="text-[10px] text-slate-500 truncate mt-1 w-[90%]" title={region.issueDetails?.description || 'Auto-healing in progress'}>
                 {region.state === 'LATE' ? 'Automated Reminder Sent' : (region.issueDetails?.description || 'Auto-healing intercept')}
               </span>
             </div>
          </div>
        ))}
        {issueRegions.length === 0 && (
          <span className="text-sm text-slate-400 italic font-medium ml-2">No active processing issues globally.</span>
        )}
      </div>
    </div>
  );
};
