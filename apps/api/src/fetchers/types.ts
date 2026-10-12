import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface Reading {
  key: string;
  value: number;
  unit: string;
  asOf: Date;
  sourceUrl: string;
}

export interface Fetcher {
  key: string;
  fetch(): Promise<Reading[]>;
}

export interface Headline {
  title: string;
  url: string;
  publishedAt: Date | null;
}

export interface NewsSource {
  key: string;
  fetch(): Promise<Headline[]>;
}

export class SourceGapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceGapError";
  }
}

export function fixturesEnabled(): boolean {
  return process.env.TRINETRA_USE_FIXTURES === "1";
}

export function readFixture(name: string): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "../../test/fixtures"),
    path.resolve(here, "../../../test/fixtures"),
  ];
  const root = candidates.find((candidate) => existsSync(candidate));
  if (!root) throw new Error("Fixture directory not found");
  const file = path.join(root, name);
  if (!existsSync(file)) throw new Error(`Missing fixture ${name}`);
  return readFileSync(file, "utf8");
}
