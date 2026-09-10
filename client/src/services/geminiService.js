async function callApi(prompt, opts = {}) {
  const endpoint =
    import.meta.env.VITE_GEMINI_ENDPOINT ||
    process.env.REACT_APP_GEMINI_ENDPOINT;
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      "Gemini endpoint or API key not configured in env variables",
    );
  }

  const controller = new AbortController();
  const timeout = opts.timeout ?? 15000;
  const id = setTimeout(() => controller.abort(), timeout);

  const body = {
    // Keep body generic; callers can set `model` in opts if needed
    model: opts.model || "gemini-default",
    prompt,
    max_tokens: opts.max_tokens ?? 300,
    temperature: opts.temperature ?? 0.7,
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Gemini API error ${res.status}: ${txt}`);
    }

    const data = await res.json().catch(async () => {
      const t = await res.text();
      return { text: t };
    });

    return data;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Build a prompt from flagged modules and return an array of short suggestions.
 * flaggedModules: [{ moduleId, moduleName, riskLevel, averageScore, attendanceRate }]
 */
export async function getInterventionSuggestions(
  flaggedModules = [],
  options = {},
) {
  if (!Array.isArray(flaggedModules) || flaggedModules.length === 0) {
    return [];
  }

  const summary = flaggedModules
    .map(
      (m) =>
        `- ${m.moduleName} (risk: ${m.riskLevel}, score: ${m.averageScore}, attendance: ${m.attendanceRate}%)`,
    )
    .join("\n");

  const prompt = `You are an assistant that provides short, actionable study or intervention suggestions for students. Given the following modules and their risk indicators, provide 3 concise, actionable recommendations (one per line) tailored to these modules. Keep each suggestion short (under 120 characters):\n\n${summary}\n\nReturn only the suggestions as a simple bullet or numbered list.`;

  try {
    const resp = await callApi(prompt, options);

    // Best-effort parsing depending on API shape
    let text = "";
    if (resp.choices && resp.choices[0]) {
      // OpenAI-like shapes
      text = resp.choices[0].message?.content || resp.choices[0].text || "";
    } else if (resp.output?.text) {
      text = resp.output.text;
    } else if (typeof resp === "string") {
      text = resp;
    } else if (resp.text) {
      text = resp.text;
    } else {
      text = JSON.stringify(resp);
    }

    // Split into lines, strip bullets/numbers, take up to 3 suggestions
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => l.replace(/^[-\d\.\)\s]+/, "").trim());

    // If parsing fails and we have a long text, split into sentences
    let suggestions = lines.filter((l) => l.length > 10);
    if (suggestions.length === 0 && text.length > 30) {
      suggestions = text
        .split(/[\.\!\?]\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);
    }

    return suggestions.slice(0, 3);
  } catch (err) {
    console.error("getInterventionSuggestions error:", err);
    throw err;
  }
}

export default { getInterventionSuggestions };
