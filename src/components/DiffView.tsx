import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

interface DiffViewProps {
  isOpen: boolean;
  onClose: () => void;
  gateId?: string;
  regionCode?: string;
}

export const DiffView: React.FC<DiffViewProps> = ({ isOpen, onClose, gateId = 'C1', regionCode = 'FR' }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white border border-amber-200 rounded-2xl shadow-[0_0_50px_-12px_rgba(245,158,11,0.2)] overflow-hidden w-full max-w-5xl flex flex-col"
        >
           <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-amber-50">
              <div className="flex items-center gap-3">
                 <div className="size-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                   <ArrowRight size={14} />
                 </div>
                 <h2 className="text-lg font-medium text-slate-900">Auto-Healing Intercept</h2>
                 <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-600 border border-amber-500/30">
                   {regionCode} - {gateId}
                 </span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-900"
              >
                <X size={20} />
              </button>
           </div>
           
           <div className="flex h-[400px]">
              {/* Left Side: Raw Data */}
              <div className="flex-1 flex flex-col border-r border-slate-200">
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Raw Data (Vendor File)
                </div>
                <div className="flex-1 p-4 font-mono text-sm overflow-auto text-slate-700 bg-white">
<pre className="whitespace-pre-wrap">
{`{
  "employeeId": "EMP-4921",
  "name": "Jean Dupont",
  "grossPay": "4500,00",
  "taxCode": null,
  "currency": "EUR"
}`}
</pre>
                </div>
              </div>

              {/* Right Side: Corrected Data */}
              <div className="flex-1 flex flex-col">
                <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Agent-Corrected Data</span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Re-mapped</span>
                </div>
                <div className="flex-1 p-4 font-mono text-sm overflow-auto bg-white text-slate-700">
<pre className="whitespace-pre-wrap">
{`{
  "employeeId": "EMP-4921",
  "name": "Jean Dupont",
  "grossPay": `}<span className="bg-amber-100 text-amber-700 px-1 rounded">"4500.00"</span>{`,
  "taxCode": `}<span className="bg-amber-100 text-amber-700 px-1 rounded">"DEFAULT_FR"</span>{`,
  "currency": "EUR"
}`}
</pre>
                </div>
              </div>
           </div>

           <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
             <div className="text-sm text-slate-500">
               <span className="font-semibold text-slate-900">Agent Insight:</span> Found comma-separated decimal in grossPay. Null taxCode auto-resolved via Country Master Data.
             </div>
             <div className="flex items-center gap-3">
               <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" onClick={onClose}>
                 Discard
               </button>
               <button className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition-colors shadow-lg shadow-amber-500/20" onClick={onClose}>
                 Approve Fix & Continue
               </button>
             </div>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
