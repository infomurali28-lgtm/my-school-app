import db from '../db';
import { downloadJSON } from '../../utils/exportHelpers';
import { seedDatabase } from '../seed/seeder';

export const backupService = {
  async exportFullBackup() {
    const backupData = {
      meta: {
        appName: 'The School Management ERP',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        tablesCount: db.tables.length
      },
      data: {}
    };

    for (const table of db.tables) {
      backupData.data[table.name] = await table.toArray();
    }

    const dateStr = new Date().toISOString().split('T')[0];
    downloadJSON(backupData, `the-school-erp-backup-${dateStr}.json`);
    return backupData;
  },

  async restoreFromBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.data || typeof parsed.data !== 'object') {
            throw new Error('Invalid backup file format. "data" field is missing.');
          }

          // Transactionally restore all tables
          await db.transaction('rw', db.tables, async () => {
            for (const table of db.tables) {
              await table.clear();
              const rows = parsed.data[table.name];
              if (rows && Array.isArray(rows) && rows.length > 0) {
                await table.bulkAdd(rows);
              }
            }
          });

          resolve({
            success: true,
            meta: parsed.meta,
            restoredTables: Object.keys(parsed.data)
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  },

  async resetToDemoData() {
    await seedDatabase(true);
    return true;
  },

  async wipeAllData() {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
      }
    });
    return true;
  }
};
