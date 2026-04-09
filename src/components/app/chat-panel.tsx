import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import {
  Copy,
  FileStack,
  PanelLeftOpen,
  PanelRightOpen,
  RefreshCw,
  SendHorizonal,
  Sparkles,
} from "lucide-react";
import { exampleChips, quickActions } from "../../data/mockRag";
import { AnswerMode, AnswerVariant, ChatMessage, MockQueryScenario } from "../../types";
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
  scope: string;
  isGenerating: boolean;
  answerMode: AnswerMode;
  showCitations: boolean;
  copiedMessageId: string | null;
  currentScenario?: MockQueryScenario;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onScopeChange: (value: string) => void;
  onPromptSelect: (question: string) => void;
  onRegenerate: (messageId: string) => void;
  onCopy: (messageId: string) => void;
  onViewSource: (messageId: string) => void;
  onAnswerModeChange: (mode: AnswerMode) => void;
  onToggleCitations: () => void;
  onOpenSidebar: () => void;
  onOpenEvidence: () => void;
  resolveAnswer: (message: ChatMessage) => AnswerVariant | undefined;
  resolveScope: (message: ChatMessage) => string | undefined;
}

export function ChatPanel({
  messages,
  input,
  scope,
  isGenerating,
  answerMode,
  showCitations,
  copiedMessageId,
  currentScenario,
  onInputChange,
  onSubmit,
  onScopeChange,
  onPromptSelect,
  onRegenerate,
  onCopy,
  onViewSource,
  onAnswerModeChange,
  onToggleCitations,
  onOpenSidebar,
  onOpenEvidence,
  resolveAnswer,
  resolveScope,
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
          <div className="flex items-center gap-2">
            <Badge tone="primary">Knowledge Base Connected</Badge>
            <Badge>Mock Data Demo</Badge>
          </div>
          <h2 className="mt-3 font-display text-3xl text-slate-900">Academic support workspace</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ask about programme policies, subject rules, deadlines, or assessment expectations.
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
          <Button
            variant="secondary"
            size="icon"
            onClick={onOpenEvidence}
            aria-label="Open evidence panel"
            className="xl:hidden"
          >
            <PanelRightOpen size={18} />
          </Button>
        </div>
      </Card>

      {!messages.length ? (
        <Card className="overflow-hidden p-0">
          <div className="grid gap-6 bg-gradient-to-br from-white via-[#fff7f4] to-[#f3efec] px-6 py-7 lg:grid-cols-[1.2fr,0.8fr] lg:px-8">
            <div>
              <Badge tone="success">Demo-ready frontend only</Badge>
              <h3 className="mt-4 font-display text-4xl leading-tight text-slate-900">
                A polished RAG assistant experience for PolyU academic guidance
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                This mock interface simulates a retrieval-augmented assistant that answers student questions, surfaces
                the evidence used, and makes policy uncertainty visible instead of hidden.
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
            </div>
            <div className="grid gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => onPromptSelect(action.title)}
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
            const answer = message.role === "assistant" ? resolveAnswer(message) : undefined;
            const scopeLabel = resolveScope(message);

            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-2xl rounded-[1.6rem] rounded-br-md bg-slate-900 px-5 py-4 text-white shadow-soft">
                    <div className="text-sm font-medium leading-7">{message.text}</div>
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
                    {scopeLabel ? <Badge>{scopeLabel}</Badge> : null}
                    {answer ? (
                      <Badge tone={answer.reliability === "High" ? "success" : answer.reliability === "Medium" ? "warning" : "neutral"}>
                        {answer.reliability} reliability
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Summary</div>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{answer?.summary}</p>
                  </div>
                  <div className="mt-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Key details</div>
                    <ul className="mt-2 space-y-2">
                      {answer?.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3 text-sm leading-7 text-slate-700">
                          <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-5 rounded-[1.4rem] bg-amber-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">Caution</div>
                    <p className="mt-2 text-sm leading-6 text-amber-900/80">{answer?.caution}</p>
                  </div>
                  {showCitations && answer?.citations.length ? (
                    <div className="mt-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Cited sources</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {answer.citations.map((citation) => (
                          <Chip key={citation}>{citation}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-4">
                    <Button variant="secondary" size="sm" onClick={() => onRegenerate(message.id)}>
                      <RefreshCw size={15} />
                      Regenerate Answer
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onViewSource(message.id)}>
                      <FileStack size={15} />
                      View Source
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onCopy(message.id)}>
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
                    <div className="text-sm font-semibold text-slate-700">Generating retrieval-backed answer</div>
                    <div className="text-sm text-slate-500">Ranking evidence and drafting the response card...</div>
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
            {currentScenario ? (
              <Badge tone="primary">Intent: {currentScenario.intent}</Badge>
            ) : (
              <Badge>Ready for a new question</Badge>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Ask a question about graduation rules, subject assessment, deadlines, or academic policy..."
              aria-label="Student question input"
            />
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={scope}
                  onChange={(event) => onScopeChange(event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-600 shadow-sm"
                >
                  <option>All documents</option>
                  <option>Programme documents</option>
                  <option>Academic regulations</option>
                  <option>Subject descriptions</option>
                </select>
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
