export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Converted';
export type LeadSource = 'Website' | 'LinkedIn' | 'Referral' | 'Trade Show' | 'Webinar' | 'Other';
export type LeadPriority = 'Low' | 'Medium' | 'High';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  source: LeadSource;
  status: LeadStatus;
  priority?: LeadPriority;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  score?: number;
  scoreBreakdown?: ScoreBreakdown[];
  budget?: number;
  timeline?: string;
  requirements?: string[];
  assignedTo?: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  company: string;
  source: string;
  notes?: string;
  tags: string[];
}

export interface CSVMappingField {
  csvHeader: string;
  leadField: keyof LeadFormData | null;
}

export interface CSVMapping {
  [key: string]: keyof LeadFormData | null;
}

export type ScoreOperator = 
  | 'equals' 
  | 'contains' 
  | 'greater_than' 
  | 'less_than' 
  | 'exists' 
  | 'not_exists';

export type ScoreFieldType = 
  | 'source' 
  | 'status' 
  | 'tags' 
  | 'budget' 
  | 'company' 
  | 'interactionCount' 
  | 'lastInteraction';

export interface ScoreRule {
  id: string;
  name: string;
  field: ScoreFieldType;
  operator: ScoreOperator;
  value: string | number | boolean;
  points: number;
  isActive: boolean;
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  reason: string;
}

export interface ScoringSettings {
  rules: ScoreRule[];
  minScore: number;
  maxScore: number;
  aiAssist: boolean;
}

export interface ScoringRule {
  id: string;
  name: string;
  category: string;
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: string | number | boolean;
  };
  points: number;
  active: boolean;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  description: string;
  timestamp: string;
  outcome?: string;
  nextAction?: string;
  nextActionDate?: string;
}

export interface LeadFilter {
  status?: LeadStatus[];
  source?: LeadSource[];
  priority?: LeadPriority[];
  tags?: string[];
  score?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
} 