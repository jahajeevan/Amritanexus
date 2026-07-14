// Student account store.
//
// Primary path: the /api/students serverless function (service role) so
// accounts live in Supabase and students can sign in from any device, without
// ever exposing password hashes to the browser.
//
// Fallback path: localStorage — used automatically when the /api runtime isn't
// reachable (e.g. `vite dev` or offline), so the whole flow stays testable.
import { apiStudentSignup, apiStudentLogin, apiStudentExists } from './backend.js';
import { hashPassword, verifyPassword, randomSalt } from './crypto.js';

const LS_KEY = 'ignite_accounts';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}
function writeLocal(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function guessDepartment(registerNum = '') {
  const r = registerNum.toUpperCase();
  if (r.includes('AIE') || r.includes('AID') || r.includes('AI')) return 'AI';
  if (r.includes('CYS') || r.includes('SEC')) return 'Cyber Security';
  if (r.includes('CSE') || r.includes('CS')) return 'Computer Science';
  if (r.includes('ECE')) return 'Electronics';
  if (r.includes('EEE')) return 'Electrical';
  if (r.includes('MEE') || r.includes('ME')) return 'Mechanical';
  if (r.includes('CVE') || r.includes('CE')) return 'Civil';
  if (r.includes('BA') || r.includes('MBA')) return 'Management';
  if (r.includes('CHE') || r.includes('CH')) return 'Chemical';
  return 'Computer Science';
}

const toProfile = (a) => ({
  id: a.id,
  name: a.name,
  email: a.email,
  registerNum: a.registerNum,
  rollNo: a.registerNum,
  phone: a.phone,
  department: a.department,
  year: a.year || 'III',
  section: a.section || null,
  role: 'student',
});

// Cache a signed-in/created profile locally so offline reloads keep the user.
function cacheProfile(profile) {
  const list = readLocal();
  if (!list.some((a) => a.email === profile.email)) {
    list.push({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      registerNum: profile.registerNum,
      phone: profile.phone,
      department: profile.department,
      year: profile.year,
      section: profile.section,
      serverManaged: true,
    });
    writeLocal(list);
  }
}

export function findLocalByEmail(email) {
  const e = String(email).toLowerCase().trim();
  return readLocal().find((a) => a.email === e) || null;
}

// Merge a profile patch into the locally cached account (keeps offline in sync).
export function updateLocalAccount(email, patch) {
  const e = String(email).toLowerCase().trim();
  const list = readLocal();
  let changed = false;
  const next = list.map((a) => (a.email === e ? (changed = true, { ...a, ...patch }) : a));
  if (changed) writeLocal(next);
}

export async function accountExists(email) {
  const server = await apiStudentExists(email);
  if (server && typeof server.exists === 'boolean') return server.exists;
  return Boolean(findLocalByEmail(email)); // offline / dev fallback
}

export async function createAccount({ name, email, registerNum, phone, password, department, year, section }) {
  const server = await apiStudentSignup({ name, email, registerNum, phone, password, department, year, section });
  if (server) {
    if (server.success) {
      cacheProfile(server.profile);
      return { success: true, profile: server.profile };
    }
    return { success: false, message: server.message };
  }

  // ── offline / dev fallback: create a local-only account ──
  const e = String(email).toLowerCase().trim();
  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const account = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: e,
    registerNum: registerNum.toUpperCase().trim(),
    phone: (phone || '').trim(),
    department: department || guessDepartment(registerNum),
    year: year || 'III',
    section: section || null,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  const list = readLocal();
  list.push(account);
  writeLocal(list);
  return { success: true, profile: toProfile(account) };
}

export async function authenticate(email, password) {
  const server = await apiStudentLogin(email, password);
  if (server) {
    if (server.success) {
      cacheProfile(server.profile);
      return { success: true, profile: server.profile };
    }
    // Server reachable but rejected — an account created offline may still
    // exist locally, so try that before surfacing the server error.
    const local = await authenticateLocal(email, password);
    return local.success ? local : { success: false, message: server.message };
  }
  return authenticateLocal(email, password); // offline / dev fallback
}

async function authenticateLocal(email, password) {
  const account = findLocalByEmail(email);
  if (!account) return { success: false, message: 'No account found for this email. Please sign up.' };
  if (account.serverManaged || !account.salt) {
    return { success: false, message: 'This account lives on the server — please connect to the internet to sign in.' };
  }
  const ok = await verifyPassword(password, account.salt, account.passwordHash);
  if (!ok) return { success: false, message: 'Incorrect password. Please try again.' };
  return { success: true, profile: toProfile(account) };
}
