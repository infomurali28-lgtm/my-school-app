import React, { useState, useEffect } from 'react';
import { Receipt, Plus, ArrowDownRight, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';
import { accountingRepository } from '../../database/repositories/accountingRepository';
import { Card, Button, Badge, Modal, StatCard } from '../../components/common/UIComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function AccountingManager() {
  const [summary, setSummary] = useState({
    feeRevenue: 0,
    otherIncome: 0,
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    incomeList: [],
    expenseList: []
  });
  const [activeTab, setActiveTab] = useState('expenses');

  // New Voucher Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherType, setVoucherType] = useState('Expense');
  const [formData, setFormData] = useState({
    title: '',
    category: 'Utilities & IT',
    amount: '',
    paymentMethod: 'Bank Transfer',
    referenceNo: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await accountingRepository.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error loading accounting summary:', err);
    }
  };

  const handleOpenAdd = (type) => {
    setVoucherType(type);
    setFormData({
      title: '',
      category: type === 'Income' ? 'Donation / Grant' : 'Facility Maintenance',
      amount: '',
      paymentMethod: 'Bank Transfer',
      referenceNo: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;

    if (voucherType === 'Income') {
      await accountingRepository.addIncome({ ...formData, amount: Number(formData.amount) });
    } else {
      await accountingRepository.addExpense({ ...formData, amount: Number(formData.amount) });
    }

    setIsModalOpen(false);
    loadSummary();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-indigo-600" />
            Accounting & Financial Vouchers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track operational campus income, expense vouchers, cash transactions, and net cash balance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={ArrowUpRight} onClick={() => handleOpenAdd('Income')}>
            Record Income
          </Button>
          <Button variant="primary" size="sm" icon={ArrowDownRight} onClick={() => handleOpenAdd('Expense')}>
            Record Expense
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Combined Inflow"
          value={formatCurrency(summary.totalIncome)}
          subtitle="Fees + Auxiliary campus revenue"
          icon={ArrowUpRight}
          color="emerald"
        />
        <StatCard
          title="Total Outflow (Expenses)"
          value={formatCurrency(summary.totalExpense)}
          subtitle="Maintenance, supplies & utilities"
          icon={ArrowDownRight}
          color="rose"
        />
        <StatCard
          title="Net Operating Surplus"
          value={formatCurrency(summary.netProfit)}
          subtitle="Revenue minus operational expenses"
          icon={Receipt}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-colors ${
            activeTab === 'expenses'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Expense Vouchers ({summary.expenseList.length})
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-colors ${
            activeTab === 'income'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Auxiliary Incomes ({summary.incomeList.length})
        </button>
      </div>

      {/* List Card */}
      <Card bodyClassName="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Voucher Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4">Reference No</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(activeTab === 'expenses' ? summary.expenseList : summary.incomeList).map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 text-slate-500">{formatDate(item.date)}</td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.title}</td>
                <td className="py-3 px-4">
                  <Badge variant="purple" size="xs">{item.category}</Badge>
                </td>
                <td className="py-3 px-4">{item.paymentMethod}</td>
                <td className="py-3 px-4 font-mono text-slate-400">{item.referenceNo || '-'}</td>
                <td className={`py-3 px-4 text-right font-extrabold ${activeTab === 'expenses' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {activeTab === 'expenses' ? '-' : '+'}{formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Voucher Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Record ${voucherType} Voucher`}
          subtitle="Add financial voucher entry"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant={voucherType === 'Income' ? 'success' : 'danger'} onClick={handleSubmit}>
                Save {voucherType}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Voucher Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Science Lab Supplies"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="25000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reference / Bill No</label>
              <input
                type="text"
                value={formData.referenceNo}
                onChange={e => setFormData({ ...formData, referenceNo: e.target.value })}
                placeholder="INV-9921"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
