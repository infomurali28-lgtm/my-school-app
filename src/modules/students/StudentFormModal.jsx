import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Building, ShieldCheck, Upload } from 'lucide-react';
import db from '../../database/db';
import { studentRepository } from '../../database/repositories/studentRepository';
import { Modal, Button } from '../../components/common/UIComponents';
import { BLOOD_GROUPS, GENDERS, RELIGIONS, CATEGORIES } from '../../utils/formatters';

export function StudentFormModal({ isOpen, onClose, onSuccess, initialData }) {
  const isEditing = Boolean(initialData);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [houses, setHouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Male',
    dob: '2015-01-01',
    bloodGroup: 'O+',
    religion: 'Hindu',
    caste: 'General',
    category: 'General',
    motherTongue: 'English',
    nationalId: '',
    email: '',
    phone: '',
    address: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    classId: 'CLS-01',
    sectionId: 'SEC-01-A',
    rollNo: '',
    houseId: 'HSE-01',
    admissionDate: new Date().toISOString().split('T')[0],
    previousSchool: '',
    photo: '',
    fatherName: '',
    motherName: '',
    guardianName: '',
    fatherOccupation: '',
    motherOccupation: '',
    parentPhone: '',
    parentEmail: ''
  });

  useEffect(() => {
    loadSetupData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fatherName: initialData.parent?.fatherName || initialData.fatherName || '',
        motherName: initialData.parent?.motherName || initialData.motherName || '',
        parentPhone: initialData.parent?.phone || initialData.parentPhone || '',
        parentEmail: initialData.parent?.email || initialData.parentEmail || ''
      });
    }
  }, [initialData]);

  const loadSetupData = async () => {
    const [cls, sec, hse, cat] = await Promise.all([
      db.classes.toArray(),
      db.sections.toArray(),
      db.houses.toArray(),
      db.studentCategories.toArray()
    ]);
    setClasses(cls);
    setSections(sec);
    setHouses(hse);
    setCategories(cat);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim()) {
      setError('First name is required.');
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await studentRepository.update(initialData.id, formData);
      } else {
        await studentRepository.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save student record.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = sections.filter(s => !formData.classId || s.classId === formData.classId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Student — ${initialData?.fullName}` : 'New Student Admission'}
      subtitle="Enter complete personal, academic, and parent credentials"
      maxWidth="max-w-4xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEditing ? 'Save Changes' : 'Complete Admission'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-semibold">
            {error}
          </div>
        )}

        {/* Section 1: Basic & Photo */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-indigo-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-900 shadow-sm">
              {formData.photo ? (
                <img src={formData.photo} alt="Student preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-indigo-400" />
              )}
            </div>
            <label className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Upload className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold">Upload Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Rahul"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Middle Name</label>
              <input
                type="text"
                value={formData.middleName}
                onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                placeholder=""
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Kumar"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Assignment */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 text-indigo-600 dark:text-indigo-400">
            Academic Enrollment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Class / Grade *</label>
              <select
                value={formData.classId}
                onChange={e => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Section *</label>
              <select
                value={formData.sectionId}
                onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {filteredSections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
              <input
                type="number"
                value={formData.rollNo}
                onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                placeholder="101"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">House</label>
              <select
                value={formData.houseId}
                onChange={e => setFormData({ ...formData, houseId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {houses.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Personal Information */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 text-indigo-600 dark:text-indigo-400">
            Personal & Demographic Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Religion</label>
              <select
                value={formData.religion}
                onChange={e => setFormData({ ...formData, religion: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Parent / Guardian Details */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 text-indigo-600 dark:text-indigo-400">
            Parent & Guardian Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Raj Kumar"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mother Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                placeholder="Sunita Kumar"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Phone *</label>
              <input
                type="text"
                value={formData.parentPhone || formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value, parentPhone: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Address & Contact */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 text-indigo-600 dark:text-indigo-400">
            Address & Location
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot 10, Green Meadows"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
