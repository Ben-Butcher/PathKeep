import { GoogleGenAI } from "@google/genai";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in your environment");
}
const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

async function callApi(prompt, opts = {}) {
  const controller = new AbortController();
  const timeout = opts.timeout ?? 15000;
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await ai.models.generateContent({
      model: opts.model || "gemini-2.5-flash",
      contents: prompt,
    });

    clearTimeout(id);

    // Normalize response into a single text string for callers.
    let text = null;

    // Google GenAI shapes
    if (res?.output && Array.isArray(res.output) && res.output[0]) {
      const c = res.output[0].content;
      if (Array.isArray(c) && c[0] && typeof c[0].text === "string")
        text = c[0].text;
      else if (typeof res.output[0].text === "string")
        text = res.output[0].text;
    }

    // candidates / choices
    if (!text && res?.candidates && res.candidates[0]) {
      if (typeof res.candidates[0].content === "string")
        text = res.candidates[0].content;
      else if (res.candidates[0].message?.content)
        text = res.candidates[0].message.content;
    }

    // OpenAI-like
    if (!text && res?.choices && res.choices[0]) {
      text = res.choices[0].message?.content || res.choices[0].text || null;
    }

    if (!text && typeof res === "string") text = res;
    if (!text && res?.text) text = res.text;
    if (!text && res?.result?.output_text) text = res.result.output_text;

    if (!text) text = JSON.stringify(res);

    return { text, raw: res };
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
    const text =
      (resp && resp.text) || JSON.stringify(resp && resp.raw ? resp.raw : resp);

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
