import db from '../db';

// The production/trial application no longer seeds Supabase PostgreSQL.
// Initial/demo data is loaded into Supabase separately using supabase_seed.sql.
export async function seedDatabase() {
  try {
    const count = await db.students.count();
    console.log(`Supabase database ready (${count} students).`);
    return;
  } catch (error) {
    console.error('Supabase database initialization failed:', error);
    throw error;
  }
}
