// Student account store. localStorage is the source of truth (always works);
// Supabase is a best-effort mirror so accounts sync across devices when the
// `students` table exists. Every Supabase call is wrapped — failures degrade
// silently to local-only.
import { supabase, isSupabaseReady } from './supabaseClient.js';
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
  role: 'student',
});

export function findLocalByEmail(email) {
  const e = String(email).toLowerCase().trim();
  return readLocal().find((a) => a.email === e) || null;
}

export async function accountExists(email) {
  if (findLocalByEmail(email)) return true;
  if (isSupabaseReady) {
    try {
      const { data } = await supabase
        .from('students')
        .select('email')
        .eq('email', String(email).toLowerCase().trim())
        .maybeSingle();
      return Boolean(data);
    } catch {
      /* ignore */
    }
  }
  return false;
}

export async function createAccount({ name, email, registerNum, phone, password, year }) {
  const e = String(email).toLowerCase().trim();
  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const department = guessDepartment(registerNum);

  const account = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: e,
    registerNum: registerNum.toUpperCase().trim(),
    phone: (phone || '').trim(),
    department,
    year: year || 'III',
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  const list = readLocal();
  list.push(account);
  writeLocal(list);

  if (isSupabaseReady) {
    try {
      await supabase.from('students').upsert(
        {
          id: account.id,
          name: account.name,
          email: account.email,
          register_num: account.registerNum,
          phone: account.phone,
          department: account.department,
          year: account.year,
          salt: account.salt,
          password_hash: account.passwordHash,
        },
        { onConflict: 'email' }
      );
    } catch {
      /* offline-only is fine */
    }
  }

  return { success: true, profile: toProfile(account) };
}

export async function authenticate(email, password) {
  const e = String(email).toLowerCase().trim();

  let account = findLocalByEmail(e);

  if (!account && isSupabaseReady) {
    try {
      const { data } = await supabase.from('students').select('*').eq('email', e).maybeSingle();
      if (data) {
        account = {
          id: data.id,
          name: data.name,
          email: data.email,
          registerNum: data.register_num,
          phone: data.phone,
          department: data.department,
          year: data.year,
          salt: data.salt,
          passwordHash: data.password_hash,
        };
        // cache locally for offline next time
        const list = readLocal();
        if (!list.some((a) => a.email === e)) {
          list.push(account);
          writeLocal(list);
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (!account) return { success: false, message: 'No account found for this email. Please sign up.' };

  const ok = await verifyPassword(password, account.salt, account.passwordHash);
  if (!ok) return { success: false, message: 'Incorrect password. Please try again.' };

  return { success: true, profile: toProfile(account) };
}
