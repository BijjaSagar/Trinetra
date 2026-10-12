import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { apnsHost, shouldDeleteDevice } from "../src/push/apns.js";
import { apnsJwt, resetApnsJwtCache, signEs256Jwt } from "../src/push/jwt.js";
import { tokenPrefix } from "../src/logger.js";

describe("APNs", () => {
  it("picks the host from the device environment", () => {
    expect(apnsHost("sandbox")).toBe("api.sandbox.push.apple.com");
    expect(apnsHost("production")).toBe("api.push.apple.com");
  });

  it("deletes devices Apple will not deliver to", () => {
    expect(shouldDeleteDevice(410, "")).toBe(true);
    expect(shouldDeleteDevice(400, '{"reason":"BadDeviceToken"}')).toBe(true);
    expect(shouldDeleteDevice(410, '{"reason":"Unregistered"}')).toBe(true);
    expect(shouldDeleteDevice(400, '{"reason":"BadTopic"}')).toBe(false);
  });

  it("caches the ES256 JWT for about 40 minutes and logs only a token prefix", () => {
    const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" });
    const keyP8Base64 = Buffer.from(typeof pem === "string" ? pem : pem.toString()).toString(
      "base64",
    );
    resetApnsJwtCache();
    const mintedAt = Date.UTC(2026, 9, 12, 2, 0, 0);
    const first = apnsJwt({
      keyP8Base64,
      keyId: "KEY1234567",
      teamId: "TEAM123456",
      now: mintedAt,
    });
    const again = apnsJwt({
      keyP8Base64,
      keyId: "KEY1234567",
      teamId: "TEAM123456",
      now: mintedAt + 39 * 60 * 1000,
    });
    const refreshed = apnsJwt({
      keyP8Base64,
      keyId: "KEY1234567",
      teamId: "TEAM123456",
      now: mintedAt + 41 * 60 * 1000,
    });
    expect(again).toBe(first);
    expect(refreshed).not.toBe(first);
    const payload = JSON.parse(Buffer.from(first.split(".")[1] ?? "", "base64url").toString());
    expect(payload.iss).toBe("TEAM123456");
    expect(
      signEs256Jwt({
        keyId: "KEY1234567",
        teamId: "TEAM123456",
        privateKey,
        issuedAtSeconds: 1,
      }).split(".")[2]?.length,
    ).toBeGreaterThan(10);
    expect(tokenPrefix("abcdef0123456789token")).toBe("abcdef01");
  });
});
