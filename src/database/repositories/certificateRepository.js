import db from '../db';
import { auditRepository } from './auditRepository';

export const certificateRepository = {
  async getAll() {
    const list = await db.certificates.toArray();
    const students = await db.students.toArray();
    const stuMap = new Map(students.map(s => [s.id, s]));

    return list.map(c => {
      const st = stuMap.get(c.studentId);
      return {
        ...c,
        studentName: st ? st.fullName : c.studentId,
        admissionNo: st ? st.admissionNo : '-'
      };
    });
  },

  async generateCertificate(data) {
    const id = `CERT-${Date.now().toString().slice(-6)}`;
    const cert = {
      ...data,
      id,
      certificateNo: `CERT-2025-${Date.now().toString().slice(-4)}`,
      issueDate: data.issueDate || new Date().toISOString().split('T')[0]
    };
    await db.certificates.add(cert);
    await auditRepository.log('ISSUE_CERTIFICATE', 'Certificates', id, `Issued ${cert.type} certificate to ${cert.studentId}`);
    return cert;
  }
};
