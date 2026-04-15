import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Info, SearchX, X } from "lucide-react";
import { ChatPanel } from "./components/app/chat-panel";
import { Sidebar } from "./components/app/sidebar";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Modal } from "./components/ui/modal";
import {
  handbookPolicies,
  handbookModelOptions,
  legacyDefaultSavedQueries,
  savedQueries as defaultSavedQueries,
  suggestedQuestions,
} from "./data/mockRag";
import { requestHandbookAnswer, getHandbookApiBaseUrl, isHandbookApiConfigured } from "./lib/handbook-api";
import { formatClockTime } from "./lib/utils";
import { AnswerMode, ChatMessage, HandbookApiResponse, HandbookChatTurn, HandbookModel, LanguageMode, NavItem, RecentConversation, SourceLink, ThemeMode } from "./types";

function App() {
  const recentStorageKey = "campus-live-recent-questions";
  const savedStorageKey = "campus-live-saved-queries";
  const themeStorageKey = "campus-live-theme";
  const languageStorageKey = "campus-live-language";
  const modelStorageKey = "campus-live-model";
  const [activeNav, setActiveNav] = useState<NavItem>("Home");
  const [answerMode, setAnswerMode] = useState<AnswerMode>("concise");
  const [showCitations, setShowCitations] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = window.localStorage.getItem(themeStorageKey);
    return stored === "dark" ? "dark" : "light";
  });
  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const stored = window.localStorage.getItem(languageStorageKey);
    return stored === "zh" ? "zh" : "en";
  });
  const [selectedModel, setSelectedModel] = useState<HandbookModel>(() => {
    if (typeof window === "undefined") {
      return "gpt-5.4";
    }

    const stored = window.localStorage.getItem(modelStorageKey);
    return handbookModelOptions.some((option) => option.value === stored) ? (stored as HandbookModel) : "gpt-5.4";
  });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = window.localStorage.getItem(recentStorageKey);
    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is RecentConversation => {
            return (
              Boolean(item) &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.title === "string" &&
              typeof item.question === "string" &&
              typeof item.timestamp === "string" &&
              Array.isArray(item.messages) &&
              (!("model" in item) || typeof item.model === "string")
            );
          })
        : [];
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
      const normalized = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
      const isLegacyDefaultSet =
        normalized.length === legacyDefaultSavedQueries.length &&
        normalized.every((item, index) => item === legacyDefaultSavedQueries[index]);

      return normalized.length && !isLegacyDefaultSet ? normalized : defaultSavedQueries;
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
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [chatSessionCount, setChatSessionCount] = useState(1);

  const apiConfigured = isHandbookApiConfigured();
  const apiBaseUrl = getHandbookApiBaseUrl();
  const modalCopy =
    languageMode === "zh"
      ? {
          sources: "来源",
          liveLinks: "实时来源链接",
          noSources: "这次回答没有返回可用的手册来源链接。",
          notes: "引用说明",
          notesBody: "这些链接会打开当前回答所使用的官方页面。",
        }
      : {
          sources: "Sources",
          liveLinks: "Live source links",
          noSources: "No handbook source links were returned for this answer.",
          notes: "Reference notes",
          notesBody: "These links open the official pages used to support the current answer.",
        };

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
      window.localStorage.setItem(recentStorageKey, JSON.stringify(recentConversations));
    }
  }, [recentConversations]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(savedStorageKey, JSON.stringify(savedQueries));
    }
  }, [savedQueries]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(themeStorageKey, themeMode);
      document.documentElement.classList.toggle("theme-dark", themeMode === "dark");
      document.documentElement.style.colorScheme = themeMode;
    }
  }, [themeMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(languageStorageKey, languageMode);
      document.documentElement.lang = languageMode === "zh" ? "zh-CN" : "en";
    }
  }, [languageMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(modelStorageKey, selectedModel);
    }
  }, [selectedModel]);

  function buildHistory(messageList: ChatMessage[]): HandbookChatTurn[] {
    return messageList.map((message) => ({
      role: message.role,
      content: message.role === "assistant" ? message.response?.answer || message.content : message.content,
    }));
  }

  function buildConversationTitle(question: string) {
    const normalized = question.replace(/\s+/g, " ").trim();
    return normalized.length > 54 ? `${normalized.slice(0, 51)}...` : normalized;
  }

  function upsertRecentConversation(conversation: RecentConversation) {
    setRecentConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)].slice(0, 8));
  }

  function saveConversationSnapshot(nextMessages: ChatMessage[], nextResponseId?: string, fallbackQuestion?: string) {
    const latestQuestion =
      [...nextMessages].reverse().find((message) => message.role === "user")?.content.trim() || fallbackQuestion?.trim() || "";

    if (!latestQuestion || !nextMessages.length) {
      return;
    }

    const conversationId = currentConversationId ?? `conversation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const snapshot: RecentConversation = {
      id: conversationId,
      title: buildConversationTitle(latestQuestion),
      question: latestQuestion,
      timestamp: formatClockTime(new Date()),
      messages: nextMessages,
      previousResponseId: nextResponseId,
      model: selectedModel,
    };

    if (!currentConversationId) {
      setCurrentConversationId(conversationId);
    }

    upsertRecentConversation(snapshot);
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
    setIsGenerating(true);

    try {
      const response = await requestHandbookAnswer({
        question: trimmed,
        history,
        mode: answerMode,
        model: selectedModel,
        previousResponseId: threadResponseId,
      });

      const assistantMessage = createAssistantMessage(response);
      const nextMessages = [...messages, userMessage, assistantMessage];
      setMessages(nextMessages);
      setThreadResponseId(response.previousResponseId);
      saveConversationSnapshot(nextMessages, response.previousResponseId, trimmed);
      setInput("");
    } finally {
      setIsGenerating(false);
    }
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

    try {
      const response = await requestHandbookAnswer({
        question,
        history,
        mode: answerMode,
        model: selectedModel,
      });

      const updatedMessages = messages.map((message) =>
        message.id === messageId ? { ...createAssistantMessage(response), id: messageId } : message,
      );
      setMessages(updatedMessages);
      setThreadResponseId(response.previousResponseId);
      saveConversationSnapshot(updatedMessages, response.previousResponseId, question);
    } finally {
      setIsGenerating(false);
    }
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
      title: modalCopy.sources,
      sources: uniqueSources,
    });
  }

  function handleNewChat() {
    setActiveNav("Chat");
    setMessages([]);
    setInput("");
    setThreadResponseId(undefined);
    setCurrentConversationId(undefined);
    setSelectedSources(null);
    setSidebarOpen(false);
    setChatSessionCount((current) => current + 1);
  }

  function handlePromptSelect(prompt: string) {
    setActiveNav("Chat");
    setInput(prompt);
    void runQuery(prompt);
  }

  function handleRecentQuestionSelect(conversationId: string) {
    const conversation = recentConversations.find((item) => item.id === conversationId);
    if (!conversation) {
      return;
    }

    setActiveNav("Chat");
    setMessages(conversation.messages);
    setInput("");
    setSelectedModel(conversation.model ?? "gpt-5.4");
    setThreadResponseId(conversation.previousResponseId);
    setCurrentConversationId(conversation.id);
    setSelectedSources(null);
    setSidebarOpen(false);
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

  function handleDeleteRecentConversation(conversationId: string) {
    setRecentConversations((current) => current.filter((item) => item.id !== conversationId));
    if (currentConversationId === conversationId) {
      setMessages([]);
      setCurrentConversationId(undefined);
      setThreadResponseId(undefined);
      setSelectedSources(null);
      setActiveNav("Chat");
    }
  }

  function handleDeleteSavedQuery(question: string) {
    setSavedQueries((current) => current.filter((item) => item !== question));
  }

  function handleModelChange(model: HandbookModel) {
    setSelectedModel(model);
    setThreadResponseId(undefined);
  }

  const sidebarDrawerClasses = "fixed inset-y-0 left-0 z-40 w-[88vw] max-w-sm overflow-y-auto bg-transparent p-4 lg:hidden";

  return (
    <div className={`min-h-screen px-4 py-4 transition-colors lg:px-6 lg:py-6 ${themeMode === "dark" ? "theme-dark" : ""}`}>
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1440px] gap-4 lg:grid-cols-[300px,minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Sidebar
            activeNav={activeNav}
            recentConversations={recentConversations}
            savedQueries={savedQueries}
            suggestedQuestions={suggestedQuestions}
            languageMode={languageMode}
            onNavChange={setActiveNav}
            onSuggestedQuestion={handlePromptSelect}
            onRecentQuestionSelect={handleRecentQuestionSelect}
            onDeleteRecentQuestion={handleDeleteRecentConversation}
            onSavedQuerySelect={handleSavedQuerySelect}
            onDeleteSavedQuery={handleDeleteSavedQuery}
          />
        </aside>

        <div className="min-w-0">
          <ChatPanel
            activeNav={activeNav}
            messages={messages}
            recentConversations={recentConversations}
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
            selectedModel={selectedModel}
            chatSessionCount={chatSessionCount}
            languageMode={languageMode}
            themeMode={themeMode}
            onInputChange={setInput}
            onSubmit={() => void runQuery(input)}
            onPromptSelect={handlePromptSelect}
            onRecentQuestionSelect={handleRecentQuestionSelect}
            onDeleteRecentQuestion={handleDeleteRecentConversation}
            onSavedQuerySelect={handleSavedQuerySelect}
            onDeleteSavedQuery={handleDeleteSavedQuery}
            onSaveCurrentQuery={handleSaveCurrentQuery}
            onRegenerate={regenerateLatestAnswer}
            onCopy={handleCopy}
            onViewSource={handleViewSource}
            onAnswerModeChange={setAnswerMode}
            onModelChange={handleModelChange}
            onLanguageModeChange={setLanguageMode}
            onThemeModeChange={setThemeMode}
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
            recentConversations={recentConversations}
            savedQueries={savedQueries}
            suggestedQuestions={suggestedQuestions}
            languageMode={languageMode}
            onNavChange={setActiveNav}
            onSuggestedQuestion={handlePromptSelect}
            onRecentQuestionSelect={handleRecentQuestionSelect}
            onDeleteRecentQuestion={handleDeleteRecentConversation}
            onSavedQuerySelect={handleSavedQuerySelect}
            onDeleteSavedQuery={handleDeleteSavedQuery}
          />
        </div>
      </aside>

      <Modal
        open={Boolean(selectedSources)}
        onClose={() => setSelectedSources(null)}
        title={selectedSources?.title ?? modalCopy.sources}
        subtitle={selectedSources?.subtitle}
      >
        {selectedSources?.sources.length ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">{modalCopy.liveLinks}</Badge>
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
            {modalCopy.noSources}
          </div>
        )}
        <div className="mt-5 rounded-[1.4rem] bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900/80">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
            <Info size={14} />
            {modalCopy.notes}
          </div>
          {modalCopy.notesBody}
        </div>
      </Modal>
    </div>
  );
}

export default App;
