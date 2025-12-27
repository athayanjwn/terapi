export type SAOption = {
  id: string;
  question_id: string;
  order_no: number;
  label: string;
  value: number;
};

export type SAQuestion = {
  id: string;
  order_no: number;
  question: string;
  dimension: string;
  reverse_scored: boolean;
  options: SAOption[];
};

export type SARule = {
  dimension: string;
  min_score: number;
  max_score: number;
  level: string;
  summary: string;
  recommend_tags: string[];
};

export type SAAssessmentListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

export type SAAssessmentDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  is_published: boolean;
  questions: SAQuestion[];
  rules: SARule[];
};

export type KonselorReco = {
  id: string;
  nama_konselor: string;
  spesialisasi: string[];
  foto_profil?: string | null;
  deskripsi?: string | null;
  match_score?: number;
};

export type SubmitAnswer = {
  question_id: string;
  option_id: string;
};

export type SubmitResponse = {
  assessment: { id: string; slug: string; title: string };
  scores: Record<string, number>;
  result: Record<string, { level: string; summary: string; score: number }>;
  recommend_tags: string[];
  recommended_konselor: KonselorReco[];
  persisted: boolean;
  attempt_id?: string;
};
