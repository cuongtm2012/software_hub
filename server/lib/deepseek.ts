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

export function isDeepseekConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

export function getDeepseekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY chưa được cấu hình trên server");
  }

  return { apiKey, baseUrl, model };
}

export async function deepseekChatCompletion(
  req: Omit<DeepseekChatCompletionRequest, "model"> & { model?: string },
): Promise<string> {
  const { apiKey, baseUrl, model: defaultModel } = getDeepseekConfig();
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

