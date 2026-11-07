import db from '../database/db';

export async function generateId(prefix, tableName, fieldName = 'id') {
  try {
    const records = await db[tableName].toArray();
    let maxNum = 0;
    const regex = new RegExp(`^${prefix}-(\\d+)`, 'i');

    for (const record of records) {
      const val = record[fieldName];
      if (val && typeof val === 'string') {
        const match = val.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    const nextNum = maxNum + 1;
    return `${prefix}-${String(nextNum).padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating ID for ' + tableName, error);
    const fallback = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${fallback}`;
  }
}

export function generateSimpleId(prefix = 'ID') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}
