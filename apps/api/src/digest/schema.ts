import { z } from "zod";

export const digestModelSchema = z.object({
  headline_en: z.string().min(1),
  headline_mr: z.string().min(1),
  summary_en: z.string().min(1),
  summary_mr: z.string().min(1),
  push_title_en: z.string().min(1),
  push_title_mr: z.string().min(1),
  push_body_en: z.string().min(1).max(120),
  push_body_mr: z.string().min(1).max(120),
});

export type DigestModelOutput = z.infer<typeof digestModelSchema>;

export const DIGEST_SYSTEM_PROMPT = [
  "You write the Trinetra morning digest.",
  "Only use numbers that appear in the input JSON.",
  "Never say buy or sell.",
  "Keep a calm tone.",
  "When a signal level is stock_up, mention a 2 to 4 week household buffer.",
  "Never advise storing petrol at home.",
  "Respond with JSON only, using these keys: headline_en, headline_mr, summary_en, summary_mr, push_title_en, push_title_mr, push_body_en, push_body_mr.",
  "Each push body must be at most 120 characters.",
].join(" ");

export function containsBuyOrSell(text: string): boolean {
  return /\bbuy\b/i.test(text) || /\bsell\b/i.test(text);
}

export function parseModelJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const body = fenced?.[1] ?? text;
  return JSON.parse(body.trim());
}
