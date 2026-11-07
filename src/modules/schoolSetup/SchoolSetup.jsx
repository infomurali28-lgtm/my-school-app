import React, { useState, useEffect } from 'react';
import { Building2, Save, Plus, Edit2, Trash2, CheckCircle2, Layers, BookOpen, GitBranch, Calendar } from 'lucide-react';
import db from '../../database/db';
import { Card, Button, Badge, Modal } from '../../components/common/UIComponents';
import { settingsRepository } from '../../database/repositories/settingsRepository';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export function SchoolSetup() {
  const { refreshBranchesAndYears, t } = useThemeLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [schoolProfile, setSchoolProfile] = useState({
    name: 'The School',
    tagline: 'Inspiring Excellence, Empowering Minds',
    address: 'Plot 42, Jubilee Hills, Knowledge Corridor',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    phone: '+91 98765 43210',
    email: 'info@theschool.edu',
    website: 'https://theschool.edu',
    principal: 'Dr. Ramesh Sharma, Ph.D.',
    affiliationNo: 'CBSE/AFF/2026/9921',
    currency: 'INR',
    currencySymbol: '₹'
  });

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modals
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchFormData, setBranchFormData] = useState({ name: '', code: '', address: '', phone: '', email: '' });

  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [yearFormData, setYearFormData] = useState({ name: '2026 - 2027', startDate: '2026-06-01', endDate: '2027-04-30', isCurrent: 0 });

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newNumericGrade, setNewNumericGrade] = useState('');

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubType, setNewSubType] = useState('Theory');

  useEffect(() => {
    loadSetupData();
  }, []);

  const loadSetupData = async () => {
    const profile = await settingsRepository.getSchoolProfile();
    setSchoolProfile(profile);

    const [cls, sec, sub, br, ay] = await Promise.all([
      db.classes.orderBy('numericGrade').toArray(),
      db.sections.toArray(),
      db.subjects.toArray(),
      db.branches.toArray(),
      db.academicYears.toArray()
    ]);
    setClasses(cls);
    setSections(sec);
    setSubjects(sub);
    setBranches(br);
    setAcademicYears(ay);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsRepository.updateSchoolProfile(schoolProfile);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error saving school profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Branch CRUD
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchFormData({ name: '', code: '', address: '', phone: '', email: '' });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b) => {
    setEditingBranch(b);
    setBranchFormData({ ...b });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    if (!branchFormData.name.trim()) return;

    if (editingBranch) {
      await db.branches.update(editingBranch.id, branchFormData);
    } else {
      const id = `BR-${Date.now().toString().slice(-5)}`;
      await db.branches.add({
        ...branchFormData,
        id,
        schoolId: 'SCH-00001',
        code: branchFormData.code || `BR-${branchFormData.name.slice(0, 3).toUpperCase()}`
      });
    }

    setIsBranchModalOpen(false);
    await refreshBranchesAndYears();
    loadSetupData();
  };

  const handleDeleteBranch = async (id) => {
    if (branches.length <= 1) {
      alert('Cannot delete the last remaining school campus branch.');
      return;
    }
    if (window.confirm('Delete this branch from The School?')) {
      await db.branches.delete(id);
      await refreshBranchesAndYears();
      loadSetupData();
    }
  };

  // Academic Year CRUD
  const handleSaveYear = async (e) => {
    e.preventDefault();
    if (!yearFormData.name.trim()) return;

    const id = `AY-${yearFormData.name.replace(/\s+/g, '')}`;
    if (yearFormData.isCurrent) {
      // Unset other current years
      const allYears = await db.academicYears.toArray();
      for (const y of allYears) {
        await db.academicYears.update(y.id, { isCurrent: 0 });
      }
    }

    await db.academicYears.put({
      id,
      schoolId: 'SCH-00001',
      name: yearFormData.name,
      startDate: yearFormData.startDate,
      endDate: yearFormData.endDate,
      isCurrent: yearFormData.isCurrent ? 1 : 0
    });

    setIsYearModalOpen(false);
    await refreshBranchesAndYears();
    loadSetupData();
  };

  const handleSetCurrentYear = async (ay) => {
    const allYears = await db.academicYears.toArray();
    for (const y of allYears) {
      await db.academicYears.update(y.id, { isCurrent: y.id === ay.id ? 1 : 0 });
    }
    await refreshBranchesAndYears();
    loadSetupData();
  };

  // Class & Subject CRUD
  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const id = `CLS-${Date.now().toString().slice(-4)}`;
    await db.classes.add({
      id,
      schoolId: 'SCH-00001',
      name: newClassName.trim(),
      numericGrade: parseInt(newNumericGrade, 10) || 0,
      stream: 'General'
    });
    await db.sections.add({
      id: `SEC-${id}-A`,
      schoolId: 'SCH-00001',
      classId: id,
      name: 'A',
      capacity: 35,
      roomNo: '101'
    });
    setNewClassName('');
    setNewNumericGrade('');
    setIsClassModalOpen(false);
    loadSetupData();
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const id = `SUB-${Date.now().toString().slice(-4)}`;
    await db.subjects.add({
      id,
      schoolId: 'SCH-00001',
      name: newSubName.trim(),
      code: newSubCode.trim() || `SUB-${newSubName.slice(0, 3).toUpperCase()}`,
      type: newSubType,
      passMarks: 35,
      maxMarks: 100
    });
    setNewSubName('');
    setNewSubCode('');
    setIsSubjectModalOpen(false);
    loadSetupData();
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Delete this class and its sections?')) {
      await db.classes.delete(id);
      await db.sections.where('classId').equals(id).delete();
      loadSetupData();
    }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Delete this subject?')) {
      await db.subjects.delete(id);
      loadSetupData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            School Setup & Campus Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure institutional profile, manage campus branches, academic sessions, grades, and subjects.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Building2 className="w-4 h-4" /> School Profile
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'branches'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <GitBranch className="w-4 h-4" /> Campus Branches ({branches.length})
        </button>

        <button
          onClick={() => setActiveTab('academicYears')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'academicYears'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4" /> Academic Years ({academicYears.length})
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'classes'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-4 h-4" /> Classes & Sections ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Subjects Curriculum ({subjects.length})
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <Card title="Institutional Profile & Header Details" subtitle="Displayed on report cards, fee receipts, and certificates">
          {savedSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>School profile updated and saved permanently!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={schoolProfile.name}
                  onChange={e => setSchoolProfile({ ...schoolProfile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Motto / Tagline</label>
                <input
                  type="text"
                  value={schoolProfile.tagline}
                  onChange={e => setSchoolProfile({ ...schoolProfile, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Principal Name</label>
                <input
                  type="text"
                  value={schoolProfile.principal}
                  onChange={e => setSchoolProfile({ ...schoolProfile, principal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Affiliation / Board Code</label>
                <input
                  type="text"
                  value={schoolProfile.affiliationNo}
                  onChange={e => setSchoolProfile({ ...schoolProfile, affiliationNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Campus Address</label>
                <input
                  type="text"
                  value={schoolProfile.address}
                  onChange={e => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={schoolProfile.phone}
                  onChange={e => setSchoolProfile({ ...schoolProfile, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  value={schoolProfile.email}
                  onChange={e => setSchoolProfile({ ...schoolProfile, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button type="submit" variant="primary" icon={Save} loading={saving}>
                Save School Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Branches Management */}
      {activeTab === 'branches' && (
        <Card
          title="Campus Branches & Locations"
          subtitle="Manage multiple school branches — immediately syncs with the top header branch selector"
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddBranch}>
              Add Branch
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {branches.map(b => (
              <div key={b.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{b.name}</h4>
                      <Badge variant="purple" size="xs">{b.code}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">📍 {b.address}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">📞 {b.phone} • ✉️ {b.email}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditBranch(b)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Academic Years Management */}
      {activeTab === 'academicYears' && (
        <Card
          title="Academic Years & Sessions"
          subtitle="Manage academic years — syncs with the top header session selector"
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsYearModalOpen(true)}>
              Add Academic Year
            </Button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {academicYears.map(ay => (
              <div key={ay.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{ay.name}</span>
                    {ay.isCurrent === 1 && <Badge variant="success" size="xs">Current Session</Badge>}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Start: {ay.startDate} • End: {ay.endDate}
                  </p>
                </div>

                {ay.isCurrent !== 1 && (
                  <Button variant="outline" size="sm" onClick={() => handleSetCurrentYear(ay)}>
                    Set as Current
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 4: Classes */}
      {activeTab === 'classes' && (
        <Card
          title="Active Classes & Sections"
          subtitle="Manage educational grade levels and classroom divisions"
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsClassModalOpen(true)}>
              Add Class
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {classes.map(cls => {
              const clsSections = sections.filter(s => s.classId === cls.id);
              return (
                <div key={cls.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{cls.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">Code: {cls.id}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Sections:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {clsSections.map(sec => (
                        <Badge key={sec.id} variant="info" size="xs">
                          Section {sec.name} (Cap: {sec.capacity})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 5: Subjects */}
      {activeTab === 'subjects' && (
        <Card
          title="Subjects Curriculum"
          subtitle="Courses taught across disciplines"
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsSubjectModalOpen(true)}>
              Add Subject
            </Button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {subjects.map(sub => (
              <div key={sub.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{sub.name}</span>
                    <Badge variant="purple" size="xs">{sub.code}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Type: <strong>{sub.type}</strong> • Max Marks: {sub.maxMarks} • Pass Marks: {sub.passMarks}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSubject(sub.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add / Edit Branch Modal */}
      {isBranchModalOpen && (
        <Modal
          isOpen={isBranchModalOpen}
          onClose={() => setIsBranchModalOpen(false)}
          title={editingBranch ? 'Edit Campus Branch' : 'Add New Campus Branch'}
          subtitle="Branch will appear immediately in the top header selector"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsBranchModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveBranch}>Save Branch</Button>
            </>
          }
        >
          <form onSubmit={handleSaveBranch} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Branch / Campus Name *</label>
              <input
                type="text"
                required
                value={branchFormData.name}
                onChange={e => setBranchFormData({ ...branchFormData, name: e.target.value })}
                placeholder="e.g. South Campus (Gachibowli)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Branch Code</label>
                <input
                  type="text"
                  value={branchFormData.code}
                  onChange={e => setBranchFormData({ ...branchFormData, code: e.target.value })}
                  placeholder="BR-SOUTH"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={branchFormData.phone}
                  onChange={e => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                  placeholder="+91 98765 43212"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Campus Address</label>
              <input
                type="text"
                value={branchFormData.address}
                onChange={e => setBranchFormData({ ...branchFormData, address: e.target.value })}
                placeholder="Near Financial District, Gachibowli"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={branchFormData.email}
                onChange={e => setBranchFormData({ ...branchFormData, email: e.target.value })}
                placeholder="south@theschool.edu"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Add Academic Year Modal */}
      {isYearModalOpen && (
        <Modal
          isOpen={isYearModalOpen}
          onClose={() => setIsYearModalOpen(false)}
          title="Add Academic Session"
          subtitle="Configure new calendar year"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsYearModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveYear}>Add Academic Year</Button>
            </>
          }
        >
          <form onSubmit={handleSaveYear} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Session Name *</label>
              <input
                type="text"
                required
                value={yearFormData.name}
                onChange={e => setYearFormData({ ...yearFormData, name: e.target.value })}
                placeholder="2026 - 2027"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={yearFormData.startDate}
                  onChange={e => setYearFormData({ ...yearFormData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={yearFormData.endDate}
                  onChange={e => setYearFormData({ ...yearFormData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is-current-year-check"
                checked={Boolean(yearFormData.isCurrent)}
                onChange={e => setYearFormData({ ...yearFormData, isCurrent: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
              <label htmlFor="is-current-year-check" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Set as Active / Current Academic Session
              </label>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Class Modal */}
      {isClassModalOpen && (
        <Modal
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          title="Add New Academic Class"
          subtitle="Creates class and initial Section A"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsClassModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddClass}>Create Class</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Class Name *</label>
              <input
                type="text"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="e.g. Grade 11 - Commerce"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Numeric Grade</label>
              <input
                type="number"
                value={newNumericGrade}
                onChange={e => setNewNumericGrade(e.target.value)}
                placeholder="11"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Add Subject Modal */}
      {isSubjectModalOpen && (
        <Modal
          isOpen={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          title="Add New Subject"
          subtitle="Add subject to academic curriculum"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsSubjectModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddSubject}>Create Subject</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Name *</label>
              <input
                type="text"
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                placeholder="e.g. Economics"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
              <input
                type="text"
                value={newSubCode}
                onChange={e => setNewSubCode(e.target.value)}
                placeholder="e.g. ECO-101"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course Type</label>
              <select
                value={newSubType}
                onChange={e => setNewSubType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
                <option value="Theory + Practical">Theory + Practical</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
