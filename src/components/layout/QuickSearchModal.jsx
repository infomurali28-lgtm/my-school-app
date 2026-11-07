import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, UserCheck, CircleDollarSign, Bell, ArrowRight } from 'lucide-react';
import db from '../../database/db';

export function QuickSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    students: [],
    teachers: [],
    fees: [],
    notices: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ students: [], teachers: [], fees: [], notices: [] });
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ students: [], teachers: [], fees: [], notices: [] });
      return;
    }

    const searchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.toLowerCase().trim();

        // 1. Search Students
        const allStudents = await db.students.toArray();
        const matchedStudents = allStudents.filter(s =>
          (s.fullName && s.fullName.toLowerCase().includes(q)) ||
          (s.admissionNo && s.admissionNo.toLowerCase().includes(q)) ||
          (s.phone && s.phone.includes(q))
        ).slice(0, 5);

        // 2. Search Teachers
        const allTeachers = await db.teachers.toArray();
        const matchedTeachers = allTeachers.filter(t =>
          (t.fullName && t.fullName.toLowerCase().includes(q)) ||
          (t.designation && t.designation.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q))
        ).slice(0, 4);

        // 3. Search Fees / Invoices
        const allInvoices = await db.feeInvoices.toArray();
        const matchedFees = allInvoices.filter(i =>
          i.invoiceNo.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q)
        ).slice(0, 4);

        // 4. Search Notices
        const allNotices = await db.notices.toArray();
        const matchedNotices = allNotices.filter(n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
        ).slice(0, 3);

        setResults({
          students: matchedStudents,
          teachers: matchedTeachers,
          fees: matchedFees,
          notices: matchedNotices
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(searchTimer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.students.length + results.teachers.length + results.fees.length + results.notices.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search students by name or admission no, teachers, fee invoices, notices..."
            autoFocus
            className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm"
          />
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && (
            <p className="text-xs text-center text-slate-400 py-6">Searching ERP database...</p>
          )}

          {!loading && query.trim() && totalResults === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}

          {!query.trim() && (
            <div className="text-center py-6 text-slate-400 text-xs">
              Type keywords to search instantly across Students, Faculty, Finance, and Notices.
            </div>
          )}

          {/* Students list */}
          {results.students.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Students ({results.students.length})
              </p>
              <div className="space-y-1">
                {results.students.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onNavigate('students', s.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{s.fullName}</p>
                      <p className="text-[11px] text-slate-400">{s.admissionNo} • Roll #{s.rollNo}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teachers list */}
          {results.teachers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Teachers ({results.teachers.length})
              </p>
              <div className="space-y-1">
                {results.teachers.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onNavigate('teachers', t.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.fullName}</p>
                      <p className="text-[11px] text-slate-400">{t.designation} • {t.email}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fees list */}
          {results.fees.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <CircleDollarSign className="w-3.5 h-3.5 text-amber-500" /> Invoices ({results.fees.length})
              </p>
              <div className="space-y-1">
                {results.fees.map(f => (
                  <div
                    key={f.id}
                    onClick={() => {
                      onNavigate('fees', f.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{f.invoiceNo} - {f.title}</p>
                      <p className="text-[11px] text-slate-400">Total: ₹{f.totalAmount} • Status: {f.status}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
