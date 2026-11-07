import db from '../db';
import { auditRepository } from './auditRepository';

export const academicRepository = {
  async getClasses() {
    return await db.classes.orderBy('numericGrade').toArray();
  },
  async getSections(classId) {
    if (classId) return await db.sections.where('classId').equals(classId).toArray();
    return await db.sections.toArray();
  },
  async getSubjects() {
    return await db.subjects.toArray();
  },
  async getAcademicYears() {
    return await db.academicYears.toArray();
  },
  async getTimetable(classId, sectionId) {
    let list = await db.timetables.toArray();
    if (classId) list = list.filter(t => t.classId === classId);
    if (sectionId) list = list.filter(t => t.sectionId === sectionId);

    const subjects = await db.subjects.toArray();
    const teachers = await db.teachers.toArray();
    const subMap = new Map(subjects.map(s => [s.id, s.name]));
    const tchMap = new Map(teachers.map(t => [t.id, t.fullName]));

    return list.map(t => ({
      ...t,
      subjectName: subMap.get(t.subjectId) || t.subjectId,
      teacherName: tchMap.get(t.teacherId) || t.teacherId
    }));
  },
  async saveTimetableSlot(slot) {
    const id = slot.id || `TT-${Date.now().toString(36)}`;
    const record = { ...slot, id };
    await db.timetables.put(record);
    return record;
  },
  async deleteTimetableSlot(id) {
    await db.timetables.delete(id);
    return true;
  }
};
