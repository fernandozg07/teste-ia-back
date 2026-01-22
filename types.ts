
export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  analysisResult?: AnalysisResult;
  groundingUrls?: GroundingUrl[];
}

export interface FileAttachment {
  name: string;
  type: string;
  mimeType: string;
  data: string; // Base64 for binary or raw text for text files
}

export interface GroundingUrl {
  uri: string;
  title: string;
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
}

export interface AnalysisResult {
  summary: string;
  metrics: {
    label: string;
    value: string | number;
    change?: number;
    isPositive?: boolean;
  }[];
  charts: {
    type: 'bar' | 'line' | 'pie' | 'funnel';
    title: string;
    data: any[];
    keys: string[];
  }[];
  insights: {
    type: 'critical' | 'positive' | 'neutral';
    text: string;
  }[];
  recommendations: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
}
