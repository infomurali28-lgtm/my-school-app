import React, { useState, useEffect } from 'react';
import { FileCheck, Plus, Printer, Award, Search } from 'lucide-react';
import db from '../../database/db';
import { certificateRepository } from '../../database/repositories/certificateRepository';
import { Card, Button, Badge, Modal } from '../../components/common/UIComponents';
import { formatDate } from '../../utils/formatters';

export function CertificateManager() {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Certificate Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [certType, setCertType] = useState('Transfer Certificate');
  const [reason, setReason] = useState('Parent Relocation / Completion of Studies');

  // Printable Certificate Modal
  const [viewCertificate, setViewCertificate] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, stuList] = await Promise.all([
        certificateRepository.getAll(),
        db.students.toArray()
      ]);
      setCertificates(list);
      setStudents(stuList);
      if (stuList.length > 0) setSelectedStudentId(stuList[0].id);
    } catch (err) {
      console.error('Error loading certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const studentObj = students.find(s => s.id === selectedStudentId);
    const newCert = await certificateRepository.generateCertificate({
      studentId: selectedStudentId,
      schoolId: 'SCH-00001',
      type: certType,
      reason: reason,
      templateData: {
        studentName: studentObj?.fullName,
        admissionNo: studentObj?.admissionNo,
        className: studentObj?.classId,
        dob: studentObj?.dob,
        fatherName: studentObj?.fatherName
      }
    });

    setIsModalOpen(false);
    loadData();
    setViewCertificate({
      ...newCert,
      studentName: studentObj?.fullName,
      admissionNo: studentObj?.admissionNo
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-7 h-7 text-indigo-600" />
            Certificates & Documentation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate and print official Transfer Certificates (TC), Study/Bonafide Certificates, and Character documents.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Issue Certificate
        </Button>
      </div>

      {/* List Card */}
      <Card title="Issued Campus Certificates" subtitle="Historical record of verified academic credentials">
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {certificates.length === 0 ? (
            <p className="py-8 text-center text-slate-400">No certificates generated yet.</p>
          ) : (
            certificates.map(cert => (
              <div key={cert.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{cert.studentName}</span>
                    <Badge variant="purple" size="xs">{cert.type}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cert No: <strong className="font-mono">{cert.certificateNo}</strong> • Issued: {formatDate(cert.issueDate)} • Reason: {cert.reason}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={() => setViewCertificate(cert)}
                >
                  Print
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Issue Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Issue Student Certificate"
          subtitle="Select student and certificate template"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleGenerate}>Generate Certificate</Button>
            </>
          }
        >
          <form onSubmit={handleGenerate} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Student *</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.admissionNo}) - {s.classId}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Certificate Type</label>
              <select
                value={certType}
                onChange={e => setCertType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="Transfer Certificate">Transfer Certificate (TC)</option>
                <option value="Study & Bonafide Certificate">Study & Bonafide Certificate</option>
                <option value="Character Certificate">Character & Conduct Certificate</option>
                <option value="Merit & Excellence Certificate">Merit & Academic Excellence Certificate</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason / Purpose</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Certificate Modal */}
      {viewCertificate && (
        <Modal
          isOpen={Boolean(viewCertificate)}
          onClose={() => setViewCertificate(null)}
          title="Official Certificate Document"
          subtitle="Signed official institutional credential"
          maxWidth="max-w-2xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setViewCertificate(null)}>Close</Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>Print Certificate</Button>
            </>
          }
        >
          <div className="p-8 bg-white text-slate-900 rounded-2xl border-4 border-double border-indigo-900 space-y-6 font-serif text-xs text-center relative">
            {/* School Header */}
            <div>
              <h1 className="text-2xl font-extrabold uppercase text-indigo-950 tracking-wider">The School Management ERP</h1>
              <p className="text-[11px] font-sans text-slate-500 font-semibold uppercase">Affiliation No: CBSE/AFF/2026/9921 • Jubilee Hills, Hyderabad</p>
              <div className="mt-4 inline-block px-4 py-1.5 border-b-2 border-indigo-900 text-base font-extrabold uppercase tracking-widest text-indigo-900">
                {viewCertificate.type}
              </div>
            </div>

            <div className="text-right text-[11px] font-sans text-slate-500">
              <p>Cert No: <strong className="font-mono text-slate-900">{viewCertificate.certificateNo}</strong></p>
              <p>Date of Issue: <strong>{formatDate(viewCertificate.issueDate)}</strong></p>
            </div>

            {/* Certificate Body Paragraph */}
            <div className="text-sm leading-relaxed text-slate-800 text-justify px-4">
              This is to certify that <strong>{viewCertificate.studentName || viewCertificate.templateData?.studentName}</strong>,
              bearing Admission Number <strong>{viewCertificate.admissionNo || viewCertificate.templateData?.admissionNo}</strong>,
              is / was a bonafide student of this institution. During the academic period in Grade <strong>{viewCertificate.templateData?.className || 'Grade 5'}</strong>,
              the student demonstrated exemplary conduct and commendable diligence.
              <br /><br />
              This certificate is granted upon formal request for: <strong>{viewCertificate.reason}</strong>.
            </div>

            {/* Seal and Signature */}
            <div className="flex justify-between pt-12 text-xs font-sans text-slate-700 px-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 mx-auto mb-2 flex items-center justify-center text-[10px] text-slate-400 uppercase font-bold">
                  Institutional Seal
                </div>
                <span>Verified by Registrar</span>
              </div>

              <div className="text-center self-end">
                <div className="font-script text-base text-indigo-900 mb-1 font-bold">Dr. Ramesh Sharma</div>
                <div className="border-t border-slate-400 pt-1 font-bold">Principal / Head of Institution</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
