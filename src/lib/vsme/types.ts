// src/lib/vsme/types.ts
export type ItemStatus = 'not_started' | 'partial' | 'ready';

export type VsmeField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'file' | 'textarea';
  required?: boolean;
  options?: string[];
};

export type VsmeItem = {
  code: string;           // nt "B1-1"
  title: string;
  description?: string;
  level?: 'basic' | 'comprehensive';
  fields: VsmeField[];
};

export type VsmeSection = {
  code: string;           // nt "B1"
  title: string;
  items: VsmeItem[];
};

export type VsmeBundle = {
  sections: VsmeSection[];
};

export type LoadResponse = {
  item: {
    code: string;
    status: ItemStatus;
    values?: Record<string, any>;
  };
  schema: VsmeItem;
  evidence: Array<{
    id: string;
    kind: 'file' | 'url';
    path_or_url: string;
    tags?: string[];
  }>;
  audit: Array<{
    id: string;
    action: string;
    actor_id: string;
    ts: string;
  }>;
  sectionStats?: {
    completed: number;
    total: number;
  };
};
