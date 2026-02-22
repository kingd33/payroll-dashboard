import { useState } from 'react';
import { CountryProcessList } from './components/CountryProcessList';
import { ConcurrentLanes } from './components/ConcurrentLanes';
import { GpcDetailsModal } from './components/GpcDetailsModal';
import { DiffView } from './components/DiffView';
import { Header } from './components/Header';
import { GlobalProgressBar } from './components/GlobalProgressBar';
import { GlobalIssuesPanel } from './components/GlobalIssuesPanel';
import { LiveLogPanel } from './components/LiveLogPanel';
import { usePipeline } from './context/PipelineContext';

function App() {
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const [selectedGpcId, setSelectedGpcId] = useState<string | undefined>(undefined);
  const [showOnlyAlerts, setShowOnlyAlerts] = useState(false);

  const { 
    regions, 
    logs, 
    isRunning, 
    setIsRunning,
    issueRegions, 
    completedRegions, 
    processingRegions, 
    cycleCompletionPercentage 
  } = usePipeline();

  const handleGpcClick = (gpcId: string, regionCode: string) => {
    setSelectedRegion(regionCode);
    setSelectedGpcId(gpcId);
    
    // Find the specific region
    const region = regions.find(r => r.countryCode === regionCode);
    const isAutoHealing = region?.state === 'AUTO_HEALING' && region.currentGpcId === gpcId;

    if (isAutoHealing || gpcId === 'GPC2') {
       setIsDiffOpen(true);
    } else {
       setIsMatrixOpen(true);
    }
  };

  const openDiffView = () => setIsDiffOpen(true);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50" style={{ overflowAnchor: 'none' }}>
      <Header />
      <GlobalProgressBar cycleCompletionPercentage={cycleCompletionPercentage} />
      
      {/* Main Content Area */}
      <main className="flex-1 p-6 gap-6 grid grid-cols-[300px_minmax(0,1fr)] relative z-10 min-h-0">
        
        <GlobalIssuesPanel 
          completedCount={completedRegions.length}
          processingCount={processingRegions.length}
          issueRegions={issueRegions}
          onGpcClick={handleGpcClick}
          openDiffView={openDiffView}
        />

        <aside className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 p-5 flex flex-col gap-6 shadow-xl">
          <header className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Regions</h2>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">Live</span>
          </header>
          
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <CountryProcessList regions={regions} showOnlyAlerts={showOnlyAlerts} onRegionClick={handleGpcClick} />
          </div>
        </aside>
        
        <div className="flex flex-col gap-6 min-w-0">
          
          <LiveLogPanel 
            logs={logs}
            isRunning={isRunning}
            onToggleRun={() => setIsRunning(!isRunning)}
            onGpcClick={handleGpcClick}
          />

          {/* Concurrent Lanes */}
          <section className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 flex flex-col relative shadow-xl flex-1">
            <header className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
               <div className="flex flex-col gap-1">
                 <h2 className="text-xl font-medium text-slate-900 tracking-tight">Control Concurrent Lanes</h2>
                 <p className="text-sm text-slate-500">21-Gate Global Payroll Controls Flow</p>
               </div>
             <div className="flex items-center gap-2 text-sm text-slate-600 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setShowOnlyAlerts(false)}
                  className={`px-3 py-1 font-medium rounded-md transition-colors ${!showOnlyAlerts ? 'text-slate-900 bg-slate-100 shadow-sm' : 'hover:text-slate-900'}`}
                >
                  Global Pipeline
                </button>
                <button 
                  onClick={() => setShowOnlyAlerts(true)}
                  className={`px-2 py-1 font-medium rounded-md transition-colors flex items-center gap-1.5 ${showOnlyAlerts ? 'text-red-700 bg-red-50 shadow-sm' : 'hover:text-slate-900'}`}
                >
                  Alerts
                  <span className={`px-1.5 py-0.5 rounded text-[10px] leading-none ${showOnlyAlerts ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-600'}`}>
                    {issueRegions.length}
                  </span>
                </button>
             </div>
          </header>
          
          <div className="flex-1 relative p-6 bg-gradient-to-b from-transparent to-slate-50/50">
            <ConcurrentLanes regions={regions} onGpcClick={handleGpcClick} showOnlyAlerts={showOnlyAlerts} />
          </div>
        </section>
        </div>
      </main>

      {/* Modals */}
      <GpcDetailsModal 
        isOpen={isMatrixOpen} 
        onClose={() => setIsMatrixOpen(false)} 
        gpcId={selectedGpcId}
        regionCode={selectedRegion}
        regionData={selectedRegion ? regions.find(r => r.countryCode === selectedRegion) : undefined}
      />

      <DiffView
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        gateId={selectedGpcId}
        regionCode={selectedRegion}
      />
    </div>
  );
}

export default App;
