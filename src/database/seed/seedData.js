// Seed dataset for "The School" ERP

export const initialSchools = [
  {
    id: 'SCH-00001',
    code: 'TS-MAIN',
    name: 'The School - Main Campus',
    tagline: 'Inspiring Excellence, Empowering Minds',
    logo: '',
    address: 'Plot 42, Jubilee Hills, Knowledge Corridor',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    country: 'India',
    phone: '+91 98765 43210',
    email: 'info@theschool.edu',
    website: 'https://theschool.edu',
    principal: 'Dr. Ramesh Sharma, Ph.D.',
    affiliationNo: 'CBSE/AFF/2026/9921',
    currency: 'INR',
    currencySymbol: '₹',
    establishedYear: 2012
  },
  {
    id: 'SCH-00002',
    code: 'TS-NORTH',
    name: 'The School - North Campus',
    tagline: 'Shaping Tomorrow’s Leaders',
    logo: '',
    address: 'Near Tech City Road, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    country: 'India',
    phone: '+91 98765 43211',
    email: 'north@theschool.edu',
    website: 'https://theschool.edu/north',
    principal: 'Mrs. Sunita Reddy, M.Ed.',
    affiliationNo: 'CBSE/AFF/2026/9922',
    currency: 'INR',
    currencySymbol: '₹',
    establishedYear: 2018
  }
];

export const initialBranches = [
  {
    id: 'BR-00001',
    schoolId: 'SCH-00001',
    code: 'BR-MAIN',
    name: 'Main Campus (Jubilee Hills)',
    address: 'Plot 42, Jubilee Hills, Knowledge Corridor',
    phone: '+91 98765 43210',
    email: 'main@theschool.edu'
  },
  {
    id: 'BR-00002',
    schoolId: 'SCH-00001',
    code: 'BR-NORTH',
    name: 'North Campus (Madhapur)',
    address: 'Near Tech City Road, Madhapur',
    phone: '+91 98765 43211',
    email: 'north@theschool.edu'
  }
];

export const initialAcademicYears = [
  {
    id: 'AY-2025-2026',
    schoolId: 'SCH-00001',
    name: '2025 - 2026',
    startDate: '2025-06-01',
    endDate: '2026-04-30',
    isCurrent: 1
  },
  {
    id: 'AY-2024-2025',
    schoolId: 'SCH-00001',
    name: '2024 - 2025',
    startDate: '2024-06-01',
    endDate: '2025-04-30',
    isCurrent: 0
  }
];

export const initialDepartments = [
  { id: 'DEP-001', schoolId: 'SCH-00001', name: 'Academics & Teaching', code: 'ACAD', head: 'Dr. Ramesh Sharma' },
  { id: 'DEP-002', schoolId: 'SCH-00001', name: 'Science & Laboratories', code: 'SCI', head: 'Mr. Arvind Rao' },
  { id: 'DEP-003', schoolId: 'SCH-00001', name: 'Mathematics & IT', code: 'MATH-IT', head: 'Mrs. Priya Nair' },
  { id: 'DEP-004', schoolId: 'SCH-00001', name: 'Languages & Humanities', code: 'LANG', head: 'Mrs. Anjali Roy' },
  { id: 'DEP-005', schoolId: 'SCH-00001', name: 'Administration & Finance', code: 'ADMIN', head: 'Mr. Rajesh Verma' },
  { id: 'DEP-006', schoolId: 'SCH-00001', name: 'Sports & Physical Education', code: 'SPORTS', head: 'Mr. Vikram Singh' }
];

export const initialHouses = [
  { id: 'HSE-01', schoolId: 'SCH-00001', name: 'Red Ruby', color: '#ef4444' },
  { id: 'HSE-02', schoolId: 'SCH-00001', name: 'Blue Sapphire', color: '#3b82f6' },
  { id: 'HSE-03', schoolId: 'SCH-00001', name: 'Emerald Green', color: '#10b981' },
  { id: 'HSE-04', schoolId: 'SCH-00001', name: 'Topaz Gold', color: '#f59e0b' }
];

export const initialStudentCategories = [
  { id: 'CAT-01', schoolId: 'SCH-00001', name: 'General' },
  { id: 'CAT-02', schoolId: 'SCH-00001', name: 'OBC' },
  { id: 'CAT-03', schoolId: 'SCH-00001', name: 'SC' },
  { id: 'CAT-04', schoolId: 'SCH-00001', name: 'ST' },
  { id: 'CAT-05', schoolId: 'SCH-00001', name: 'EWS' }
];

