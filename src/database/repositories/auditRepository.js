import db from '../db';

export const auditRepository = {
  async log(action, module, recordId, description, user = null) {
    try {
      const currentUser = user || JSON.parse(localStorage.getItem('the_school_user') || '{}');
      await db.auditLogs.add({
        userId: currentUser.username || 'System',
        userName: currentUser.name || currentUser.username || 'Anonymous',
        role: currentUser.role || 'Guest',
        action: action,
        module: module,
        recordId: recordId || '-',
        description: description || '',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  },

  async getAll(limit = 100) {
    return await db.auditLogs.orderBy('id').reverse().limit(limit).toArray();
  },

  async clearAll() {
    return await db.auditLogs.clear();
  }
};
