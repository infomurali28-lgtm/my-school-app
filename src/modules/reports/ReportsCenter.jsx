import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Search, Filter, FileSpreadsheet } from 'lucide-react';
import db from '../../database/db';
import { Card, Button, Badge } from '../../components/common/UIComponents';
import { exportToCSV, exportToExcel } from '../../utils/exportHelpers';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function ReportsCenter() {
  const [reportType, setReportType] = useState('students');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, [reportType]);

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'students') {
        const students = await db.students.toArray();
        const classes = await db.classes.toArray();
        const classMap = new Map(classes.map(c => [c.id, c.name]));
        setReportData(students.map(s => ({
          'Admission No': s.admissionNo,
          'Student Name': s.fullName,
          'Class': classMap.get(s.classId) || s.classId,
          'Gender': s.gender,
          'Phone': s.phone,
          'Blood Group': s.bloodGroup,
          'Status': s.status
        })));
      } else if (reportType === 'fees') {
        const invoices = await db.feeInvoices.toArray();
        const stuMap = new Map((await db.students.toArray()).map(s => [s.id, s.fullName]));
        setReportData(invoices.map(i => ({
          'Invoice No': i.invoiceNo,
          'Student': stuMap.get(i.studentId) || i.studentId,
          'Total Fee': i.totalAmount,
          'Paid Amount': i.paidAmount,
          'Balance Due': i.balanceAmount,
          'Due Date': i.dueDate,
          'Status': i.status
        })));
      } else if (reportType === 'accounting') {
        const income = await db.income.toArray();
        const expense = await db.expenses.toArray();
        const combined = [
          ...income.map(i => ({ ...i, type: 'Income' })),
          ...expense.map(e => ({ ...e, type: 'Expense' }))
        ];
        setReportData(combined.map(c => ({
          'Date': c.date,
          'Type': c.type,
          'Title': c.title,
          'Category': c.category,
          'Payment Mode': c.paymentMethod,
          'Amount': c.amount
        })));
      } else if (reportType === 'faculty') {
        const teachers = await db.teachers.toArray();
        setReportData(teachers.map(t => ({
          'Teacher ID': t.teacherNo,
          'Name': t.fullName,
          'Department': t.departmentId,
          'Designation': t.designation,
          'Qualification': t.qualification,
          'Phone': t.phone,
          'Salary': t.salary,
          'Status': t.status
        })));
      }
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    if (format === 'excel') {
      exportToExcel(reportData, 'Report', `${reportType}-report.xlsx`);
    } else {
      exportToCSV(reportData, `${reportType}-report.csv`);
    }
  };

  const headers = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Centralized Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate and export custom institutional audit reports for students, fees, vouchers, and faculty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" icon={Download} onClick={() => handleExport('excel')}>
            Export Excel
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
            Print View
          </Button>
        </div>
      </div>

      {/* Report Selector Card */}
      <Card bodyClassName="p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Select Report Category</label>
          <select
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
          >
            <option value="students">Student Enrollment Roster Report</option>
            <option value="fees">Fee Collections & Outstanding Dues Report</option>
            <option value="accounting">Campus Income & Expense Audit Report</option>
            <option value="faculty">Faculty & Staff Payroll Directory Report</option>
          </select>
        </div>
      </Card>

      {/* Report Results Table */}
      <Card
        title={`Report Summary — ${reportData.length} Records`}
        subtitle="Computed live from Supabase PostgreSQL repository"
        bodyClassName="p-0 overflow-x-auto"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              {headers.map(h => (
                <th key={h} className="py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={headers.length || 1} className="py-10 text-center text-slate-400">
                  Compiling report data...
                </td>
              </tr>
            ) : reportData.length === 0 ? (
              <tr>
                <td colSpan={headers.length || 1} className="py-10 text-center text-slate-400">
                  No records found for this report.
                </td>
              </tr>
            ) : (
              reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  {headers.map(h => (
                    <td key={h} className="py-2.5 px-4">
                      {typeof row[h] === 'number' && (h.includes('Fee') || h.includes('Amount') || h.includes('Salary') || h.includes('Due'))
                        ? formatCurrency(row[h])
                        : String(row[h] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
