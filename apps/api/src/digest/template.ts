import { rulesConfig } from "../rules/rules.config.js";
import type { SignalDraft } from "../rules/engine.js";
import { labelFor } from "../domain/indicators.js";
import type { DigestCopy } from "../db/types.js";
import type { Headline } from "../fetchers/types.js";
import type { Reading } from "../fetchers/types.js";
import { changeOver, roundPct } from "../domain/change.js";

export interface DigestInput {
  digestDate: string;
  bufferWeeks: { min: number; max: number };
  windows: { sevenDay: number; thirtyDay: number };
  signals: Array<{
    indicatorKey: string;
    labelEn: string;
    labelMr: string;
    level: string;
    reasonCode: string;
    value: number | null;
    unit: string | null;
    change7dPct: number | null;
  }>;
  headlines: string[];
}

const PRIORITY = [
  "petrol_solapur",
  "diesel_solapur",
  "brent_usd",
  "indian_basket_usd",
  "fao_veg_oil_index",
  "ujani_pct",
  "usd_inr",
  "gold_inr_10g",
  "silver_inr_kg",
];

const LEVEL_RANK: Record<string, number> = { stock_up: 3, watch: 2, normal: 1 };

export function buildDigestInput(args: {
  digestDate: string;
  signals: SignalDraft[];
  readings: Reading[];
  headlines: Headline[];
}): DigestInput {
  return {
    digestDate: args.digestDate,
    bufferWeeks: {
      min: rulesConfig.householdBufferWeeks.min,
      max: rulesConfig.householdBufferWeeks.max,
    },
    windows: { sevenDay: 7, thirtyDay: 30 },
    signals: args.signals.map((signal) => {
      const points = args.readings.filter((reading) => reading.key === signal.indicatorKey);
      const latest = points[points.length - 1];
      const change = latest
        ? changeOver(
            points.map((point) => ({ value: point.value, asOf: point.asOf })),
            { value: latest.value, asOf: latest.asOf },
            7,
            3,
          )
        : null;
      return {
        indicatorKey: signal.indicatorKey,
        labelEn: labelFor(signal.indicatorKey, "en"),
        labelMr: labelFor(signal.indicatorKey, "mr"),
        level: signal.level,
        reasonCode: signal.reasonCode,
        value: latest?.value ?? null,
        unit: latest?.unit ?? null,
        change7dPct: change === null ? null : roundPct(change),
      };
    }),
    headlines: args.headlines.slice(0, 8).map((headline) => headline.title),
  };
}

export function templateDigest(input: DigestInput): DigestCopy {
  const top = pickTop(input);
  const min = input.bufferWeeks.min;
  const max = input.bufferWeeks.max;
  if (!top) {
    return staleDigestCopy();
  }
  if (top.level === "stock_up") {
    return {
      headlineEn: `Stock up: ${top.labelEn}`,
      headlineMr: `साठा: ${top.labelMr}`,
      summaryEn: `${top.labelEn} needs attention. Keep a ${min} to ${max} week buffer of cooking oil, pulses and staples. Do not store petrol at home. Fill the vehicle tank instead.`,
      summaryMr: `${top.labelMr} कडे लक्ष द्या. खाद्यतेल, कडधान्य आणि धान्याचा ${min} ते ${max} आठवड्यांचा साठा ठेवा. घरी पेट्रोल साठवू नका. गाडीची टाकी भरा.`,
      pushTitleEn: "Trinetra",
      pushTitleMr: "त्रिनेत्र",
      pushBodyEn: fit(`Stock up: ${top.labelEn}. Keep a ${min} to ${max} week buffer.`),
      pushBodyMr: fit(`साठा: ${top.labelMr}. ${min} ते ${max} आठवड्यांचा साठा ठेवा.`),
    };
  }
  if (top.level === "watch") {
    return {
      headlineEn: `Watch: ${top.labelEn}`,
      headlineMr: `लक्ष ठेवा: ${top.labelMr}`,
      summaryEn: `${top.labelEn} is on watch. No extra buffer is called for today. Check the source link before changing a plan.`,
      summaryMr: `${top.labelMr} वर लक्ष ठेवा. आज जास्तीचा साठा गरजेचा नाही. योजना बदलण्यापूर्वी स्रोत पाहा.`,
      pushTitleEn: "Trinetra",
      pushTitleMr: "त्रिनेत्र",
      pushBodyEn: fit(`Watch: ${top.labelEn}. No extra buffer today.`),
      pushBodyMr: fit(`लक्ष ठेवा: ${top.labelMr}. आज जास्तीचा साठा नाही.`),
    };
  }
  return {
    headlineEn: "Normal today",
    headlineMr: "आज सामान्य",
    summaryEn:
      "No stock-up signal today. Keep the usual 2 to 4 week household buffer and check again tomorrow.",
    summaryMr:
      "आज साठा वाढवण्याचा संकेत नाही. नेहमीचा 2 ते 4 आठवड्यांचा घरगुती साठा ठेवा आणि उद्या पुन्हा पाहा.",
    pushTitleEn: "Trinetra",
    pushTitleMr: "त्रिनेत्र",
    pushBodyEn: "Normal today. No stock-up signal.",
    pushBodyMr: "आज सामान्य. साठा वाढवण्याचा संकेत नाही.",
  };
}

export function staleDigestCopy(): DigestCopy {
  return {
    headlineEn: "Data is stale",
    headlineMr: "आकडे जुने आहेत",
    summaryEn: "Today's sources did not refresh. The last good readings are still in the app.",
    summaryMr: "आजचे स्रोत मिळाले नाहीत. शेवटचे उपलब्ध आकडे अॅपमध्ये आहेत.",
    pushTitleEn: "Trinetra",
    pushTitleMr: "त्रिनेत्र",
    pushBodyEn: "Data is stale today. Open the app for the last good readings.",
    pushBodyMr: "आजचे आकडे जुने आहेत. शेवटचे आकडे अॅपमध्ये पाहा.",
  };
}

export function stockUpAlertCopy(labelEn: string, labelMr: string): { en: string; mr: string } {
  return {
    en: fit(`New stock up signal: ${labelEn}. Keep a 2 to 4 week buffer.`),
    mr: fit(`नवा साठा संकेत: ${labelMr}. 2 ते 4 आठवड्यांचा साठा ठेवा.`),
  };
}

function pickTop(input: DigestInput): DigestInput["signals"][number] | null {
  let best: DigestInput["signals"][number] | null = null;
  for (const signal of input.signals) {
    if (!best) {
      best = signal;
      continue;
    }
    const rank = LEVEL_RANK[signal.level] ?? 0;
    const bestRank = LEVEL_RANK[best.level] ?? 0;
    if (rank > bestRank) best = signal;
    else if (rank === bestRank && priority(signal.indicatorKey) < priority(best.indicatorKey)) {
      best = signal;
    }
  }
  return best;
}

function priority(key: string): number {
  const index = PRIORITY.indexOf(key);
  return index === -1 ? PRIORITY.length : index;
}

export function fit(text: string): string {
  const chars = [...text];
  if (chars.length <= 120) return text;
  return chars.slice(0, 119).join("") + "…";
}
