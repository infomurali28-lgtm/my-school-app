import db from '../db';
import { auditRepository } from './auditRepository';
import { generateId } from '../../utils/idGenerator';

export const feeRepository = {
  async getInvoices({ studentId, classId, status, search, page = 1, limit = 20 } = {}) {
    let invoices = await db.feeInvoices.toArray();

    if (studentId) invoices = invoices.filter(i => i.studentId === studentId);
    if (classId) invoices = invoices.filter(i => i.classId === classId);
    if (status) invoices = invoices.filter(i => i.status === status);

    const students = await db.students.toArray();
    const classes = await db.classes.toArray();
    const stuMap = new Map(students.map(s => [s.id, s]));
    const clsMap = new Map(classes.map(c => [c.id, c.name]));

    const enriched = invoices.map(inv => {
      const student = stuMap.get(inv.studentId);
      return {
        ...inv,
        studentName: student ? student.fullName : inv.studentId,
        admissionNo: student ? student.admissionNo : '-',
        className: clsMap.get(inv.classId) || inv.classId
      };
    });

    if (search) {
      const q = search.toLowerCase().trim();
      const filtered = enriched.filter(i =>
        i.invoiceNo.toLowerCase().includes(q) ||
        i.studentName.toLowerCase().includes(q) ||
        i.admissionNo.toLowerCase().includes(q)
      );
      const total = filtered.length;
      return {
        data: filtered.slice((page - 1) * limit, page * limit),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1
      };
    }

    const total = enriched.length;
    return {
      data: enriched.slice((page - 1) * limit, page * limit),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  async getInvoiceById(id) {
    const inv = await db.feeInvoices.get(id);
    if (!inv) return null;
    const student = await db.students.get(inv.studentId);
    const cls = student ? await db.classes.get(student.classId) : null;
    const payments = await db.feePayments.where('invoiceId').equals(id).toArray();
    return {
      ...inv,
      student,
      className: cls ? cls.name : '-',
      payments
    };
  },

  async collectPayment({ invoiceId, amount, paymentMethod, transactionRef, remarks, collectedBy }) {
    const invoice = await db.feeInvoices.get(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const paymentAmount = Number(amount);
    const newPaidAmount = (invoice.paidAmount || 0) + paymentAmount;
    const newBalance = Math.max(0, invoice.totalAmount - newPaidAmount);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partial';

    // Update invoice
    await db.feeInvoices.update(invoiceId, {
      paidAmount: newPaidAmount,
      balanceAmount: newBalance,
      status: newStatus
    });

    // Create payment receipt
    const receiptNo = await generateId('REC-2025', 'feePayments', 'receiptNo');
    const payment = {
      id: `PAY-${Date.now().toString(36)}`,
      receiptNo,
      invoiceId,
      studentId: invoice.studentId,
      schoolId: invoice.schoolId || 'SCH-00001',
      amount: paymentAmount,
      paymentMethod,
      transactionRef: transactionRef || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentDate: new Date().toISOString().split('T')[0],
      collectedBy: collectedBy || 'Accounts Desk',
      remarks: remarks || 'Fee payment received'
    };

    await db.feePayments.add(payment);
    await auditRepository.log('COLLECT_FEE', 'Fees', invoiceId, `Collected ${paymentAmount} via ${paymentMethod} (Receipt: ${receiptNo})`);

    return { invoice, payment };
  },

  async getFeeStats() {
    const invoices = await db.feeInvoices.toArray();
    const payments = await db.feePayments.toArray();

    let totalBilled = 0;
    let totalCollected = 0;
    let totalPending = 0;

    invoices.forEach(inv => {
      totalBilled += (inv.totalAmount || 0);
      totalCollected += (inv.paidAmount || 0);
      totalPending += (inv.balanceAmount || 0);
    });

    return {
      totalBilled,
      totalCollected,
      totalPending,
      totalInvoices: invoices.length,
      paidCount: invoices.filter(i => i.status === 'Paid').length,
      unpaidCount: invoices.filter(i => i.status === 'Unpaid').length,
      partialCount: invoices.filter(i => i.status === 'Partial').length
    };
  }
};

export const accountingRepository = {
  async getSummary() {
    const incomeList = await db.income.toArray();
    const expenseList = await db.expenses.toArray();
    const feePayments = await db.feePayments.toArray();

    const feeTotal = feePayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const otherIncome = incomeList.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalIncome = feeTotal + otherIncome;
    const totalExpense = expenseList.reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProfit = totalIncome - totalExpense;

    return {
      feeRevenue: feeTotal,
      otherIncome,
      totalIncome,
      totalExpense,
      netProfit,
      incomeList,
      expenseList
    };
  },

  async addIncome(data) {
    const id = data.id || await generateId('INC', 'income');
    const item = { ...data, id, date: data.date || new Date().toISOString().split('T')[0] };
    await db.income.add(item);
    await auditRepository.log('ADD_INCOME', 'Accounting', id, `Recorded income: ${item.title} (${item.amount})`);
    return item;
  },

  async addExpense(data) {
    const id = data.id || await generateId('EXP', 'expenses');
    const item = { ...data, id, date: data.date || new Date().toISOString().split('T')[0] };
    await db.expenses.add(item);
    await auditRepository.log('ADD_EXPENSE', 'Accounting', id, `Recorded expense: ${item.title} (${item.amount})`);
    return item;
  }
};
