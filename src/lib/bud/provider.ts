/** Canonical Bud model adapter. Providers are replaceable; none is mandatory. */

export type ProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ProviderResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export type AIProvider = {
  id: string;
  kind: "remote" | "free";
  complete: (messages: ProviderMessage[], opts?: { maxTokens?: number; signal?: AbortSignal }) => Promise<ProviderResult>;
};

const FREE_REPLY =
  "Bud is quiet in this environment — the live model isn’t available right now. UNIBUD still works. Market for hostels and services, Money for the demo ledger, Studies for your semester, Communities for campus rooms, Riff for gist. Ask again when the model is back.";

const freeProvider: AIProvider = {
  id: "free",
  kind: "free",
  async complete() {
    return { ok: true, text: FREE_REPLY };
  },
};

function xaiProvider(apiKey: string): AIProvider {
  return {
    id: "xai",
    kind: "remote",
    async complete(messages, opts) {
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal: opts?.signal,
          body: JSON.stringify({
            model: "grok-4.5",
            max_tokens: opts?.maxTokens ?? 700,
            messages,
          }),
        });
        if (!res.ok) {
          const error =
            res.status >= 500
              ? "Bud couldn’t reach the model. Try again in a moment."
              : "Bud couldn’t reply just now. Try again.";
          return { ok: false, error };
        }
        const body = (await res.json()) as { choices: { message: { content: string } }[] };
        return { ok: true, text: body.choices[0]?.message.content ?? "I went quiet. Ask me again." };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return { ok: false, error: "Bud stopped that reply." };
        }
        return { ok: false, error: "Looks like the connection dropped. Check your network and try again." };
      }
    },
  };
}

/** Configuration-driven. Paid/remote only if a key is present. Never throws. */
export function getAIProvider(): AIProvider {
  const key = typeof process !== "undefined" ? process.env.XAI_API_KEY : undefined;
  if (key && key.trim()) return xaiProvider(key.trim());
  return freeProvider;
}
