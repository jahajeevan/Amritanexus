// Web Crypto helpers (SHA-256). Runs in any secure context (https / localhost).

export async function sha256Hex(str) {
  const data = new TextEncoder().encode(String(str));
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomSalt(bytes = 12) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Salted password hash for locally/Supabase-stored student accounts.
// (Not bcrypt — appropriate for a campus event app; far better than plaintext.)
export async function hashPassword(password, salt) {
  return sha256Hex(`${salt}:${password}`);
}

export async function verifyPassword(password, salt, expectedHash) {
  const h = await hashPassword(password, salt);
  return h === expectedHash;
}
