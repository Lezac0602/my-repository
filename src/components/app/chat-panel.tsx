import { FormEvent, KeyboardEvent, ReactNode, useEffect, useRef } from "react";
import {
  BookmarkPlus,
  Copy,
  ExternalLink,
  FileStack,
  Globe,
  LoaderCircle,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  SendHorizonal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { exampleChips, handbookModelOptions, quickActions } from "../../data/mockRag";
import { AnswerMode, ChatMessage, HandbookModel, LanguageMode, NavItem, RecentConversation, ThemeMode } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Chip } from "../ui/chip";
import { LoadingDots } from "../ui/loading-dots";
import { SegmentedControl } from "../ui/segmented-control";
import { Textarea } from "../ui/textarea";
import { TogglePill } from "../ui/toggle-pill";

interface ChatPanelProps {
  activeNav: NavItem;
  messages: ChatMessage[];
  recentConversations: RecentConversation[];
  savedQueries: string[];
  input: string;
  isGenerating: boolean;
  answerMode: AnswerMode;
  showCitations: boolean;
  copiedMessageId: string | null;
  latestAssistantMessageId?: string;
  apiConfigured: boolean;
  apiBaseUrl: string;
  handbookPolicies: string[];
  selectedModel: HandbookModel;
  chatSessionCount: number;
  languageMode: LanguageMode;
  themeMode: ThemeMode;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onPromptSelect: (question: string) => void;
  onRecentQuestionSelect: (conversationId: string) => void;
  onDeleteRecentQuestion: (conversationId: string) => void;
  onSavedQuerySelect: (question: string) => void;
  onDeleteSavedQuery: (question: string) => void;
  onSaveCurrentQuery: () => void;
  onRegenerate: (messageId: string) => void;
  onCopy: (messageId: string) => void;
  onViewSource: (messageId: string) => void;
  onAnswerModeChange: (mode: AnswerMode) => void;
  onModelChange: (model: HandbookModel) => void;
  onLanguageModeChange: (mode: LanguageMode) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onToggleCitations: () => void;
  onOpenSidebar: () => void;
  onNewChat: () => void;
}

