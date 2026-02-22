# Global Payroll Orchestrator Dashboard

This project is a React-based frontend dashboard designed to monitor and visualize a complex 21-Gate Global Payroll Controls pipeline. 

It provides real-time visualization of concurrent processing lanes across multiple geographic regions, bubbling up processing bottlenecks, SLA breaches, and auto-healing intercepts.

## Architecture & State Management

The frontend has been designed with a decoupled architecture to ensure that the UI components are completely isolated from the data sourcing logic. 

**All pipeline logic, data sorting, and metric computation is centralized within the `PipelineContext`.**

The application uses a Context API provider (`src/context/PipelineContext.tsx`) to distribute global state down to pure display components (`<ConcurrentLanes />`, `<GlobalIssuesPanel />`, etc.).

### Current State: The Mock Engine
By default, the application runs on a mock telemetry engine called `useSimulation.ts`. This engine generates dummy localized regions, assigns them to random stages of the 21-GPC pipeline, and occasionally triggers artificial `[ERROR]` or `[AUTO-HEALING]` events to demonstrate the dashboard's capabilities. 

## Wiring up a Real Backend

To integrate this dashboard with your actual Production Backend (e.g., an Airflow Orchestrator, a Kafka event stream, or a REST API polling service), follow these steps:

### 1. Match the Interface Types
Ensure your backend payload can be mapped to the `RegionData` and `LogMessage` interfaces defined in `src/types.ts` and `src/hooks/useSimulation.ts`.

Key interfaces you must satisfy:
```typescript
interface RegionData {
  id: string;
  countryCode: string;
  name: string;
  progress: number;
  currentPhaseId: string;
  currentGpcId: string;
  state: 'SCHEDULED' | 'LATE' | 'IDLE' | 'PROCESSING' | 'AUTO_HEALING' | 'ERROR' | 'PASSED';
  issueDetails?: {
    ticketId: string;
    description: string;
  };
  dueDate?: string; 
}
```

### 2. Create your API Hook
Create a new file (e.g., `src/hooks/useBackendData.ts`). This hook should handle the WebSocket connection or polling logic, returning exactly the same signature as the current simulation engine:

```typescript
// Example: src/hooks/useBackendData.ts
import { useState, useEffect } from 'react';
import { type RegionData, type LogMessage } from '../types';

export const useBackendData = () => {
    const [regions, setRegions] = useState<RegionData[]>([]);
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
       // Establish WebSocket connection here
       // Update 'regions' and 'logs' states as messages arrive
    }, []);

    return { regions, logs, isRunning, setIsRunning };
}
```

### 3. Swap the Engine in `PipelineContext.tsx`
Once your data-fetching hook is ready, simply swap it into the Global Context Provider. The UI components will never know the difference.

Open `src/context/PipelineContext.tsx`:

```diff
- import { useSimulation } from '../hooks/useSimulation';
+ import { useBackendData } from '../hooks/useBackendData';

  export const PipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
-   const { regions, logs, isRunning, setIsRunning } = useSimulation();
+   const { regions, logs, isRunning, setIsRunning } = useBackendData();

    // ... memoized metric computations (leave these alone)

    return (
      <PipelineContext.Provider value={value}>
        {children}
      </PipelineContext.Provider>
    );
  };
```

That's it! Because the context provider automatically pre-calculates the `issueRegions`, `cycleCompletionPercentage`, and `sortedRegions`, swapping the root hook immediately fuels the entire dashboard with your live production data.

### 4. Wire the Action Triggers
If you want the dashboard buttons (like bypassing an error or approving a diff) to send mutations back to the backend, add an action dispatcher to your hook:

1. Add a `resumePipeline(regionCode, gpcId)` method to your `useBackendData` hook.
2. Export it from the `PipelineContext` return value.
3. Call `resumePipeline` globally from the "Approve Fix" buttons inside `<DiffView />`.

## Directory Structure
Here is a breakdown of the repository to help you navigate the codebase:

```text
src/
├── App.tsx                     # Main layout shell (Grid positioning for all components)
├── main.tsx                    # React entrypoint; wraps App in <PipelineProvider>
├── types.ts                    # Crucial! Defines all Typescript interfaces (RegionData, Logs, Phases, etc.)
├── utils.ts                    # Utility helper functions 
│
├── context/
│   └── PipelineContext.tsx     # The architectural brain. Merges backend data into a global context API 
│                               # and pre-calculates expensive dashboard metrics (Completion %, Issue Regions).
│
├── hooks/
│   └── useSimulation.ts        # The Virtual Engine powering the demo mode. It fetches `public/demo-schedule.json` 
│                               # and acts as a fake backend. Swap this out for your real API hook.
│
├── components/                 # Pure display components that consume the PipelineContext
│   ├── Header.tsx              # Top navigation bar & Virtual Clock display
│   ├── GlobalProgressBar.tsx   # Top overall cycle completion progress bar
│   ├── GlobalIssuesPanel.tsx   # Top left ticket count & active issues ticker
│   ├── LiveLogPanel.tsx        # Bottom left real-time orchestrator log output
│   ├── CountryProcessList.tsx  # Right Sidebar listing 21 global regions & their individual statuses
│   ├── ConcurrentLanes.tsx     # THE CORE VISUAL: The massive middle grid rendering Phases & GPCs
│   │
│   ├── AgentStatusIcon.tsx     # Renders the pulsing/beating icons depending on AgentState (Error, Auto-healing)
│   ├── GpcDetailsModal.tsx     # Slide-over modal showing details when you click a Region's active phase node
│   └── DiffView.tsx            # Fullscreen modal displaying the "Before vs After" JSON payload difference
```
