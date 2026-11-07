import React, { useState, useEffect } from 'react';
import { Printer, GraduationCap } from 'lucide-react';
import { studentRepository } from '../../database/repositories/studentRepository';
import { Modal, Button } from '../../components/common/UIComponents';
import { formatDate } from '../../utils/formatters';

export function StudentIdCardModal({ studentId, isOpen, onClose }) {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (studentId) {
      studentRepository.getById(studentId).then(setStudent);
    }
  }, [studentId]);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Identity Card"
      subtitle="Official student campus credential"
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="primary" icon={Printer} onClick={handlePrint}>Print ID Card</Button>
        </>
      }
    >
      <div className="flex justify-center p-2">
        {/* Printable Card */}
        <div id="student-id-card" className="w-80 bg-white rounded-3xl shadow-xl border-2 border-indigo-600 overflow-hidden text-slate-900 font-sans relative">
          {/* Top Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-extrabold text-sm tracking-tight uppercase">The School</h3>
            </div>
            <p className="text-[9px] uppercase tracking-wider text-indigo-200">Inspiring Excellence • Academic 2025-26</p>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col items-center text-center space-y-3">
            {/* Photo */}
            <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-indigo-600 shadow-sm overflow-hidden flex items-center justify-center">
              {student.photo ? (
                <img src={student.photo} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-indigo-700">{student.firstName ? student.firstName[0] : 'S'}</span>
              )}
            </div>

            {/* Name & Class */}
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{student.fullName}</h2>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-0.5">
                Class {student.className} • Section {student.sectionName}
              </p>
            </div>

            {/* Details Table */}
            <div className="w-full bg-slate-50 rounded-xl p-3 text-[11px] space-y-1 text-left border border-slate-200/60">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Adm No:</span>
                <span className="font-bold font-mono">{student.admissionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Roll No:</span>
                <span className="font-bold font-mono">{student.rollNo || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Father Name:</span>
                <span className="font-bold truncate max-w-[120px]">{student.parent?.fatherName || student.fatherName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Blood Group:</span>
                <span className="font-bold text-rose-600">{student.bloodGroup || 'O+'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Emergency Phone:</span>
                <span className="font-bold">{student.phone}</span>
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="pt-2 w-full flex flex-col items-center">
              <div className="h-7 w-48 bg-slate-900 rounded-sm flex items-center justify-around px-2">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className={`h-5 bg-white ${i % 3 === 0 ? 'w-1' : (i % 2 === 0 ? 'w-0.5' : 'w-1.5')}`} />
                ))}
              </div>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 mt-0.5">{student.admissionNo}</span>
            </div>
          </div>

          {/* Footer Ribbon */}
          <div className="bg-indigo-50 border-t border-indigo-100 px-4 py-2 flex justify-between items-center text-[9px] font-semibold text-slate-500">
            <span>Valid till Apr 2026</span>
            <span className="text-indigo-600 font-bold">Principal Signature ✓</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