const labels = {
  en: {
    recentTitle: "Recent Questions",
    recentSubtitle: "Recent conversations reopen the original thread instead of sending the same question again.",
    savedTitle: "Saved Queries",
    savedSubtitle: "Saved queries persist locally in this browser so you can reuse handbook prompts quickly.",
    noRecent: "No recent conversations yet. Ask the handbook something first.",
    noSaved: "No saved queries yet. Use 'Save Query' under the chat input to keep one here.",
    openThread: "Open Thread",
    askAgain: "Ask Again",
    loadQuery: "Open Thread",
    askNow: "Ask Now",
    delete: "Delete",
    settings: "Settings",
    settingsSubtitle: "Live handbook search configuration for this browser session and deployed frontend.",
    backendConnected: "Backend connected",
    backendMissing: "Backend missing",
    session: "Session",
    apiBase: "API base",
    noApiBase: "No API base configured",
    language: "Language",
    languageHelp: "Switch the interface text between English and Chinese.",
    theme: "Theme",
    themeHelp: "Switch between a bright academic dashboard and a darker presentation mode for demos.",
    features: "Client-side features",
    featuresHelp: "Recent conversations and saved queries are stored locally in this browser. Recent items reopen past threads, while saved queries reload reusable prompts into the input.",
    answerModes: "Answer modes",
    answerModesHelp: "Concise Answer keeps the reply shorter with 3 to 4 key bullets. Detailed Answer asks the backend to give a fuller explanation with 4 to 6 bullets when the handbook supports it.",
    light: "Light",
    dark: "Dark",
    english: "English",
    chinese: "中文",
    workspaceTitle: "RPg handbook search workspace",
    workspaceSubtitle: "Ask questions about PolyU RPg campus life and get grounded answers with clean source references.",
    homeBadge: "Live handbook assistant",
    homeTitle: "Ask live questions against the PolyU RPg Handbook",
    homeBody: "New chats now use a live OpenAI-powered web search flow that is restricted to the official PolyU handbook scope. Answers are structured for demos, with concise summaries, key points, cautions, and clearly visible source links.",
    backendMissingBanner: "Set VITE_HANDBOOK_API_BASE_URL before publishing the frontend. The current build has no live backend endpoint configured yet.",
    backendReadyBanner: "New chat is ready. Questions will be sent to the live handbook backend and recent activity will be saved in this browser.",
    newChatPrompt: "Ask anything you want about PolyU Rpg Campus Life!",
    assistant: "Assistant",
    supported: "Handbook-supported",
    review: "Needs review",
    summary: "Summary",
    keyDetails: "Key details",
    noBullets: "No handbook-supported bullet points were returned for this answer.",
    caution: "Caution",
    defaultCaution: "Always verify the final wording on the official handbook page before relying on this answer.",
    sources: "Sources",
    regenerate: "Regenerate Answer",
    viewSources: "View Sources",
    copy: "Copy Answer",
    copied: "Copied",
    aiPreparing: "AI is preparing an answer",
    aiPreparingDetail: "Searching live handbook pages and drafting a structured response...",
    concise: "Concise Answer",
    detailed: "Detailed Answer",
    citationsVisible: "Citations visible",
    citationsHidden: "Citations hidden",
    searchReady: "Live handbook search ready",
    searchWaiting: "Waiting for API configuration",
    model: "Model",
    saveQuery: "Save Query",
    send: "Send",
    placeholder: "Ask a question about the PolyU Graduate School RPg Handbook...",
    inputLabel: "Handbook question input",
    newChat: "New Chat",
  },
  zh: {
    recentTitle: "最近聊天",
    recentSubtitle: "最近聊天会重新打开原来的对话线程，而不是再次把同一个问题发送出去。",
    savedTitle: "保存的问题",
    savedSubtitle: "保存的问题会存储在当前浏览器中，方便之后快速复用。",
    noRecent: "还没有最近聊天。先向手册提一个问题吧。",
    noSaved: "还没有保存的问题。可以在聊天输入框下方点击“保存问题”。",
    openThread: "打开对话",
    askAgain: "再次提问",
    loadQuery: "打开对话",
    askNow: "立即提问",
    delete: "删除",
    settings: "设置",
    settingsSubtitle: "配置当前浏览器和已部署前端所使用的实时手册搜索选项。",
    backendConnected: "后端已连接",
    backendMissing: "后端未连接",
    session: "会话",
    apiBase: "API 地址",
    noApiBase: "尚未配置 API 地址",
    language: "语言",
    languageHelp: "在英文界面和中文界面之间切换。",
    theme: "主题",
    themeHelp: "在明亮的学术风格和更适合演示的深色模式之间切换。",
    features: "前端功能",
    featuresHelp: "最近聊天和保存的问题都会保存在当前浏览器中。最近聊天会恢复原线程，保存的问题则会重新载入到输入框中。",
    answerModes: "回答模式",
    answerModesHelp: "简洁回答会保持较短，一般包含 3 到 4 个要点；详细回答会在手册支持的情况下给出 4 到 6 个更完整的要点。",
    light: "亮色",
    dark: "暗色",
    english: "English",
    chinese: "中文",
    workspaceTitle: "RPg 手册搜索工作区",
    workspaceSubtitle: "围绕 PolyU RPg 校园与学术生活提问，并获得带来源支持的整洁回答。",
    homeBadge: "实时手册助手",
    homeTitle: "实时提问 PolyU RPg Handbook",
    homeBody: "新聊天会调用基于 OpenAI 的实时网页搜索流程，并限制在 PolyU 官方手册范围内。回答会整理成适合演示的摘要、要点、提醒和清晰的来源链接。",
    backendMissingBanner: "在发布前端之前，请先设置 VITE_HANDBOOK_API_BASE_URL。当前构建还没有连接实时后端。",
    backendReadyBanner: "现在可以开始新聊天了。问题会发送到实时手册后端，最近活动也会保存在当前浏览器中。",
    newChatPrompt: "你可以在这里询问任何有关 PolyU Rpg Campus Life 的问题！",
    assistant: "助手",
    supported: "有手册支持",
    review: "需要人工确认",
    summary: "摘要",
    keyDetails: "关键要点",
    noBullets: "这次回答没有返回可确认的手册要点。",
    caution: "提醒",
    defaultCaution: "在正式依赖此回答前，请务必再次核对官方手册页面中的最新原文。",
    sources: "来源",
    regenerate: "重新生成回答",
    viewSources: "查看来源",
    copy: "复制回答",
    copied: "已复制",
    aiPreparing: "AI 正在准备答案",
    aiPreparingDetail: "正在检索实时手册页面并整理结构化回答……",
    concise: "简洁回答",
    detailed: "详细回答",
    citationsVisible: "显示引用",
    citationsHidden: "隐藏引用",
    searchReady: "实时手册搜索已就绪",
    searchWaiting: "等待 API 配置",
    model: "模型",
    saveQuery: "保存问题",
    send: "发送",
    placeholder: "输入你关于 PolyU Graduate School RPg Handbook 的问题……",
    inputLabel: "手册提问输入框",
    newChat: "新聊天",
  },
};

