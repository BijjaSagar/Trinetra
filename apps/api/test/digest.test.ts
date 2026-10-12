import { describe, expect, it } from "vitest";
import pino from "pino";
import { buildDigest } from "../src/digest/build.js";
import { numbersOutsideInput } from "../src/digest/number-check.js";
import { DIGEST_SYSTEM_PROMPT, containsBuyOrSell } from "../src/digest/schema.js";
import { buildDigestInput, templateDigest } from "../src/digest/template.js";
import type { Reading } from "../src/fetchers/types.js";
import { kolkataDateString } from "../src/domain/time.js";

const log = pino({ level: "silent" });

describe("number check and template digest", () => {
  const readings: Reading[] = [
    {
      key: "petrol_solapur",
      value: 101.5,
      unit: "INR/L",
      asOf: new Date("2026-10-12T00:00:00.000Z"),
      sourceUrl: "https://example.com",
    },
  ];
  const input = buildDigestInput({
    digestDate: "2026-10-12",
    readings,
    headlines: [],
    signals: [
      {
        indicatorKey: "petrol_solapur",
        level: "stock_up",
        reasonCode: "petrol_price_changed",
        asOf: readings[0]!.asOf,
        details: null,
      },
    ],
  });

  it("accepts sensible rounding and rejects a foreign number", () => {
    expect(numbersOutsideInput("Oil is 198.6, about 199.", { value: 198.6 })).toEqual([]);
    expect(numbersOutsideInput("२ ते ४", { buffer: [2, 4] })).toEqual([]);
    expect(
      numbersOutsideInput("The index is 200.", { value: 198.6 }).map((item) => item.raw),
    ).toEqual(["200"]);
  });

  it("keeps the template inside the rules", () => {
    const copy = templateDigest(input);
    const text = Object.values(copy).join("\n");
    expect(containsBuyOrSell(text)).toBe(false);
    expect(text).toContain("2 to 4");
    expect(text.toLowerCase()).toContain("do not store petrol at home");
    expect([...copy.pushBodyEn].length).toBeLessThanOrEqual(120);
    expect([...copy.pushBodyMr].length).toBeLessThanOrEqual(120);
    expect(numbersOutsideInput(text, input)).toEqual([]);
    expect(DIGEST_SYSTEM_PROMPT).toContain("Never say buy or sell.");
    expect(DIGEST_SYSTEM_PROMPT).toContain("2 to 4 week");
  });

  it("retries once and then uses the template", async () => {
    let calls = 0;
    const copy = await buildDigest({
      input,
      logger: log,
      model: {
        async complete() {
          calls += 1;
          return JSON.stringify({
            headline_en: "Up 999",
            headline_mr: "९९९",
            summary_en: "999",
            summary_mr: "999",
            push_title_en: "Trinetra",
            push_title_mr: "त्रिनेत्र",
            push_body_en: "999",
            push_body_mr: "999",
          });
        },
      },
    });
    expect(calls).toBe(2);
    expect(copy.source).toBe("template");
    expect(copy.copy.pushBodyEn).toContain("2 to 4");
  });
});

describe("Asia/Kolkata calendar", () => {
  it("maps 02:00 UTC to the same IST date", () => {
    expect(kolkataDateString(new Date("2026-10-12T02:00:00.000Z"))).toBe("2026-10-12");
    expect(kolkataDateString(new Date("2026-10-12T18:30:00.000Z"))).toBe("2026-10-13");
  });
});
