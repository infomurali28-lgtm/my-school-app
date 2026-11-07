import React, { useState, useEffect } from 'react';
import { CircleDollarSign, Search, Receipt, Printer, Download, FileSpreadsheet, Filter } from 'lucide-react';
import db from '../../database/db';
import { feeRepository } from '../../database/repositories/feeRepository';
import { Card, Button, Badge, Modal, StatCard, Pagination } from '../../components/common/UIComponents';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '../../utils/formatters';
import { exportToCSV, exportToExcel } from '../../utils/exportHelpers';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export function FeeManager() {
  const { activeAcademicYear, t } = useThemeLanguage();
  const [invoices, setInvoices] = useState([]);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({ totalBilled: 0, totalCollected: 0, totalPending: 0 });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(activeAcademicYear || 'AY-2025-2026');
  const [search, setSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);

  // Collect Payment Modal
  const [collectingInvoice, setCollectingInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [collectingLoading, setCollectingLoading] = useState(false);

  // Printable Receipt Modal
  const [printedReceipt, setPrintedReceipt] = useState(null);

  useEffect(() => {
    db.classes.orderBy('numericGrade').toArray().then(setClasses);
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, classFilter, yearFilter, search, page]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      let allInvoices = await db.feeInvoices.toArray();
      const students = await db.students.toArray();
      const clsList = await db.classes.toArray();
      const stuMap = new Map(students.map(s => [s.id, s]));
      const clsMap = new Map(clsList.map(c => [c.id, c.name]));

      // Enrich invoices
      let enriched = allInvoices.map(inv => {
        const student = stuMap.get(inv.studentId);
        return {
          ...inv,
          studentName: student ? student.fullName : inv.studentId,
          admissionNo: student ? student.admissionNo : '-',
          className: clsMap.get(inv.classId) || inv.classId
        };
      });

      // Filter by Academic Year
      if (yearFilter) {
        enriched = enriched.filter(i => !i.academicYearId || i.academicYearId === yearFilter);
      }

      // Filter by Status
      if (statusFilter) {
        enriched = enriched.filter(i => i.status === statusFilter);
      }

      // Filter by Class
      if (classFilter) {
        enriched = enriched.filter(i => i.classId === classFilter);
      }

      // Filter by Search Query
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        enriched = enriched.filter(i =>
          (i.invoiceNo && i.invoiceNo.toLowerCase().includes(q)) ||
          (i.studentName && i.studentName.toLowerCase().includes(q)) ||
          (i.admissionNo && i.admissionNo.toLowerCase().includes(q)) ||
          (i.title && i.title.toLowerCase().includes(q))
        );
      }

      // Calculate Stats for filtered list
      let billed = 0;
      let collected = 0;
      let pending = 0;
      enriched.forEach(inv => {
        billed += (inv.totalAmount || 0);
        collected += (inv.paidAmount || 0);
        pending += (inv.balanceAmount || 0);
      });
      setStats({ totalBilled: billed, totalCollected: collected, totalPending: pending, totalInvoices: enriched.length });

      // Paginate
      const total = enriched.length;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / limit) || 1);
      const startIndex = (page - 1) * limit;
      setInvoices(enriched.slice(startIndex, startIndex + limit));
    } catch (err) {
      console.error('Error loading fee invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCollect = (inv) => {
    setCollectingInvoice(inv);
    setPaymentAmount(inv.balanceAmount || inv.totalAmount);
    setPaymentMethod('UPI');
    setPaymentRemarks('Academic term installment received with thanks');
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;

    setCollectingLoading(true);
    try {
      const result = await feeRepository.collectPayment({
        invoiceId: collectingInvoice.id,
        amount: Number(paymentAmount),
        paymentMethod,
        remarks: paymentRemarks,
        collectedBy: 'Accounts Desk'
      });

      setCollectingInvoice(null);
      setPrintedReceipt({
        ...result.payment,
        invoice: result.invoice,
        studentName: collectingInvoice.studentName,
        admissionNo: collectingInvoice.admissionNo,
        className: collectingInvoice.className
      });
      loadInvoices();
    } catch (err) {
      alert('Payment collection failed: ' + err.message);
    } finally {
      setCollectingLoading(false);
    }
  };

  // Export Filtered Table Data in Excel / CSV
  const handleExportFiltered = async (format) => {
    // Get full filtered dataset (not just paginated slice)
    let allInvoices = await db.feeInvoices.toArray();
    const students = await db.students.toArray();
    const clsList = await db.classes.toArray();
    const stuMap = new Map(students.map(s => [s.id, s]));
    const clsMap = new Map(clsList.map(c => [c.id, c.name]));

    let filtered = allInvoices.map(inv => {
      const student = stuMap.get(inv.studentId);
      return {
        'Invoice No': inv.invoiceNo,
        'Student Name': student ? student.fullName : inv.studentId,
        'Admission No': student ? student.admissionNo : '-',
        'Class': clsMap.get(inv.classId) || inv.classId,
        'Academic Session': inv.academicYearId || '2025-2026',
        'Fee Description': inv.title,
        'Total Fee (₹)': inv.totalAmount,
        'Paid Amount (₹)': inv.paidAmount,
        'Balance Due (₹)': inv.balanceAmount,
        'Due Date': inv.dueDate,
        'Payment Status': inv.status
      };
    });

    if (yearFilter) filtered = filtered.filter(i => i['Academic Session'] === yearFilter);
    if (statusFilter) filtered = filtered.filter(i => i['Payment Status'] === statusFilter);

    const filename = `fee-report-${statusFilter || 'all'}-${new Date().toISOString().split('T')[0]}`;
    if (format === 'excel') {
      exportToExcel(filtered, 'Fee_Report', `${filename}.xlsx`);
    } else {
      exportToCSV(filtered, `${filename}.csv`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CircleDollarSign className="w-7 h-7 text-indigo-600" />
            {t('fees.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('fees.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => handleExportFiltered('excel')}
            title="Download Excel spreadsheet matching current filters"
          >
            {t('fees.exportFilteredExcel')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={() => handleExportFiltered('csv')}
            title="Download CSV spreadsheet matching current filters"
          >
            {t('fees.exportFilteredCSV')}
          </Button>
        </div>
      </div>

      {/* KPI Cards in Rupees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={t('fees.totalBilled')}
          value={formatCurrency(stats.totalBilled)}
          subtitle={`${stats.totalInvoices || 0} active invoices`}
          icon={CircleDollarSign}
          color="indigo"
        />
        <StatCard
          title={t('fees.totalCollected')}
          value={formatCurrency(stats.totalCollected)}
          subtitle="Collected through UPI, Cash & Bank"
          icon={Receipt}
          color="emerald"
        />
        <StatCard
          title={t('fees.totalPending')}
          value={formatCurrency(stats.totalPending)}
          subtitle="Remaining outstanding balance"
          icon={CircleDollarSign}
          color="amber"
        />
      </div>

      {/* Advanced Filter Toolbar */}
      <Card bodyClassName="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search student, adm no, invoice..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="">All Payment Statuses (All)</option>
            <option value="Paid">✓ Paid (Full Settlement)</option>
            <option value="Partial">⏳ Partial (Partially Paid)</option>
            <option value="Unpaid">✗ Unpaid (Pending)</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={e => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="">All Classes (Nursery - 12)</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Academic Session Filter */}
          <select
            value={yearFilter}
            onChange={e => {
              setYearFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="AY-2025-2026">Session 2025 - 2026 (Current)</option>
            <option value="AY-2024-2025">Session 2024 - 2025</option>
          </select>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">{t('fees.invoiceNo')}</th>
              <th className="py-3 px-4">{t('fees.student')}</th>
              <th className="py-3 px-4">{t('fees.class')}</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">{t('fees.totalFee')}</th>
              <th className="py-3 px-4">{t('fees.paidAmount')}</th>
              <th className="py-3 px-4">{t('fees.balanceDue')}</th>
              <th className="py-3 px-4">{t('fees.status')}</th>
              <th className="py-3 px-4 text-right">{t('fees.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="9" className="py-10 text-center text-slate-400">Loading fee records...</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-10 text-center text-slate-400">No invoices matching the selected filter criteria.</td>
              </tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 font-medium">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.invoiceNo}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{inv.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{inv.admissionNo}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold">{inv.className}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">{inv.title}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{formatCurrency(inv.totalAmount)}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                  <td className="py-3 px-4 font-bold text-rose-600">{formatCurrency(inv.balanceAmount || inv.totalAmount - inv.paidAmount)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={inv.status === 'Paid' ? 'success' : (inv.status === 'Partial' ? 'warning' : 'danger')} size="xs">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {inv.status !== 'Paid' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Receipt}
                        onClick={() => handleOpenCollect(inv)}
                      >
                        {t('fees.collect')}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Printer}
                        onClick={() => setPrintedReceipt({
                          receiptNo: `REC-2025-${inv.invoiceNo.slice(-4)}`,
                          amount: inv.paidAmount,
                          paymentMethod: 'UPI',
                          paymentDate: new Date().toISOString().split('T')[0],
                          studentName: inv.studentName,
                          admissionNo: inv.admissionNo,
                          className: inv.className,
                          invoice: inv
                        })}
                      >
                        {t('fees.receipt')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      </Card>

      {/* Collect Fee Modal */}
      {collectingInvoice && (
        <Modal
          isOpen={Boolean(collectingInvoice)}
          onClose={() => setCollectingInvoice(null)}
          title="Collect Student Fee Payment"
          subtitle={`Student: ${collectingInvoice.studentName} (${collectingInvoice.admissionNo})`}
          footer={
            <>
              <Button variant="outline" onClick={() => setCollectingInvoice(null)} disabled={collectingLoading}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleConfirmPayment} loading={collectingLoading}>
                Receive Payment & Generate Receipt
              </Button>
            </>
          }
        >
          <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between font-bold">
                <span>Total Due for {collectingInvoice.invoiceNo}:</span>
                <span className="text-rose-600 font-extrabold">{formatCurrency(collectingInvoice.balanceAmount || collectingInvoice.totalAmount)}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Paying Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                max={collectingInvoice.balanceAmount || collectingInvoice.totalAmount}
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-extrabold text-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
              >
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Receipt Remarks</label>
              <input
                type="text"
                value={paymentRemarks}
                onChange={e => setPaymentRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Official Receipt Modal */}
      {printedReceipt && (
        <Modal
          isOpen={Boolean(printedReceipt)}
          onClose={() => setPrintedReceipt(null)}
          title="Official Fee Payment Receipt"
          subtitle="Signed acknowledgment receipt"
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" onClick={() => setPrintedReceipt(null)}>Close</Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>Print Receipt</Button>
            </>
          }
        >
          <div className="p-6 bg-white text-slate-900 rounded-2xl border-2 border-indigo-600 space-y-4 font-sans text-xs">
            <div className="text-center pb-3 border-b border-slate-200">
              <h2 className="text-base font-extrabold uppercase text-indigo-900">The School</h2>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Jubilee Hills, Hyderabad • Official Fee Receipt</p>
              <p className="text-xs font-bold font-mono text-indigo-600 mt-1">Receipt No: {printedReceipt.receiptNo}</p>
            </div>

            <div className="space-y-1.5 text-[11px] bg-slate-50 p-3 rounded-xl border">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold">{printedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admission No:</span>
                <span className="font-bold font-mono">{printedReceipt.admissionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class:</span>
                <span className="font-bold">{printedReceipt.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-bold">{formatDate(printedReceipt.paymentDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-indigo-600">{printedReceipt.paymentMethod}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between font-bold">
              <span className="text-emerald-900">Total Amount Received:</span>
              <span className="text-base text-emerald-700">{formatCurrency(printedReceipt.amount)}</span>
            </div>

            <div className="flex justify-between pt-6 text-[10px] text-slate-500 font-semibold">
              <span>Cashier / Bursar Seal ✓</span>
              <span>Parent / Guardian Copy</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
