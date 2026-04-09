export type NavItem = "Chat" | "Knowledge Base" | "Recent Questions" | "Saved Queries" | "Settings";

export type DocumentCategory =
  | "Academic Regulations"
  | "Programme Handbook"
  | "Course Syllabus"
  | "Graduation Requirements"
  | "Deadlines"
  | "FAQ";

export type DocumentType = "Policy" | "Handbook" | "Subject Description" | "FAQ" | "Timeline";

export type AnswerMode = "concise" | "detailed";

export type QueryIntent = "policy" | "course" | "deadline" | "graduation" | "compliance";

export type PipelineStepStatus = "pending" | "active" | "complete" | "failed";

export interface DocumentRecord {
  id: string;
  title: string;
  type: DocumentType;
  category: DocumentCategory;
  updatedAt: string;
  coverage: number;
  isTopReferenced: boolean;
}

export interface ChunkRecord {
  id: string;
  documentId: string;
  sectionLabel: string;
  pageLabel: string;
  preview: string;
  fullText: string;
  keywords: string[];
  relevance: number;
}

export interface AnswerVariant {
  mode: AnswerMode;
  summary: string;
  bullets: string[];
  caution: string;
  citations: string[];
  reliability: "High" | "Medium" | "Low";
}

export interface PipelineStep {
  id: string;
  label: string;
  description: string;
}

export interface MockQueryScenario {
  id: string;
  question: string;
  intent: QueryIntent;
  scope: string;
  keywords: string[];
  pipeline: PipelineStep[];
  evidenceChunkIds: string[];
  answers: {
    concise: AnswerVariant[];
    detailed: AnswerVariant[];
  };
  noResults?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  timestamp: string;
  scenarioId?: string;
  variantIndex?: number;
}

export interface ConversationPreset {
  id: string;
  title: string;
  subtitle: string;
  scenarioId: string;
  messages: ChatMessage[];
}
