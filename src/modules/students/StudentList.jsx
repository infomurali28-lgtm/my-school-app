import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  CreditCard,
  CheckSquare,
  Square,
  ArrowRightLeft
} from 'lucide-react';
import db from '../../database/db';
import { studentRepository } from '../../database/repositories/studentRepository';
import { Button, Card, Badge, Modal, Pagination } from '../../components/common/UIComponents';
import { exportToCSV, exportToExcel } from '../../utils/exportHelpers';
import { excelService } from '../../database/services/excelService';
import { StudentFormModal } from './StudentFormModal';
import { StudentProfileModal } from './StudentProfileModal';
import { StudentIdCardModal } from './StudentIdCardModal';
import { StudentBulkImportModal } from './StudentBulkImportModal';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export function StudentList() {
  const { activeBranch, t } = useThemeLanguage();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [houses, setHouses] = useState([]);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(15);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudentId, setViewingStudentId] = useState(null);
  const [idCardStudentId, setIdCardStudentId] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteTargetClass, setPromoteTargetClass] = useState('');
  const [promoteTargetSec, setPromoteTargetSec] = useState('');

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [selectedClass, selectedSection, selectedHouse, selectedStatus, searchQuery, page, activeBranch]);

  const loadFilterOptions = async () => {
    const [cls, sec, hse] = await Promise.all([
      db.classes.orderBy('numericGrade').toArray(),
      db.sections.toArray(),
      db.houses.toArray()
    ]);
    setClasses(cls);
    setSections(sec);
    setHouses(hse);
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await studentRepository.getAll({
        classId: selectedClass,
        sectionId: selectedSection,
        houseId: selectedHouse,
        status: selectedStatus,
        search: searchQuery,
        page,
        limit
      });
      setStudents(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.total);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      await studentRepository.delete(id);
      loadStudents();
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected students?`)) {
      await studentRepository.bulkDelete(selectedIds);
      setSelectedIds([]);
      loadStudents();
    }
  };

  const handleBulkPromote = async () => {
    if (!promoteTargetClass) {
      alert('Please select target class.');
      return;
    }
    await studentRepository.bulkPromote(selectedIds, promoteTargetClass, promoteTargetSec || 'SEC-01-A');
    setIsPromoteModalOpen(false);
    setSelectedIds([]);
    loadStudents();
    alert(`Successfully promoted ${selectedIds.length} students!`);
  };

  const handleExportData = (type) => {
    const exportData = students.map(s => ({
      'Admission No': s.admissionNo,
      'Full Name': s.fullName,
      'Class': s.className,
      'Section': s.sectionName,
      'Roll No': s.rollNo,
      'Gender': s.gender,
      'Date of Birth': s.dob,
      'Blood Group': s.bloodGroup,
      'Mobile Phone': s.phone,
      'Email': s.email,
      'House': s.houseName,
      'Status': s.status
    }));

    if (type === 'excel') {
      exportToExcel(exportData, 'Students', 'the-school-students-list.xlsx');
    } else {
      exportToCSV(exportData, 'the-school-students-list.csv');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            {t('students.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('students.subtitle', { total: totalItems })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => excelService.generateStudentSampleExcel()}
            title="Download formatted Excel sample file with all columns"
          >
            {t('students.sampleExcel')}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => setIsImportOpen(true)}
          >
            {t('students.bulkImport')}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingStudent(null);
              setIsFormOpen(true);
            }}
          >
            {t('students.newAdmission')}
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <Card bodyClassName="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student name, admission no, roll no..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={e => {
              setSelectedClass(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none font-bold"
          >
            <option value="">All Classes (Nursery - 12)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* House Filter */}
          <select
            value={selectedHouse}
            onChange={e => {
              setSelectedHouse(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none font-bold"
          >
            <option value="">All Houses</option>
            {houses.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none font-bold"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Transferred">Transferred</option>
          </select>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 animate-in fade-in">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {selectedIds.length} students selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ArrowRightLeft}
                onClick={() => setIsPromoteModalOpen(true)}
              >
                Promote Selected
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Student Data Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-10 text-center">
                <button onClick={handleSelectAll} className="text-slate-400 hover:text-indigo-600">
                  {selectedIds.length === students.length && students.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3.5 px-4">{t('students.admissionNo')}</th>
              <th className="py-3.5 px-4">{t('students.name')}</th>
              <th className="py-3.5 px-4">{t('students.classSection')}</th>
              <th className="py-3.5 px-4">{t('students.rollNo')}</th>
              <th className="py-3.5 px-4">{t('students.gender')}</th>
              <th className="py-3.5 px-4">{t('students.bloodGroup')}</th>
              <th className="py-3.5 px-4">{t('students.contact')}</th>
              <th className="py-3.5 px-4">{t('common.status')}</th>
              <th className="py-3.5 px-4 text-right">{t('common.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan="10" className="py-12 text-center text-slate-400">
                  {t('common.loading')}
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-12 text-center text-slate-400">
                  {t('common.noRecords')}
                </td>
              </tr>
            ) : (
              students.map(s => {
                const isSelected = selectedIds.includes(s.id);
                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleToggleSelect(s.id)} className="text-slate-400 hover:text-indigo-600">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.admissionNo}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                          {s.firstName ? s.firstName[0] : 'S'}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{s.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{s.className} - {s.sectionName}</td>
                    <td className="py-3 px-4 font-mono">{s.rollNo || '-'}</td>
                    <td className="py-3 px-4">{s.gender}</td>
                    <td className="py-3 px-4">
                      <Badge variant="purple" size="xs">{s.bloodGroup || 'O+'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{s.phone}</td>
                    <td className="py-3 px-4">
                      <Badge variant={s.status === 'Active' ? 'success' : 'danger'} size="xs">
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View Profile"
                          onClick={() => setViewingStudentId(s.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Generate ID Card"
                          onClick={() => setIdCardStudentId(s.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Student"
                          onClick={() => {
                            setEditingStudent(s);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Student"
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer controls & Export */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExportData('csv')}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportData('excel')}>
              Export Excel
            </Button>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      </Card>

      {/* Admission Form Modal */}
      {isFormOpen && (
        <StudentFormModal
          isOpen={isFormOpen}
          initialData={editingStudent}
          onClose={() => {
            setIsFormOpen(false);
            setEditingStudent(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingStudent(null);
            loadStudents();
          }}
        />
      )}

      {/* Profile Modal */}
      {viewingStudentId && (
        <StudentProfileModal
          studentId={viewingStudentId}
          isOpen={!!viewingStudentId}
          onClose={() => setViewingStudentId(null)}
        />
      )}

      {/* ID Card Modal */}
      {idCardStudentId && (
        <StudentIdCardModal
          studentId={idCardStudentId}
          isOpen={!!idCardStudentId}
          onClose={() => setIdCardStudentId(null)}
        />
      )}

      {/* Bulk Excel Importer Modal */}
      {isImportOpen && (
        <StudentBulkImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={() => {
            setIsImportOpen(false);
            loadStudents();
          }}
        />
      )}

      {/* Bulk Promotion Modal */}
      {isPromoteModalOpen && (
        <Modal
          isOpen={isPromoteModalOpen}
          onClose={() => setIsPromoteModalOpen(false)}
          title="Promote Selected Students"
          subtitle={`Promoting ${selectedIds.length} students to the next academic grade`}
          footer={
            <>
              <Button variant="outline" onClick={() => setIsPromoteModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleBulkPromote}>Confirm Promotion</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Class *</label>
              <select
                value={promoteTargetClass}
                onChange={e => setPromoteTargetClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
              >
                <option value="">Select Target Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Section</label>
              <select
                value={promoteTargetSec}
                onChange={e => setPromoteTargetSec(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
              >
                <option value="SEC-01-A">Section A</option>
                <option value="SEC-01-B">Section B</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
