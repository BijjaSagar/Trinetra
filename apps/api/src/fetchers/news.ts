import { fetchText } from "../http/fetch-text.js";
import { fixturesEnabled, readFixture, type Headline, type NewsSource } from "./types.js";

export const NEWS_QUERIES = [
  "India import duty",
  "Solapur water supply",
  "petrol price hike",
] as const;

export function newsRssUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    hl: "en-IN",
    gl: "IN",
    ceid: "IN:en",
  });
  return `https://news.google.com/rss/search?${params.toString()}`;
}

export function parseNewsRss(xml: string, limit = 8): Headline[] {
  const headlines: Headline[] = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  for (const item of items) {
    const title = decodeXml(/<title>([\s\S]*?)<\/title>/.exec(item)?.[1] ?? "").trim();
    const link = decodeXml(/<link>([\s\S]*?)<\/link>/.exec(item)?.[1] ?? "").trim();
    const sourceUrl = /<source\s+url="([^"]+)"/.exec(item)?.[1];
    const pub = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(item)?.[1];
    if (!title) continue;
    const publishedAt = pub ? new Date(pub) : null;
    headlines.push({
      title,
      url: sourceUrl && sourceUrl.startsWith("http") ? sourceUrl : link,
      publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
    });
    if (headlines.length >= limit) break;
  }
  return headlines;
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export const newsSource: NewsSource = {
  key: "news",
  async fetch() {
    if (fixturesEnabled()) return parseNewsRss(readFixture("news.xml"));
    const batches = await Promise.all(
      NEWS_QUERIES.map(async (query) => parseNewsRss(await fetchText(newsRssUrl(query)), 3)),
    );
    const seen = new Set<string>();
    const headlines: Headline[] = [];
    for (const batch of batches) {
      for (const headline of batch) {
        if (seen.has(headline.title)) continue;
        seen.add(headline.title);
        headlines.push(headline);
        if (headlines.length >= 8) return headlines;
      }
    }
    return headlines;
  },
};
