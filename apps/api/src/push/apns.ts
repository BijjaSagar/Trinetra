import http2 from "node:http2";
import type { ApnsEnvironment } from "../db/types.js";
import { logger, tokenPrefix } from "../logger.js";
import { apnsJwt } from "./jwt.js";

export interface PushMessage {
  title: string;
  body: string;
  digestDate: string;
  kind: "digest" | "stock_up" | "stale";
}

export interface ApnsTransport {
  post(
    host: string,
    devicePath: string,
    headers: Record<string, string>,
    body: string,
  ): Promise<{ status: number; body: string }>;
}

export function apnsHost(environment: ApnsEnvironment): string {
  return environment === "sandbox" ? "api.sandbox.push.apple.com" : "api.push.apple.com";
}

export function shouldDeleteDevice(status: number, body: string): boolean {
  if (status === 410) return true;
  return /"reason"\s*:\s*"(BadDeviceToken|Unregistered)"/.test(body);
}

export function http2Transport(): ApnsTransport {
  return {
    post(host, devicePath, headers, body) {
      return new Promise((resolve, reject) => {
        const client = http2.connect(`https://${host}`);
        const fail = (error: Error) => {
          client.close();
          reject(error);
        };
        client.on("error", fail);
        const request = client.request({
          ":method": "POST",
          ":path": devicePath,
          ...headers,
        });
        const chunks: Buffer[] = [];
        request.on("response", (responseHeaders) => {
          const status = Number(responseHeaders[":status"] ?? 0);
          request.on("data", (chunk: Buffer) => chunks.push(chunk));
          request.on("end", () => {
            client.close();
            resolve({ status, body: Buffer.concat(chunks).toString("utf8") });
          });
        });
        request.on("error", fail);
        request.end(body);
      });
    },
  };
}

export interface ApnsConfig {
  keyP8Base64: string;
  keyId: string;
  teamId: string;
  bundleId: string;
}

export async function sendAlert(input: {
  config: ApnsConfig;
  environment: ApnsEnvironment;
  deviceToken: string;
  message: PushMessage;
  transport?: ApnsTransport;
}): Promise<"sent" | "deleted" | "failed"> {
  const host = apnsHost(input.environment);
  const token = apnsJwt({
    keyP8Base64: input.config.keyP8Base64,
    keyId: input.config.keyId,
    teamId: input.config.teamId,
  });
  const body = JSON.stringify({
    aps: {
      alert: { title: input.message.title, body: input.message.body },
      sound: "default",
    },
    digest_date: input.message.digestDate,
    kind: input.message.kind,
  });
  const transport = input.transport ?? http2Transport();
  const response = await transport.post(
    host,
    `/3/device/${input.deviceToken}`,
    {
      authorization: `bearer ${token}`,
      "apns-topic": input.config.bundleId,
      "apns-push-type": "alert",
      "apns-priority": "10",
    },
    body,
  );
  const prefix = tokenPrefix(input.deviceToken);
  if (response.status === 200) {
    logger.info({ tokenPrefix: prefix, host }, "apns sent");
    return "sent";
  }
  if (shouldDeleteDevice(response.status, response.body)) {
    logger.info({ tokenPrefix: prefix, status: response.status }, "apns device removed");
    return "deleted";
  }
  logger.warn({ tokenPrefix: prefix, status: response.status }, "apns send failed");
  return "failed";
}
