export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
  image?: string | null;
  timestamp: Date;
}

export interface PortfolioData {
  initialCapital: number;
  monthlyInvestment: number;
  riskAppetite: 'Low' | 'Medium' | 'High';
  preferredTools: string[];
}

export enum AnalysisMode {
  STANDARD = 'Standard',
  DEEP = 'Deep Analysis',
}

// Final data structure used by the UI component, includes calculated monetary values
export interface Allocation {
  name: string;
  percentage: number;
  lumpSum: number;
  sip: number;
  metrics: string; // e.g., "1Y Return: 15%, PE Ratio: 25"
}

export interface PortfolioAnalysisResponse {
  rationale: string;
  projectedReturn: string;
  allocations: Allocation[];
}

// New types for the raw AI response, which does not contain calculated monetary values
export interface AIAllocation {
  name: string;
  percentage: number;
  metrics: string;
}

export interface AIPortfolioAnalysisResponse {
  rationale: string;
  projectedReturn: string;
  allocations: AIAllocation[];
}
