// Thin client for the serverless OTP + admin endpoints.
// In local `vite dev` (no /api runtime) it transparently falls back to a
// client-side mock so the whole flow stays testable without Vercel.
import { sha256Hex } from './crypto.js';

const DEV = import.meta.env.DEV;
let devStore = null; // { email, code, exp }

function genCode() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 1_000_000).padStart(6, '0');
}

async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error('no-api'); // vite dev served HTML
  return { status: res.status, data: await res.json() };
}

export async function sendOtp({ email, name }) {
  try {
    const { data } = await postJson('/api/send-otp', { email, name, purpose: 'signup' });
    if (data.ok) return { ok: true, token: data.token };
    if (DEV) return devSend(email);
    return { ok: false, error: data.error || 'Could not send code.' };
  } catch {
    if (DEV) return devSend(email);
    return { ok: false, error: 'Network error — please try again.' };
  }
}

export async function verifyOtp({ email, otp, token }) {
  if (token === 'dev-mock') return devVerify(email, otp);
  try {
    const { data } = await postJson('/api/verify-otp', { email, otp, token, purpose: 'signup' });
    return data;
  } catch {
    if (DEV) return devVerify(email, otp);
    return { ok: false, error: 'Network error — please try again.' };
  }
}

export async function adminLogin({ email, password }) {
  try {
    const { status, data } = await postJson('/api/admin-login', { email, password });
    if (status === 501 || status === 404) return clientAdminCheck(email, password);
    if (data && typeof data.ok === 'boolean') return data;
    return clientAdminCheck(email, password);
  } catch {
    return clientAdminCheck(email, password);
  }
}

// Offline / static fallback: compare against the SHA-256 hash baked in at build.
async function clientAdminCheck(email, password) {
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
  const adminHash = (import.meta.env.VITE_ADMIN_PASSWORD_HASH || '').trim().toLowerCase();
  const emailOk = String(email || '').trim().toLowerCase() === adminEmail;
  const passOk = adminHash && (await sha256Hex(password)) === adminHash;
  if (emailOk && passOk) return { ok: true, name: 'Faculty Coordinator', email: adminEmail };
  return { ok: false, error: 'Invalid administrative credentials.' };
}

function devSend(email) {
  const code = genCode();
  devStore = { email: String(email).toLowerCase(), code, exp: Date.now() + 600000 };
  // eslint-disable-next-line no-console
  console.info(`[DEV OTP] code for ${email}: ${code}`);
  return { ok: true, token: 'dev-mock', devCode: code };
}

function devVerify(email, otp) {
  if (!devStore) return { ok: false, error: 'Request a code first.' };
  if (Date.now() > devStore.exp) return { ok: false, error: 'Code expired.' };
  if (devStore.email !== String(email).toLowerCase()) return { ok: false, error: 'Email mismatch.' };
  if (String(otp).trim() !== devStore.code) return { ok: false, error: 'Incorrect code.' };
  return { ok: true };
}
