// Opaque route tokens keep readable page names out of the browser address bar.
// They are obfuscation only, not an authorization mechanism. Every target page
// must still enforce its own authentication and role checks.

// Set OPAQUE_ROUTE_KEY in production. Rotating it invalidates previously
// generated opaque links, so change it deliberately during a deployment.
const ROUTE_KEY = process.env.OPAQUE_ROUTE_KEY?.trim() || "rees52-opaque-route-v1";

function xorBytes(bytes: Uint8Array) {
  return bytes.map((value, index) => value ^ ROUTE_KEY.charCodeAt(index % ROUTE_KEY.length));
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value: string) {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

export function encodeOpaquePath(path: string) {
  const bytes = new TextEncoder().encode(path);
  return bytesToHex(xorBytes(bytes));
}

export function decodeOpaquePath(token: string): string | null {
  if (!token || token.length > 4096 || token.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(token)) {
    return null;
  }

  try {
    const decoded = new TextDecoder().decode(xorBytes(hexToBytes(token)));
    if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\u0000")) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function opaquePathFor(pathname: string, search = "") {
  return `/r/${encodeOpaquePath(`${pathname}${search}`)}`;
}
