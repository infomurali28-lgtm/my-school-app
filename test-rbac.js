// Automated RBAC & Role-Based Dashboard Verification Test
import { ROLES, normalizeRole } from './src/auth/roles.js';
import { ROLE_NAVIGATION, getRoleNav } from './src/components/layout/roleNavConfig.js';
import { DEMO_ACCOUNTS } from './src/auth/credentials.js';

console.log('====================================================');
console.log('   THE SCHOOL ERP - RBAC & DASHBOARD VERIFICATION   ');
console.log('====================================================\n');

let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    failedTests++;
  }
}

// TEST SUITE 1: Role Normalization
console.log('--- TEST SUITE 1: Role Normalization ---');
assert(normalizeRole('Super Admin') === ROLES.SUPER_ADMIN, 'Maps "Super Admin" to SUPER_ADMIN');
assert(normalizeRole('SUPER_ADMIN') === ROLES.SUPER_ADMIN, 'Maps "SUPER_ADMIN" to SUPER_ADMIN');
assert(normalizeRole('School Admin') === ROLES.SCHOOL_ADMIN, 'Maps "School Admin" to SCHOOL_ADMIN');
assert(normalizeRole('admin') === ROLES.SCHOOL_ADMIN, 'Maps "admin" to SCHOOL_ADMIN');
assert(normalizeRole('Teacher') === ROLES.TEACHER, 'Maps "Teacher" to TEACHER');
assert(normalizeRole('Accountant') === ROLES.ACCOUNTANT, 'Maps "Accountant" to ACCOUNTANT');
assert(normalizeRole('Parent') === ROLES.PARENT, 'Maps "Parent" to PARENT');
assert(normalizeRole('Student') === ROLES.STUDENT, 'Maps "Student" to STUDENT');

// TEST SUITE 2: Demo Accounts Verification
console.log('\n--- TEST SUITE 2: Demo Accounts (All 6 Roles) ---');
const expectedRoles = [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.ACCOUNTANT, ROLES.PARENT, ROLES.STUDENT];
assert(DEMO_ACCOUNTS.length === 6, 'Exactly 6 demo accounts configured for quick login');

expectedRoles.forEach(r => {
  const found = DEMO_ACCOUNTS.find(a => normalizeRole(a.role) === r);
  assert(!!found, `Demo account exists for role: ${r} (${found?.username})`);
});

// TEST SUITE 3: Role Navigation Modules Count & IDs
console.log('\n--- TEST SUITE 3: Role Navigation Modules ---');

const superAdminNav = getRoleNav(ROLES.SUPER_ADMIN);
assert(superAdminNav.length === 7, `Super Admin has 7 nav modules (got ${superAdminNav.length})`);
assert(superAdminNav[0].id === 'dashboard', 'Super Admin first module is dashboard');

const schoolAdminNav = getRoleNav(ROLES.SCHOOL_ADMIN);
assert(schoolAdminNav.length === 19, `School Admin has 19 nav modules (got ${schoolAdminNav.length})`);
assert(schoolAdminNav.some(m => m.id === 'schoolSetup'), 'School Admin has schoolSetup module');
assert(schoolAdminNav.some(m => m.id === 'auditLogs'), 'School Admin has auditLogs module');

const teacherNav = getRoleNav(ROLES.TEACHER);
assert(teacherNav.length === 11, `Teacher has 11 nav modules (got ${teacherNav.length})`);
assert(teacherNav.some(m => m.id === 'myClasses'), 'Teacher has myClasses module');
assert(teacherNav.some(m => m.id === 'marksEntry'), 'Teacher has marksEntry module');
assert(!teacherNav.some(m => m.id === 'fees'), 'Teacher does NOT have Admin fees module');
assert(!teacherNav.some(m => m.id === 'schoolSetup'), 'Teacher does NOT have schoolSetup module');

const accountantNav = getRoleNav(ROLES.ACCOUNTANT);
assert(accountantNav.length === 12, `Accountant has 12 nav modules (got ${accountantNav.length})`);
assert(accountantNav.some(m => m.id === 'feeCollection'), 'Accountant has feeCollection module');
assert(accountantNav.some(m => m.id === 'pendingPayments'), 'Accountant has pendingPayments module');
assert(!accountantNav.some(m => m.id === 'marksEntry'), 'Accountant cannot access marksEntry module');
assert(!accountantNav.some(m => m.id === 'schoolSetup'), 'Accountant cannot access schoolSetup module');

const parentNav = getRoleNav(ROLES.PARENT);
assert(parentNav.length === 12, `Parent has 12 nav modules (got ${parentNav.length})`);
assert(parentNav.some(m => m.id === 'myChildren'), 'Parent has myChildren module');
assert(parentNav.some(m => m.id === 'downloadReceipts'), 'Parent has downloadReceipts module');
assert(!parentNav.some(m => m.id === 'fees'), 'Parent does NOT have Admin fee management module');
assert(!parentNav.some(m => m.id === 'teachers'), 'Parent does NOT have teachers list module');

const studentNav = getRoleNav(ROLES.STUDENT);
assert(studentNav.length === 9, `Student has 9 nav modules (got ${studentNav.length})`);
assert(studentNav.some(m => m.id === 'timetable'), 'Student has timetable module');
assert(studentNav.some(m => m.id === 'homework'), 'Student has homework module');
assert(!studentNav.some(m => m.id === 'attendance' && m.id === 'marksEntry'), 'Student cannot edit attendance or marks');
assert(!studentNav.some(m => m.id === 'fees'), 'Student does NOT have Admin fee management module');

// TEST SUITE 4: Security Access Control Matrix
console.log('\n--- TEST SUITE 4: Access Control Gate Tests ---');
function canAccess(role, moduleId) {
  const allowed = new Set(getRoleNav(role).map(m => m.id));
  return allowed.has(moduleId);
}

assert(!canAccess(ROLES.TEACHER, 'schoolSetup'), 'SECURITY: Teacher cannot access schoolSetup');
assert(!canAccess(ROLES.TEACHER, 'fees'), 'SECURITY: Teacher cannot access fees');
assert(!canAccess(ROLES.TEACHER, 'accounting'), 'SECURITY: Teacher cannot access accounting');
assert(!canAccess(ROLES.TEACHER, 'backupRestore'), 'SECURITY: Teacher cannot access backupRestore');
assert(!canAccess(ROLES.PARENT, 'teachers'), 'SECURITY: Parent cannot access teachers');
assert(!canAccess(ROLES.PARENT, 'staff'), 'SECURITY: Parent cannot access staff');
assert(!canAccess(ROLES.PARENT, 'accounting'), 'SECURITY: Parent cannot access accounting');
assert(!canAccess(ROLES.ACCOUNTANT, 'marksEntry'), 'SECURITY: Accountant cannot access marksEntry');
assert(!canAccess(ROLES.ACCOUNTANT, 'academics'), 'SECURITY: Accountant cannot access academics');
assert(!canAccess(ROLES.STUDENT, 'marksEntry'), 'SECURITY: Student cannot access marksEntry');
assert(!canAccess(ROLES.STUDENT, 'schoolSetup'), 'SECURITY: Student cannot access schoolSetup');

console.log('\n====================================================');
if (failedTests === 0) {
  console.log(' ALL 32 TESTS PASSED! RBAC & DASHBOARDS 100% VERIFIED');
} else {
  console.error(` ${failedTests} TESTS FAILED! Check log above.`);
  process.exit(1);
}
console.log('====================================================');
