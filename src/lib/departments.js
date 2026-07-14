// Single source of truth for the college's academic structure — branches,
// academic years and class sections. Shared by signup, event creation, the
// leaderboard and the class-attendance forms so everything stays consistent.
//
// `code` is the short key the leaderboard/credit system uses (must match the
// DEPT_ALIASES map in api/_supabase.js so credit bumps always land). `label`
// is what humans see in dropdowns.

export const DEPARTMENTS = [
  { code: 'CSE', label: 'Computer Science (CSE)' },
  { code: 'AI', label: 'Artificial Intelligence (AI)' },
  { code: 'Cyber Security', label: 'Cyber Security' },
  { code: 'ECE', label: 'Electronics & Communication (ECE)' },
  { code: 'EEE', label: 'Electrical & Electronics (EEE)' },
  { code: 'Mechanical', label: 'Mechanical' },
  { code: 'Civil', label: 'Civil' },
  { code: 'MBA', label: 'Management (MBA)' },
];

export const DEPARTMENT_CODES = DEPARTMENTS.map((d) => d.code);

// Academic years (Roman numerals, as used across the app) and class sections.
export const YEARS = ['I', 'II', 'III', 'IV'];
export const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Free-form department name → canonical leaderboard code. Mirrors the server
// map in api/_supabase.js. Returns null when nothing matches.
const DEPT_ALIASES = {
  cse: 'CSE', cs: 'CSE', 'computer science': 'CSE', computer: 'CSE',
  ai: 'AI', aie: 'AI', aid: 'AI', 'artificial intelligence': 'AI',
  'cyber security': 'Cyber Security', cybersecurity: 'Cyber Security', cys: 'Cyber Security', security: 'Cyber Security',
  ece: 'ECE', electronics: 'ECE',
  eee: 'EEE', electrical: 'EEE',
  mechanical: 'Mechanical', mech: 'Mechanical', mee: 'Mechanical',
  civil: 'Civil', cve: 'Civil',
  mba: 'MBA', management: 'MBA', business: 'MBA',
};

export function normalizeDept(name) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return null;
  if (DEPT_ALIASES[n]) return DEPT_ALIASES[n];
  for (const [k, v] of Object.entries(DEPT_ALIASES)) {
    if (n.includes(k)) return v;
  }
  return null;
}

const LABEL_BY_CODE = Object.fromEntries(DEPARTMENTS.map((d) => [d.code, d.label]));
export const deptLabel = (code) => LABEL_BY_CODE[code] || code || '—';

// A stable, human-readable class key like "CSE · III · A".
export const classKey = (deptCode, year, section) =>
  `${deptCode || '—'} · ${year || '—'} · ${section || '—'}`;
