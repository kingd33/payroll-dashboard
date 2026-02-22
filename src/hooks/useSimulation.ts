import { useState, useEffect, useCallback } from 'react';
import { type RegionData, PIPELINE_PHASES } from '../types';

const ALL_GPCS = PIPELINE_PHASES.flatMap(p => p.gpcs);

export interface LogMessage {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SYSTEM' | 'ERROR' | 'AUTO_HEALING' | 'PASSED' | 'PROCESSING' | 'SCHEDULED' | 'LATE';
  message: string;
  gpcId?: string;
  regionCode?: string;
}

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const useSimulation = () => {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([{
    id: 'init-log-0',
    timestamp: new Date().toISOString().split('T')[1].split('.')[0],
    type: 'SYSTEM',
    message: 'Initializing 21-Gate Global Payroll Controls Virtual Simulation Engine...'
  }]);
  const [isRunning, setIsRunning] = useState(true);
  const [virtualTime, setVirtualTime] = useState(-1); // Start at -1 to allow initial load before tick 0

  // Asynchronously load the schedule data
  useEffect(() => {
    fetch('/demo-schedule.json')
      .then(res => res.json())
      .then((data: any[]) => {
        const loadedRegions: RegionData[] = data.map(r => ({
          ...r,
          progress: 0,
          currentPhaseId: 'PHASE0',
          currentGpcId: 'PRE',
          scheduleDropTime: parseInt(r.scheduleDropTime, 10)
        }));
        setRegions(loadedRegions);
        setVirtualTime(0); // Start clock
        addLog('SYSTEM', 'Loaded external schedule manifest. Virtual Clock engaged.');
      })
      .catch(err => console.error("Failed to load demo schedule", err));
  }, []);

  const addLog = useCallback((type: LogMessage['type'], message: string, regionCode?: string, gpcId?: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => {
      const newLog = { id: Math.random().toString(36).substring(7), timestamp, type, message, regionCode, gpcId };
      return [newLog, ...prev].slice(0, 50); // Keep last 50 logs
    });
  }, []);

  useEffect(() => {
    if (!isRunning || virtualTime < 0) return;

    const interval = setInterval(() => {
      setVirtualTime(prev => prev + 1);

      setRegions(prevRegions => {
        return prevRegions.map(region => {
          // If ERROR, 10% chance to stay error, otherwise it might just stay error. Actually, errors require manual intervention usually, but let's have them auto-heal occasionally so the simulation doesn't stall.
          // Or let's just make regions in PASSED state stay PASSED.
          if (region.state === 'PASSED') {
             // 5% chance to restart a new cycle if passed for a long time?
             if (Math.random() < 0.05) {
                addLog('SYSTEM', `${region.countryCode} cycle restarted. Data ingestion initiating.`, region.countryCode, 'PRE');
                return { ...region, progress: 0, state: 'PROCESSING', currentPhaseId: 'PHASE0', currentGpcId: 'PRE', issueDetails: undefined };
             }
             return region;
          }

          if (region.state === 'ERROR') {
             // Let it stay in error for a bit, then maybe transition to AUTO_HEALING
             if (Math.random() < 0.2) {
                addLog('AUTO_HEALING', `${region.countryCode} ${region.currentGpcId} attempting automated recovery from critical failure...`, region.countryCode, region.currentGpcId);
                return { ...region, state: 'AUTO_HEALING', issueDetails: { ticketId: region.issueDetails?.ticketId || 'INC-REC', description: 'Automated recovery protocol initiated.' } };
             }
             return region;
          }

          if (region.state === 'AUTO_HEALING') {
             // Let it heal and resume
             if (Math.random() < 0.4) {
                addLog('PASSED', `${region.countryCode} auto-healing successful. Resuming ${region.currentGpcId} evaluation.`, region.countryCode, region.currentGpcId);
                return { ...region, state: 'PROCESSING', issueDetails: undefined };
             }
             return region;
          }

          if (region.state === 'IDLE') {
             if (Math.random() < 0.3) {
                addLog('PROCESSING', `${region.countryCode} entering main processing queue for ${region.currentGpcId}...`, region.countryCode, region.currentGpcId);
                return { ...region, state: 'PROCESSING' };
             }
             return region;
          }

          if (region.state === 'SCHEDULED' && region.scheduleDropTime !== undefined) {
             // Wake up the pipeline when the virtual clock hits the scheduled time
             if (virtualTime >= region.scheduleDropTime) {
                if (Math.random() < 0.1) {
                   addLog('LATE', `[VT ${virtualTime}] ${region.countryCode} missed SLA drop window. Tagging as LATE. Automated Reminder Sent.`, region.countryCode);
                   return { ...region, state: 'LATE', issueDetails: { ticketId: 'SLA-BREACH', description: 'Automated Reminder Sent' } };
                } else {
                   addLog('PROCESSING', `[VT ${virtualTime}] ${region.countryCode} scheduled payload arrived at virtual hour ${virtualTime}. Entering main processing queue...`, region.countryCode, region.currentGpcId);
                   return { ...region, state: 'PROCESSING' };
                }
             }
             return region;
          }

          if (region.state === 'LATE') {
             // Let it stay late for a bit, then eventually receive the file
             if (Math.random() < 0.1) {
                addLog('PROCESSING', `${region.countryCode} delayed payload received. Initiating processing for ${region.currentGpcId}...`, region.countryCode, region.currentGpcId);
                return { ...region, state: 'PROCESSING', issueDetails: undefined };
             }
             return region;
          }

          // State is PROCESSING
          const newProgress = region.progress + getRandomInt(5, 25);
          
          // Random chance for an issue
          if (Math.random() < 0.05 && region.currentGpcId !== 'PRE') {
             const isCritical = Math.random() < 0.4;
             if (isCritical) {
                const ticketId = `INC${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
                addLog('ERROR', `${region.countryCode} ${region.currentGpcId} validation failed. System halted! Generating ticket ${ticketId}`, region.countryCode, region.currentGpcId);
                return { 
                   ...region, 
                   state: 'ERROR', 
                   issueDetails: { ticketId, description: `Rule validation failure detected by issuehandleragent at ${region.currentGpcId}` } 
                };
             } else {
                addLog('AUTO_HEALING', `${region.countryCode} ${region.currentGpcId} detected minor anomaly. Intercepting for auto-resolution...`, region.countryCode, region.currentGpcId);
                return { 
                   ...region, 
                   state: 'AUTO_HEALING', 
                   issueDetails: { ticketId: `TASK${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, description: 'Formatting mismatch intercepted.' } 
                };
             }
          }

          if (newProgress >= 100) {
             // Move to next GPC
             const currentIndex = ALL_GPCS.findIndex(g => g.id === region.currentGpcId);
             if (currentIndex >= 0 && currentIndex < ALL_GPCS.length - 1) {
                const nextGpc = ALL_GPCS[currentIndex + 1];
                const nextPhaseId = nextGpc.phaseId;
                addLog('PASSED', `${region.countryCode} completed ${region.currentGpcId}. Progressing to ${nextGpc.id}.`, region.countryCode, nextGpc.id);
                return { ...region, progress: 0, currentGpcId: nextGpc.id, currentPhaseId: nextPhaseId, state: 'PROCESSING' };
             } else {
                addLog('PASSED', `${region.countryCode} Pipeline Complete! Final payload dispatched successfully.`, region.countryCode);
                return { ...region, progress: 100, state: 'PASSED' };
             }
          }

          return { ...region, progress: newProgress };
        });
      });
    }, 1000); // Tick every 1 second = 1 virtual hour

    return () => clearInterval(interval);
  }, [isRunning, addLog, virtualTime]);

  return {
    regions,
    logs,
    isRunning,
    setIsRunning,
    virtualTime
  };
};
