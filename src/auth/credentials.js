export const DEMO_ACCOUNTS = [
  {
    role: 'Super Admin',
    username: 'superadmin',
    password: 'admin123',
    name: 'Master ERP Administrator',
    badge: 'Platform Head',
    color: 'from-purple-600 to-indigo-600',
    icon: 'fa-shield-halved'
  },
  {
    role: 'School Admin',
    username: 'admin',
    password: 'admin',
    name: 'Dr. Ramesh Sharma (Principal)',
    badge: 'Campus Admin',
    color: 'from-indigo-600 to-blue-600',
    icon: 'fa-user-tie'
  },
  {
    role: 'Teacher',
    username: 'teacher',
    password: 'teacher123',
    name: 'Mrs. Priya Nair (Faculty)',
    badge: 'Maths Dept',
    color: 'from-emerald-600 to-teal-600',
    icon: 'fa-chalkboard-user'
  },
  {
    role: 'Accountant',
    username: 'accountant',
    password: 'accountant123',
    name: 'Mr. Kiran Reddy',
    badge: 'Finance Lead',
    color: 'from-amber-600 to-orange-600',
    icon: 'fa-file-invoice-dollar'
  },
  {
    role: 'Parent',
    username: 'parent',
    password: 'parent123',
    name: 'Mr. Rajesh Sharma',
    badge: 'Guardian Portal',
    color: 'from-sky-600 to-cyan-600',
    icon: 'fa-users'
  },
  {
    role: 'Student',
    username: 'student',
    password: 'student123',
    name: 'Aarav Sharma (Grade 1)',
    badge: 'Student Portal',
    color: 'from-rose-600 to-pink-600',
    icon: 'fa-graduation-cap'
  }
];

export const ROLE_PERMISSIONS = {
  'Super Admin': ['all'],
  'School Admin': ['all'],
  'Teacher': ['dashboard', 'myProfile', 'myClasses', 'myStudents', 'attendance', 'timetable', 'assignments', 'examinations', 'marksEntry', 'studentPerformance', 'communication'],
  'Accountant': ['dashboard', 'myProfile', 'fees', 'feeStructures', 'feeCollection', 'paymentHistory', 'pendingPayments', 'receipts', 'income', 'expenses', 'accounting', 'financialReports'],
  'Parent': ['dashboard', 'myChildren', 'attendance', 'academicPerformance', 'examinationResults', 'homeworkAssignments', 'feeDetails', 'paymentHistory', 'downloadReceipts', 'timetable', 'notices', 'myProfile'],
  'Student': ['dashboard', 'myProfile', 'timetable', 'attendance', 'examinationResults', 'assignments', 'homework', 'academicPerformance', 'notices']
};
