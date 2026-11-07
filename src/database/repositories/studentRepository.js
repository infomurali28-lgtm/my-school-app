import db from '../db';
import { auditRepository } from './auditRepository';
import { generateId } from '../../utils/idGenerator';

export const studentRepository = {
  async getAll({ classId, sectionId, houseId, status, search, page = 1, limit = 20 } = {}) {
    let collection = db.students.toCollection();

    let students = await collection.toArray();

    if (classId) {
      students = students.filter(s => s.classId === classId);
    }
    if (sectionId) {
      students = students.filter(s => s.sectionId === sectionId);
    }
    if (houseId) {
      students = students.filter(s => s.houseId === houseId);
    }
    if (status) {
      students = students.filter(s => s.status === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      students = students.filter(s =>
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        (s.admissionNo && s.admissionNo.toLowerCase().includes(q)) ||
        (s.rollNo && String(s.rollNo).includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );
    }

    // Join with classes and sections for display
    const classes = await db.classes.toArray();
    const sections = await db.sections.toArray();
    const houses = await db.houses.toArray();
    const classMap = new Map(classes.map(c => [c.id, c.name]));
    const secMap = new Map(sections.map(s => [s.id, s.name]));
    const houseMap = new Map(houses.map(h => [h.id, h.name]));

    const enriched = students.map(s => ({
      ...s,
      className: classMap.get(s.classId) || s.classId || '-',
      sectionName: secMap.get(s.sectionId) || s.sectionId || '-',
      houseName: houseMap.get(s.houseId) || s.houseId || '-'
    }));

    // Pagination
    const total = enriched.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = enriched.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total,
      page,
      totalPages,
      limit
    };
  },

  async getById(id) {
    const student = await db.students.get(id);
    if (!student) return null;

    const parent = student.parentId ? await db.parents.get(student.parentId) : null;
    const cls = student.classId ? await db.classes.get(student.classId) : null;
    const sec = student.sectionId ? await db.sections.get(student.sectionId) : null;
    const house = student.houseId ? await db.houses.get(student.houseId) : null;
    const invoices = await db.feeInvoices.where('studentId').equals(id).toArray();

    return {
      ...student,
      parent,
      className: cls ? cls.name : '-',
      sectionName: sec ? sec.name : '-',
      houseName: house ? house.name : '-',
      invoices
    };
  },

  async create(data) {
    const id = data.id || await generateId('STU', 'students');
    const admissionNo = data.admissionNo || `ADM-${Date.now().toString().slice(-6)}`;
    const fullName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim();

    let parentId = data.parentId;
    if (!parentId && (data.fatherName || data.motherName)) {
      parentId = await generateId('PAR', 'parents');
      await db.parents.add({
        id: parentId,
        fatherName: data.fatherName || '',
        motherName: data.motherName || '',
        guardianName: data.guardianName || data.fatherName || '',
        fatherOccupation: data.fatherOccupation || '',
        motherOccupation: data.motherOccupation || '',
        phone: data.phone || data.parentPhone || '',
        email: data.parentEmail || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || ''
      });
    }

    const newStudent = {
      ...data,
      id,
      admissionNo,
      fullName,
      parentId: parentId || '',
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };

    await db.students.add(newStudent);
    await auditRepository.log('CREATE_STUDENT', 'Students', id, `Enrolled new student ${fullName} (${admissionNo})`);
    return newStudent;
  },

  async update(id, data) {
    const existing = await db.students.get(id);
    if (!existing) throw new Error('Student not found');

    const fullName = data.fullName || `${data.firstName || existing.firstName} ${data.lastName || existing.lastName}`.trim();
    const updated = {
      ...existing,
      ...data,
      fullName,
      updatedAt: new Date().toISOString()
    };

    if (existing.parentId && (data.fatherName || data.motherName || data.parentPhone)) {
      const parent = await db.parents.get(existing.parentId);
      if (parent) {
        await db.parents.update(existing.parentId, {
          fatherName: data.fatherName !== undefined ? data.fatherName : parent.fatherName,
          motherName: data.motherName !== undefined ? data.motherName : parent.motherName,
          phone: data.parentPhone !== undefined ? data.parentPhone : parent.phone,
          email: data.parentEmail !== undefined ? data.parentEmail : parent.email,
          address: data.address !== undefined ? data.address : parent.address
        });
      }
    }

    await db.students.put(updated);
    await auditRepository.log('UPDATE_STUDENT', 'Students', id, `Updated student details for ${fullName}`);
    return updated;
  },

  async delete(id) {
    const student = await db.students.get(id);
    if (!student) return;

    await db.students.delete(id);
    await auditRepository.log('DELETE_STUDENT', 'Students', id, `Deleted student ${student.fullName} (${student.admissionNo})`);
    return true;
  },

  async bulkDelete(ids) {
    if (!ids || !ids.length) return;
    await db.students.bulkDelete(ids);
    await auditRepository.log('BULK_DELETE_STUDENT', 'Students', ids.join(','), `Bulk deleted ${ids.length} students`);
    return true;
  },

  async bulkPromote(studentIds, targetClassId, targetSectionId) {
    const students = await db.students.where('id').anyOf(studentIds).toArray();
    const updated = students.map(s => ({
      ...s,
      classId: targetClassId,
      sectionId: targetSectionId,
      updatedAt: new Date().toISOString()
    }));
    await db.students.bulkPut(updated);
    await auditRepository.log('PROMOTE_STUDENTS', 'Students', studentIds.join(','), `Promoted ${studentIds.length} students to class ${targetClassId}`);
    return updated;
  },

  async bulkImport(studentsList) {
    const created = [];
    for (let i = 0; i < studentsList.length; i++) {
      const row = studentsList[i];
      const res = await this.create(row);
      created.push(res);
    }
    return created;
  },

  async getStats() {
    const students = await db.students.toArray();
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const male = students.filter(s => s.gender === 'Male').length;
    const female = students.filter(s => s.gender === 'Female').length;

    const classDistribution = {};
    students.forEach(s => {
      classDistribution[s.classId] = (classDistribution[s.classId] || 0) + 1;
    });

    return {
      total,
      active,
      male,
      female,
      classDistribution
    };
  }
};
