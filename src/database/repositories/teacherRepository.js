import db from '../db';
import { auditRepository } from './auditRepository';
import { generateId } from '../../utils/idGenerator';

export const teacherRepository = {
  async getAll({ departmentId, status, search, page = 1, limit = 20 } = {}) {
    let teachers = await db.teachers.toArray();

    if (departmentId) {
      teachers = teachers.filter(t => t.departmentId === departmentId);
    }
    if (status) {
      teachers = teachers.filter(t => t.status === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      teachers = teachers.filter(t =>
        (t.fullName && t.fullName.toLowerCase().includes(q)) ||
        (t.teacherNo && t.teacherNo.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.phone && t.phone.includes(q)) ||
        (t.designation && t.designation.toLowerCase().includes(q))
      );
    }

    const depts = await db.departments.toArray();
    const deptMap = new Map(depts.map(d => [d.id, d.name]));

    const enriched = teachers.map(t => ({
      ...t,
      departmentName: deptMap.get(t.departmentId) || t.departmentId || '-'
    }));

    const total = enriched.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      data: enriched.slice(startIndex, startIndex + limit),
      total,
      page,
      totalPages,
      limit
    };
  },

  async getById(id) {
    const teacher = await db.teachers.get(id);
    if (!teacher) return null;
    const dept = teacher.departmentId ? await db.departments.get(teacher.departmentId) : null;
    const timetable = await db.timetables.where('teacherId').equals(id).toArray();
    return {
      ...teacher,
      departmentName: dept ? dept.name : '-',
      timetable
    };
  },

  async create(data) {
    const id = data.id || await generateId('TCH', 'teachers');
    const teacherNo = data.teacherNo || `EMP-T-${Date.now().toString().slice(-4)}`;
    const fullName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim();

    const newTeacher = {
      ...data,
      id,
      teacherNo,
      fullName,
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };

    await db.teachers.add(newTeacher);

    // Create user login if requested
    if (data.username && data.password) {
      await db.users.add({
        username: data.username,
        email: data.email || `${data.username}@theschool.edu`,
        password: data.password,
        role: 'Teacher',
        name: fullName,
        phone: data.phone,
        schoolId: 'SCH-00001',
        entityId: id,
        createdAt: new Date().toISOString()
      });
    }

    await auditRepository.log('CREATE_TEACHER', 'Teachers', id, `Added new faculty member ${fullName}`);
    return newTeacher;
  },

  async update(id, data) {
    const existing = await db.teachers.get(id);
    if (!existing) throw new Error('Teacher not found');

    const fullName = data.fullName || `${data.firstName || existing.firstName} ${data.lastName || existing.lastName}`.trim();
    const updated = {
      ...existing,
      ...data,
      fullName,
      updatedAt: new Date().toISOString()
    };

    await db.teachers.put(updated);
    await auditRepository.log('UPDATE_TEACHER', 'Teachers', id, `Updated faculty details for ${fullName}`);
    return updated;
  },

  async delete(id) {
    const teacher = await db.teachers.get(id);
    if (!teacher) return;
    await db.teachers.delete(id);
    await auditRepository.log('DELETE_TEACHER', 'Teachers', id, `Deleted teacher ${teacher.fullName}`);
    return true;
  }
};

export const parentRepository = {
  async getAll({ search, page = 1, limit = 20 } = {}) {
    let parents = await db.parents.toArray();

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      parents = parents.filter(p =>
        (p.fatherName && p.fatherName.toLowerCase().includes(q)) ||
        (p.motherName && p.motherName.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
      );
    }

    const students = await db.students.toArray();
    const studentMap = new Map();
    students.forEach(s => {
      if (s.parentId) {
        if (!studentMap.has(s.parentId)) studentMap.set(s.parentId, []);
        studentMap.get(s.parentId).push(s);
      }
    });

    const enriched = parents.map(p => ({
      ...p,
      children: studentMap.get(p.id) || []
    }));

    const total = enriched.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      data: enriched.slice(startIndex, startIndex + limit),
      total,
      page,
      totalPages,
      limit
    };
  },

  async getById(id) {
    const parent = await db.parents.get(id);
    if (!parent) return null;
    const children = await db.students.where('parentId').equals(id).toArray();
    return {
      ...parent,
      children
    };
  }
};

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
