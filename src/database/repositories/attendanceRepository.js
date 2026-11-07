import db from '../db';
import { auditRepository } from './auditRepository';

export const attendanceRepository = {
  async getStudentAttendanceByDate(date, classId, sectionId) {
    const record = await db.attendance
      .where('date').equals(date)
      .and(r => r.classId === classId && (!sectionId || r.sectionId === sectionId))
      .first();
    return record || null;
  },

  async saveStudentAttendance(date, classId, sectionId, records) {
    const id = `ATT-${date}-${classId}-${sectionId}`;
    const entry = {
      id,
      schoolId: 'SCH-00001',
      date,
      classId,
      sectionId,
      records,
      updatedAt: new Date().toISOString()
    };
    await db.attendance.put(entry);
    await auditRepository.log('SAVE_ATTENDANCE', 'Attendance', id, `Saved attendance for class ${classId}-${sectionId} on ${date}`);
    return entry;
  },

  async getAttendanceSummary(classId, sectionId, monthStr) {
    // monthStr format: YYYY-MM
    let list = await db.attendance.toArray();
    if (classId) list = list.filter(r => r.classId === classId);
    if (sectionId) list = list.filter(r => r.sectionId === sectionId);
    if (monthStr) list = list.filter(r => r.date.startsWith(monthStr));

    let totalSessions = list.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;

    list.forEach(item => {
      (item.records || []).forEach(st => {
        if (st.status === 'Present') presentCount++;
        else if (st.status === 'Absent') absentCount++;
        else if (st.status === 'Late') lateCount++;
        else if (st.status === 'Half Day') halfDayCount++;
      });
    });

    const totalMarked = presentCount + absentCount + lateCount + halfDayCount;
    const percentage = totalMarked > 0 ? ((presentCount + (lateCount * 0.8) + (halfDayCount * 0.5)) / totalMarked) * 100 : 100;

    return {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      halfDayCount,
      percentage: Number(percentage.toFixed(1))
    };
  },

  async getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = await db.attendance.where('date').equals(today).toArray();
    
    let present = 0;
    let absent = 0;
    let late = 0;
    let total = 0;

    todayRecords.forEach(att => {
      (att.records || []).forEach(r => {
        total++;
        if (r.status === 'Present') present++;
        else if (r.status === 'Absent') absent++;
        else if (r.status === 'Late') late++;
      });
    });

    return {
      date: today,
      totalMarked: total,
      present,
      absent,
      late,
      attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) : '96.5'
    };
  }
};

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

export const examRepository = {
  async getExams() {
    return await db.exams.toArray();
  },
  async createExam(data) {
    const id = data.id || `EXAM-${Date.now().toString().slice(-4)}`;
    const exam = { ...data, id, status: data.status || 'Upcoming' };
    await db.exams.add(exam);
    await auditRepository.log('CREATE_EXAM', 'Exams', id, `Scheduled examination ${data.name}`);
    return exam;
  },
  async getMarks(examId, classId, sectionId, subjectId) {
    const records = await db.marks
      .where('examId').equals(examId)
      .and(m => m.classId === classId && (!sectionId || m.sectionId === sectionId) && (!subjectId || m.subjectId === subjectId))
      .toArray();
    return records;
  },
  async saveMarks(examId, classId, sectionId, subjectId, studentMarks) {
    const id = `MRK-${examId}-${classId}-${sectionId}-${subjectId}`;
    const record = {
      id,
      examId,
      classId,
      sectionId,
      subjectId,
      records: studentMarks,
      updatedAt: new Date().toISOString()
    };
    await db.marks.put(record);
    await auditRepository.log('SAVE_MARKS', 'Exams', id, `Saved marks for exam ${examId}, class ${classId}, subject ${subjectId}`);
    return record;
  },
  async getStudentReportCard(studentId, examId) {
    const student = await db.students.get(studentId);
    if (!student) return null;
    const exam = await db.exams.get(examId);
    const marksList = await db.marks.where('examId').equals(examId).and(m => m.classId === student.classId).toArray();
    const subjects = await db.subjects.toArray();
    const subMap = new Map(subjects.map(s => [s.id, s]));

    const subjectResults = [];
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;

    marksList.forEach(m => {
      const entry = (m.records || []).find(r => r.studentId === studentId);
      const subObj = subMap.get(m.subjectId) || { name: m.subjectId, maxMarks: 100, passMarks: 35 };
      if (entry) {
        const score = entry.marksObtained || 0;
        totalMarksObtained += score;
        totalMaxMarks += subObj.maxMarks || 100;
        subjectResults.push({
          subjectId: m.subjectId,
          subjectName: subObj.name,
          maxMarks: subObj.maxMarks || 100,
          passMarks: subObj.passMarks || 35,
          marksObtained: score,
          isAbsent: entry.isAbsent || false,
          remarks: entry.remarks || ''
        });
      }
    });

    const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    const grades = await db.grades.toArray();
    const gradeObj = grades.find(g => percentage >= g.minScore && percentage <= g.maxScore) || { gradeName: 'D', description: 'Pass' };

    return {
      student,
      exam,
      subjects: subjectResults,
      totalMarksObtained,
      totalMaxMarks,
      percentage: Number(percentage.toFixed(2)),
      grade: gradeObj.gradeName,
      gradeRemarks: gradeObj.description
    };
  }
};
