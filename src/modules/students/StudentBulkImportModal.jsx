import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Modal, Button, Badge } from '../../components/common/UIComponents';
import { excelService } from '../../database/services/excelService';

export function StudentBulkImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setLoading(true);

    try {
      const result = await excelService.parseStudentFile(selectedFile);
      setParsedData(result);
    } catch (err) {
      setError(err.message || 'Failed to parse Excel file. Please ensure it follows the sample structure.');
      setParsedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !parsedData.students?.length) return;

    setImporting(true);
    try {
      await excelService.importParsedStudents(parsedData.students);
      alert(`Successfully imported ${parsedData.students.length} students into the database!`);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to import students.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Student Excel Import"
      subtitle="Upload Excel (.xlsx) or CSV spreadsheet to add multiple students simultaneously"
      maxWidth="max-w-4xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={importing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!parsedData || !parsedData.students?.length || importing}
            loading={importing}
            onClick={handleImport}
          >
            Import {parsedData?.students?.length || 0} Students
          </Button>
        </>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Step 1: Download Template */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Download Sample Excel Template</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Pre-formatted template with standard columns (First Name, Last Name, Class, Parent Phone, etc.)
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => excelService.generateStudentSampleExcel()}
            className="bg-white dark:bg-slate-900 font-bold shrink-0"
          >
            Download Sample File (.xlsx)
          </Button>
        </div>

        {/* Step 2: Upload Area */}
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center transition-colors">
          <input
            type="file"
            id="excel-upload-input"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="excel-upload-input" className="cursor-pointer flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {file ? file.name : 'Click to select Excel or CSV file'}
            </p>
            <p className="text-slate-400 text-[11px] mt-1">Supports .xlsx, .xls, and .csv spreadsheet formats</p>
          </label>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview of Parsed Rows */}
        {parsedData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Previewing {parsedData.parsedCount} Valid Records (Ready to Save)
              </h4>
              {parsedData.errors?.length > 0 && (
                <Badge variant="warning">{parsedData.errors.length} Warnings</Badge>
              )}
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-56">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Gender</th>
                    <th className="p-2.5">Class</th>
                    <th className="p-2.5">Father</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Blood</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedData.students.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold">{st.firstName} {st.lastName}</td>
                      <td className="p-2.5">{st.gender}</td>
                      <td className="p-2.5 font-semibold text-indigo-600">{st.classId}</td>
                      <td className="p-2.5">{st.fatherName || '-'}</td>
                      <td className="p-2.5">{st.parentPhone || '-'}</td>
                      <td className="p-2.5"><Badge variant="purple" size="xs">{st.bloodGroup}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
