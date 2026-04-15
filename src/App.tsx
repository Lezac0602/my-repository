import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Info, SearchX, X } from "lucide-react";
import { ChatPanel } from "./components/app/chat-panel";
import { Sidebar } from "./components/app/sidebar";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Modal } from "./components/ui/modal";
import {
  handbookPolicies,
  handbookRootUrl,
  savedQueries as defaultSavedQueries,
  suggestedQuestions,
} from "./data/mockRag";
import { requestHandbookAnswer, getHandbookApiBaseUrl, isHandbookApiConfigured } from "./lib/handbook-api";
import { formatClockTime } from "./lib/utils";
import { AnswerMode, ChatMessage, HandbookApiResponse, HandbookChatTurn, NavItem, SourceLink } from "./types";

function App() {
  const recentStorageKey = "campus-live-recent-questions";
  const savedStorageKey = "campus-live-saved-queries";
  const [activeNav, setActiveNav] = useState<NavItem>("Chat");
  const [answerMode, setAnswerMode] = useState<AnswerMode>("concise");
  const [showCitations, setShowCitations] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = window.localStorage.getItem(recentStorageKey);
    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  });
  const [savedQueries, setSavedQueries] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return defaultSavedQueries;
    }

    const stored = window.localStorage.getItem(savedStorageKey);
    if (!stored) {
      return defaultSavedQueries;
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length
        ? parsed.filter((item): item is string => typeof item === "string")
        : defaultSavedQueries;
    } catch {
      return defaultSavedQueries;
    }
  });
  const [selectedSources, setSelectedSources] = useState<{
    title: string;
    subtitle?: string;
    sources: SourceLink[];
  } | null>(null);
  const [threadResponseId, setThreadResponseId] = useState<string>();
  const [chatSessionCount, setChatSessionCount] = useState(1);

  const apiConfigured = isHandbookApiConfigured();
  const apiBaseUrl = getHandbookApiBaseUrl();

  const latestAssistantMessageId = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant")?.id,
    [messages],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedSources(null);
        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(recentStorageKey, JSON.stringify(recentQuestions));
    }
  }, [recentQuestions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(savedStorageKey, JSON.stringify(savedQueries));
    }
  }, [savedQueries]);

  function buildHistory(messageList: ChatMessage[]): HandbookChatTurn[] {
    return messageList.map((message) => ({
      role: message.role,
      content: message.role === "assistant" ? message.response?.answer || message.content : message.content,
    }));
  }

  function upsertRecentQuestion(question: string) {
    setRecentQuestions((current) => [question, ...current.filter((item) => item !== question)].slice(0, 6));
  }

  function upsertSavedQuery(question: string) {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    setSavedQueries((current) => [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 10));
  }

  function getLatestUserQuestion() {
    return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  }

  function createAssistantMessage(response: HandbookApiResponse): ChatMessage {
    return {
      id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: "assistant",
      content: response.answer || response.message || "No handbook-supported answer was returned.",
      timestamp: formatClockTime(new Date()),
      response,
    };
  }

  async function runQuery(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isGenerating) {
      return;
    }

    const history = buildHistory(messages);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: formatClockTime(new Date()),
    };

    setSidebarOpen(false);
    setActiveNav("Chat");
    setInput(trimmed);
    setMessages((current) => [...current, userMessage]);
    upsertRecentQuestion(trimmed);
    setIsGenerating(true);

    const response = await requestHandbookAnswer({
      question: trimmed,
      history,
      mode: answerMode,
      previousResponseId: threadResponseId,
    });

    setMessages((current) => [...current, createAssistantMessage(response)]);
    setThreadResponseId(response.previousResponseId);
    setIsGenerating(false);
    setInput("");
  }

  async function regenerateLatestAnswer(messageId: string) {
    if (isGenerating || messageId !== latestAssistantMessageId) {
      return;
    }

    const assistantIndex = messages.findIndex((message) => message.id === messageId);
    if (assistantIndex <= 0) {
      return;
    }

    const userIndex = [...messages]
      .slice(0, assistantIndex)
      .map((message, index) => ({ message, index }))
      .reverse()
      .find((entry) => entry.message.role === "user")?.index;

    if (userIndex === undefined) {
      return;
    }

    const question = messages[userIndex]?.content.trim();
    if (!question) {
      return;
    }

    const history = buildHistory(messages.slice(0, userIndex));
    setIsGenerating(true);

    const response = await requestHandbookAnswer({
      question,
      history,
      mode: answerMode,
    });

    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...createAssistantMessage(response), id: messageId } : message)),
    );
    setThreadResponseId(response.previousResponseId);
    setIsGenerating(false);
  }

  async function handleCopy(messageId: string) {
    const message = messages.find((item) => item.id === messageId);
    const response = message?.response;

    if (!message || !response) {
      return;
    }

    const text = [
      `Summary: ${response.answer || response.message || "No answer returned."}`,
      "",
      "Key details:",
      ...(response.bullets.length ? response.bullets.map((bullet) => `- ${bullet}`) : ["- No handbook-supported bullet points returned."]),
      "",
      `Caution: ${response.caution || "Always confirm the latest handbook wording on the official PolyU page."}`,
      ...(response.citations.length
        ? ["", "Sources:", ...response.citations.map((citation) => `- ${citation.title}: ${citation.url}`)]
        : []),
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
    const response = messages.find((item) => item.id === messageId)?.response;
    if (!response) {
      return;
    }

    const uniqueSources = [...response.citations, ...response.sourcePages].filter(
      (source, index, list) => list.findIndex((item) => item.url === source.url) === index,
    );

    setSelectedSources({
      title: "Handbook Sources",
      subtitle: handbookRootUrl,
      sources: uniqueSources,
    });
  }

  function handleNewChat() {
    setActiveNav("Chat");
    setMessages([]);
    setInput("");
    setThreadResponseId(undefined);
    setSelectedSources(null);
    setSidebarOpen(false);
    setChatSessionCount((current) => current + 1);
  }

  function handlePromptSelect(prompt: string) {
    setActiveNav("Chat");
    setInput(prompt);
    void runQuery(prompt);
  }

  function handleRecentQuestionSelect(question: string) {
    setActiveNav("Chat");
    setInput(question);
    void runQuery(question);
  }

  function handleSavedQuerySelect(question: string) {
    setActiveNav("Chat");
    setInput(question);
  }

  function handleSaveCurrentQuery() {
    const candidate = input.trim() || getLatestUserQuestion().trim();
    if (!candidate) {
      return;
    }

    upsertSavedQuery(candidate);
    setActiveNav("Saved Queries");
  }

  const sidebarDrawerClasses = "fixed inset-y-0 left-0 z-40 w-[88vw] max-w-sm overflow-y-auto bg-transparent p-4 lg:hidden";

  return (
    <div className="min-h-screen px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1440px] gap-4 lg:grid-cols-[300px,minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Sidebar
            activeNav={activeNav}
            recentQuestions={recentQuestions}
            savedQueries={savedQueries}
            suggestedQuestions={suggestedQuestions}
            apiConfigured={apiConfigured}
            onNavChange={setActiveNav}
            onSuggestedQuestion={handlePromptSelect}
            onRecentQuestionSelect={handleRecentQuestionSelect}
            onSavedQuerySelect={handleSavedQuerySelect}
            onNewChat={handleNewChat}
          />
        </aside>

        <div className="min-w-0">
          <ChatPanel
            activeNav={activeNav}
            messages={messages}
            recentQuestions={recentQuestions}
            savedQueries={savedQueries}
            input={input}
            isGenerating={isGenerating}
            answerMode={answerMode}
            showCitations={showCitations}
            copiedMessageId={copiedMessageId}
            latestAssistantMessageId={latestAssistantMessageId}
            apiConfigured={apiConfigured}
            apiBaseUrl={apiBaseUrl}
            handbookPolicies={handbookPolicies}
            chatSessionCount={chatSessionCount}
            onInputChange={setInput}
            onSubmit={() => void runQuery(input)}
            onPromptSelect={handlePromptSelect}
            onRecentQuestionSelect={handleRecentQuestionSelect}
            onSavedQuerySelect={handleSavedQuerySelect}
            onSaveCurrentQuery={handleSaveCurrentQuery}
            onRegenerate={regenerateLatestAnswer}
            onCopy={handleCopy}
            onViewSource={handleViewSource}
            onAnswerModeChange={setAnswerMode}
            onToggleCitations={() => setShowCitations((value) => !value)}
            onOpenSidebar={() => setSidebarOpen(true)}
            onNewChat={handleNewChat}
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
            recentQuestions={recentQuestions}
            savedQueries={savedQueries}
            suggestedQuestions={suggestedQuestions}
            apiConfigured={apiConfigured}
            onNavChange={setActiveNav}
            onSuggestedQuestion={handlePromptSelect}
            onRecentQuestionSelect={handleRecentQuestionSelect}
            onSavedQuerySelect={handleSavedQuerySelect}
            onNewChat={handleNewChat}
          />
        </div>
      </aside>

      <Modal
        open={Boolean(selectedSources)}
        onClose={() => setSelectedSources(null)}
        title={selectedSources?.title ?? "Handbook Sources"}
        subtitle={selectedSources?.subtitle}
      >
        {selectedSources?.sources.length ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">Handbook-only scope</Badge>
              <Badge tone="success">Live source links</Badge>
            </div>
            <div className="space-y-3">
              {selectedSources.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-4 rounded-[1.4rem] border border-slate-200/80 bg-white/85 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{source.title}</div>
                    <div className="mt-1 break-all text-xs leading-6 text-slate-500">{source.url}</div>
                  </div>
                  <ExternalLink size={16} className="mt-1 shrink-0 text-primary" />
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
            <SearchX className="mx-auto mb-3" size={20} />
            No handbook source links were returned for this answer.
          </div>
        )}
        <div className="mt-5 rounded-[1.4rem] bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900/80">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
            <Info size={14} />
            Source policy
          </div>
          Only pages under the official PolyU RPg Handbook scope are accepted for this live QA flow.
        </div>
      </Modal>
    </div>
  );
}

export default App;
