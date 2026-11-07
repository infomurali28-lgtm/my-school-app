import db from '../db';
import { auditRepository } from './auditRepository';

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
