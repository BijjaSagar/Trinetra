import type { Headline } from "../fetchers/types.js";

export interface NewsFlags {
  dutyCut: boolean;
  retailHikeAnnounced: boolean;
  supplyCutAnnounced: boolean;
  dutyOrGstHeadlines: string[];
}

const dutyCutPattern =
  /\b(cuts|cut|reduces|reduced|slashes|slashed|lowers|lowered)\b[\s\S]{0,40}\b(import duty|customs duty)\b|\b(import duty|customs duty|edible oil duty)\b[\s\S]{0,40}\b(cut|cuts|reduced|slashed|lowered)\b/i;

const retailHikePattern =
  /\b(petrol|diesel|fuel) price hike\b|\bhike in (petrol|diesel|fuel) prices?\b/i;

const noHikePattern = /\bno (petrol|diesel|fuel) price hike\b/i;

const supplyCutPattern = /\b(water supply cut|supply cut announced|water cut)\b/i;

export function classifyHeadlines(headlines: Headline[]): NewsFlags {
  const dutyOrGstHeadlines: string[] = [];
  let dutyCut = false;
  let retailHikeAnnounced = false;
  let supplyCutAnnounced = false;
  for (const headline of headlines) {
    const title = headline.title;
    if (dutyCutPattern.test(title)) dutyCut = true;
    if (retailHikePattern.test(title) && !noHikePattern.test(title)) retailHikeAnnounced = true;
    if (supplyCutPattern.test(title)) supplyCutAnnounced = true;
    if (
      /\b(gold|silver)\b/i.test(title) &&
      /\b(gst|igst|import duty|customs duty)\b/i.test(title)
    ) {
      dutyOrGstHeadlines.push(title);
    }
  }
  return { dutyCut, retailHikeAnnounced, supplyCutAnnounced, dutyOrGstHeadlines };
}
