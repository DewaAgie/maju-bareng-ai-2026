import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceLogsApi } from '../api/attendance.api';
import { useAuth } from '../store/authContext';
import { Calendar, Download, Search, Filter } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

const METHOD_COLORS = {
  QR_CODE: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  BARCODE: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  MANUAL: 'bg-gray-700 text-gray-300',
};

function exportCSV(logs) {
  const headers = ['Member Name', 'Email', 'Check-In Time', 'Method', 'Notes'];
  const rows = logs.map((log) => [
    log.member?.fullName || '',
    log.member?.email || '',
    new Date(log.checkInAt).toLocaleString(),
    log.method || '',
    log.notes || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `attendance-logs-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AttendanceLogs() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-logs', search, method, dateFrom, dateTo, page],
    queryFn: () =>
      getAttendanceLogsApi({
        gymId: user?.gymId,
        search: search || undefined,
        method: method || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit,
      }).then((r) => r.data),
  });

  const logs = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const inputClass = "py-2.5 px-3 bg-gray-900/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-gray-500";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Logs</h1>
          <p className="text-sm text-gray-400 mt-1">View and export attendance records</p>
        </div>
        <button
          onClick={() => exportCSV(logs)}
          disabled={logs.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search member..."
            className={`${inputClass} pl-8 w-48`}
          />
        </div>
        <select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }} className={inputClass}>
          <option value="">All Methods</option>
          <option value="QR_CODE">QR Code</option>
          <option value="BARCODE">Barcode</option>
          <option value="MANUAL">Manual</option>
        </select>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className={inputClass} title="From date" />
          <span className="text-gray-500 text-sm">to</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className={inputClass} title="To date" />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton rows={10} columns={4} />
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-800">
                  {['Member', 'Check-In Time', 'Method', 'Notes'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {log.member?.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-200">{log.member?.fullName || '—'}</p>
                          <p className="text-xs text-gray-500">{log.member?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-200">{new Date(log.checkInAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-500">{new Date(log.checkInAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${METHOD_COLORS[log.method] || 'bg-gray-700 text-gray-400'}`}>
                        {log.method?.replace('_', ' ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{log.notes || '—'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-500">
                      <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:border-gray-700'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
