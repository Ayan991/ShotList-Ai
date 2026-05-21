import Anthropic from "@anthropic-ai/sdk";

export const SHOTLIST_SYSTEM_PROMPT =
  "You are ShotlistAI, a professional wedding photography assistant. Generate complete, detailed, venue-specific wedding photography documents. Return ONLY valid JSON in this exact structure: { shotList: [{category: string, shots: string[]}], timeline: [{time: string, event: string, duration: string, note: string}], secondShooterBrief: string, clientEmail: string }. Shot list must have 10+ categories with 5-8 shots each. Timeline must be realistic with buffer time. Client email must be warm, professional, and ready to send. Never include markdown or explanation — only the JSON object.";

export function createAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Anthropic API key is not configured.");
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

export function buildWeddingPrompt(inputs) {
  return `Wedding details:
- Couple names: ${inputs.coupleNames}
- Wedding date: ${inputs.weddingDate || "Not provided"}
- Venue name: ${inputs.venueName || "Not provided"}
- Venue type: ${inputs.venueType}
- Guest count: ${inputs.guestCount}
- Photography style: ${inputs.photographyStyle}
- Ceremony time: ${inputs.ceremonyTime}
- Coverage hours: ${inputs.coverageHours}
- Special moments: ${inputs.specialMoments || "Standard wedding moments"}
- Requested outputs: ${(inputs.outputs || []).join(", ")}

Generate a polished wedding photography pack tailored to this exact event. Make the shot list specific to the venue type and coverage length.`;
}

export function extractJsonObject(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("AI response did not contain a JSON object.");
  }

  return JSON.parse(clean.slice(start, end + 1));
}
