import db from '../db';
import { auditRepository } from './auditRepository';
import { generateId } from '../../utils/idGenerator';

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
