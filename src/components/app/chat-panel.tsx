import { FormEvent, KeyboardEvent, ReactNode, useEffect, useRef } from "react";
import {
  BookmarkPlus,
  Copy,
  ExternalLink,
  FileStack,
  LoaderCircle,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  SendHorizonal,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import { exampleChips, handbookModelOptions, quickActions } from "../../data/mockRag";
import { AnswerMode, ChatMessage, HandbookModel, NavItem, RecentConversation, ThemeMode } from "../../types";
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
  themeMode: ThemeMode;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onPromptSelect: (question: string) => void;
  onRecentQuestionSelect: (conversationId: string) => void;
  onSavedQuerySelect: (question: string) => void;
  onSaveCurrentQuery: () => void;
  onRegenerate: (messageId: string) => void;
  onCopy: (messageId: string) => void;
  onViewSource: (messageId: string) => void;
  onAnswerModeChange: (mode: AnswerMode) => void;
  onModelChange: (model: HandbookModel) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onToggleCitations: () => void;
  onOpenSidebar: () => void;
  onNewChat: () => void;
}

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
  chatSessionCount,
  themeMode,
  onInputChange,
  onSubmit,
  onPromptSelect,
  onRecentQuestionSelect,
  onSavedQuerySelect,
  onSaveCurrentQuery,
  onRegenerate,
  onCopy,
  onViewSource,
  onAnswerModeChange,
  onModelChange,
  onThemeModeChange,
  onToggleCitations,
  onOpenSidebar,
  onNewChat,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  function renderLibraryView(
    title: string,
    subtitle: string,
    content: ReactNode,
    emptyText?: string,
  ) {
    return (
      <Card className="flex min-h-0 flex-1 flex-col p-0">
        <div className="border-b border-slate-200/70 px-5 py-5 lg:px-6">
          <h3 className="font-display text-3xl text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">{subtitle}</p>
        </div>
        <div className="space-y-4 px-5 py-5 lg:px-6">{content || <div className="rounded-[1.5rem] bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">{emptyText}</div>}</div>
      </Card>
    );
  }

  if (activeNav === "Recent Questions") {
    return renderLibraryView(
      "Recent Questions",
      "Recent conversations now reopen the original thread instead of sending the same question again.",
      recentConversations.length ? (
        recentConversations.map((conversation) => (
          <Card key={conversation.id} muted className="rounded-[1.6rem] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-semibold leading-7 text-slate-700">{conversation.title}</div>
                <div className="mt-1 text-xs leading-6 text-slate-500">{conversation.question}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {conversation.timestamp}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => onRecentQuestionSelect(conversation.id)}>
                  Open Thread
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onPromptSelect(conversation.question)}>
                  Ask Again
                </Button>
              </div>
            </div>
          </Card>
        ))
      ) : undefined,
      "No recent conversations yet. Ask the handbook something first.",
    );
  }

  if (activeNav === "Saved Queries") {
    return renderLibraryView(
      "Saved Queries",
      "Saved queries persist locally in this browser so you can reuse handbook prompts quickly.",
      savedQueries.length ? (
        savedQueries.map((query) => (
          <Card key={query} muted className="rounded-[1.6rem] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm font-semibold leading-7 text-slate-700">{query}</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => onSavedQuerySelect(query)}>
                  Load Query
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onPromptSelect(query)}>
                  Ask Now
                </Button>
              </div>
            </div>
          </Card>
        ))
      ) : undefined,
      "No saved queries yet. Use 'Save Query' under the chat input to keep one here.",
    );
  }

  if (activeNav === "Settings") {
    return (
      <Card className="flex min-h-0 flex-1 flex-col p-0">
        <div className="border-b border-slate-200/70 px-5 py-5 lg:px-6">
          <h3 className="font-display text-3xl text-slate-900">Settings</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Live handbook search configuration for this browser session and deployed frontend.
          </p>
        </div>
        <div className="space-y-4 px-5 py-5 lg:px-6">
          <Card muted className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={apiConfigured ? "success" : "warning"}>
                {apiConfigured ? "Backend connected" : "Backend missing"}
              </Badge>
              <Badge tone="primary">Session {chatSessionCount}</Badge>
              <Badge tone="neutral">{handbookModelOptions.find((option) => option.value === selectedModel)?.label ?? selectedModel}</Badge>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-800">API base</div>
              <div className="mt-1 break-all">{apiConfigured ? apiBaseUrl : "No API base configured"}</div>
            </div>
          </Card>
          <Card muted className="p-4">
            <div className="text-sm font-semibold text-slate-800">Theme</div>
            <div className="mt-3">
              <SegmentedControl
                options={[
                  { label: "Light", value: "light" },
                  { label: "Dark", value: "dark" },
                ]}
                value={themeMode}
                onChange={onThemeModeChange}
              />
            </div>
            <div className="mt-4 text-sm leading-7 text-slate-500">
              Switch between a bright academic dashboard and a darker presentation mode for demos.
            </div>
          </Card>
          <Card muted className="p-4">
            <div className="text-sm font-semibold text-slate-800">Client-side features</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {handbookPolicies.map((policy) => (
                <Chip key={policy} type="button">
                  {policy}
                </Chip>
              ))}
            </div>
            <div className="mt-4 text-sm leading-7 text-slate-500">
              Recent conversations and saved queries are stored locally in this browser. Recent items reopen past threads,
              while saved queries reload reusable prompts into the input.
            </div>
            <div className="mt-4 rounded-[1.25rem] bg-panel px-4 py-4 text-sm leading-7 text-slate-600">
              <div className="font-semibold text-slate-800">Answer modes</div>
              <div className="mt-2">
                Concise Answer keeps the reply shorter with 3 to 4 key bullets. Detailed Answer asks the backend to give
                a fuller explanation with 4 to 6 bullets when the handbook supports it.
              </div>
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
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">Live Handbook QA</Badge>
            <Badge tone={apiConfigured ? "success" : "warning"}>
              {apiConfigured ? (
                <>
                  <Wifi size={12} />
                  Backend connected
                </>
              ) : (
                <>
                  <WifiOff size={12} />
                  Backend not configured
                </>
              )}
            </Badge>
            <Badge tone="neutral">Session {chatSessionCount}</Badge>
          </div>
          <h2 className="mt-3 font-display text-3xl text-slate-900">RPg handbook search workspace</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions about PolyU RPg campus life and get grounded answers with clean source references.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="lg:hidden"
          >
            <PanelLeftOpen size={18} />
          </Button>
          <Button variant="secondary" onClick={onNewChat}>
            <Plus size={16} />
            New Chat
          </Button>
        </div>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col p-0">
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 lg:px-6">
          {activeNav === "Home" ? (
            <div className="grid gap-6 bg-gradient-to-br from-white via-[#fff7f4] to-[#f3efec] px-1 py-1 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="px-5 py-6">
                <Badge tone="success">Live handbook assistant</Badge>
                <h3 className="mt-4 font-display text-4xl leading-tight text-slate-900">
                  Ask live questions against the PolyU RPg Handbook
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                  New chats now use a live OpenAI-powered web search flow that is restricted to the official PolyU
                  handbook scope. Answers are structured for demos, with concise summaries, key points, cautions, and
                  clearly visible source links.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <TogglePill
                    label={answerMode === "concise" ? "Concise Answer" : "Detailed Answer"}
                    active
                    onClick={() => onAnswerModeChange(answerMode === "concise" ? "detailed" : "concise")}
                  />
                  <TogglePill
                    label={showCitations ? "Hide citations" : "Show citations"}
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
                  <div className="mt-6 rounded-[1.4rem] bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900/80">
                    Set <code>VITE_HANDBOOK_API_BASE_URL</code> before publishing the frontend. The current build has no live
                    backend endpoint configured yet.
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.4rem] bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900/80">
                    New chat is ready. Questions will be sent to the live handbook backend and recent activity will be saved in this browser.
                  </div>
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
              <p className="max-w-2xl font-display text-3xl leading-tight text-slate-700">
                Ask anything you want about PolyU Rpg Campus Life!
              </p>
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
                    <Badge tone="primary">Assistant</Badge>
                    <Badge tone={response?.status === "ok" ? "success" : "warning"}>
                      {response?.status === "ok" ? "Handbook-supported" : "Needs review"}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Summary</div>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {sanitizeCitationText(response?.answer || response?.message || message.content)}
                      {renderCitationMarkers(message)}
                    </p>
                  </div>
                  <div className="mt-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Key details</div>
                    <ul className="mt-2 space-y-2">
                      {(response?.bullets.length
                        ? response.bullets
                        : ["No handbook-supported bullet points were returned for this answer."]).map((bullet) => (
                        <li key={bullet} className="flex gap-3 text-sm leading-7 text-slate-700">
                          <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                          <span>{sanitizeCitationText(bullet)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-5 rounded-[1.4rem] bg-amber-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">Caution</div>
                    <p className="mt-2 text-sm leading-6 text-amber-900/80">
                      {sanitizeCitationText(
                        response?.caution || "Always verify the final wording on the official handbook page before relying on this answer.",
                      )}
                    </p>
                  </div>
                  {showCitations && response?.citations.length ? (
                    <div className="mt-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sources</div>
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
                      Regenerate Answer
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewSource(message.id)}
                      disabled={!response?.citations.length && !response?.sourcePages.length}
                    >
                      <FileStack size={15} />
                      View Sources
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onCopy(message.id)} disabled={!response}>
                      <Copy size={15} />
                      {copiedMessageId === message.id ? "Copied" : "Copy Answer"}
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
                      AI is preparing an answer
                      <LoadingDots />
                    </div>
                    <div className="text-sm text-slate-500">
                      Searching live handbook pages and drafting a structured response...
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 z-10 border-t border-slate-200/70 bg-white/95 px-5 py-5 backdrop-blur lg:px-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedControl
                options={[
                  { label: "Concise Answer", value: "concise" },
                  { label: "Detailed Answer", value: "detailed" },
                ]}
                value={answerMode}
                onChange={onAnswerModeChange}
              />
              <TogglePill
                label={showCitations ? "Citations visible" : "Citations hidden"}
                active={showCitations}
                onClick={onToggleCitations}
              />
            </div>
            <Badge tone={apiConfigured ? "success" : "warning"}>
              {apiConfigured ? "Live handbook search ready" : "Waiting for API configuration"}
            </Badge>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Model</div>
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
              placeholder="Ask a question about the PolyU Graduate School RPg Handbook..."
              aria-label="Handbook question input"
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
                  Save Query
                </Button>
                <Button type="submit" disabled={!input.trim() || isGenerating}>
                  <SendHorizonal size={16} />
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
