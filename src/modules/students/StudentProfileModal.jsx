import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Award, Clock } from 'lucide-react';
import { studentRepository } from '../../database/repositories/studentRepository';
import { Modal, Badge, Button } from '../../components/common/UIComponents';
import { formatDate, formatCurrency } from '../../utils/formatters';

export function StudentProfileModal({ studentId, isOpen, onClose }) {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      loadProfile();
    }
  }, [studentId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await studentRepository.getById(studentId);
      setStudent(data);
    } catch (err) {
      console.error('Error loading student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.fullName} — Profile View`}
      subtitle={`Admission No: ${student.admissionNo} • ${student.className} (${student.sectionName})`}
      maxWidth="max-w-3xl"
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-6 text-xs">
        {/* Profile Card Header */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xl overflow-hidden shadow-sm shrink-0">
            {student.photo ? (
              <img src={student.photo} alt={student.fullName} className="w-full h-full object-cover" />
            ) : (
              student.firstName ? student.firstName[0] : 'S'
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{student.fullName}</h3>
              <Badge variant={student.status === 'Active' ? 'success' : 'danger'} size="xs">{student.status}</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Roll No: <strong>{student.rollNo || '-'}</strong> • House: <strong>{student.houseName}</strong> • Blood Group: <strong>{student.bloodGroup}</strong>
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition-colors ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Personal & Parents
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition-colors ${activeTab === 'fees' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Fee Ledger ({student.invoices?.length || 0})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-indigo-600">Student Info</h4>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p><strong>DOB:</strong> {formatDate(student.dob)}</p>
                  <p><strong>Gender:</strong> {student.gender}</p>
                  <p><strong>Category:</strong> {student.category || 'General'}</p>
                  <p><strong>Mother Tongue:</strong> {student.motherTongue || 'English'}</p>
                  <p><strong>Admission Date:</strong> {formatDate(student.admissionDate)}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-indigo-600">Parent / Guardian</h4>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p><strong>Father:</strong> {student.parent?.fatherName || student.fatherName || '-'}</p>
                  <p><strong>Mother:</strong> {student.parent?.motherName || student.motherName || '-'}</p>
                  <p><strong>Occupation:</strong> {student.parent?.fatherOccupation || '-'}</p>
                  <p><strong>Phone:</strong> {student.parent?.phone || student.phone || '-'}</p>
                  <p><strong>Address:</strong> {student.address || student.parent?.address || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Fees */}
        {activeTab === 'fees' && (
          <div className="space-y-3">
            {(!student.invoices || student.invoices.length === 0) ? (
              <p className="py-6 text-center text-slate-400">No invoices issued for this student.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
                {student.invoices.map(inv => (
                  <div key={inv.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{inv.title}</p>
                      <p className="text-[11px] text-slate-400">{inv.invoiceNo} • Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(inv.totalAmount)}</p>
                      <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'} size="xs">{inv.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
