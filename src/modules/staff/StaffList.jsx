import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, DollarSign, Trash2, Edit2, FileText, CheckCircle2 } from 'lucide-react';
import db from '../../database/db';
import { staffRepository } from '../../database/repositories/staffRepository';
import { Card, Button, Badge, Modal } from '../../components/common/UIComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function StaffList() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Payslip Modal
  const [viewPayslipStaff, setViewPayslipStaff] = useState(null);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    email: '',
    phone: '',
    departmentId: 'DEP-005',
    designation: 'Staff',
    qualification: '',
    salary: 35000,
    joiningDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadStaff();
  }, [selectedDept, search]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const [list, depts] = await Promise.all([
        staffRepository.getAll({ departmentId: selectedDept, search }),
        db.departments.toArray()
      ]);
      setStaff(list);
      setDepartments(depts);
    } catch (err) {
      console.error('Error loading staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Male',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || 'DEP-005',
      designation: 'Officer / Staff',
      qualification: '',
      salary: 38000,
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this staff record?')) {
      await staffRepository.delete(id);
      loadStaff();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) return;

    if (editingStaff) {
      await staffRepository.update(editingStaff.id, formData);
    } else {
      await staffRepository.create(formData);
    }
    setIsModalOpen(false);
    loadStaff();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-rose-600" />
            Staff & HR Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage administrative officers, accountants, HR, security, and monthly payroll slips.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Add Staff Member
        </Button>
      </div>

      {/* Filter */}
      <Card bodyClassName="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff by name, designation..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
          />
        </div>

        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </Card>

      {/* Grid of Staff */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {staff.map(s => (
          <div key={s.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 font-extrabold flex items-center justify-center text-base shrink-0 border border-rose-100 dark:border-rose-900/40">
                  {s.firstName ? s.firstName[0] : 'S'}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{s.fullName}</h3>
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">{s.designation}</p>
                  <Badge variant="purple" size="xs" className="mt-1">{s.departmentName}</Badge>
                </div>
              </div>

              <button
                onClick={() => handleDelete(s.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{s.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{s.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Joined: {formatDate(s.joiningDate)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Salary: {formatCurrency(s.salary || 35000)}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={FileText}
                onClick={() => setViewPayslipStaff(s)}
              >
                Payslip
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Staff Member"
          subtitle="Non-teaching / Administrative staff record"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit}>Save Staff Member</Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Senior Accountant"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={e => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Payslip Modal */}
      {viewPayslipStaff && (
        <Modal
          isOpen={Boolean(viewPayslipStaff)}
          onClose={() => setViewPayslipStaff(null)}
          title="Staff Salary Payslip"
          subtitle="Monthly institutional disbursement receipt"
          maxWidth="max-w-xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setViewPayslipStaff(null)}>Close</Button>
              <Button variant="primary" onClick={() => window.print()}>Print Payslip</Button>
            </>
          }
        >
          <div className="p-6 bg-white text-slate-900 rounded-2xl border border-slate-200 space-y-4 font-sans text-xs">
            <div className="text-center pb-3 border-b border-slate-200">
              <h2 className="text-base font-extrabold uppercase tracking-tight text-indigo-900">The School Management ERP</h2>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Jubilee Hills, Hyderabad • Monthly Salary Slip</p>
              <p className="text-xs font-bold text-indigo-600 mt-1">Month: August 2025</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div><strong>Employee:</strong> {viewPayslipStaff.fullName}</div>
              <div><strong>Staff ID:</strong> {viewPayslipStaff.staffNo || viewPayslipStaff.id}</div>
              <div><strong>Designation:</strong> {viewPayslipStaff.designation}</div>
              <div><strong>Department:</strong> {viewPayslipStaff.departmentName}</div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 font-bold border-b">
                  <tr>
                    <th className="p-2.5">Earnings Item</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  <tr>
                    <td className="p-2.5">Basic Salary</td>
                    <td className="p-2.5 text-right">{formatCurrency((viewPayslipStaff.salary || 35000) * 0.7)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">House Rent Allowance (HRA)</td>
                    <td className="p-2.5 text-right">{formatCurrency((viewPayslipStaff.salary || 35000) * 0.2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Special Academic Allowance</td>
                    <td className="p-2.5 text-right">{formatCurrency((viewPayslipStaff.salary || 35000) * 0.1)}</td>
                  </tr>
                  <tr className="bg-indigo-50 font-bold">
                    <td className="p-2.5">Net Disbursed Amount</td>
                    <td className="p-2.5 text-right text-indigo-700">{formatCurrency(viewPayslipStaff.salary || 35000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-6 text-[10px] text-slate-500">
              <span>Authorized Signature: ______________</span>
              <span>Employee Signature: ______________</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
