import OpenAI from "openai";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const handbookPrefix = (process.env.HANDBOOK_URL_PREFIX || "https://www.polyu.edu.hk/gs/rpghandbook/").trim();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://lezac0602.github.io")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.fixedWindow(12, "5 m"),
        prefix: "campus-handbook-chat",
      })
    : null;

function setCorsHeaders(res, origin) {
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

async function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function validateRequest(body) {
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const mode = body?.mode === "detailed" ? "detailed" : "concise";
  const previousResponseId =
    typeof body?.previousResponseId === "string" && body.previousResponseId.trim()
      ? body.previousResponseId.trim()
      : undefined;

  const history = Array.isArray(body?.history)
    ? body.history
        .filter(
          (item) =>
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.trim(),
        )
        .slice(-10)
        .map((item) => ({
          role: item.role,
          content: item.content.trim(),
        }))
    : [];

  if (!question) {
    return { error: "A non-empty question is required." };
  }

  return {
    question,
    mode,
    history,
    previousResponseId,
  };
}

function buildInstruction(mode, strictRetry) {
  const depthLine =
    mode === "detailed"
      ? "Use a richer explanation with 4 to 6 bullets when the handbook supports them."
      : "Keep the answer concise with 3 to 4 bullets.";

  const retryLine = strictRetry
    ? "This is a retry because previous results did not include valid handbook sources. If you cannot support the answer with handbook URLs under the exact prefix, state that no valid handbook source was found."
    : "If you cannot support the answer with handbook URLs under the exact prefix, state that no valid handbook source was found instead of guessing.";

  return [
    "You are a handbook QA assistant for The Hong Kong Polytechnic University.",
    `Only answer using information supported by the PolyU Graduate School Research Postgraduate Handbook pages under this URL prefix: ${handbookPrefix}`,
    "Treat any other page, even on polyu.edu.hk, as invalid for final answer support.",
    retryLine,
    depthLine,
    "Return plain text using exactly these sections and nothing else:",
    "SUMMARY:",
    "<one paragraph>",
    "KEY DETAILS:",
    "- bullet",
    "- bullet",
    "CAUTION:",
    "<one paragraph>",
    "Do not mention any source outside the allowed handbook prefix in the final answer.",
  ].join("\n");
}

function buildInput(question, history) {
  return [
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    {
      role: "user",
      content: question,
    },
  ];
}

function uniqueLinks(items) {
  return items.filter(
    (item, index, list) =>
      item &&
      typeof item.url === "string" &&
      typeof item.title === "string" &&
      list.findIndex((candidate) => candidate.url === item.url) === index,
  );
}

function collectLinksDeep(value, results = []) {
  if (!value) {
    return results;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectLinksDeep(item, results));
    return results;
  }

  if (typeof value !== "object") {
    return results;
  }

  if (value.type === "url_citation" && value.url_citation?.url) {
    results.push({
      title: value.url_citation.title || value.url_citation.url,
      url: value.url_citation.url,
    });
  }

  if (typeof value.url === "string" && value.url) {
    results.push({
      title: typeof value.title === "string" && value.title ? value.title : value.url,
      url: value.url,
    });
  }

  Object.values(value).forEach((item) => {
    if (item && typeof item === "object") {
      collectLinksDeep(item, results);
    }
  });

  return results;
}

function filterHandbookLinks(items) {
  return uniqueLinks(items).filter((item) => item.url.startsWith(handbookPrefix));
}

function parseStructuredAnswer(text) {
  const normalized = String(text || "").replace(/\r\n/g, "\n").trim();
  const summaryMatch = normalized.match(/SUMMARY:\s*([\s\S]*?)(?:\nKEY DETAILS:|\nCAUTION:|$)/i);
  const detailsMatch = normalized.match(/KEY DETAILS:\s*([\s\S]*?)(?:\nCAUTION:|$)/i);
  const cautionMatch = normalized.match(/CAUTION:\s*([\s\S]*)$/i);

  const answer = summaryMatch?.[1]?.trim() || normalized;
  const bullets = (detailsMatch?.[1] || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*•]\s+/.test(line))
    .map((line) => line.replace(/^[-*•]\s+/, ""));
  const caution = cautionMatch?.[1]?.trim() || "Verify the latest wording on the official handbook page before relying on this answer.";

  return {
    answer,
    bullets,
    caution,
  };
}

