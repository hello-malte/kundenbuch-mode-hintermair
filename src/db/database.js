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
