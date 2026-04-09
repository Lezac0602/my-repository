import { Activity, AlertTriangle, Database, FileSearch, Layers3, ShieldCheck } from "lucide-react";
import { documents, getAverageCoverage, getDocumentById, getLatestKnowledgeBaseUpdate } from "../../data/mockRag";
import { ChunkRecord, MockQueryScenario, PipelineStepStatus } from "../../types";
import { highlightText } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { PanelHeader } from "../ui/panel-header";
import { ProgressBar } from "../ui/progress-bar";
import { Button } from "../ui/button";

interface EvidencePanelProps {
  scenario?: MockQueryScenario;
  evidence: ChunkRecord[];
  activeStep: number;
  isGenerating: boolean;
  onInspectChunk: (chunkId: string) => void;
  answerReliability?: "High" | "Medium" | "Low";
}

function getStepStatus(
  index: number,
  activeStep: number,
  scenario?: MockQueryScenario,
  isGenerating?: boolean,
): PipelineStepStatus {
  if (!scenario) {
    return "pending";
  }

  if (scenario.noResults && !isGenerating) {
    if (index === 0) {
      return "complete";
    }
    if (index === 1) {
      return "failed";
    }
    return "pending";
  }

  if (!isGenerating) {
    return "complete";
  }

  if (index < activeStep) {
    return "complete";
  }

  if (index === activeStep) {
    return "active";
  }

  return "pending";
}

const stepStyles: Record<PipelineStepStatus, string> = {
  pending: "border-slate-200 bg-white/70 text-slate-400",
  active: "border-primary/20 bg-primarySoft text-primary",
  complete: "border-emerald-200 bg-emerald-50 text-success",
  failed: "border-amber-200 bg-amber-50 text-warning",
};

export function EvidencePanel({
  scenario,
  evidence,
  activeStep,
  isGenerating,
  onInspectChunk,
  answerReliability,
}: EvidencePanelProps) {
  const topDocuments = documents.filter((document) => document.isTopReferenced).slice(0, 3);
  const coverage = getAverageCoverage();
  const lastUpdated = getLatestKnowledgeBaseUpdate();

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="p-5">
        <PanelHeader
          title="Retrieved Evidence"
          subtitle="Evidence cards explain which chunks support the current answer."
        />
        <div className="mt-4 space-y-3">
          {!scenario ? (
            <EmptyState
              icon={<FileSearch size={24} />}
              title="No evidence selected yet"
              description="Ask a question or load a mock conversation to inspect the retrieved source chunks."
            />
          ) : evidence.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle size={24} />}
              title="No relevant documents found"
              description="The current mock query did not return any evidence. Try a supported academic question or remove category filters."
            />
          ) : (
            evidence.map((chunk) => {
              const document = getDocumentById(chunk.documentId);
              return (
                <div
                  key={chunk.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onInspectChunk(chunk.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onInspectChunk(chunk.id);
                    }
                  }}
                  className="w-full rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">{document?.type ?? "Document"}</Badge>
                    <Badge>{chunk.pageLabel}</Badge>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {chunk.sectionLabel}
                    </div>
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-900">{document?.title}</div>
                  <p
                    className="mt-2 text-sm leading-6 text-slate-600"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(chunk.preview, chunk.keywords),
                    }}
                  />
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Relevance
                      </div>
                      <ProgressBar value={chunk.relevance} />
                    </div>
                    <Button variant="secondary" size="sm">
                      Inspect Source
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="p-5">
        <PanelHeader title="RAG Pipeline" subtitle="Mock retrieval flow for the current query." />
        <div className="mt-4 space-y-3">
          {(scenario?.pipeline ?? []).map((step, index) => {
            const status = getStepStatus(index, activeStep, scenario, isGenerating);
            return (
              <div key={step.id} className={`rounded-[1.4rem] border px-4 py-3 ${stepStyles[status]}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{step.label}</div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em]">{status}</div>
                </div>
                <p className="mt-1 text-sm leading-6 opacity-80">{step.description}</p>
              </div>
            );
          })}
          {!scenario ? (
            <div className="rounded-[1.4rem] border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
              Pipeline status will appear after a mock query is submitted.
            </div>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-1 2xl:grid-cols-2">
        <Card muted className="p-5">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-primary" />
            <h3 className="section-title">Top Referenced Documents</h3>
          </div>
          <div className="mt-4 space-y-3">
            {topDocuments.map((document) => (
              <div key={document.id} className="rounded-2xl bg-white/75 px-4 py-3">
                <div className="text-sm font-semibold text-slate-800">{document.title}</div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{document.category}</span>
                  <span>{Math.round(document.coverage * 100)}% coverage</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card muted className="p-5">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            <h3 className="section-title">Knowledge Metrics</h3>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Document coverage</span>
                <span className="font-semibold text-slate-700">{Math.round(coverage * 100)}%</span>
              </div>
              <ProgressBar value={coverage} />
            </div>
            <div className="rounded-2xl bg-white/75 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Last updated knowledge base</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{lastUpdated}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-1 2xl:grid-cols-2">
        <Card muted className="p-5">
          <div className="flex items-center gap-2">
            <Layers3 size={16} className="text-primary" />
            <h3 className="section-title">Question Intent</h3>
          </div>
          <div className="mt-4">
            <Badge tone="primary" className="text-sm">
              {scenario ? scenario.intent : "Waiting for query"}
            </Badge>
          </div>
        </Card>
        <Card muted className="p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            <h3 className="section-title">Answer Reliability</h3>
          </div>
          <div className="mt-4">
            <Badge
              tone={
                answerReliability === "High"
                  ? "success"
                  : answerReliability === "Medium"
                    ? "warning"
                    : "neutral"
              }
              className="text-sm"
            >
              {answerReliability ?? "No answer yet"}
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
