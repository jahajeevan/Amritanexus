/* Shared helpers for the event surfaces (directory + detail + cards).
   Keeps status styling and seat math consistent everywhere. */

// Tailwind classes for the small status pill on cards / hero.
export const STATUS_BADGE = {
  Open: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Almost Full': 'border-amber-200 bg-amber-50 text-amber-700',
  Closed: 'border-red-200 bg-red-50 text-red-700',
  Upcoming: 'border-amrita-maroon/20 bg-amrita-maroonSoft text-amrita-maroon',
  Completed: 'border-amrita-line bg-amrita-panel text-amrita-slate',
};

// Maps an event status to a shared <Badge> tone.
export const STATUS_TONE = {
  Open: 'success',
  'Almost Full': 'warning',
  Closed: 'danger',
  Upcoming: 'maroon',
  Completed: 'neutral',
};

export function statusBadgeClass(status) {
  return STATUS_BADGE[status] || STATUS_BADGE.Open;
}

// True once an event's registration deadline (last day to register) has passed.
export function isPastDeadline(event) {
  if (!event?.deadline) return false;
  const d = new Date(`${event.deadline}T23:59:59`);
  if (Number.isNaN(d.getTime())) return false;
  return Date.now() > d.getTime();
}

// Whether an event should still appear on the PUBLIC site. Once its deadline
// passes it drops off the homepage and events directory automatically.
export function isEventVisible(event) {
  return !isPastDeadline(event);
}

// Seat math used by cards, the hero seat bar and the registration card.
export function seatInfo(event) {
  const max = Number(event?.maxSeats) || 0;
  const filled = Math.min(Number(event?.seatsFilled) || 0, max);
  const seatsLeft = Math.max(0, max - filled);
  const pct = max ? Math.min(100, Math.round((filled / max) * 100)) : 0;
  const isFull = seatsLeft <= 0;
  const pastDeadline = isPastDeadline(event);
  const isClosed = event?.status === 'Closed' || event?.status === 'Completed' || isFull || pastDeadline;
  return { max, filled, seatsLeft, pct, isFull, pastDeadline, isClosed, isOpen: !isClosed };
}

// "2026-05-15" -> "15 May 2026" (or with a weekday when asked).
export function formatEventDate(date, opts) {
  if (!date) return '';
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-IN', opts || { day: 'numeric', month: 'short', year: 'numeric' });
}

// "09:00" -> "9:00 AM"
export function formatTime(time) {
  if (!time) return '';
  const [hRaw, mRaw] = String(time).split(':');
  const h = Number(hRaw);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(mRaw ?? '00').padStart(2, '0')} ${period}`;
}
