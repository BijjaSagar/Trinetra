import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFiles, readEnv, requireEnv } from "../env.js";
import { kolkataDateString } from "../domain/time.js";
import { sendAlert } from "./apns.js";

async function main(): Promise<void> {
  loadEnvFiles();
  const token = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!token) {
    console.error("Usage: pnpm push:test -- <apns-token> [--production]");
    process.exit(1);
  }
  const missing = requireEnv(["APNS_KEY_P8", "APNS_KEY_ID", "APNS_TEAM_ID"]);
  if (missing.length > 0) {
    console.error(
      `APNs is not configured. Set ${missing.join(", ")} in .env (see .env.example). No push was sent.`,
    );
    process.exit(1);
  }
  const env = readEnv();
  const environment = process.argv.includes("--production") ? "production" : "sandbox";
  try {
    const result = await sendAlert({
      config: {
        keyP8Base64: env.APNS_KEY_P8 ?? "",
        keyId: env.APNS_KEY_ID ?? "",
        teamId: env.APNS_TEAM_ID ?? "",
        bundleId: env.APNS_BUNDLE_ID,
      },
      environment,
      deviceToken: token,
      message: {
        title: "Trinetra",
        body: "Test push. Be ready before the storm.",
        digestDate: kolkataDateString(new Date()),
        kind: "digest",
      },
    });
    if (result !== "sent") {
      console.error(`Test push was not accepted (${result}).`);
      process.exit(1);
    }
    console.log(`Test push accepted by APNs (${environment}).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "APNs request failed";
    console.error(message);
    process.exit(1);
  }
}

const isDirect =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirect) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "push:test failed");
    process.exit(1);
  });
}
