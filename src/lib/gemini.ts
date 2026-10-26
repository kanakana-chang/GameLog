export async function generateGeminiText(
  prompt: string,
  options?: { temperature?: number },
) {
  const key =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!key) {
    console.error("Gemini API key is not configured");
    return null;
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(key)}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options?.temperature ?? 0.4,
    },
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
    } catch (error) {
      console.error("Gemini network error", error);
      return null;
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
    
    // 一時的な障害・レート制限のみ再試行
    const retryable =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;
    
    // 再試行対象外、または最後の試行なら終了
    if (!retryable || attempt === 1) {
      return null;
    }
    
    // 再試行前に500ミリ秒待つ
    await new Promise((resolve) => setTimeout(resolve, 500));

  }

  return null;
}