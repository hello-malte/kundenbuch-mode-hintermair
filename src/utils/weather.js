// Coordinates for Ried, 86510 (Aichach-Friedberg, Bayern)
const COORDS = { lat: 48.36, lon: 11.00 };
const CACHE_KEY = 'kundenbuch-weather';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export async function getCurrentWeather() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) return data;
    }
  } catch {}

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${COORDS.lat}&longitude=${COORDS.lon}` +
      `&current=temperature_2m,weather_code` +
      `&timezone=Europe%2FBerlin`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather fetch failed');
    const json = await res.json();
    const data = {
      temperature: Math.round(json.current?.temperature_2m ?? 0),
      code: json.current?.weather_code ?? 0
    };
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, ts: Date.now() })
      );
    } catch {}
    return data;
  } catch (e) {
    console.warn('Weather error', e);
    return null;
  }
}

export function weatherCodeInfo(code) {
  if (code === 0) return { iconKey: 'sun', label: 'Sonnig' };
  if (code === 1) return { iconKey: 'cloud-sun', label: 'Überwiegend klar' };
  if (code === 2) return { iconKey: 'cloud-sun', label: 'Teils bewölkt' };
  if (code === 3) return { iconKey: 'cloud', label: 'Bedeckt' };
  if ([45, 48].includes(code)) return { iconKey: 'fog', label: 'Nebel' };
  if ([51, 53, 55, 56, 57].includes(code))
    return { iconKey: 'drizzle', label: 'Nieselregen' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { iconKey: 'rain', label: 'Regen' };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { iconKey: 'snow', label: 'Schnee' };
  if ([95, 96, 99].includes(code))
    return { iconKey: 'lightning', label: 'Gewitter' };
  return { iconKey: 'cloud', label: 'Bewölkt' };
}
