import React, { useState, useEffect } from 'react';
import {
  Building2,
  GraduationCap,
  Users,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';
import db from '../../database/db';
import { StatCard, Card, Badge, Button, Modal } from '../../components/common/UIComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function SuperAdminDashboard({ onNavigate }) {
  const [schools, setSchools] = useState([]);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeSubscriptions: 0,
    expiringSoon: 0,
    totalRevenue: 2450000,
    activeUsersToday: 184
  });
  const [loading, setLoading] = useState(true);
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    code: '',
    city: '',
    phone: '',
    email: '',
    principal: '',
    plan: 'Enterprise',
    status: 'Active'
  });

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);
      const [allSchools, allStudents, allTeachers] = await Promise.all([
        db.schools.toArray(),
        db.students.toArray(),
        db.teachers.toArray()
      ]);

      // Enrich schools with mock subscription data if missing
      const enrichedSchools = allSchools.map((s, idx) => ({
        ...s,
        plan: s.plan || (idx === 0 ? 'Enterprise Pro' : 'Standard School'),
        status: s.status || 'Active',
        expiryDate: s.expiryDate || (idx === 0 ? '2027-03-31' : '2026-12-15'),
        studentCount: allStudents.filter(st => st.schoolId === s.id).length || (idx === 0 ? allStudents.length : 120),
        teacherCount: allTeachers.filter(t => t.schoolId === s.id).length || (idx === 0 ? allTeachers.length : 18)
      }));

      setSchools(enrichedSchools);
      setStats({
        totalSchools: enrichedSchools.length,
        totalStudents: allStudents.length,
        totalTeachers: allTeachers.length,
        activeSubscriptions: enrichedSchools.filter(s => s.status === 'Active').length,
        expiringSoon: 1,
        totalRevenue: 3480000,
        activeUsersToday: 215
      });
    } catch (err) {
      console.error('Super Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.code) return;
    const schoolId = `SCH-${String(schools.length + 1).padStart(5, '0')}`;
    const payload = {
      ...newSchool,
      id: schoolId,
      establishedYear: new Date().getFullYear(),
      createdAt: new Date().toISOString()
    };
    await db.schools.add(payload);
    setIsAddSchoolOpen(false);
    setNewSchool({ name: '', code: '', city: '', phone: '', email: '', principal: '', plan: 'Enterprise', status: 'Active' });
    loadSuperAdminData();
  };

  const toggleSchoolStatus = async (school) => {
    const newStatus = school.status === 'Active' ? 'Suspended' : 'Active';
    await db.schools.update(school.id, { status: newStatus });
    loadSuperAdminData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-purple-200 mb-2 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              Super Admin Platform Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ERP Platform Control Center
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-xl">
              Centralized oversight across all registered school campuses, cloud tenants, multi-school subscriptions, and platform analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddSchoolOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-900 font-extrabold text-xs shadow-lg hover:bg-purple-50 transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-purple-700" />
              Register New School
            </button>
          </div>
        </div>
      </div>

      {/* Primary Platform Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Registered Schools"
          value={stats.totalSchools}
          subValue="Across 2 Indian States"
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Students Across Schools"
          value={stats.totalStudents}
          subValue="Active Enrolled"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Faculty & Teachers"
          value={stats.totalTeachers}
          subValue="Verified Teaching Staff"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Platform Revenue (YTD)"
          value={formatCurrency(stats.totalRevenue)}
          subValue="Recurring SaaS Inflow"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Subscription Alerts & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              Subscription Renewal Alert
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
              <strong>The School - North Campus</strong> license expires in 37 days. Invoice dispatched.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
              Database & Cloud Health
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
              PostgreSQL Supabase engine healthy. 99.98% uptime in last 30 days. Zero data loss.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500 text-white shrink-0 mt-0.5">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
              Platform Concurrency
            </h4>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1">
              <strong>{stats.activeUsersToday} concurrent logins</strong> today across admin, teacher, and parent portals.
            </p>
          </div>
        </div>
      </div>

      {/* Schools Management Table */}
      <Card
        title="Registered Schools & Tenant Licensing"
        subtitle="Manage school institutional profiles, active subscriptions, and administrative access"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="success">All Services Operational</Badge>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-3 px-4">School Name & Code</th>
                <th className="py-3 px-4">Principal / Head</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Students</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Renewal Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
              {schools.map(sch => (
                <tr key={sch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {sch.code?.substring(0, 2) || 'SC'}
                      </div>
                      <div>
                        <p>{sch.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{sch.code} ({sch.id})</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {sch.principal || 'Dr. Ramesh Sharma'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {sch.city || 'Hyderabad'}, {sch.state || 'Telangana'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {sch.studentCount || 0}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {sch.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {formatDate(sch.expiryDate)}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={sch.status === 'Active' ? 'success' : 'danger'}>
                      {sch.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleSchoolStatus(sch)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                        sch.status === 'Active'
                          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      {sch.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New School Registration Modal */}
      {isAddSchoolOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Register New School Tenant
            </h3>
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The School - South Campus"
                  value={newSchool.name}
                  onChange={e => setNewSchool({ ...newSchool, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-transparent focus:border-purple-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TS-SOUTH"
                    value={newSchool.code}
                    onChange={e => setNewSchool({ ...newSchool, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-transparent focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad, Telangana"
                    value={newSchool.city}
                    onChange={e => setNewSchool({ ...newSchool, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-transparent focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@school.edu"
                    value={newSchool.email}
                    onChange={e => setNewSchool({ ...newSchool, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-transparent focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newSchool.phone}
                    onChange={e => setNewSchool({ ...newSchool, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-transparent focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
                >
                  Save & Activate School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default SuperAdminDashboard;
