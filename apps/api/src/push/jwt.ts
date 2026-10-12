import { createPrivateKey, createSign, type KeyObject } from "node:crypto";

const CACHE_MS = 40 * 60 * 1000;

let cached: { token: string; mintedAt: number; keyId: string } | null = null;

export function resetApnsJwtCache(): void {
  cached = null;
}

export function apnsJwt(input: {
  keyP8Base64: string;
  keyId: string;
  teamId: string;
  now?: number;
}): string {
  const now = input.now ?? Date.now();
  if (cached && cached.keyId === input.keyId && now - cached.mintedAt < CACHE_MS) {
    return cached.token;
  }
  const token = signEs256Jwt({
    keyId: input.keyId,
    teamId: input.teamId,
    privateKey: privateKeyFromBase64(input.keyP8Base64),
    issuedAtSeconds: Math.floor(now / 1000),
  });
  cached = { token, mintedAt: now, keyId: input.keyId };
  return token;
}

export function privateKeyFromBase64(keyP8Base64: string): KeyObject {
  const pem = Buffer.from(keyP8Base64, "base64").toString("utf8");
  return createPrivateKey(pem);
}

export function signEs256Jwt(input: {
  keyId: string;
  teamId: string;
  privateKey: KeyObject;
  issuedAtSeconds: number;
}): string {
  const header = base64url(JSON.stringify({ alg: "ES256", kid: input.keyId }));
  const payload = base64url(JSON.stringify({ iss: input.teamId, iat: input.issuedAtSeconds }));
  const signingInput = `${header}.${payload}`;
  const signer = createSign("SHA256");
  signer.update(signingInput);
  signer.end();
  const der = signer.sign(input.privateKey);
  const jose = derToJose(der);
  return `${signingInput}.${base64url(jose)}`;
}

export function derToJose(der: Buffer): Buffer {
  let offset = 0;
  if (der[offset] !== 0x30) throw new Error("APNs JWT signature was not a DER sequence");
  offset += 1;
  const sequenceLength = der[offset];
  if (sequenceLength === undefined || sequenceLength > 127) {
    throw new Error("APNs JWT signature length was unexpected");
  }
  offset += 1;
  const sequenceEnd = offset + sequenceLength;
  const readInteger = (): Buffer => {
    if (der[offset] !== 0x02) throw new Error("APNs JWT signature integer missing");
    offset += 1;
    const length = der[offset];
    if (length === undefined) throw new Error("APNs JWT signature integer length missing");
    offset += 1;
    let bytes = der.subarray(offset, offset + length);
    offset += length;
    if (bytes[0] === 0x00) bytes = bytes.subarray(1);
    if (bytes.length > 32) throw new Error("APNs JWT signature integer too long");
    const padded = Buffer.alloc(32);
    bytes.copy(padded, 32 - bytes.length);
    return padded;
  };
  const signature = Buffer.concat([readInteger(), readInteger()]);
  if (offset !== sequenceEnd) throw new Error("APNs JWT signature had trailing bytes");
  return signature;
}

function base64url(value: string | Buffer): string {
  const buffer = typeof value === "string" ? Buffer.from(value) : value;
  return buffer.toString("base64url");
}
