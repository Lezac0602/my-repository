import { HandbookApiRequest, HandbookApiResponse } from "../types";

const apiBaseUrl = import.meta.env.VITE_HANDBOOK_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";

function createFallbackResponse(message: string, status: HandbookApiResponse["status"] = "error"): HandbookApiResponse {
  return {
    answer: "",
    bullets: [],
    caution: "",
    citations: [],
    sourcePages: [],
    status,
    message,
  };
}

export function getHandbookApiBaseUrl(): string {
  return apiBaseUrl;
}

export function isHandbookApiConfigured(): boolean {
  return Boolean(apiBaseUrl);
}

export async function requestHandbookAnswer(payload: HandbookApiRequest): Promise<HandbookApiResponse> {
  if (!apiBaseUrl) {
    return createFallbackResponse(
      "The live handbook backend is not configured yet. Set VITE_HANDBOOK_API_BASE_URL to connect this chat to the deployed API.",
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/handbook-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as Partial<HandbookApiResponse> | null;
    const normalized: HandbookApiResponse = {
      answer: typeof data?.answer === "string" ? data.answer : "",
      bullets: Array.isArray(data?.bullets) ? data!.bullets.filter((item): item is string => typeof item === "string") : [],
      caution: typeof data?.caution === "string" ? data.caution : "",
      citations: Array.isArray(data?.citations)
        ? data!.citations.filter(
            (item): item is { title: string; url: string } =>
              Boolean(item) && typeof item.title === "string" && typeof item.url === "string",
          )
        : [],
      sourcePages: Array.isArray(data?.sourcePages)
        ? data!.sourcePages.filter(
            (item): item is { title: string; url: string } =>
              Boolean(item) && typeof item.title === "string" && typeof item.url === "string",
          )
        : [],
      previousResponseId: typeof data?.previousResponseId === "string" ? data.previousResponseId : undefined,
      status:
        data?.status === "ok" || data?.status === "no_handbook_source" || data?.status === "error"
          ? data.status
          : response.ok
            ? "ok"
            : "error",
      message: typeof data?.message === "string" ? data.message : undefined,
    };

    if (!response.ok) {
      return {
        ...normalized,
        status: normalized.status === "no_handbook_source" ? "no_handbook_source" : "error",
        message: normalized.message ?? "The handbook service returned an error.",
      };
    }

    return normalized;
  } catch {
    return createFallbackResponse(
      "The handbook service could not be reached. Check the deployed API URL or try again in a moment.",
    );
  }
}
