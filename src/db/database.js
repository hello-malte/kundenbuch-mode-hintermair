import Dexie from 'dexie';

export const db = new Dexie('kundenbuch');

db.version(1).stores({
  customers: '++id, nachname, vorname, telefon, geaendert_am',
  timeline_entries: '++id, kunden_id, datum, erstellt_am',
  order_items: '++id, kunden_id, brand, erledigt'
});

db.version(2).stores({
  customers: '++id, nachname, vorname, telefon, geaendert_am',
  timeline_entries: '++id, kunden_id, datum, erstellt_am',
  order_items: '++id, kunden_id, brand, erledigt',
  alterations: '++id, kunden_id, datum, erledigt, erstellt_am'
});

db.version(3).stores({
  customers: '++id, nachname, vorname, telefon, geaendert_am',
  timeline_entries: '++id, kunden_id, datum, erstellt_am',
  order_items: '++id, kunden_id, brand, erledigt',
  alterations: '++id, kunden_id, datum, erledigt, erstellt_am',
  reservations: '++id, kunden_id, datum, erledigt, erstellt_am'
});

const customerDefaults = () => ({
  vorname: '',
  nachname: '',
  telefon: '',
  email: '',
  strasse: '',
  plz: '',
  ort: '',
  geburtstag: '',
  foto: null,
  notizen_freitext: '',
  groesse_oberteil: '',
  groesse_hose: '',
  schuhgroesse: '',
  lieblingsmarken: [],
  schnitte: '',
  figur_hinweise: '',
  allergien: ''
});

export async function createCustomer(partial = {}) {
  const now = new Date().toISOString();
  return db.customers.add({
    ...customerDefaults(),
    ...partial,
    erstellt_am: now,
    geaendert_am: now
  });
}

export async function updateCustomer(id, patch) {
  return db.customers.update(id, {
    ...patch,
    geaendert_am: new Date().toISOString()
  });
}

export async function deleteCustomer(id) {
  await db.transaction(
    'rw',
    db.customers,
    db.timeline_entries,
    db.order_items,
    db.alterations,
    db.reservations,
    async () => {
      await db.timeline_entries.where('kunden_id').equals(id).delete();
      await db.order_items.where('kunden_id').equals(id).delete();
      await db.alterations.where('kunden_id').equals(id).delete();
      await db.reservations.where('kunden_id').equals(id).delete();
      await db.customers.delete(id);
    }
  );
}

export function normalizeTimelineEntry(entry) {
  if (!entry) return entry;
  if (Array.isArray(entry.artikel)) return entry;
  const artikel = [];
  const fotos = entry.fotos || [];
  const notiz = entry.notiz || '';
  if (fotos.length || notiz.trim()) {
    artikel.push({ fotos, notiz });
  }
  return { ...entry, artikel };
}

function cleanArtikel(artikel) {
  return (artikel || [])
    .map((a) => ({ fotos: a.fotos || [], notiz: (a.notiz || '').trim() }))
    .filter((a) => a.fotos.length || a.notiz);
}

export async function addTimelineEntry({ customerId, artikel }) {
  const now = new Date().toISOString();
  const cleaned = cleanArtikel(artikel);
  if (!cleaned.length) throw new Error('Eintrag enthält keine Artikel.');
  return db.timeline_entries.add({
    kunden_id: customerId,
    datum: now,
    artikel: cleaned,
    erstellt_am: now
  });
}

export async function updateTimelineEntry(id, { artikel }) {
  const existing = await db.timeline_entries.get(id);
  if (!existing) return;
  const cleaned = cleanArtikel(artikel);
  if (!cleaned.length) {
    return db.timeline_entries.delete(id);
  }
  return db.timeline_entries.put({
    id: existing.id,
    kunden_id: existing.kunden_id,
    datum: existing.datum,
    erstellt_am: existing.erstellt_am,
    artikel: cleaned
  });
}

export async function deleteTimelineEntry(id) {
  return db.timeline_entries.delete(id);
}

export async function addOrderItem({ customerId, brand, notiz }) {
  return db.order_items.add({
    kunden_id: customerId,
    brand: brand.trim(),
    notiz: (notiz || '').trim(),
    erledigt: false,
    erstellt_am: new Date().toISOString()
  });
}

