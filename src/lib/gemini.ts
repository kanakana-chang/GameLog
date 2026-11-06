export const GEMINI_TEXT_MODEL = "gemini-3.5-flash-lite";

export function hasGeminiKey() {
  return Boolean(
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  );
}

export async function generateGeminiText(
  prompt: string,
  options?: {
    temperature?: number;
    timeoutMs?: number;
    maxOutputTokens?: number;
    retries?: number;
    model?: string;
  },
) {
  const key =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!key) {
    console.error("Gemini API key is not configured");
    return null;
  }

  const model = options?.model ?? GEMINI_TEXT_MODEL;
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options?.temperature ?? 0.4,
      ...(options?.maxOutputTokens
        ? { maxOutputTokens: options.maxOutputTokens }
        : {}),
    },
  };

  const attempts = Math.max(1, options?.retries ?? 2);

  for (let attempt = 0; attempt < attempts; attempt++) {
    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(options?.timeoutMs ?? 8000),
      });
    } catch (error) {
      console.error("Gemini network error", error);
      if (attempt >= attempts - 1) return null;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      continue;
    }

    if (response.ok) {
      try {
        const data = (await response.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };

        return (
          data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          null
        );
      } catch (error) {
        console.error("Gemini response parsing failed", error);
        return null;
      }
    }

    const errorText = await response.text();

    console.error("Gemini request failed", {
      status: response.status,
      attempt: attempt + 1,
      error: errorText,
    });

    const retryable =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;

    if (!retryable || attempt >= attempts - 1) {
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }

  return null;
}
