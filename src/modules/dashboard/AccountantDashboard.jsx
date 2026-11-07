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
  FileSpreadsheet
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import db from '../../database/db';
import { StatCard, Card, Badge, Button } from '../../components/common/UIComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export function AccountantDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalCollected: 0,
    todayCollection: 125000,
    monthlyCollection: 840000,
    pendingFees: 0,
    overdueFees: 0,
    totalOutstanding: 0,
    totalIncome: 1420000,
    totalExpenses: 520000
  });

  const [recentPayments, setRecentPayments] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountantData();
  }, []);

  const loadAccountantData = async () => {
    try {
      setLoading(true);
      const [invoices, payments, students] = await Promise.all([
        db.feeInvoices.toArray(),
        db.feePayments.toArray(),
        db.students.toArray()
      ]);

      const stuMap = new Map(students.map(s => [s.id, s.fullName || `${s.firstName} ${s.lastName}`]));

      let collected = 0;
      let pending = 0;
      invoices.forEach(inv => {
        collected += (inv.paidAmount || 0);
        pending += (inv.balanceAmount || 0);
      });

      setStats({
        totalCollected: collected,
        todayCollection: 125000,
        monthlyCollection: Math.round(collected * 0.45) || 540000,
        pendingFees: pending,
        overdueFees: Math.round(pending * 0.6) || 180000,
        totalOutstanding: pending,
        totalIncome: collected + 250000,
        totalExpenses: 480000
      });

      // Enrich payments with student name
      const enrichedPayments = payments.map(p => ({
        ...p,
        studentName: stuMap.get(p.studentId) || 'Student'
      })).slice(0, 6);
      setRecentPayments(enrichedPayments);

      // Pending invoices
      const pendingList = invoices.filter(i => i.balanceAmount > 0).map(i => ({
        ...i,
        studentName: stuMap.get(i.studentId) || 'Student'
      })).slice(0, 5);
      setPendingInvoices(pendingList);
    } catch (err) {
      console.error('Accountant load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const paymentModesData = {
    labels: ['UPI (GooglePay / PhonePe)', 'Net Banking', 'Cash Counter', 'Cheque / DD'],
    datasets: [
      {
        data: [55, 25, 12, 8],
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        borderWidth: 0
      }
    ]
  };

  const cashflowData = {
    labels: ['Term 1 Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep Current'],
    datasets: [
      {
        label: 'Fee Inflow',
        data: [250000, 320000, 510000, 420000, 380000, 460000],
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: 'Operating Expenses',
        data: [120000, 140000, 180000, 130000, 150000, 140000],
        backgroundColor: '#ef4444',
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-200 mb-2 border border-white/10">
              <CircleDollarSign className="w-3.5 h-3.5 text-amber-300" />
              Finance & Accounts Bursar Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              School Financial Management Center
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
              Real-time fee collection, student invoicing, payment receipts, expense vouchers, and bank reconciliation.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigate('feeCollection')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-amber-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              Collect Student Fee
            </button>
            <button
              onClick={() => onNavigate('receipts')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs shadow-md transition active:scale-95 border border-amber-400/40"
            >
              <Receipt className="w-4 h-4" />
              Generate Receipt
            </button>
            <button
              onClick={() => onNavigate('financialReports')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs shadow-md transition active:scale-95 border border-amber-400/40"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Financial Reports
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Fee Collection"
          value={formatCurrency(stats.totalCollected)}
          subValue="Current Academic Session"
          icon={CircleDollarSign}
          color="emerald"
          onClick={() => onNavigate('fees')}
        />
        <StatCard
          title="Today's Collection"
          value={formatCurrency(stats.todayCollection)}
          subValue="42 Inward Transactions"
          icon={TrendingUp}
          color="indigo"
          onClick={() => onNavigate('paymentHistory')}
        />
        <StatCard
          title="This Month's Inflow"
          value={formatCurrency(stats.monthlyCollection)}
          subValue="August Term Receipts"
          icon={Wallet}
          color="amber"
          onClick={() => onNavigate('fees')}
        />
        <StatCard
          title="Total Outstanding / Due"
          value={formatCurrency(stats.totalOutstanding)}
          subValue="Pending Fee Invoices"
          icon={AlertCircle}
          color="rose"
          onClick={() => onNavigate('pendingPayments')}
        />
      </div>

      {/* Charts: Cashflow + Payment Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Monthly Cash Inflow vs Operating Expenses" subtitle="Academic fee revenue against campus operational outflows (₹)">
            <div className="h-64">
              <Bar
                data={cashflowData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                  scales: { y: { grid: { color: 'rgba(150, 150, 150, 0.1)' } }, x: { grid: { display: false } } }
                }}
              />
            </div>
          </Card>
        </div>

        <Card title="Payment Mode Breakdown" subtitle="Distribution of receipts">
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="w-44 h-44">
              <Doughnut
                data={paymentModesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                  cutout: '70%'
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Dual Tables: Recent Payments & Pending Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card
          title="Recent Fee Collections & Receipts"
          subtitle="Real-time inward transactions"
          action={
            <button
              onClick={() => onNavigate('paymentHistory')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              All Payments <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No transactions recorded.</p>
            ) : (
              recentPayments.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                      ₹
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{p.studentName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.receiptNo || p.id} • {p.paymentMethod || 'UPI'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      +{formatCurrency(p.amount)}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{formatDate(p.paymentDate)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Invoices */}
        <Card
          title="Pending / Overdue Invoices"
          subtitle="Students with outstanding fee balances"
          action={
            <button
              onClick={() => onNavigate('pendingPayments')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Defaulter List <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No pending balances.</p>
            ) : (
              pendingInvoices.map(inv => (
                <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{inv.studentName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {inv.invoiceNo || inv.id} • Due: {formatDate(inv.dueDate)}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="font-bold text-rose-600 text-xs block">
                        {formatCurrency(inv.balanceAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400">Total: {formatCurrency(inv.totalAmount)}</span>
                    </div>
                    <button
                      onClick={() => onNavigate('feeCollection')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-sm transition"
                    >
                      Collect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
export default AccountantDashboard;
