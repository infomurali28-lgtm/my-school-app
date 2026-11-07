import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, MapPin, GraduationCap } from 'lucide-react';
import { parentRepository } from '../../database/repositories/parentRepository';
import { Card, Badge, Pagination } from '../../components/common/UIComponents';

export function ParentList() {
  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParents();
  }, [search, page]);

  const loadParents = async () => {
    setLoading(true);
    try {
      const res = await parentRepository.getAll({ search, page, limit: 12 });
      setParents(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.total);
    } catch (err) {
      console.error('Error loading parents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-sky-600" />
            Parent & Guardian Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total {totalItems} parent accounts linked to enrolled students.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card bodyClassName="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search parents by father name, mother name, phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
          />
        </div>
      </Card>

      {/* Grid of Parents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {parents.map(p => (
          <div key={p.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{p.fatherName || p.guardianName}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Mother: {p.motherName || '-'}</p>
              </div>
              <Badge variant="info" size="xs">
                {p.children?.length || 1} Ward(s)
              </Badge>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{p.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{p.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{p.address || '-'}</span>
              </div>
            </div>

            {/* Wards list */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Enrolled Children:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(p.children || []).map(child => (
                  <span key={child.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                    <GraduationCap className="w-3 h-3" />
                    {child.fullName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={12}
        onPageChange={setPage}
      />
    </div>
  );
}
