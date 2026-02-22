import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useSimulation, type LogMessage } from '../hooks/useSimulation';
import { type RegionData, getSortedRegions } from '../types';

interface PipelineContextType {
  // Raw Data Firehose
  regions: RegionData[];
  logs: LogMessage[];
  
  // Controls
  isRunning: boolean;
  setIsRunning: (run: boolean) => void;
  
  // Shared Metrics
  sortedRegions: RegionData[];
  issueRegions: RegionData[];
  errorRegions: RegionData[];
  completedRegions: RegionData[];
  processingRegions: RegionData[];
  cycleCompletionPercentage: number;
  virtualTime: number;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // In a real application, replace useSimulation with useWebSocket or usePolling
  const { regions, logs, isRunning, setIsRunning, virtualTime } = useSimulation();

  // Compute metrics globally so they don't recalculate per component render
  const metrics = useMemo(() => {
    const sorted = getSortedRegions(regions);
    const issues = sorted.filter(r => r.state === 'ERROR' || r.state === 'AUTO_HEALING' || r.state === 'LATE');
    const errors = issues.filter(r => r.state === 'ERROR');
    const completed = sorted.filter(r => r.state === 'PASSED');
    const processing = sorted.filter(r => r.state === 'PROCESSING');
    const percentage = Math.round((completed.length / Math.max(regions.length, 1)) * 100);

    return {
      sortedRegions: sorted,
      issueRegions: issues,
      errorRegions: errors,
      completedRegions: completed,
      processingRegions: processing,
      cycleCompletionPercentage: percentage
    };
  }, [regions]);

  const value = {
    regions,
    logs,
    isRunning,
    setIsRunning,
    virtualTime,
    ...metrics
  };

  return (
    <PipelineContext.Provider value={value}>
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};
