# The School — Management ERP

> A modern, responsive, database-free School Management ERP designed to run locally on **Node.js (v24+)** using **IndexedDB** for permanent browser client-side persistence without requiring any database server installation (No MySQL, PostgreSQL, MongoDB, or Docker).

---

## ✨ Features & Capabilities

- **100% Local & Database-Free**: Runs entirely in the browser backed by IndexedDB (`Dexie.js`) with true transactional relational models.
- **Permanent Persistence**: Data survives browser refreshes, restarts, and shutdowns.
- **Vibrant Modern UI**: Tailwind CSS, custom gradients, soft shadows, dark/light mode, Lucide icons & Font Awesome.
- **Demo Accounts & Quick Switcher**: 1-click login chips for Super Admin, School Admin, Teacher, Accountant, Parent, and Student.
- **Bulk Excel Import & Generator**: Download formatted sample Excel templates (`.xlsx`) and upload bulk student records with instant validation.
- **Complete ERP Modules Included**:
  1. **Dynamic KPI Dashboards** with live charts (Student Growth, Fee Ratios, Attendance Breakdown).
  2. **School Setup** (Profiles, Branches, Academic Years, Classes Nursery-12, Sections, Subjects, Houses).
  3. **Student Management** (20+ field admission wizard, photo uploads, student directory, promotion, printable ID cards with barcodes).
  4. **Parent Directory** (Linked student cards, guardian credentials, contact directory).
  5. **Faculty & Teacher Management** (Qualifications, assigned subjects, salary ledger).
  6. **Staff & HR Management** (Administrative roles, salary structures, printable monthly payslips).
  7. **Daily Attendance Register** (Class/Section selector, 1-click "Mark All Present", quick status toggles, attendance %).
  8. **Academics & Timetable** (Weekly timetable builder with period allocation and room assignments).
  9. **Examinations & Marksheets** (Subject-wise marks entry grid, auto grade calculation, printable student report cards).
  10. **Fees & Finance** (Fee categories, invoice generation, payment collection modal with UPI/Cash/Bank, printable receipts).
  11. **Accounting Vouchers** (Campus income & expense vouchers, cash book ledger, net surplus calculation).
  12. **Communication Center** (Notice board with priority badges, campus events calendar).
  13. **Certificates** (Official printable Transfer Certificates, Bonafide/Study Certificates, Character Certificates).
  14. **Centralized Reports** (Filterable Student, Attendance, Fee, Expense, and Faculty reports with CSV & Excel export).
  15. **Full System Backup & Restore** (1-click JSON snapshot download, JSON database restore, demo data reset, factory wipe).
  16. **Security & Audit Logs** (Chronological audit trail recording every write/update/delete action).
  17. **Multi-Language Localization** (English, Telugu - తెలుగు, Hindi - हिंदी).
  18. **PWA & Offline-First** (Service Worker caching and web app manifest).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18, v20, v22, or v24 installed.

### Installation & Launch

1. Open your terminal in this directory:
```bash
npm install
```

2. Start the local development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🔑 Demo Login Accounts

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `admin123` | Full ERP Master Rights |
| **School Admin** | `admin` | `admin` | Campus Principal & Operations |
| **Teacher** | `teacher` | `teacher123` | Attendance, Marks, Timetable |
| **Accountant** | `accountant` | `accountant123` | Invoices, Collections, Ledger |
| **Parent** | `parent` | `parent123` | Guardian Portal, Ward Details |
| **Student** | `student` | `student123` | Student Portal & Timetable |

---

## 🧪 Testing Guide

1. **Persistence Test**:
   - Go to **Students** -> Click **New Admission** -> Add "Rahul Kumar" in Grade 5-A.
   - Refresh or restart your browser.
   - Verify Rahul Kumar remains in the database and is reflected in the Dashboard KPIs.

2. **Bulk Excel Loader Test**:
   - Go to **Students** or **Backup & Import** -> Click **Sample Excel** to download `the-school-students-sample.xlsx`.
   - Click **Bulk Import** -> Select the downloaded `.xlsx` file -> Verify parsed rows -> Click **Import Students**.

3. **Fee Collection & Printable Receipt**:
   - Go to **Fees & Finance** -> Click **Collect** on any unpaid invoice -> Pay via UPI -> View & Print the signed fee receipt.

4. **Exam Marksheet Generation**:
   - Go to **Examinations** -> Pick Class 5-A, Mathematics -> Enter marks -> Click **Marksheet** on any student row to preview the official report card.

5. **Full Backup & Restore**:
   - Go to **Backup & Import** -> Click **Export & Download Full JSON Backup**.
   - Click **Reset Demo Data** or **Delete All Data**.
   - Click **Select & Restore Backup File** -> Select your downloaded `.json` backup file -> Verify 100% data restored.
