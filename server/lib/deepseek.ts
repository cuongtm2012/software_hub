import {
  getDeepseekRuntimeConfig,
  isDeepseekConfigured as isDeepseekConfiguredFromSettings,
  refreshDeepseekRuntimeSettings,
} from "./deepseek-settings";

export { refreshDeepseekRuntimeSettings, isDeepseekConfiguredFromSettings as isDeepseekConfigured };

type DeepseekRole = "system" | "user" | "assistant";

export type DeepseekChatMessage = {
  role: DeepseekRole;
  content: string;
};

export type DeepseekChatCompletionRequest = {
  model: string;
  messages: DeepseekChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
};

type DeepseekChatCompletionResponse = {
  choices?: Array<{
    message?: { role?: string; content?: string };
  }>;
};

export async function deepseekChatCompletion(
  req: Omit<DeepseekChatCompletionRequest, "model"> & { model?: string },
): Promise<string> {
  const { apiKey, baseUrl, model: defaultModel } = getDeepseekRuntimeConfig();
  const model = req.model || defaultModel;

  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: req.messages,
      temperature: req.temperature ?? 0.4,
      max_tokens: req.max_tokens ?? 1200,
      ...(req.response_format ? { response_format: req.response_format } : {}),
    } satisfies DeepseekChatCompletionRequest),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DeepSeek error: ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  }

  const data = (await res.json()) as DeepseekChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty content");
  return content;
}
