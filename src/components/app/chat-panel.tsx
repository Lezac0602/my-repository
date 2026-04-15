import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import {
  Copy,
  FileStack,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  SendHorizonal,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import { exampleChips, handbookRootUrl, quickActions } from "../../data/mockRag";
import { AnswerMode, ChatMessage } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Chip } from "../ui/chip";
import { LoadingDots } from "../ui/loading-dots";
import { SegmentedControl } from "../ui/segmented-control";
import { Textarea } from "../ui/textarea";
import { TogglePill } from "../ui/toggle-pill";

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  isGenerating: boolean;
  answerMode: AnswerMode;
  showCitations: boolean;
  copiedMessageId: string | null;
  latestAssistantMessageId?: string;
  apiConfigured: boolean;
  apiBaseUrl: string;
  handbookPolicies: string[];
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onPromptSelect: (question: string) => void;
  onRegenerate: (messageId: string) => void;
  onCopy: (messageId: string) => void;
  onViewSource: (messageId: string) => void;
  onAnswerModeChange: (mode: AnswerMode) => void;
  onToggleCitations: () => void;
  onOpenSidebar: () => void;
  onNewChat: () => void;
}

export function ChatPanel({
  messages,
  input,
  isGenerating,
  answerMode,
  showCitations,
  copiedMessageId,
  latestAssistantMessageId,
  apiConfigured,
  apiBaseUrl,
  handbookPolicies,
  onInputChange,
  onSubmit,
  onPromptSelect,
  onRegenerate,
  onCopy,
  onViewSource,
  onAnswerModeChange,
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

  return (
    <div className="flex h-full flex-col gap-4">
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
          </div>
          <h2 className="mt-3 font-display text-3xl text-slate-900">RPg handbook search workspace</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions about the PolyU Graduate School RPg Handbook and get handbook-only answers with clickable sources.
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

      {!messages.length ? (
        <Card className="overflow-hidden p-0">
          <div className="grid gap-6 bg-gradient-to-br from-white via-[#fff7f4] to-[#f3efec] px-6 py-7 lg:grid-cols-[1.2fr,0.8fr] lg:px-8">
            <div>
              <Badge tone="success">Handbook-only web search</Badge>
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
                <div className="mt-6 rounded-[1.4rem] bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                  Active API base: <span className="font-semibold text-slate-800">{apiBaseUrl}</span>
                </div>
              )}
            </div>
            <div className="grid gap-3">
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
        </Card>
      ) : null}

      <Card className="flex min-h-0 flex-1 flex-col p-0">
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 lg:px-6">
          {messages.map((message) => {
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
                      {response?.answer || response?.message || message.content}
                    </p>
                  </div>
                  <div className="mt-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Key details</div>
                    <ul className="mt-2 space-y-2">
                      {(response?.bullets.length ? response.bullets : ["No handbook-supported bullet points were returned for this answer."]).map(
                        (bullet) => (
                          <li key={bullet} className="flex gap-3 text-sm leading-7 text-slate-700">
                            <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                            <span>{bullet}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div className="mt-5 rounded-[1.4rem] bg-amber-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">Caution</div>
                    <p className="mt-2 text-sm leading-6 text-amber-900/80">
                      {response?.caution || "Always verify the final wording on the official handbook page before relying on this answer."}
                    </p>
                  </div>
                  {showCitations && response?.citations.length ? (
                    <div className="mt-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Cited sources</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {response.citations.map((citation) => (
                          <a
                            key={citation.url}
                            href={citation.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary/20 hover:bg-white hover:text-primary"
                          >
                            {citation.title}
                          </a>
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
          })}

          {isGenerating ? (
            <div className="flex justify-start">
              <Card muted className="max-w-xl rounded-[1.8rem] px-5 py-4">
                <div className="flex items-center gap-3">
                  <LoadingDots />
                  <div>
                    <div className="text-sm font-semibold text-slate-700">Searching the handbook</div>
                    <div className="text-sm text-slate-500">
                      Querying the live RPg handbook scope and drafting a structured answer...
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-200/70 px-5 py-5 lg:px-6">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Ask a question about the PolyU Graduate School RPg Handbook..."
              aria-label="Handbook question input"
            />
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
                  Source scope: {handbookRootUrl}
                </div>
                <div className="flex flex-wrap gap-2">
                  {exampleChips.map((chip) => (
                    <Chip key={chip} onClick={() => onPromptSelect(chip)}>
                      {chip}
                    </Chip>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={!input.trim() || isGenerating}>
                <SendHorizonal size={16} />
                Send
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