function createNoSourceResponse() {
  return {
    answer: "No valid RPg handbook source could be confirmed for this question within the allowed handbook scope.",
    bullets: [
      "The search did not return handbook-backed pages under the required RPg handbook prefix.",
      "No answer was generated from unsupported PolyU pages.",
      "Try using handbook terms such as admission, progress review, thesis examination, or leave of absence.",
    ],
    caution: "This assistant is configured to avoid guessing when handbook support cannot be verified.",
    citations: [],
    sourcePages: [],
    status: "no_handbook_source",
    message: "No valid handbook source could be verified.",
  };
}

async function fetchHandbookResponse({ question, history, mode, previousResponseId, strictRetry }) {
  const response = await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    tools: [
      {
        type: "web_search",
        filters: {
          allowed_domains: ["www.polyu.edu.hk"],
        },
      },
    ],
    tool_choice: "auto",
    include: ["web_search_call.action.sources"],
    previous_response_id: previousResponseId,
    input: [
      {
        role: "system",
        content: buildInstruction(mode, strictRetry),
      },
      ...buildInput(question, previousResponseId ? [] : history),
    ],
  });

  const parsed = parseStructuredAnswer(response.output_text);
  const allLinks = collectLinksDeep(response.output, []);
  const citations = filterHandbookLinks(allLinks.filter((item) => item.url.startsWith(handbookPrefix)));
  const sourcePages = filterHandbookLinks(allLinks);

  return {
    answer: parsed.answer,
    bullets: parsed.bullets,
    caution: parsed.caution,
    citations: citations.length ? citations : sourcePages.slice(0, 6),
    sourcePages,
    previousResponseId: response.id,
    status: sourcePages.length ? "ok" : "no_handbook_source",
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (origin && !allowedOrigins.includes(origin)) {
    sendJson(res, 403, {
      status: "error",
      message: "This origin is not allowed to use the handbook API.",
    });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, {
      status: "error",
      message: "Only POST is supported for this endpoint.",
    });
    return;
  }

  if (!openai) {
    sendJson(res, 500, {
      status: "error",
      message: "OPENAI_API_KEY is not configured on the backend.",
    });
    return;
  }

  try {
    if (ratelimit) {
      const ip = getClientIp(req);
      const result = await ratelimit.limit(`ip:${ip}`);

      res.setHeader("X-RateLimit-Limit", String(result.limit));
      res.setHeader("X-RateLimit-Remaining", String(result.remaining));
      res.setHeader("X-RateLimit-Reset", String(result.reset));

      if (!result.success) {
        sendJson(res, 429, {
          status: "error",
          message: "Rate limit reached for the handbook demo. Please wait a few minutes and try again.",
        });
        return;
      }
    }

    const body = await parseBody(req);
    const validated = validateRequest(body);

    if ("error" in validated) {
      sendJson(res, 400, {
        status: "error",
        message: validated.error,
      });
      return;
    }

    let response = await fetchHandbookResponse({
      ...validated,
      strictRetry: false,
    });

    if (!response.sourcePages.length) {
      response = await fetchHandbookResponse({
        ...validated,
        previousResponseId: undefined,
        strictRetry: true,
      });
    }

    if (!response.sourcePages.length) {
      sendJson(res, 200, createNoSourceResponse());
      return;
    }

    sendJson(res, 200, response);
  } catch (error) {
    console.error("handbook-chat error", error);
    sendJson(res, 500, {
      status: "error",
      message: "The handbook service encountered an unexpected error.",
    });
  }
}
