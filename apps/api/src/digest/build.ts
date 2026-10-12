import Anthropic from "@anthropic-ai/sdk";
import type { DigestCopy } from "../db/types.js";
import type { Logger } from "pino";
import {
  DIGEST_SYSTEM_PROMPT,
  containsBuyOrSell,
  digestModelSchema,
  parseModelJson,
} from "./schema.js";
import { numbersOutsideInput } from "./number-check.js";
import { templateDigest, type DigestInput } from "./template.js";

export interface DigestModel {
  complete(system: string, user: string): Promise<string>;
}

export function createClaudeModel(apiKey: string, model: string): DigestModel {
  const client = new Anthropic({ apiKey });
  return {
    async complete(system, user) {
      const message = await client.messages.create({
        model,
        max_tokens: 1200,
        system,
        messages: [{ role: "user", content: user }],
      });
      const text = message.content.find((block) => block.type === "text");
      return text && text.type === "text" ? text.text : "";
    },
  };
}

export async function buildDigest(args: {
  input: DigestInput;
  model: DigestModel | null;
  logger: Logger;
}): Promise<{ copy: DigestCopy; source: "claude" | "template" }> {
  if (!args.model) {
    args.logger.info("Claude key missing, using template digest");
    return { copy: templateDigest(args.input), source: "template" };
  }
  let reminder = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = await args.model.complete(
        DIGEST_SYSTEM_PROMPT,
        `${JSON.stringify(args.input)}\n${reminder}`,
      );
      const parsed = digestModelSchema.parse(parseModelJson(raw));
      const text = Object.values(parsed).join("\n");
      if (containsBuyOrSell(text)) {
        reminder = "Rewrite. Do not use the words buy or sell.";
        args.logger.warn({ attempt }, "digest rejected for buy or sell wording");
        continue;
      }
      const outside = numbersOutsideInput(text, args.input);
      if (outside.length > 0) {
        reminder = `Rewrite. These numbers were not in the input: ${outside.map((item) => item.raw).join(", ")}.`;
        args.logger.warn(
          { attempt, outside: outside.map((item) => item.raw) },
          "digest rejected numbers",
        );
        continue;
      }
      return {
        source: "claude",
        copy: {
          headlineEn: parsed.headline_en,
          headlineMr: parsed.headline_mr,
          summaryEn: parsed.summary_en,
          summaryMr: parsed.summary_mr,
          pushTitleEn: parsed.push_title_en,
          pushTitleMr: parsed.push_title_mr,
          pushBodyEn: parsed.push_body_en,
          pushBodyMr: parsed.push_body_mr,
        },
      };
    } catch (error) {
      reminder =
        "Rewrite as JSON matching the required keys. Push bodies must be at most 120 characters.";
      args.logger.warn({ attempt, err: error }, "digest model output failed validation");
    }
  }
  args.logger.info("using template digest after model rejection");
  return { copy: templateDigest(args.input), source: "template" };
}
