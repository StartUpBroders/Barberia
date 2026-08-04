export function nuevaClaveIdempotencia() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.floor(globalThis.crypto.getRandomValues(new Uint32Array(1))[0]).toString(16)}`;
}
