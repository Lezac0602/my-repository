import { HandbookModel, MockStudent, QuickAction } from "../types";

export const navigationItems = ["Home", "Chat", "Recent Questions", "Saved Queries", "Settings"] as const;

export const handbookRootUrl = "https://www.polyu.edu.hk/gs/rpghandbook/";

export const suggestedQuestions = [
  "Summarize the admission requirements for research postgraduate applicants.",
  "What are the progress monitoring requirements for RPg students?",
  "What does the handbook say about thesis submission and examination?",
  "What are the attendance and residency expectations for full-time RPg students?",
  "What are the procedures for leave of absence or study suspension?",
];

export const exampleChips = [
  "Admission requirements",
  "Progress reports",
  "Thesis examination",
  "Leave of absence",
];

export const quickActions: QuickAction[] = [
  {
    title: "Admission Requirements",
    description: "Search the RPg Handbook for entry requirements, application expectations, and supporting rules.",
    prompt: "Summarize the admission requirements for research postgraduate applicants.",
  },
  {
    title: "Progress Monitoring",
    description: "Ask about progress reports, annual reviews, and continuation requirements for RPg study.",
    prompt: "What are the progress monitoring requirements for RPg students?",
  },
  {
    title: "Thesis Submission",
    description: "Review handbook guidance on thesis preparation, submission, examination, and related milestones.",
    prompt: "What does the handbook say about thesis submission and examination?",
  },
  {
    title: "Leave and Suspension",
    description: "Check the handbook rules on leave of absence, suspension, and related procedural conditions.",
    prompt: "What are the procedures for leave of absence or study suspension?",
  },
];

export const savedQueries = [
  "What does the handbook say about confirmation of candidature?",
  "How is thesis examination arranged for RPg students?",
  "What are the attendance expectations for full-time students?",
];

export const handbookPolicies = [
  "Handbook-only answers",
  "Live web search",
  "Clickable citations",
];

export const handbookModelOptions: Array<{
  value: HandbookModel;
  label: string;
  description: string;
}> = [
  {
    value: "gpt-5.4",
    label: "GPT-5.4",
    description: "Best overall reasoning quality for handbook questions.",
  },
  {
    value: "gpt-5.4-mini",
    label: "GPT-5.4 mini",
    description: "Faster and cheaper while still supporting web search.",
  },
  {
    value: "gpt-5.4-nano",
    label: "GPT-5.4 nano",
    description: "Fastest lightweight option for simple handbook lookups.",
  },
];

export const mockStudent: MockStudent = {
  name: "Annie Chan",
  programme: "MPhil / PhD Applicant Demo",
  year: "Graduate School",
  studentId: "RPG240123",
};
