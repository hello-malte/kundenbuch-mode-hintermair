import Dexie from 'dexie';

export const db = new Dexie('kundenbuch');

db.version(1).stores({
  customers: '++id, nachname, vorname, telefon, geaendert_am',
  timeline_entries: '++id, kunden_id, datum, erstellt_am',
  order_items: '++id, kunden_id, brand, erledigt'
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
  await db.transaction('rw', db.customers, db.timeline_entries, db.order_items, async () => {
    await db.timeline_entries.where('kunden_id').equals(id).delete();
    await db.order_items.where('kunden_id').equals(id).delete();
    await db.customers.delete(id);
  });
}

export async function addTimelineEntry({ customerId, fotos, notiz }) {
  const now = new Date().toISOString();
  return db.timeline_entries.add({
    kunden_id: customerId,
    datum: now,
    fotos: fotos || [],
    notiz: notiz || '',
    erstellt_am: now
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

export const BACKUP_VERSION = 1;

export async function exportAllData() {
  const [customers, timeline_entries, order_items] = await Promise.all([
    db.customers.toArray(),
    db.timeline_entries.toArray(),
    db.order_items.toArray()
  ]);
  return {
    app: 'kundenbuch',
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    customers,
    timeline_entries,
    order_items
  };
}

export async function importAllData(data) {
  if (!data || data.app !== 'kundenbuch' || data.version !== BACKUP_VERSION) {
    throw new Error('Datei ist kein gültiges Kundenbuch-Backup.');
  }
  await db.transaction(
    'rw',
    db.customers,
    db.timeline_entries,
    db.order_items,
    async () => {
      await db.timeline_entries.clear();
      await db.order_items.clear();
      await db.customers.clear();
      if (data.customers?.length) await db.customers.bulkAdd(data.customers);
      if (data.timeline_entries?.length)
        await db.timeline_entries.bulkAdd(data.timeline_entries);
      if (data.order_items?.length) await db.order_items.bulkAdd(data.order_items);
    }
  );
}

export async function getStats() {
  const [customers, timeline_entries, order_items] = await Promise.all([
    db.customers.count(),
    db.timeline_entries.count(),
    db.order_items.count()
  ]);
  return { customers, timeline_entries, order_items };
}
