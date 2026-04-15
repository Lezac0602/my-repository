export type NavItem = "Home" | "Chat" | "Recent Questions" | "Saved Queries" | "Settings";

export type AnswerMode = "concise" | "detailed";
export type ThemeMode = "light" | "dark";
export type LanguageMode = "en" | "zh";
export type HandbookModel = "gpt-5.4" | "gpt-5.4-mini" | "gpt-5.4-nano";

export type ChatRole = "user" | "assistant";

export type HandbookResponseStatus = "ok" | "no_handbook_source" | "error";

export interface SourceLink {
  title: string;
  url: string;
}

export interface HandbookChatTurn {
  role: ChatRole;
  content: string;
}

export interface HandbookApiRequest {
  question: string;
  history: HandbookChatTurn[];
  mode: AnswerMode;
  model: HandbookModel;
  previousResponseId?: string;
}

export interface HandbookApiResponse {
  answer: string;
  bullets: string[];
  caution: string;
  citations: SourceLink[];
  sourcePages: SourceLink[];
  previousResponseId?: string;
  status: HandbookResponseStatus;
  message?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  response?: HandbookApiResponse;
}

export interface RecentConversation {
  id: string;
  title: string;
  question: string;
  timestamp: string;
  messages: ChatMessage[];
  previousResponseId?: string;
  model?: HandbookModel;
}

export interface QuickAction {
  title: string;
  description: string;
  prompt: string;
}

export interface MockStudent {
  name: string;
  programme: string;
  year: string;
  studentId: string;
}
