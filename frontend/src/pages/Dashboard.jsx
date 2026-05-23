import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsApi } from '../api/dashboard.api';
import { useAuth } from '../store/authContext';
import { Users, CalendarCheck, Dumbbell, Megaphone, TrendingUp, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSkeleton from '../components/LoadingSkeleton';

const statCards = [
  { key: 'totalActiveMembers', label: 'Active Members', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { key: 'todayAttendance', label: "Today's Check-ins", icon: CalendarCheck, color: 'from-emerald-500 to-teal-500' },
  { key: 'activeClasses', label: 'Active Classes', icon: Dumbbell, color: 'from-violet-500 to-purple-500' },
  { key: 'activePromotions', label: 'Promotions', icon: Megaphone, color: 'from-pink-500 to-rose-500' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const gymId = user?.gymId;

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', gymId],
    queryFn: () => getDashboardStatsApi({ gymId }).then((r) => r.data.data),
    enabled: !!gymId,
  });

  if (!gymId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
          <Dumbbell size={40} className="text-indigo-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-200 mb-2">Welcome, Super Admin!</h2>
        <p className="text-gray-400 text-sm">Navigate to Gyms to manage gym locations.</p>
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton rows={8} columns={4} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of your gym performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                <card.icon size={20} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-white">{data?.[card.key] ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <div className="xl:col-span-2 bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Attendance Trend (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.attendanceTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Classes */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            Top 5 Classes
          </h3>
          <div className="space-y-3">
            {(data?.topClasses || []).map((cls, i) => (
              <div key={cls.id} className="flex items-center gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold
                  ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-500'}
                `}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{cls.name}</p>
                  <p className="text-xs text-gray-500">{cls.category}</p>
                </div>
                <span className="text-sm font-semibold text-indigo-400">{cls.totalEnrollments}</span>
              </div>
            ))}
            {(!data?.topClasses || data.topClasses.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* New Members This Month */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">New Members This Month</p>
            <p className="text-2xl font-bold text-white">{data?.newMembersThisMonth ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
