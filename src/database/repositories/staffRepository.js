import db from '../db';
import { auditRepository } from './auditRepository';
import { generateId } from '../../utils/idGenerator';

export const staffRepository = {
  async getAll({ departmentId, status, search } = {}) {
    let staff = await db.staff.toArray();
    if (departmentId) staff = staff.filter(s => s.departmentId === departmentId);
    if (status) staff = staff.filter(s => s.status === status);
    if (search) {
      const q = search.toLowerCase().trim();
      staff = staff.filter(s =>
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        (s.staffNo && s.staffNo.toLowerCase().includes(q)) ||
        (s.designation && s.designation.toLowerCase().includes(q))
      );
    }
    const depts = await db.departments.toArray();
    const deptMap = new Map(depts.map(d => [d.id, d.name]));
    return staff.map(s => ({ ...s, departmentName: deptMap.get(s.departmentId) || '-' }));
  },

  async create(data) {
    const id = data.id || await generateId('STF', 'staff');
    const staffNo = data.staffNo || `EMP-S-${Date.now().toString().slice(-4)}`;
    const fullName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim();
    const newStaff = { ...data, id, staffNo, fullName, status: data.status || 'Active', createdAt: new Date().toISOString() };
    await db.staff.add(newStaff);
    await auditRepository.log('CREATE_STAFF', 'Staff', id, `Added staff member ${fullName}`);
    return newStaff;
  },

  async update(id, data) {
    const existing = await db.staff.get(id);
    if (!existing) throw new Error('Staff not found');
    const fullName = data.fullName || `${data.firstName || existing.firstName} ${data.lastName || existing.lastName}`.trim();
    const updated = { ...existing, ...data, fullName, updatedAt: new Date().toISOString() };
    await db.staff.put(updated);
    await auditRepository.log('UPDATE_STAFF', 'Staff', id, `Updated staff details for ${fullName}`);
    return updated;
  },

  async delete(id) {
    await db.staff.delete(id);
    await auditRepository.log('DELETE_STAFF', 'Staff', id, 'Deleted staff record');
    return true;
  }
};
