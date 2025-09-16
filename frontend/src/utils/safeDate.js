// Utility to safely parse various date inputs into a valid Date object
// - Trims microseconds to milliseconds
// - Adds 'Z' only if no timezone is present
// - Accepts Date, number, or string

export function safeParseDate(value) {
  if (!value) return null;

  // If already a Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // If numeric timestamp
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  // If string
  if (typeof value === 'string') {
    let s = value.trim();

    // Normalize space to 'T'
    if (s.includes(' ') && !s.includes('T')) {
      s = s.replace(' ', 'T');
    }

    // Trim fractional seconds to 3 digits (milliseconds) if longer
    // e.g., 2025-08-11T12:53:22.619255+00:00 -> 2025-08-11T12:53:22.619+00:00
    s = s.replace(/(\.\d{3})\d+/, '$1');

    // Detect timezone info: 'Z' or +HH:MM or -HH:MM or +HHMM or -HHMM or +HH
    const hasTimezone = /Z$/i.test(s) || /[+\-]\d{2}:?\d{2}$/.test(s) || /[+\-]\d{2}$/.test(s);
    if (!hasTimezone) {
      s = `${s}Z`;
    }

    const d1 = new Date(s);
    if (!isNaN(d1.getTime())) return d1;

    // Fallback: try native parse of the original string
    const d2 = new Date(value);
    if (!isNaN(d2.getTime())) return d2;
  }

  return null;
}

export function formatDateInUserTimeZone(dateObj, locale) {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  try {
    return new Intl.DateTimeFormat(locale || undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
      timeZone: tz,
    }).format(dateObj);
  } catch (_) {
    // Fallback to toLocaleString without explicit tz
    return dateObj.toLocaleString(locale || undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }
}


