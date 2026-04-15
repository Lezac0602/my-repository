import { useEffect, useMemo, useState } from "react";
import { Info, SearchX, X } from "lucide-react";
import { ChatPanel } from "./components/app/chat-panel";
import { Sidebar } from "./components/app/sidebar";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Chip } from "./components/ui/chip";
import { Modal } from "./components/ui/modal";
import {
  chunks,
  conversationPresets,
  getDocumentById,
  getScenarioById,
  getScenarioForQuestion,
} from "./data/mockRag";
import { delay, formatClockTime, highlightText } from "./lib/utils";
import { AnswerMode, AnswerVariant, ChatMessage, NavItem } from "./types";

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("Chat");
  const [answerMode, setAnswerMode] = useState<AnswerMode>("concise");
  const [showCitations, setShowCitations] = useState(true);
  const [scope, setScope] = useState("All documents");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentScenarioId, setCurrentScenarioId] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentScenario = useMemo(() => getScenarioById(currentScenarioId), [currentScenarioId]);

  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );

  const selectedChunk = useMemo(
    () => chunks.find((chunk) => chunk.id === selectedChunkId),
    [selectedChunkId],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedChunkId(null);
        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function resolveAnswerVariant(message: ChatMessage, mode: AnswerMode): AnswerVariant | undefined {
    const scenario = getScenarioById(message.scenarioId);
    if (!scenario) {
      return undefined;
    }

    const variants = scenario.answers[mode];
    const variantIndex = message.variantIndex ?? 0;
    return variants[variantIndex % variants.length];
  }

  function resolveScope(message: ChatMessage): string | undefined {
    return getScenarioById(message.scenarioId)?.scope;
  }

  async function runQuery(question: string) {
    const trimmed = question.trim();

    if (!trimmed || isGenerating) {
      return;
    }

    const scenario = getScenarioForQuestion(trimmed);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: formatClockTime(new Date()),
    };

    setSidebarOpen(false);
    setActiveNav("Chat");
    setInput(trimmed);
    setCurrentScenarioId(scenario.id);
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setIsGenerating(true);

    const stepsToAnimate = scenario.noResults ? 2 : scenario.pipeline.length;
    for (let index = 0; index < stepsToAnimate; index += 1) {
      await delay(280);
    }

    await delay(220);

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      timestamp: formatClockTime(new Date()),
      scenarioId: scenario.id,
      variantIndex: 0,
    };

    setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    setIsGenerating(false);
    setInput("");
  }

  function handleSubmit() {
    void runQuery(input);
  }

  function handlePromptSelect(prompt: string) {
    setInput(prompt);
    void runQuery(prompt);
  }

  function handleLoadConversation(conversationId: string) {
    const preset = conversationPresets.find((item) => item.id === conversationId);
    if (!preset) {
      return;
    }

    setMessages(preset.messages);
    setCurrentScenarioId(preset.scenarioId);
    setActiveNav("Chat");
    setSidebarOpen(false);
  }

  function handleRegenerate(messageId: string) {
    setMessages((currentMessages) =>
      currentMessages.map((message) => {
        if (message.id !== messageId || message.role !== "assistant") {
          return message;
        }

        const scenario = getScenarioById(message.scenarioId);
        if (!scenario) {
          return message;
        }

        const length = scenario.answers[answerMode].length;
        return {
          ...message,
          variantIndex: ((message.variantIndex ?? 0) + 1) % length,
        };
      }),
    );
  }

  async function handleCopy(messageId: string) {
    const message = messages.find((item) => item.id === messageId);
    if (!message) {
      return;
    }

    const answer = resolveAnswerVariant(message, answerMode);
    if (!answer) {
      return;
    }

    const text = [
      `Summary: ${answer.summary}`,
      "",
      "Key details:",
      ...answer.bullets.map((bullet) => `- ${bullet}`),
      "",
      `Caution: ${answer.caution}`,
      ...(answer.citations.length ? ["", "Sources:", ...answer.citations.map((citation) => `- ${citation}`)] : []),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      window.setTimeout(() => setCopiedMessageId(null), 1600);
    } catch {
      setCopiedMessageId(null);
    }
  }

  function handleViewSource(messageId: string) {
    const message = messages.find((item) => item.id === messageId);
    const scenario = getScenarioById(message?.scenarioId);
    const firstChunkId = scenario?.evidenceChunkIds[0];
    if (firstChunkId) {
      setSelectedChunkId(firstChunkId);
    }
  }

  const sidebarDrawerClasses = "fixed inset-y-0 left-0 z-40 w-[88vw] max-w-sm overflow-y-auto bg-transparent p-4 lg:hidden";

  return (
    <div className="min-h-screen px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1440px] gap-4 lg:grid-cols-[300px,minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Sidebar
            activeNav={activeNav}
            onNavChange={setActiveNav}
            onSuggestedQuestion={handlePromptSelect}
            onLoadConversation={handleLoadConversation}
          />
        </aside>

        <div className="min-w-0">
          <ChatPanel
            messages={messages}
            input={input}
            scope={scope}
            isGenerating={isGenerating}
            answerMode={answerMode}
            showCitations={showCitations}
            copiedMessageId={copiedMessageId}
            currentScenario={currentScenario}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onScopeChange={setScope}
            onPromptSelect={handlePromptSelect}
            onRegenerate={handleRegenerate}
            onCopy={handleCopy}
            onViewSource={handleViewSource}
            onAnswerModeChange={setAnswerMode}
            onToggleCitations={() => setShowCitations((value) => !value)}
            onOpenSidebar={() => setSidebarOpen(true)}
            resolveAnswer={(message) => resolveAnswerVariant(message, answerMode)}
            resolveScope={resolveScope}
          />
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      ) : null}
      <aside className={`${sidebarDrawerClasses} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300`}>
        <div className="h-full">
          <div className="mb-3 flex justify-end">
            <Button variant="secondary" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
              <X size={18} />
            </Button>
          </div>
          <Sidebar
            activeNav={activeNav}
            onNavChange={setActiveNav}
            onSuggestedQuestion={handlePromptSelect}
            onLoadConversation={handleLoadConversation}
          />
        </div>
      </aside>

      <Modal
        open={Boolean(selectedChunk)}
        onClose={() => setSelectedChunkId(null)}
        title={getDocumentById(selectedChunk?.documentId ?? "")?.title ?? "Source excerpt"}
        subtitle={
          selectedChunk
            ? `${selectedChunk.sectionLabel} - ${selectedChunk.pageLabel}`
            : undefined
        }
      >
        {selectedChunk ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{getDocumentById(selectedChunk.documentId)?.category}</Badge>
              <Badge>{getDocumentById(selectedChunk.documentId)?.type}</Badge>
              {selectedChunk.keywords.map((keyword) => (
                <Chip key={keyword}>{keyword}</Chip>
              ))}
            </div>
            <div className="rounded-[1.6rem] bg-slate-50 px-5 py-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                <Info size={14} />
                Full source excerpt
              </div>
              <p
                className="text-sm leading-7 text-slate-700"
                dangerouslySetInnerHTML={{
                  __html: highlightText(selectedChunk.fullText, selectedChunk.keywords),
                }}
              />
            </div>
            {currentScenario?.noResults ? (
              <div className="rounded-[1.4rem] bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900/80">
                This no-results state is included to show how the demo surfaces missing evidence instead of inventing an answer.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
            <SearchX className="mx-auto mb-3" size={20} />
            No chunk selected.
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;
