import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Trash2, RefreshCw, Clock } from 'lucide-react';
import { auditRepository } from '../../database/repositories/auditRepository';
import { Card, Button, Badge } from '../../components/common/UIComponents';
import { formatDate } from '../../utils/formatters';

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditRepository.getAll(150);
      setLogs(data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (window.confirm('Clear all audit logs from cloud database?')) {
      await auditRepository.clearAll();
      loadLogs();
    }
  };

  const filtered = logs.filter(l =>
    !search ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.module.toLowerCase().includes(search.toLowerCase()) ||
    (l.description && l.description.toLowerCase().includes(search.toLowerCase())) ||
    (l.userName && l.userName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Security & System Audit Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chronological audit trail of all database writes, updates, deletions, and logins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadLogs}>
            Refresh
          </Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={handleClearLogs}>
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card bodyClassName="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit trail by user, action, module, record..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
          />
        </div>
      </Card>

      {/* Logs Table */}
      <Card
        title={`Audit Trail (${filtered.length} Events)`}
        subtitle="Permanent local change log"
        bodyClassName="p-0 overflow-x-auto"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Module</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">Loading audit history...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">No logs found.</td>
              </tr>
            ) : (
              filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 font-mono text-[11px]">
                  <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">{formatDate(l.timestamp, true)}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200 font-sans">{l.userName}</td>
                  <td className="py-2.5 px-4 font-sans">
                    <Badge variant="purple" size="xs">{l.role}</Badge>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 font-sans">{l.module}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300">{l.action}</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-sans">{l.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
