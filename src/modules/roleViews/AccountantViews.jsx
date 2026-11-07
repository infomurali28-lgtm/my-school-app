import React, { useState, useEffect } from 'react';
import {
  CircleDollarSign,
  Receipt,
  Wallet,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Search,
  Filter
} from 'lucide-react';
import db from '../../database/db';
import { Card, Badge, Button, Modal } from '../../components/common/UIComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';

// 1. Fee Structures View
export function FeeStructuresView() {
  const structures = [
    { grade: 'Nursery - UKG', tuition: 25000, term: 5000, lab: 2000, total: 32000 },
    { grade: 'Grade 1 - 5', tuition: 35000, term: 6000, lab: 4000, total: 45000 },
    { grade: 'Grade 6 - 8', tuition: 42000, term: 8000, lab: 6000, total: 56000 },
    { grade: 'Grade 9 - 10', tuition: 50000, term: 10000, lab: 8000, total: 68000 },
    { grade: 'Grade 11 - 12 (Science / Commerce)', tuition: 65000, term: 12000, lab: 12000, total: 89000 }
  ];

  return (
    <Card title="Approved Institutional Fee Structures" subtitle="Annual fee schedule configured by School Board">
      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
              <th className="py-3 px-4">Class / Grade</th>
              <th className="py-3 px-4">Tuition Fee</th>
              <th className="py-3 px-4">Term & Library</th>
              <th className="py-3 px-4">Lab & Digital</th>
              <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Total Annual Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {structures.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{s.grade}</td>
                <td className="py-3.5 px-4">{formatCurrency(s.tuition)}</td>
                <td className="py-3.5 px-4">{formatCurrency(s.term)}</td>
                <td className="py-3.5 px-4">{formatCurrency(s.lab)}</td>
                <td className="py-3.5 px-4 font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(s.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// 2. Fee Collection View
export function FeeCollectionView() {
  const [studentId, setStudentId] = useState('STU-00001');
  const [student, setStudent] = useState(null);
  const [amount, setAmount] = useState('16000');
  const [method, setMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    db.students.toArray().then(all => {
      setStudent(all[0] || { fullName: 'Vihaan Iyer', admissionNo: 'ADM-2025-00001', classId: 'Grade 1' });
    });
  }, []);

  const handleCollect = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card title="Fee Collection Desk" subtitle="Record fee receipts and issue official vouchers">
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
            Payment recorded successfully! Receipt #REC-2026-9921 generated.
          </div>
        )}

        <form onSubmit={handleCollect} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">Student</label>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-900 dark:text-white">{student?.fullName} ({student?.admissionNo})</p>
              <p className="text-[11px] text-slate-400">Class: {student?.classId} • Balance Due: <span className="font-bold text-rose-600">₹16,000</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Payment Method *</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none font-bold"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash at Counter</option>
                <option value="NetBanking">Net Banking / NEFT</option>
                <option value="Cheque">Cheque / Demand Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Transaction Ref / Cheque No.</label>
            <input
              type="text"
              placeholder="e.g. UPI-921820129"
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition"
          >
            Confirm & Print Receipt
          </button>
        </form>
      </Card>
    </div>
  );
}

// 3. Payment History View
export function PaymentHistoryView() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    db.feePayments.toArray().then(p => {
      setPayments(p.slice(0, 15));
    });
  }, []);

  return (
    <Card title="Fee Payment Ledger" subtitle="Complete record of all fee receipts">
      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
              <th className="py-3 px-4">Receipt No</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{p.receiptNo || p.id}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(p.paymentDate)}</td>
                <td className="py-3 px-4 font-mono">{p.studentId}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                    {p.paymentMethod || 'UPI'}
                  </span>
                </td>
                <td className="py-3 px-4 font-extrabold text-emerald-600">{formatCurrency(p.amount)}</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-amber-600 font-bold hover:underline flex items-center gap-1 ml-auto">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// 4. Pending Payments View
export function PendingPaymentsView() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    db.feeInvoices.toArray().then(inv => {
      setInvoices(inv.filter(i => (i.balanceAmount || 0) > 0));
    });
  }, []);

  return (
    <Card title="Pending & Overdue Fee Invoices" subtitle="Students with outstanding fee balances">
      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
              <th className="py-3 px-4">Invoice No</th>
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Total Fee</th>
              <th className="py-3 px-4">Balance Due</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNo || inv.id}</td>
                <td className="py-3 px-4 font-mono">{inv.studentId}</td>
                <td className="py-3 px-4">{inv.classId || 'Grade 1'}</td>
                <td className="py-3 px-4 text-rose-500 font-bold">{formatDate(inv.dueDate)}</td>
                <td className="py-3 px-4">{formatCurrency(inv.totalAmount)}</td>
                <td className="py-3 px-4 font-extrabold text-rose-600">{formatCurrency(inv.balanceAmount)}</td>
                <td className="py-3 px-4 text-right">
                  <button className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px]">
                    Collect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// 5. Receipts View
export function ReceiptsView() {
  return (
    <Card title="Printable Fee Receipts" subtitle="Generate instant duplicate receipts for auditing and tax exemption">
      <div className="p-8 text-center space-y-3">
        <Printer className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="font-extrabold text-sm">Receipt Generator & Dispatch Center</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">Select any student payment above to generate an official 80G tax compliant fee voucher with digital school seal.</p>
      </div>
    </Card>
  );
}

// 6. Financial Reports View
export function FinancialReportsView() {
  return (
    <Card title="Financial Analytics & Revenue Summary" subtitle="Term-wise collections, bank reconciliations and expense audits">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-400">Total Billed Fees</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">₹48,50,000</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-emerald-600">Total Realized Revenue</p>
          <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">₹39,20,000</p>
        </div>
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
          <p className="text-xs text-rose-600">Pending Receivables</p>
          <p className="text-lg font-extrabold text-rose-700 dark:text-rose-300 mt-1">₹9,30,000</p>
        </div>
      </div>
    </Card>
  );
}
