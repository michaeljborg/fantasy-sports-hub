/**
 * Seals small JSON payloads (the Yahoo session) into an opaque cookie value
 * with AES-GCM, keyed by SESSION_SECRET. Tampered or foreign values fail to
 * open and come back as null.
 */
const encoder = new TextEncoder();
const decoder = new TextDecoder();

let keyPromise: Promise<CryptoKey> | undefined;

function getKey() {
  keyPromise ??= (async () => {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error("SESSION_SECRET must be set to at least 32 characters in .env.local");
    }
    const hash = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
    return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt", "decrypt"]);
  })();
  return keyPromise;
}

const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");
const fromBase64 = (value: string) => new Uint8Array(Buffer.from(value, "base64url"));

export async function seal(data: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await getKey(),
    encoder.encode(JSON.stringify(data)),
  );
  return `${toBase64(iv)}.${toBase64(new Uint8Array(cipher))}`;
}

export async function unseal<T>(value: string): Promise<T | null> {
  const [iv, cipher] = value.split(".");
  if (!iv || !cipher) return null;
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(iv) },
      await getKey(),
      fromBase64(cipher),
    );
    return JSON.parse(decoder.decode(plain)) as T;
  } catch {
    return null;
  }
}
