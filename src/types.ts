export type AgentState = 'SCHEDULED' | 'LATE' | 'IDLE' | 'PROCESSING' | 'AUTO_HEALING' | 'ERROR' | 'PASSED';

export interface GPC {
  id: string; // e.g., 'GPC1'
  name: string;
  phaseId: string;
}

export interface Phase {
  id: string;
  name: string;
  shortName: string; // For macro view
  gpcs: GPC[];
}

export const GPC_DEFINITIONS: GPC[] = [
  // Phase 1: Pre-payroll Processing Controls
  { id: 'GPC1', name: 'Schema Match', phaseId: 'PHASE1' },
  { id: 'GPC2', name: 'Character Encoding', phaseId: 'PHASE1' },
  { id: 'GPC3', name: 'Date Formats', phaseId: 'PHASE1' },
  
  // Phase 2: Payroll Processing Controls
  { id: 'GPC4', name: 'Required Fields', phaseId: 'PHASE2' },
  { id: 'GPC5', name: 'Currency Validation', phaseId: 'PHASE2' },
  { id: 'GPC6', name: 'Gross-to-Net Variance', phaseId: 'PHASE2' },
  { id: 'GPC7', name: 'Social Charge Thresholds', phaseId: 'PHASE2' },
  { id: 'GPC8', name: 'Tax Bracket Alignment', phaseId: 'PHASE2' },
  { id: 'GPC9', name: 'Aggregation Check', phaseId: 'PHASE2' },
  { id: 'GPC10', name: 'Pension Contributions', phaseId: 'PHASE2' },
  { id: 'GPC11', name: 'Benefit Deductions', phaseId: 'PHASE2' },
  
  // Phase 3: Post-payroll Processing Controls
  { id: 'GPC12', name: 'Bonus Caps', phaseId: 'PHASE3' },
  { id: 'GPC13', name: 'Employee ID Matching', phaseId: 'PHASE3' },
  { id: 'GPC14', name: 'New Joiner Validation', phaseId: 'PHASE3' },
  { id: 'GPC15', name: 'Leaver Reconciliation', phaseId: 'PHASE3' },
  { id: 'GPC16', name: 'Bank Account Format', phaseId: 'PHASE3' },
  { id: 'GPC17', name: 'Duplicate Payment Check', phaseId: 'PHASE3' },
  { id: 'GPC18', name: 'Cost Center Mapping', phaseId: 'PHASE3' },
  { id: 'GPC19', name: 'Historical Trend Check', phaseId: 'PHASE3' },
  { id: 'GPC20', name: 'Multi-Country Dedupe', phaseId: 'PHASE3' },
  { id: 'GPC21', name: 'Final Sign-off', phaseId: 'PHASE3' },
];

export const PIPELINE_PHASES: Phase[] = [
  { 
    id: 'PHASE0', 
    name: 'Precondition Data Transformation', 
    shortName: 'Precondition',
    gpcs: [{ id: 'PRE', name: 'Airflow/Python ETL', phaseId: 'PHASE0' }] 
  },
  { 
    id: 'PHASE1', 
    name: 'Pre-payroll Processing Controls', 
    shortName: 'Pre-payroll',
    gpcs: GPC_DEFINITIONS.filter(g => g.phaseId === 'PHASE1') 
  },
  { 
    id: 'PHASE2', 
    name: 'Payroll Processing Controls', 
    shortName: 'Payroll',
    gpcs: GPC_DEFINITIONS.filter(g => g.phaseId === 'PHASE2') 
  },
  { 
    id: 'PHASE3', 
    name: 'Post-payroll Processing Controls', 
    shortName: 'Post-payroll',
    gpcs: GPC_DEFINITIONS.filter(g => g.phaseId === 'PHASE3') 
  }
];

export interface IssueDetails {
  ticketId: string;
  description: string;
}

export interface RegionData {
  id: string;
  countryCode: string;
  name: string;
  progress: number;
  currentPhaseId: string;
  currentGpcId: string;
  state: AgentState;
  issueDetails?: IssueDetails;
  scheduleDropTime?: number; // Virtual hours until drop
}

export const getSortedRegions = (regions: RegionData[]) => {
  const priorityOrder: Record<AgentState, number> = { ERROR: 0, AUTO_HEALING: 1, LATE: 2, PROCESSING: 3, SCHEDULED: 4, IDLE: 5, PASSED: 6 };
  return [...regions].sort((a, b) => priorityOrder[a.state] - priorityOrder[b.state]);
};