export async function updateOrderItem(id, patch) {
  return db.order_items.update(id, patch);
}

export async function deleteOrderItem(id) {
  return db.order_items.delete(id);
}

export async function addAlteration({ customerId, beschreibung, fotos }) {
  const now = new Date().toISOString();
  const text = (beschreibung || '').trim();
  if (!text && !(fotos?.length)) {
    throw new Error('Beschreibung oder Foto erforderlich.');
  }
  return db.alterations.add({
    kunden_id: customerId,
    datum: now,
    beschreibung: text,
    fotos: fotos || [],
    erledigt: false,
    erledigt_am: null,
    erstellt_am: now
  });
}

export async function updateAlteration(id, patch) {
  const existing = await db.alterations.get(id);
  if (!existing) return;
  const next = { ...existing, ...patch };
  if (patch.beschreibung !== undefined) {
    next.beschreibung = patch.beschreibung.trim();
  }
  return db.alterations.put(next);
}

export async function toggleAlterationDone(id, erledigt) {
  return db.alterations.update(id, {
    erledigt: !!erledigt,
    erledigt_am: erledigt ? new Date().toISOString() : null
  });
}

export async function deleteAlteration(id) {
  return db.alterations.delete(id);
}

export async function addReservation({ customerId, beschreibung, fotos }) {
  const now = new Date().toISOString();
  const text = (beschreibung || '').trim();
  if (!text && !(fotos?.length)) {
    throw new Error('Beschreibung oder Foto erforderlich.');
  }
  return db.reservations.add({
    kunden_id: customerId,
    datum: now,
    beschreibung: text,
    fotos: fotos || [],
    erledigt: false,
    erledigt_am: null,
    erstellt_am: now
  });
}

export async function updateReservation(id, patch) {
  const existing = await db.reservations.get(id);
  if (!existing) return;
  const next = { ...existing, ...patch };
  if (patch.beschreibung !== undefined) {
    next.beschreibung = patch.beschreibung.trim();
  }
  return db.reservations.put(next);
}

export async function toggleReservationDone(id, erledigt) {
  return db.reservations.update(id, {
    erledigt: !!erledigt,
    erledigt_am: erledigt ? new Date().toISOString() : null
  });
}

export async function deleteReservation(id) {
  return db.reservations.delete(id);
}

export const BACKUP_VERSION = 3;

export async function exportAllData() {
  const [
    customers,
    timeline_entries,
    order_items,
    alterations,
    reservations
  ] = await Promise.all([
    db.customers.toArray(),
    db.timeline_entries.toArray(),
    db.order_items.toArray(),
    db.alterations.toArray(),
    db.reservations.toArray()
  ]);
  return {
    app: 'kundenbuch',
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    customers,
    timeline_entries,
    order_items,
    alterations,
    reservations
  };
}

export async function importAllData(data) {
  if (!data || data.app !== 'kundenbuch' || ![1, 2, 3].includes(data.version)) {
    throw new Error('Datei ist kein gültiges Kundenbuch-Backup.');
  }
  await db.transaction(
    'rw',
    db.customers,
    db.timeline_entries,
    db.order_items,
    db.alterations,
    db.reservations,
    async () => {
      await db.timeline_entries.clear();
      await db.order_items.clear();
      await db.alterations.clear();
      await db.reservations.clear();
      await db.customers.clear();
      if (data.customers?.length) await db.customers.bulkAdd(data.customers);
      if (data.timeline_entries?.length)
        await db.timeline_entries.bulkAdd(data.timeline_entries);
      if (data.order_items?.length) await db.order_items.bulkAdd(data.order_items);
      if (data.alterations?.length)
        await db.alterations.bulkAdd(data.alterations);
      if (data.reservations?.length)
        await db.reservations.bulkAdd(data.reservations);
    }
  );
}

export async function getStats() {
  const [
    customers,
    timeline_entries,
    order_items,
    alterations,
    reservations
  ] = await Promise.all([
    db.customers.count(),
    db.timeline_entries.count(),
    db.order_items.count(),
    db.alterations.count(),
    db.reservations.count()
  ]);
  return { customers, timeline_entries, order_items, alterations, reservations };
}
