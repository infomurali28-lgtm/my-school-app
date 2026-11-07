import * as XLSX from 'xlsx';
import db from '../db';
import { studentRepository } from '../repositories/studentRepository';

export const excelService = {
  // Generate downloadable sample Excel file with all columns and realistic rows
  generateStudentSampleExcel() {
    const sampleData = [
      {
        'Admission No': 'ADM-2025-0901',
        'First Name': 'Rohan',
        'Middle Name': 'Kumar',
        'Last Name': 'Chopra',
        'Gender': 'Male',
        'Date of Birth (YYYY-MM-DD)': '2015-04-12',
        'Blood Group': 'O+',
        'Class': 'Grade 5',
        'Section': 'A',
        'Roll No': 101,
        'Father Name': 'Sanjay Chopra',
        'Mother Name': 'Reena Chopra',
        'Father Occupation': 'Software Architect',
        'Mother Occupation': 'Professor',
        'Phone Number': '9876543111',
        'Parent Email': 'sanjay.chopra@example.com',
        'Address': 'Flat 302, Palm Heights, Jubilee Hills',
        'City': 'Hyderabad',
        'State': 'Telangana',
        'Pincode': '500033',
        'Category': 'General',
        'Religion': 'Hindu',
        'Mother Tongue': 'Telugu'
      },
      {
        'Admission No': 'ADM-2025-0902',
        'First Name': 'Meera',
        'Middle Name': '',
        'Last Name': 'Sen',
        'Gender': 'Female',
        'Date of Birth (YYYY-MM-DD)': '2015-08-20',
        'Blood Group': 'B+',
        'Class': 'Grade 5',
        'Section': 'A',
        'Roll No': 102,
        'Father Name': 'Sourav Sen',
        'Mother Name': 'Mousumi Sen',
        'Father Occupation': 'Cardiologist',
        'Mother Occupation': 'Lawyer',
        'Phone Number': '9876543112',
        'Parent Email': 'sourav.sen@example.com',
        'Address': 'House 14, Lotus Colony, Madhapur',
        'City': 'Hyderabad',
        'State': 'Telangana',
        'Pincode': '500081',
        'Category': 'General',
        'Religion': 'Hindu',
        'Mother Tongue': 'Hindi'
      },
      {
        'Admission No': 'ADM-2025-0903',
        'First Name': 'Kunal',
        'Middle Name': '',
        'Last Name': 'Kapoor',
        'Gender': 'Male',
        'Date of Birth (YYYY-MM-DD)': '2016-01-15',
        'Blood Group': 'A+',
        'Class': 'Grade 4',
        'Section': 'A',
        'Roll No': 103,
        'Father Name': 'Anil Kapoor',
        'Mother Name': 'Sunita Kapoor',
        'Father Occupation': 'Business Owner',
        'Mother Occupation': 'Designer',
        'Phone Number': '9876543113',
        'Parent Email': 'anil.kapoor@example.com',
        'Address': '88 Cyber City Road, Hitec City',
        'City': 'Hyderabad',
        'State': 'Telangana',
        'Pincode': '500081',
        'Category': 'OBC',
        'Religion': 'Hindu',
        'Mother Tongue': 'English'
      },
      {
        'Admission No': 'ADM-2025-0904',
        'First Name': 'Zara',
        'Middle Name': '',
        'Last Name': 'Khan',
        'Gender': 'Female',
        'Date of Birth (YYYY-MM-DD)': '2014-11-05',
        'Blood Group': 'AB+',
        'Class': 'Grade 6',
        'Section': 'A',
        'Roll No': 104,
        'Father Name': 'Tariq Khan',
        'Mother Name': 'Farah Khan',
        'Father Occupation': 'Civil Engineer',
        'Mother Occupation': 'Teacher',
        'Phone Number': '9876543114',
        'Parent Email': 'tariq.khan@example.com',
        'Address': 'Banjara Hills Road No 10',
        'City': 'Hyderabad',
        'State': 'Telangana',
        'Pincode': '500034',
        'Category': 'General',
        'Religion': 'Muslim',
        'Mother Tongue': 'Urdu'
      },
      {
        'Admission No': 'ADM-2025-0905',
        'First Name': 'Harsh',
        'Middle Name': '',
        'Last Name': 'Vardhan',
        'Gender': 'Male',
        'Date of Birth (YYYY-MM-DD)': '2013-06-18',
        'Blood Group': 'O-',
        'Class': 'Grade 7',
        'Section': 'A',
        'Roll No': 105,
        'Father Name': 'Vikram Vardhan',
        'Mother Name': 'Radha Vardhan',
        'Father Occupation': 'IAS Officer',
        'Mother Occupation': 'Author',
        'Phone Number': '9876543115',
        'Parent Email': 'vikram.vardhan@example.com',
        'Address': 'Officers Colony, Jubilee Hills',
        'City': 'Hyderabad',
        'State': 'Telangana',
        'Pincode': '500033',
        'Category': 'General',
        'Religion': 'Hindu',
        'Mother Tongue': 'Telugu'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Bulk_Template');

    const colWidths = Object.keys(sampleData[0]).map(key => ({
      wch: Math.max(key.length + 3, 16)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, 'the-school-students-bulk-sample.xlsx');
  },

  // Parse uploaded Excel or CSV file
  async parseStudentFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json(worksheet);

          if (!rawRows.length) {
            throw new Error('The uploaded spreadsheet contains no data rows.');
          }

          const classes = await db.classes.toArray();
          const sections = await db.sections.toArray();

          const classMap = new Map();
          classes.forEach(c => {
            classMap.set(c.name.toLowerCase().trim(), c.id);
            classMap.set(c.id.toLowerCase().trim(), c.id);
          });

          const sectionMap = new Map();
          sections.forEach(s => {
            sectionMap.set(s.name.toLowerCase().trim(), s.id);
            sectionMap.set(s.id.toLowerCase().trim(), s.id);
          });

          const parsedStudents = [];
          const errors = [];

          rawRows.forEach((row, index) => {
            const rowNum = index + 2;
            const firstName = row['First Name'] || row['firstName'] || row['Student Name'] || '';
            const lastName = row['Last Name'] || row['lastName'] || '';
            const rawClass = String(row['Class'] || row['class'] || 'Grade 1').toLowerCase().trim();
            const rawSec = String(row['Section'] || row['section'] || 'A').toLowerCase().trim();

            if (!firstName.trim()) {
              errors.push(`Row ${rowNum}: First Name is required.`);
              return;
            }

            const classId = classMap.get(rawClass) || 'CLS-01';
            const matchedSec = sections.find(s => s.classId === classId && (s.name.toLowerCase() === rawSec || s.id.toLowerCase() === rawSec));
            const sectionId = matchedSec ? matchedSec.id : (sections.find(s => s.classId === classId)?.id || 'SEC-01-A');

            parsedStudents.push({
              admissionNo: row['Admission No'] || row['admissionNo'] || '',
              rollNo: parseInt(row['Roll No'] || row['rollNo'] || '1', 10),
              firstName: firstName.trim(),
              middleName: row['Middle Name'] || '',
              lastName: lastName.trim(),
              gender: row['Gender'] || row['gender'] || 'Male',
              dob: row['Date of Birth (YYYY-MM-DD)'] || row['dob'] || '2015-01-01',
              bloodGroup: row['Blood Group'] || row['bloodGroup'] || 'O+',
              classId,
              sectionId,
              fatherName: row['Father Name'] || row['fatherName'] || '',
              motherName: row['Mother Name'] || row['motherName'] || '',
              fatherOccupation: row['Father Occupation'] || '',
              motherOccupation: row['Mother Occupation'] || '',
              parentPhone: String(row['Phone Number'] || row['phone'] || row['parentPhone'] || ''),
              parentEmail: row['Parent Email'] || row['email'] || '',
              address: row['Address'] || row['address'] || '',
              city: row['City'] || row['city'] || 'Hyderabad',
              state: row['State'] || row['state'] || 'Telangana',
              pincode: String(row['Pincode'] || '500033'),
              category: row['Category'] || row['category'] || 'General',
              religion: row['Religion'] || row['religion'] || 'Hindu',
              motherTongue: row['Mother Tongue'] || 'Telugu',
              status: 'Active'
            });
          });

          resolve({
            success: true,
            totalRows: rawRows.length,
            parsedCount: parsedStudents.length,
            students: parsedStudents,
            errors
          });
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  // Save parsed students to Supabase PostgreSQL
  async importParsedStudents(studentsList) {
    return await studentRepository.bulkImport(studentsList);
  }
};
