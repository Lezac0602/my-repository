import {
  Bookmark,
  CircleHelp,
  Cog,
  GraduationCap,
  History,
  House,
  MessageSquareText,
  Sparkles,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { mockStudent, navigationItems } from "../../data/mockRag";
import { NavItem, RecentConversation } from "../../types";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface SidebarProps {
  activeNav: NavItem;
  recentConversations: RecentConversation[];
  savedQueries: string[];
  suggestedQuestions: string[];
  apiConfigured: boolean;
  onNavChange: (item: NavItem) => void;
  onSuggestedQuestion: (question: string) => void;
  onRecentQuestionSelect: (conversationId: string) => void;
  onSavedQuerySelect: (question: string) => void;
}

const navIcons = {
  Home: House,
  Chat: MessageSquareText,
  "Recent Questions": History,
  "Saved Queries": Bookmark,
  Settings: Cog,
} satisfies Record<NavItem, typeof MessageSquareText>;

export function Sidebar({
  activeNav,
  recentConversations,
  savedQueries,
  suggestedQuestions,
  apiConfigured,
  onNavChange,
  onSuggestedQuestion,
  onRecentQuestionSelect,
  onSavedQuerySelect,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="rounded-[2rem] p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary px-3 py-3 text-white shadow-soft">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl leading-tight text-slate-900">
              PolyU Campus Academic Assistant
            </h1>
            <p className="mt-1 text-sm text-slate-500">Live RPg handbook support</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge tone={apiConfigured ? "success" : "warning"}>
            {apiConfigured ? (
              <>
                <Wifi size={12} />
                Live search enabled
              </>
            ) : (
              <>
                <WifiOff size={12} />
                Backend setup needed
              </>
            )}
          </Badge>
          <Badge tone="primary">Live campus assistant</Badge>
        </div>

        <div className="mt-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = navIcons[item];
            return (
              <button
                key={item}
                type="button"
                onClick={() => onNavChange(item)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition",
                  activeNav === item ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white/80",
                )}
              >
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <Icon size={18} />
                  {item}
                </span>
                {activeNav === item ? <Sparkles size={16} /> : null}
              </button>
            );
          })}
        </div>
      </Card>

      <Card muted className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <CircleHelp size={16} className="text-primary" />
          <h2 className="section-title">Suggested Questions</h2>
        </div>
        <div className="space-y-2">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onSuggestedQuestion(question)}
              className="w-full rounded-2xl bg-white/85 px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:bg-white"
            >
              {question}
            </button>
          ))}
        </div>
      </Card>

      <Card muted className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <History size={16} className="text-primary" />
          <h2 className="section-title">Recent Questions</h2>
        </div>
        <div className="space-y-2">
          {(recentConversations.length
            ? recentConversations
            : [
                {
                  id: "empty",
                  title: "No live questions yet",
                  question: "Start a new chat to build a recent list.",
                  timestamp: "",
                  messages: [],
                },
              ]).map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => recentConversations.length && onRecentQuestionSelect(conversation.id)}
              className="w-full rounded-2xl border border-transparent bg-white/75 px-4 py-3 text-left transition hover:border-slate-200 hover:bg-white disabled:cursor-default"
              disabled={!recentConversations.length}
            >
              <div className="text-sm font-semibold text-slate-700">{conversation.title}</div>
              <div className="mt-1 text-xs leading-6 text-slate-500">{conversation.question}</div>
              {conversation.timestamp ? (
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {conversation.timestamp}
                </div>
              ) : null}
            </button>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-200/80 pt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Saved Queries
          </div>
          <div className="space-y-2">
            {savedQueries.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => onSavedQuerySelect(query)}
                className="w-full rounded-2xl bg-white/75 px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-white"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mt-auto p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primarySoft text-primary">
            <UserRound size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">{mockStudent.name}</div>
            <div className="text-xs text-slate-500">{mockStudent.programme}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/80 px-3 py-3">
            <div className="text-xs text-slate-400">Status</div>
            <div className="mt-1 font-semibold text-slate-700">{mockStudent.year}</div>
          </div>
          <div className="rounded-2xl bg-white/80 px-3 py-3">
            <div className="text-xs text-slate-400">Reference ID</div>
            <div className="mt-1 font-semibold text-slate-700">{mockStudent.studentId}</div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-xs leading-6 text-slate-500">
          Live answers are grounded in official handbook pages, and recent threads stay saved in this browser for quick return visits.
        </div>
      </Card>
    </div>
  );
}