export const initialClasses = [
  { id: 'CLS-00', schoolId: 'SCH-00001', name: 'Nursery', numericGrade: 0, stream: 'General' },
  { id: 'CLS-LKG', schoolId: 'SCH-00001', name: 'LKG', numericGrade: 0, stream: 'General' },
  { id: 'CLS-UKG', schoolId: 'SCH-00001', name: 'UKG', numericGrade: 0, stream: 'General' },
  { id: 'CLS-01', schoolId: 'SCH-00001', name: 'Grade 1', numericGrade: 1, stream: 'General' },
  { id: 'CLS-02', schoolId: 'SCH-00001', name: 'Grade 2', numericGrade: 2, stream: 'General' },
  { id: 'CLS-03', schoolId: 'SCH-00001', name: 'Grade 3', numericGrade: 3, stream: 'General' },
  { id: 'CLS-04', schoolId: 'SCH-00001', name: 'Grade 4', numericGrade: 4, stream: 'General' },
  { id: 'CLS-05', schoolId: 'SCH-00001', name: 'Grade 5', numericGrade: 5, stream: 'General' },
  { id: 'CLS-06', schoolId: 'SCH-00001', name: 'Grade 6', numericGrade: 6, stream: 'General' },
  { id: 'CLS-07', schoolId: 'SCH-00001', name: 'Grade 7', numericGrade: 7, stream: 'General' },
  { id: 'CLS-08', schoolId: 'SCH-00001', name: 'Grade 8', numericGrade: 8, stream: 'General' },
  { id: 'CLS-09', schoolId: 'SCH-00001', name: 'Grade 9', numericGrade: 9, stream: 'General' },
  { id: 'CLS-10', schoolId: 'SCH-00001', name: 'Grade 10', numericGrade: 10, stream: 'General' },
  { id: 'CLS-11', schoolId: 'SCH-00001', name: 'Grade 11 - Science', numericGrade: 11, stream: 'Science' },
  { id: 'CLS-12', schoolId: 'SCH-00001', name: 'Grade 12 - Science', numericGrade: 12, stream: 'Science' }
];

export const initialSections = [
  { id: 'SEC-01-A', schoolId: 'SCH-00001', classId: 'CLS-01', name: 'A', capacity: 35, roomNo: '101', classTeacherId: 'TCH-00001' },
  { id: 'SEC-01-B', schoolId: 'SCH-00001', classId: 'CLS-01', name: 'B', capacity: 35, roomNo: '102', classTeacherId: 'TCH-00002' },
  { id: 'SEC-02-A', schoolId: 'SCH-00001', classId: 'CLS-02', name: 'A', capacity: 35, roomNo: '103', classTeacherId: 'TCH-00003' },
  { id: 'SEC-03-A', schoolId: 'SCH-00001', classId: 'CLS-03', name: 'A', capacity: 35, roomNo: '104', classTeacherId: 'TCH-00004' },
  { id: 'SEC-04-A', schoolId: 'SCH-00001', classId: 'CLS-04', name: 'A', capacity: 35, roomNo: '105', classTeacherId: 'TCH-00005' },
  { id: 'SEC-05-A', schoolId: 'SCH-00001', classId: 'CLS-05', name: 'A', capacity: 35, roomNo: '201', classTeacherId: 'TCH-00006' },
  { id: 'SEC-05-B', schoolId: 'SCH-00001', classId: 'CLS-05', name: 'B', capacity: 35, roomNo: '202', classTeacherId: 'TCH-00007' },
  { id: 'SEC-06-A', schoolId: 'SCH-00001', classId: 'CLS-06', name: 'A', capacity: 35, roomNo: '203', classTeacherId: 'TCH-00008' },
  { id: 'SEC-07-A', schoolId: 'SCH-00001', classId: 'CLS-07', name: 'A', capacity: 35, roomNo: '204', classTeacherId: 'TCH-00009' },
  { id: 'SEC-08-A', schoolId: 'SCH-00001', classId: 'CLS-08', name: 'A', capacity: 35, roomNo: '301', classTeacherId: 'TCH-00010' },
  { id: 'SEC-09-A', schoolId: 'SCH-00001', classId: 'CLS-09', name: 'A', capacity: 35, roomNo: '302', classTeacherId: 'TCH-00011' },
  { id: 'SEC-10-A', schoolId: 'SCH-00001', classId: 'CLS-10', name: 'A', capacity: 35, roomNo: '303', classTeacherId: 'TCH-00012' },
  { id: 'SEC-11-A', schoolId: 'SCH-00001', classId: 'CLS-11', name: 'A', capacity: 30, roomNo: '401', classTeacherId: 'TCH-00013' },
  { id: 'SEC-12-A', schoolId: 'SCH-00001', classId: 'CLS-12', name: 'A', capacity: 30, roomNo: '402', classTeacherId: 'TCH-00014' }
];

