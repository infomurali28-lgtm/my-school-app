import db from '../db';
import { auditRepository } from './auditRepository';

export const communicationRepository = {
  async getNotices() {
    return await db.notices.orderBy('publishDate').reverse().toArray();
  },
  async addNotice(data) {
    const id = data.id || `NTC-${Date.now().toString().slice(-4)}`;
    const record = { ...data, id, publishDate: data.publishDate || new Date().toISOString().split('T')[0] };
    await db.notices.add(record);
    await auditRepository.log('CREATE_NOTICE', 'Communication', id, `Published notice: ${data.title}`);
    return record;
  },
  async getEvents() {
    return await db.events.orderBy('startDate').toArray();
  },
  async addEvent(data) {
    const id = data.id || `EVT-${Date.now().toString().slice(-4)}`;
    const record = { ...data, id };
    await db.events.add(record);
    await auditRepository.log('CREATE_EVENT', 'Communication', id, `Created event: ${data.title}`);
    return record;
  }
};

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

export const settingsRepository = {
  async getSchoolProfile() {
    const school = await db.schools.get('SCH-00001');
    return school || {
      id: 'SCH-00001',
      name: 'The School - Main Campus',
      tagline: 'Inspiring Excellence, Empowering Minds',
      address: 'Plot 42, Jubilee Hills, Knowledge Corridor',
      phone: '+91 98765 43210',
      email: 'info@theschool.edu',
      principal: 'Dr. Ramesh Sharma, Ph.D.'
    };
  },

  async updateSchoolProfile(data) {
    await db.schools.put({ ...data, id: 'SCH-00001' });
    await auditRepository.log('UPDATE_SETTINGS', 'Settings', 'SCH-00001', 'Updated school profile');
    return data;
  }
};
