/**
 * Central definition of the Gemini model used across all AI endpoints.
 *
 * The previous code hard-coded "gemini-3.5-flash" in six places — an identifier
 * that does not follow Google's model naming (1.0 → 1.5 → 2.0 → 2.5 → 3) and
 * very likely does not exist, which would make every live AI call fail (4xx).
 *
 * The value is overridable via the GEMINI_MODEL env var so it can be corrected
 * without touching code. Confirm the exact name against the current Google
 * model catalog for your API key/region before going to production.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
