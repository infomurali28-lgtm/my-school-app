import React, { useState } from 'react';
import { DatabaseBackup, Download, Upload, RefreshCw, Trash2, FileSpreadsheet, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { backupService } from '../../database/services/backupService';
import { excelService } from '../../database/services/excelService';
import { Card, Button, Modal } from '../../components/common/UIComponents';
import { StudentBulkImportModal } from '../students/StudentBulkImportModal';

export function BackupRestore() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleExportBackup = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await backupService.exportFullBackup();
      setSuccessMsg('Full JSON backup successfully exported and downloaded!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Backup failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm('Restoring this backup will replace current local database records. Continue?')) {
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await backupService.restoreFromBackup(file);
      setSuccessMsg(`Database restored successfully! (${res.restoredTables.length} tables loaded)`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setErrorMsg('Restore failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemoData = async () => {
    setLoading(true);
    setIsResetModalOpen(false);
    try {
      await backupService.resetToDemoData();
      alert('Demo data successfully re-seeded with 100+ students, 20+ faculty, attendance, fees, and exams!');
      window.location.reload();
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWipeData = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      alert('You must type DELETE to proceed.');
      return;
    }
    setLoading(true);
    setIsWipeModalOpen(false);
    try {
      await backupService.wipeAllData();
      alert('All local database records wiped.');
      window.location.reload();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <DatabaseBackup className="w-7 h-7 text-indigo-600" />
          Data Management, Backup & Excel Tools
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Perform full system database snapshots, load bulk Excel records, and restore local data.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <Card title="1. Full Database Backup" subtitle="Download complete Supabase PostgreSQL data as a portable JSON snapshot">
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Exports all 25+ stores (Students, Teachers, Attendance, Invoices, Receipts, Marks, Notices, Audit Logs) into a single timestamped JSON file.
            </p>
            <Button
              variant="primary"
              icon={Download}
              loading={loading}
              onClick={handleExportBackup}
              className="w-full font-bold"
            >
              Export & Download Full JSON Backup
            </Button>
          </div>
        </Card>

        {/* Restore Card */}
        <Card title="2. Restore from Backup JSON" subtitle="Import a previously saved backup file">
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Upload an ERP backup JSON file to restore all student directories, classes, examination marks, and invoices.
            </p>
            <div>
              <input
                type="file"
                id="restore-json-input"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
              <label
                htmlFor="restore-json-input"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 font-bold cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Select & Restore Backup File (.json)</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Excel Importer & Sample */}
        <Card title="3. Excel Bulk Data Operations" subtitle="Load hundreds of students and parents from spreadsheet">
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Download the official Excel template pre-formatted with student admission columns or upload your completed spreadsheet.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="outline"
                icon={Download}
                onClick={() => excelService.generateStudentSampleExcel()}
                className="flex-1 font-bold"
              >
                Download Sample Excel
              </Button>
              <Button
                variant="secondary"
                icon={Upload}
                onClick={() => setIsBulkImportOpen(true)}
                className="flex-1 font-bold"
              >
                Bulk Import Students
              </Button>
            </div>
          </div>
        </Card>

        {/* Re-seed / Reset Data */}
        <Card title="4. Maintenance & Demo Data" subtitle="Re-populate demo accounts or wipe local cache">
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Re-seed realistic sample data (100+ students, 20+ faculty, attendance registers, exam marks) or perform a factory wipe.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={() => setIsResetModalOpen(true)}
                className="flex-1 font-bold text-amber-600 hover:bg-amber-50"
              >
                Reset Demo Data
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => setIsWipeModalOpen(true)}
                className="flex-1 font-bold"
              >
                Delete All Data
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title="Reset to Realistic Demo Dataset?"
          subtitle="This will repopulate 100+ students, teachers, fees, and attendance."
          footer={
            <>
              <Button variant="outline" onClick={() => setIsResetModalOpen(false)}>Cancel</Button>
              <Button variant="warning" onClick={handleResetDemoData}>Yes, Reset Demo Data</Button>
            </>
          }
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
            This will reset Supabase PostgreSQL back to the default dataset with 100+ students, 20+ faculty, full attendance, and fee invoices.
          </div>
        </Modal>
      )}

      {/* Wipe Confirmation Modal */}
      {isWipeModalOpen && (
        <Modal
          isOpen={isWipeModalOpen}
          onClose={() => setIsWipeModalOpen(false)}
          title="CAUTION: Factory Reset Local Database"
          subtitle="This will permanently delete all locally stored records."
          footer={
            <>
              <Button variant="outline" onClick={() => setIsWipeModalOpen(false)}>Cancel</Button>
              <Button variant="danger" disabled={deleteConfirmationText !== 'DELETE'} onClick={handleWipeData}>
                Permanently Wipe Database
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-800 dark:text-rose-300 font-semibold leading-relaxed">
              WARNING: This action is irreversible. All local school data will be erased.
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-rose-600"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Excel Modal */}
      {isBulkImportOpen && (
        <StudentBulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          onSuccess={() => {
            setIsBulkImportOpen(false);
            setSuccessMsg('Bulk students imported successfully!');
          }}
        />
      )}
    </div>
  );
}
