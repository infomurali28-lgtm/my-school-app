import db from '../db';

export const parentRepository = {
  async getAll({ search, page = 1, limit = 20 } = {}) {
    let parents = await db.parents.toArray();

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      parents = parents.filter(p =>
        (p.fatherName && p.fatherName.toLowerCase().includes(q)) ||
        (p.motherName && p.motherName.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
      );
    }

    const students = await db.students.toArray();
    const studentMap = new Map();
    students.forEach(s => {
      if (s.parentId) {
        if (!studentMap.has(s.parentId)) studentMap.set(s.parentId, []);
        studentMap.get(s.parentId).push(s);
      }
    });

    const enriched = parents.map(p => ({
      ...p,
      children: studentMap.get(p.id) || []
    }));

    const total = enriched.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      data: enriched.slice(startIndex, startIndex + limit),
      total,
      page,
      totalPages,
      limit
    };
  },

  async getById(id) {
    const parent = await db.parents.get(id);
    if (!parent) return null;
    const children = await db.students.where('parentId').equals(id).toArray();
    return {
      ...parent,
      children
    };
  }
};
