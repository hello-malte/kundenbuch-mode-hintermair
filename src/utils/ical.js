function pad(n) {
  return String(n).padStart(2, '0');
}

function toICalDate(input) {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeICalText(s) {
  return (s || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildOrderAppointmentICS({
  uid,
  summary,
  description,
  location,
  startDate,
  endDate
}) {
  const dtStart = toICalDate(startDate);
  if (!dtStart) return null;
  const dtEnd = toICalDate(endDate || new Date(new Date(startDate).getTime() + 60 * 60 * 1000));
  const now = toICalDate(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mode Hintermair//Kundenbuch//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid || `kundenbuch-${Date.now()}@mode-hintermair`}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICalText(summary || 'Order-Termin')}`
  ];
  if (description) lines.push(`DESCRIPTION:${escapeICalText(description)}`);
  if (location) lines.push(`LOCATION:${escapeICalText(location)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export async function shareICS(filename, icsContent) {
  if (!icsContent) return 'no-content';
  try {
    const file = new File([icsContent], filename, { type: 'text/calendar' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return 'shared';
      } catch (e) {
        if (e?.name === 'AbortError') return 'cancelled';
      }
    }
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  } catch (e) {
    console.warn('shareICS failed', e);
    return 'unsupported';
  }
}
