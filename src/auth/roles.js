// Role definitions and permission helpers for The School ERP

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  ACCOUNTANT: 'Accountant',
  PARENT: 'Parent',
  STUDENT: 'Student'
};

export function normalizeRole(role) {
  if (!role) return ROLES.SCHOOL_ADMIN;
  const clean = String(role).trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (clean.includes('super')) return ROLES.SUPER_ADMIN;
  if (clean.includes('schooladmin') || clean === 'admin' || clean.includes('principal')) return ROLES.SCHOOL_ADMIN;
  if (clean.includes('teacher') || clean.includes('faculty')) return ROLES.TEACHER;
  if (clean.includes('account') || clean.includes('finance') || clean.includes('bursar')) return ROLES.ACCOUNTANT;
  if (clean.includes('parent') || clean.includes('guardian')) return ROLES.PARENT;
  if (clean.includes('student') || clean.includes('pupil')) return ROLES.STUDENT;
  return ROLES.SCHOOL_ADMIN;
}

export const ROLE_THEMES = {
  [ROLES.SUPER_ADMIN]: {
    label: 'Super Admin',
    tagline: 'Platform Administrator',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    color: 'from-purple-600 to-indigo-600',
    icon: 'ShieldCheck'
  },
  [ROLES.SCHOOL_ADMIN]: {
    label: 'School Admin',
    tagline: 'Campus Principal & Administrator',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    color: 'from-indigo-600 to-blue-600',
    icon: 'Building2'
  },
  [ROLES.TEACHER]: {
    label: 'Teacher',
    tagline: 'Faculty Portal',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    color: 'from-emerald-600 to-teal-600',
    icon: 'UserCheck'
  },
  [ROLES.ACCOUNTANT]: {
    label: 'Accountant',
    tagline: 'Finance & Accounts Lead',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    color: 'from-amber-600 to-orange-600',
    icon: 'CircleDollarSign'
  },
  [ROLES.PARENT]: {
    label: 'Parent',
    tagline: 'Parent & Guardian Portal',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    color: 'from-sky-600 to-cyan-600',
    icon: 'Users'
  },
  [ROLES.STUDENT]: {
    label: 'Student',
    tagline: 'Student Learning Portal',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    color: 'from-rose-600 to-pink-600',
    icon: 'GraduationCap'
  }
};
