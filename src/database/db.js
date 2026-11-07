// Supabase-backed compatibility layer for the existing Dexie-style repositories.
// The UI keeps the same db.table API, but records are stored in PostgreSQL via Supabase REST.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tipobwermptihgdhqiie.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
if (!SUPABASE_KEY) console.warn('Missing VITE_SUPABASE_PUBLISHABLE_KEY');
const TABLE_NAME = 'school_records';

const TABLES = [
  'users','roles','schools','branches','academicYears','departments','classes','sections','subjects','houses',
  'studentCategories','students','parents','teachers','staff','attendance','teacherAttendance','staffAttendance',
  'timetables','exams','examSchedules','marks','grades','feeCategories','feeStructures','feeInvoices','feePayments',
  'income','expenses','salaryStructures','payrolls','leaveRequests','notices','events','messages','certificates',
  'auditLogs','settings'
];

const cache = new Map();
const apiHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

async function request(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: { ...apiHeaders, ...(options.headers || {}) }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${response.status}: ${text || response.statusText}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function encode(value) {
  return encodeURIComponent(value);
}

async function loadTable(name, force = false) {
  if (!force && cache.has(name)) return cache.get(name);
  const rows = await request(`${TABLE_NAME}?select=id,data,school_id&table_name=eq.${encode(name)}&limit=10000`);
  const data = (rows || []).map(row => ({ ...(row.data || {}), id: row.data?.id ?? row.id }));
  cache.set(name, data);
  return data;
}

async function insertRows(name, rows) {
  if (!rows?.length) return [];
  const payload = rows.map(row => ({
    table_name: name,
    id: String(row.id),
    school_id: row.schoolId || row.school_id || 'SCH-00001',
    data: row
  }));
  const result = await request(TABLE_NAME, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  cache.set(name, [...(cache.get(name) || []), ...rows]);
  return rows;
}

async function upsertRows(name, rows) {
  if (!rows?.length) return [];
  const payload = rows.map(row => ({
    table_name: name,
    id: String(row.id),
    school_id: row.schoolId || row.school_id || 'SCH-00001',
    data: row
  }));
  await request(TABLE_NAME, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(payload)
  });
  const current = cache.get(name) || [];
  const map = new Map(current.map(r => [String(r.id), r]));
  rows.forEach(r => map.set(String(r.id), r));
  cache.set(name, [...map.values()]);
  return rows;
}

async function deleteRows(name, ids) {
  if (!ids?.length) return;
  const unique = [...new Set(ids.map(String))];
  for (const id of unique) {
    await request(`${TABLE_NAME}?table_name=eq.${encode(name)}&id=eq.${encode(id)}`, { method: 'DELETE' });
  }
  const set = new Set(unique);
  cache.set(name, (cache.get(name) || []).filter(r => !set.has(String(r.id))));
}

function collection(name, initialPromise) {
  const get = async () => initialPromise ? await initialPromise() : await loadTable(name);
  const api = {
    async toArray() { return [...await get()]; },
    async first() { return (await get())[0]; },
    async delete() { const rows = await get(); await deleteRows(name, rows.map(r => r.id)); },
    async limit(n) { return (await get()).slice(0, n); }
  };
  return api;
}

function table(name) {
  const t = {
    name,
    async toArray() { return [...await loadTable(name)]; },
    async count() { return (await loadTable(name)).length; },
    async get(id) { return (await loadTable(name)).find(r => String(r.id) === String(id)); },
    async add(row) { await insertRows(name, [row]); return row; },
    async bulkAdd(rows) { await insertRows(name, rows); return rows; },
    async put(row) { await upsertRows(name, [row]); return row; },
    async bulkPut(rows) { await upsertRows(name, rows); return rows; },
    async update(id, patch) {
      const existing = await t.get(id);
      if (!existing) return 0;
      const updated = { ...existing, ...patch };
      await upsertRows(name, [updated]);
      return 1;
    },
    async delete(id) { await deleteRows(name, [id]); },
    async bulkDelete(ids) { await deleteRows(name, ids); },
    async clear() {
      const rows = await loadTable(name, true);
      await deleteRows(name, rows.map(r => r.id));
    },
    toCollection() { return collection(name); },
    where(field) {
      const filter = async () => loadTable(name);
      const query = {
        async toArray() { return await filter(); },
        async first() { return (await filter())[0]; },
        async delete() { const rows = await filter(); await deleteRows(name, rows.map(r => r.id)); },
        equals(value) {
          const c = {
            async toArray() { return (await filter()).filter(r => r[field] === value); },
            async first() { return (await c.toArray())[0]; },
            async delete() { const rows = await c.toArray(); await deleteRows(name, rows.map(r => r.id)); },
            anyOf(values) { return chainFilter(row => values.some(v => String(row[field]) === String(v))); },
            and(predicate) { return chainFilter(rows => predicate(rows)); }
          };
          return c;
        },
        equalsIgnoreCase(value) {
          const target = String(value).toLowerCase();
          return {
            async toArray() { return (await filter()).filter(r => String(r[field] ?? '').toLowerCase() === target); },
            async first() { return (await this.toArray())[0]; },
            async delete() { const rows = await this.toArray(); await deleteRows(name, rows.map(r => r.id)); }
          };
        },
        anyOf(values) { return chainFilter(row => values.map(String).includes(String(row[field]))); },
        and(predicate) { return chainFilter(predicate); }
      };
      function chainFilter(predicate) {
        const c = {
          async toArray() { return (await filter()).filter(predicate); },
          async first() { return (await c.toArray())[0]; },
          async delete() { const rows = await c.toArray(); await deleteRows(name, rows.map(r => r.id)); },
          and(next) { return chainFilter(async row => (await predicate(row)) && next(row)); }
        };
        return c;
      }
      return query;
    },
    orderBy(field) {
      const chain = {
        _reverse: false,
        _limit: null,
        reverse() { this._reverse = !this._reverse; return this; },
        limit(n) { this._limit = n; return this; },
        async toArray() {
          let rows = [...await loadTable(name)];
          rows.sort((a,b) => {
            const av = a[field], bv = b[field];
            if (av === bv) return 0;
            if (av == null) return -1;
            if (bv == null) return 1;
            return av < bv ? -1 : 1;
          });
          if (this._reverse) rows.reverse();
          if (this._limit != null) rows = rows.slice(0, this._limit);
          return rows;
        }
      };
      return chain;
    }
  };
  return t;
}

export const db = {
  tables: TABLES.map(table),
  transaction: async (_mode, _tables, fn) => fn()
};
for (const name of TABLES) db[name] = table(name);

export async function testSupabaseConnection() {
  await request(`${TABLE_NAME}?select=id&limit=1`);
  return true;
}

export default db;