export const initialSubjects = [
  { id: 'SUB-01', schoolId: 'SCH-00001', name: 'English Language & Lit', code: 'ENG-101', type: 'Theory', passMarks: 35, maxMarks: 100 },
  { id: 'SUB-02', schoolId: 'SCH-00001', name: 'Mathematics', code: 'MATH-102', type: 'Theory', passMarks: 35, maxMarks: 100 },
  { id: 'SUB-03', schoolId: 'SCH-00001', name: 'General Science', code: 'SCI-103', type: 'Theory + Practical', passMarks: 35, maxMarks: 100 },
  { id: 'SUB-04', schoolId: 'SCH-00001', name: 'Social Studies', code: 'SOC-104', type: 'Theory', passMarks: 35, maxMarks: 100 },
  { id: 'SUB-05', schoolId: 'SCH-00001', name: 'Hindi', code: 'HIN-105', type: 'Theory', passMarks: 35, maxMarks: 100 },
  { id: 'SUB-06', schoolId: 'SCH-00001', name: 'Telugu', code: 'TEL-106', type: 'Theory', passMarks: 35, maxMarks: 100 },
  { id: 'SUB-07', schoolId: 'SCH-00001', name: 'Computer Science & AI', code: 'CS-107', type: 'Practical', passMarks: 35, maxMarks: 100 },
  { id: 'SUB-08', schoolId: 'SCH-00001', name: 'Physics', code: 'PHY-108', type: 'Theory + Practical', passMarks: 35, maxMarks: 100 },
  { id: 'SUB-09', schoolId: 'SCH-00001', name: 'Chemistry', code: 'CHEM-109', type: 'Theory + Practical', passMarks: 35, maxMarks: 100 },
  { id: 'SUB-10', schoolId: 'SCH-00001', name: 'Biology', code: 'BIO-110', type: 'Theory + Practical', passMarks: 35, maxMarks: 100 }
];

export const initialGrades = [
  { id: 'GR-01', schoolId: 'SCH-00001', gradeName: 'A+', minScore: 90, maxScore: 100, gradePoint: 10.0, description: 'Outstanding' },
  { id: 'GR-02', schoolId: 'SCH-00001', gradeName: 'A', minScore: 80, maxScore: 89.9, gradePoint: 9.0, description: 'Excellent' },
  { id: 'GR-03', schoolId: 'SCH-00001', gradeName: 'B+', minScore: 70, maxScore: 79.9, gradePoint: 8.0, description: 'Very Good' },
  { id: 'GR-04', schoolId: 'SCH-00001', gradeName: 'B', minScore: 60, maxScore: 69.9, gradePoint: 7.0, description: 'Good' },
  { id: 'GR-05', schoolId: 'SCH-00001', gradeName: 'C', minScore: 50, maxScore: 59.9, gradePoint: 6.0, description: 'Average' },
  { id: 'GR-06', schoolId: 'SCH-00001', gradeName: 'D', minScore: 35, maxScore: 49.9, gradePoint: 5.0, description: 'Pass' },
  { id: 'GR-07', schoolId: 'SCH-00001', gradeName: 'F', minScore: 0, maxScore: 34.9, gradePoint: 0.0, description: 'Fail / Needs Improvement' }
];

export const initialFeeCategories = [
  { id: 'FC-01', schoolId: 'SCH-00001', name: 'Annual Tuition Fee', code: 'TUI', description: 'Core academic and instructional fee' },
  { id: 'FC-02', schoolId: 'SCH-00001', name: 'Admission & Registration Fee', code: 'ADM', description: 'One-time admission charge' },
  { id: 'FC-03', schoolId: 'SCH-00001', name: 'Examination & Assessment Fee', code: 'EXAM', description: 'Term exams, lab material & reports' },
  { id: 'FC-04', schoolId: 'SCH-00001', name: 'Computer & Smart Lab Fee', code: 'LAB', description: 'Robotics, IT lab and cloud subscriptions' },
  { id: 'FC-05', schoolId: 'SCH-00001', name: 'Sports & Extracurricular Fee', code: 'SPORTS', description: 'Coaching, tournaments, annual sports' }
];

export const initialFeeStructures = [
  { id: 'FS-01', schoolId: 'SCH-00001', academicYearId: 'AY-2025-2026', classId: 'CLS-01', feeCategoryId: 'FC-01', amount: 35000, dueDate: '2025-07-15', frequency: 'Annual' },
  { id: 'FS-02', schoolId: 'SCH-00001', academicYearId: 'AY-2025-2026', classId: 'CLS-01', feeCategoryId: 'FC-03', amount: 3000, dueDate: '2025-09-10', frequency: 'Term' },
  { id: 'FS-03', schoolId: 'SCH-00001', academicYearId: 'AY-2025-2026', classId: 'CLS-05', feeCategoryId: 'FC-01', amount: 45000, dueDate: '2025-07-15', frequency: 'Annual' },
  { id: 'FS-04', schoolId: 'SCH-00001', academicYearId: 'AY-2025-2026', classId: 'CLS-05', feeCategoryId: 'FC-04', amount: 5000, dueDate: '2025-08-15', frequency: 'Annual' },
  { id: 'FS-05', schoolId: 'SCH-00001', academicYearId: 'AY-2025-2026', classId: 'CLS-10', feeCategoryId: 'FC-01', amount: 55000, dueDate: '2025-07-15', frequency: 'Annual' }
];