export function ChatPanel({
  activeNav,
  messages,
  recentConversations,
  savedQueries,
  input,
  isGenerating,
  answerMode,
  showCitations,
  copiedMessageId,
  latestAssistantMessageId,
  apiConfigured,
  apiBaseUrl,
  handbookPolicies,
  selectedModel,
  languageMode,
  themeMode,
  onInputChange,
  onSubmit,
  onPromptSelect,
  onRecentQuestionSelect,
  onDeleteRecentQuestion,
  onSavedQuerySelect,
  onDeleteSavedQuery,
  onSaveCurrentQuery,
  onRegenerate,
  onCopy,
  onViewSource,
  onAnswerModeChange,
  onModelChange,
  onLanguageModeChange,
  onThemeModeChange,
  onToggleCitations,
  onOpenSidebar,
  onNewChat,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const copy = labels[languageMode];

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isGenerating]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  function sanitizeCitationText(text: string) {
    return text
      .replace(/\s*\(\[[^\]]+\]\((https?:\/\/[^\s)]+)\)\)/gi, "")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi, "$1")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function renderCitationMarkers(message: ChatMessage) {
    const citations = message.response?.citations ?? [];
    if (!showCitations || !citations.length) {
      return null;
    }

    return (
      <span className="ml-1 inline-flex flex-wrap items-center gap-1 align-middle">
        {citations.map((citation, index) => (
          <button
            key={`${message.id}-${citation.url}`}
            type="button"
            title={`${citation.title}\n${citation.url}`}
            onClick={() => window.open(citation.url, "_blank", "noopener,noreferrer")}
            className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 transition hover:border-primary/20 hover:bg-white hover:text-primary"
            aria-label={`Open citation ${index + 1}: ${citation.title}`}
          >
            [{index + 1}]
          </button>
        ))}
      </span>
    );
  }

  function renderLibraryView(title: string, subtitle: string, content: ReactNode, emptyText?: string) {
    return (
      <Card className="flex min-h-0 flex-1 flex-col p-0">
        <div className="border-b border-slate-200/70 px-5 py-5 lg:px-6">
          <h3 className="font-display text-3xl text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">{subtitle}</p>
        </div>
        <div className="space-y-4 px-5 py-5 lg:px-6">
          {content || <div className="rounded-[1.5rem] bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">{emptyText}</div>}
        </div>
      </Card>
    );
  }

  if (activeNav === "Recent Questions") {
    return renderLibraryView(
      copy.recentTitle,
      copy.recentSubtitle,
      recentConversations.length ? (
        recentConversations.map((conversation) => (
          <Card key={conversation.id} muted className="rounded-[1.6rem] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-semibold leading-7 text-slate-700">{conversation.title}</div>
                <div className="mt-1 text-xs leading-6 text-slate-500">{conversation.question}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{conversation.timestamp}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => onRecentQuestionSelect(conversation.id)}>
                  {copy.openThread}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onPromptSelect(conversation.question)}>
                  {copy.askAgain}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDeleteRecentQuestion(conversation.id)}>
                  <Trash2 size={14} />
                  {copy.delete}
                </Button>
              </div>
            </div>
          </Card>
        ))
      ) : undefined,
      copy.noRecent,
    );
  }

  if (activeNav === "Saved Queries") {
    return renderLibraryView(
      copy.savedTitle,
      copy.savedSubtitle,
      savedQueries.length ? (
        savedQueries.map((query) => (
          <Card key={query} muted className="rounded-[1.6rem] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm font-semibold leading-7 text-slate-700">{query}</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => onSavedQuerySelect(query)}>
                  {copy.loadQuery}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onPromptSelect(query)}>
                  {copy.askNow}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDeleteSavedQuery(query)}>
                  <Trash2 size={14} />
                  {copy.delete}
                </Button>
              </div>
            </div>
          </Card>
        ))
      ) : undefined,
      copy.noSaved,
    );
  }

  if (activeNav === "Settings") {
    return (
      <Card className="flex min-h-0 flex-1 flex-col p-0">
        <div className="border-b border-slate-200/70 px-5 py-5 lg:px-6">
          <h3 className="font-display text-3xl text-slate-900">{copy.settings}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">{copy.settingsSubtitle}</p>
        </div>
        <div className="space-y-4 px-5 py-5 lg:px-6">
          <Card muted className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={apiConfigured ? "success" : "warning"}>{apiConfigured ? copy.backendConnected : copy.backendMissing}</Badge>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-800">{copy.apiBase}</div>
              <div className="mt-1 break-all">{apiConfigured ? apiBaseUrl : copy.noApiBase}</div>
            </div>
          </Card>

          <Card muted className="p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Globe size={16} />
              {copy.language}
            </div>
            <div className="mt-3">
              <SegmentedControl
                options={[
                  { label: copy.english, value: "en" },
                  { label: copy.chinese, value: "zh" },
                ]}
                value={languageMode}
                onChange={onLanguageModeChange}
              />
            </div>
            <div className="mt-4 text-sm leading-7 text-slate-500">{copy.languageHelp}</div>
          </Card>

          <Card muted className="p-4">
            <div className="text-sm font-semibold text-slate-800">{copy.theme}</div>
            <div className="mt-3">
              <SegmentedControl
                options={[
                  { label: copy.light, value: "light" },
                  { label: copy.dark, value: "dark" },
                ]}
                value={themeMode}
                onChange={onThemeModeChange}
              />
            </div>
            <div className="mt-4 text-sm leading-7 text-slate-500">{copy.themeHelp}</div>
          </Card>

          <Card muted className="p-4">
            <div className="text-sm font-semibold text-slate-800">{copy.features}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {handbookPolicies.map((policy) => (
                <Chip key={policy} type="button">
                  {policy}
                </Chip>
              ))}
            </div>
            <div className="mt-4 text-sm leading-7 text-slate-500">{copy.featuresHelp}</div>
            <div className="mt-4 rounded-[1.25rem] bg-panel px-4 py-4 text-sm leading-7 text-slate-600">
              <div className="font-semibold text-slate-800">{copy.answerModes}</div>
              <div className="mt-2">{copy.answerModesHelp}</div>
            </div>
          </Card>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-display text-3xl text-slate-900">{copy.workspaceTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{copy.workspaceSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={onOpenSidebar} aria-label="Open sidebar" className="lg:hidden">
            <PanelLeftOpen size={18} />
          </Button>
          <Button variant="secondary" onClick={onNewChat}>
            <Plus size={16} />
            {copy.newChat}
          </Button>
        </div>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col p-0">
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 lg:px-6">
          {activeNav === "Home" ? (
            <div className="grid gap-6 bg-gradient-to-br from-white via-[#fff7f4] to-[#f3efec] px-1 py-1 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="px-5 py-6">
                <Badge tone="success">{copy.homeBadge}</Badge>
                <h3 className="mt-4 font-display text-4xl leading-tight text-slate-900">{copy.homeTitle}</h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{copy.homeBody}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <TogglePill
                    label={answerMode === "concise" ? copy.concise : copy.detailed}
                    active
                    onClick={() => onAnswerModeChange(answerMode === "concise" ? "detailed" : "concise")}
                  />
                  <TogglePill
                    label={showCitations ? copy.citationsHidden : copy.citationsVisible}
                    active={showCitations}
                    onClick={onToggleCitations}
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {handbookPolicies.map((policy) => (
                    <Chip key={policy} type="button">
                      {policy}
                    </Chip>
                  ))}
                </div>
                {!apiConfigured ? (
                  <div className="mt-6 rounded-[1.4rem] bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900/80">{copy.backendMissingBanner}</div>
                ) : (
                  <div className="mt-6 rounded-[1.4rem] bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900/80">{copy.backendReadyBanner}</div>
                )}
              </div>
              <div className="grid gap-3 px-5 py-6">
                {quickActions.map((action, index) => (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() => onPromptSelect(action.prompt)}
                    className="rounded-[1.5rem] bg-white/85 p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:bg-white"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-800">{action.title}</div>
                      <Sparkles size={16} className="text-primary" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {activeNav === "Chat" && !messages.length ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
              <p className="max-w-2xl font-display text-3xl leading-tight text-slate-700">{copy.newChatPrompt}</p>
            </div>
          ) : null}

          {activeNav === "Chat"
            ? messages.map((message) => {
                const response = message.response;
                const canRegenerate = message.id === latestAssistantMessageId;

                if (message.role === "user") {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-2xl rounded-[1.6rem] rounded-br-md bg-slate-900 px-5 py-4 text-white shadow-soft">
                        <div className="text-sm font-medium leading-7">{message.content}</div>
                        <div className="mt-2 text-xs uppercase tracking-[0.16em] text-white/55">{message.timestamp}</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={message.id} className="flex justify-start">
                    <Card className="max-w-3xl rounded-[1.8rem] p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="primary">{copy.assistant}</Badge>
                        <Badge tone={response?.status === "ok" ? "success" : "warning"}>
                          {response?.status === "ok" ? copy.supported : copy.review}
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{copy.summary}</div>
                        <p className="mt-2 text-sm leading-7 text-slate-700">
                          {sanitizeCitationText(response?.answer || response?.message || message.content)}
                          {renderCitationMarkers(message)}
                        </p>
                      </div>
                      <div className="mt-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{copy.keyDetails}</div>
                        <ul className="mt-2 space-y-2">
                          {(response?.bullets.length ? response.bullets : [copy.noBullets]).map((bullet) => (
                            <li key={bullet} className="flex gap-3 text-sm leading-7 text-slate-700">
                              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                              <span>{sanitizeCitationText(bullet)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-5 rounded-[1.4rem] bg-amber-50 px-4 py-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">{copy.caution}</div>
                        <p className="mt-2 text-sm leading-6 text-amber-900/80">
                          {sanitizeCitationText(response?.caution || copy.defaultCaution)}
                        </p>
                      </div>
                      {showCitations && response?.citations.length ? (
                        <div className="mt-5">
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{copy.sources}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {response.citations.map((citation, index) => (
                              <button
                                key={citation.url}
                                type="button"
                                title={`${citation.title}\n${citation.url}`}
                                onClick={() => window.open(citation.url, "_blank", "noopener,noreferrer")}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary/20 hover:bg-white hover:text-primary"
                              >
                                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">[{index + 1}]</span>
                                <span>{citation.title}</span>
                                <ExternalLink size={12} />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-4">
                        <Button variant="secondary" size="sm" onClick={() => onRegenerate(message.id)} disabled={!canRegenerate || isGenerating}>
                          <RefreshCw size={15} />
                          {copy.regenerate}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onViewSource(message.id)}
                          disabled={!response?.citations.length && !response?.sourcePages.length}
                        >
                          <FileStack size={15} />
                          {copy.viewSources}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => onCopy(message.id)} disabled={!response}>
                          <Copy size={15} />
                          {copiedMessageId === message.id ? copy.copied : copy.copy}
                        </Button>
                        <div className="ml-auto text-xs uppercase tracking-[0.16em] text-slate-400">{message.timestamp}</div>
                      </div>
                    </Card>
                  </div>
                );
              })
            : null}

          {activeNav === "Chat" && isGenerating ? (
            <div className="flex justify-start">
              <Card muted className="max-w-xl rounded-[1.8rem] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primarySoft text-primary">
                    <LoaderCircle size={20} className="animate-spin" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      {copy.aiPreparing}
                      <LoadingDots />
                    </div>
                    <div className="text-sm text-slate-500">{copy.aiPreparingDetail}</div>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>

        {activeNav === "Chat" ? (
          <div className="sticky bottom-0 z-10 border-t border-slate-200/70 bg-white/95 px-5 py-5 backdrop-blur lg:px-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedControl
                options={[
                  { label: copy.concise, value: "concise" },
                  { label: copy.detailed, value: "detailed" },
                ]}
                value={answerMode}
                onChange={onAnswerModeChange}
              />
              <TogglePill
                label={showCitations ? copy.citationsVisible : copy.citationsHidden}
                active={showCitations}
                onClick={onToggleCitations}
              />
            </div>
            <Badge tone={apiConfigured ? "success" : "warning"}>{apiConfigured ? copy.searchReady : copy.searchWaiting}</Badge>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{copy.model}</div>
            {handbookModelOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onModelChange(option.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selectedModel === option.value
                    ? "border-primary/30 bg-primarySoft text-primary"
                    : "border-border bg-panel text-muted hover:bg-panelMuted hover:text-foreground"
                }`}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={copy.placeholder}
              aria-label={copy.inputLabel}
            />
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {exampleChips.map((chip) => (
                  <Chip key={chip} onClick={() => onPromptSelect(chip)}>
                    {chip}
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSaveCurrentQuery}
                  disabled={!input.trim() && !messages.some((message) => message.role === "user")}
                >
                  <BookmarkPlus size={16} />
                  {copy.saveQuery}
                </Button>
                <Button type="submit" disabled={!input.trim() || isGenerating}>
                  <SendHorizonal size={16} />
                  {copy.send}
                </Button>
              </div>
            </div>
          </form>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
