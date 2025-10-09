// src/lib/cdm/types.ts
export type CDMItem = {
  code: string;
  title?: string;
};

export type CDMSection = {
  code: string;
  title?: string;
  items: CDMItem[];
};

export type CDMBundle = {
  sections: CDMSection[];
};

export type RecordStatus = 'draft' | 'final';

export type ProgressSummary = {
  ok: true;
  project: string;
  scope: 'all' | string; // 'all' või sektsiooni kood
  total: number;
  final: number;
  draft: number;
  not_started: number;
  updated_at: string;
};

export type Evidence = {
  id: string;
  project_id: string;
  code: string;
  kind: 'file' | 'url';
  path_or_url: string;
  tags?: string[];
  created_at: string;
};
