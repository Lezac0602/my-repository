import {
  Bookmark,
  CircleHelp,
  Cog,
  GraduationCap,
  History,
  House,
  MessageSquareText,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { mockStudent, navigationItems } from "../../data/mockRag";
import { LanguageMode, NavItem, RecentConversation } from "../../types";
import { cn } from "../../lib/utils";
import { Card } from "../ui/card";

interface SidebarProps {
  activeNav: NavItem;
  recentConversations: RecentConversation[];
  savedQueries: string[];
  suggestedQuestions: string[];
  apiConfigured: boolean;
  languageMode: LanguageMode;
  onNavChange: (item: NavItem) => void;
  onSuggestedQuestion: (question: string) => void;
  onRecentQuestionSelect: (conversationId: string) => void;
  onDeleteRecentQuestion: (conversationId: string) => void;
  onSavedQuerySelect: (question: string) => void;
  onDeleteSavedQuery: (question: string) => void;
}

const navIcons = {
  Home: House,
  Chat: MessageSquareText,
  "Recent Questions": History,
  "Saved Queries": Bookmark,
  Settings: Cog,
} satisfies Record<NavItem, typeof MessageSquareText>;

const labels = {
  en: {
    title: "PolyU Campus Academic Assistant",
    subtitle: "Live RPg handbook support",
    suggested: "Suggested Questions",
    recent: "Recent Questions",
    saved: "Saved Queries",
    noRecentTitle: "No live questions yet",
    noRecentText: "Start a new chat to build a recent list.",
    studentStatus: "Status",
    studentRef: "Reference ID",
    studentNote: "Live answers are grounded in official handbook pages, and recent threads stay saved in this browser for quick return visits.",
    nav: {
      Home: "Home",
      Chat: "Chat",
      "Recent Questions": "Recent Questions",
      "Saved Queries": "Saved Queries",
      Settings: "Settings",
    } satisfies Record<NavItem, string>,
    deleteLabel: "Delete",
  },
  zh: {
    title: "PolyU 校园学术助手",
    subtitle: "实时 RPg 手册支持",
    suggested: "推荐问题",
    recent: "最近聊天",
    saved: "保存的问题",
    noRecentTitle: "还没有最近提问",
    noRecentText: "开始一次新聊天后，这里会显示历史记录。",
    studentStatus: "状态",
    studentRef: "参考编号",
    studentNote: "实时回答会基于官方手册页面生成，最近线程也会保存在当前浏览器中，方便稍后继续查看。",
    nav: {
      Home: "首页",
      Chat: "聊天",
      "Recent Questions": "最近聊天",
      "Saved Queries": "保存的问题",
      Settings: "设置",
    } satisfies Record<NavItem, string>,
    deleteLabel: "删除",
  },
};

export function Sidebar({
  activeNav,
  recentConversations,
  savedQueries,
  suggestedQuestions,
  languageMode,
  onNavChange,
  onSuggestedQuestion,
  onRecentQuestionSelect,
  onDeleteRecentQuestion,
  onSavedQuerySelect,
  onDeleteSavedQuery,
}: SidebarProps) {
  const copy = labels[languageMode];

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="rounded-[2rem] p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary px-3 py-3 text-white shadow-soft">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl leading-tight text-slate-900">{copy.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
          </div>
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
                  {copy.nav[item]}
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
          <h2 className="section-title">{copy.suggested}</h2>
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
          <h2 className="section-title">{copy.recent}</h2>
        </div>
        <div className="space-y-2">
          {(recentConversations.length
            ? recentConversations
            : [
                {
                  id: "empty",
                  title: copy.noRecentTitle,
                  question: copy.noRecentText,
                  timestamp: "",
                  messages: [],
                },
              ]).map((conversation) => (
            <div
              key={conversation.id}
              className="rounded-2xl border border-transparent bg-white/75 px-4 py-3 transition hover:border-slate-200 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => recentConversations.length && onRecentQuestionSelect(conversation.id)}
                  className="min-w-0 flex-1 text-left disabled:cursor-default"
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
                {recentConversations.length ? (
                  <button
                    type="button"
                    onClick={() => onDeleteRecentQuestion(conversation.id)}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
                    aria-label={copy.deleteLabel}
                    title={copy.deleteLabel}
                  >
                    <Trash2 size={15} />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-200/80 pt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{copy.saved}</div>
          <div className="space-y-2">
            {savedQueries.map((query) => (
              <div key={query} className="flex items-start gap-2 rounded-2xl bg-white/75 px-4 py-3">
                <button
                  type="button"
                  onClick={() => onSavedQuerySelect(query)}
                  className="min-w-0 flex-1 text-left text-sm text-slate-600 transition hover:text-slate-800"
                >
                  {query}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSavedQuery(query)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
                  aria-label={copy.deleteLabel}
                  title={copy.deleteLabel}
                >
                  <Trash2 size={15} />
                </button>
              </div>
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
            <div className="text-xs text-slate-400">{copy.studentStatus}</div>
            <div className="mt-1 font-semibold text-slate-700">{mockStudent.year}</div>
          </div>
          <div className="rounded-2xl bg-white/80 px-3 py-3">
            <div className="text-xs text-slate-400">{copy.studentRef}</div>
            <div className="mt-1 font-semibold text-slate-700">{mockStudent.studentId}</div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-xs leading-6 text-slate-500">{copy.studentNote}</div>
      </Card>
    </div>
  );
}
