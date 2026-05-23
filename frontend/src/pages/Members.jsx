import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMembersApi, createMemberApi } from '../api/member.api';
import { Users, Plus, Search, ChevronRight, X, Check } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

const STATUS_COLORS = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  EXPIRED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function CreateMemberModal({ onClose, onSave }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', gender: '', dateOfBirth: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) return toast.error('Name and email are required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await onSave(fd);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create member');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-bold text-white">New Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email <span className="text-red-400">*</span></label>
            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="john@example.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+62 ..." className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date of Birth</label>
              <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} type="date" className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              Create Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Members() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const limit = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['members', search, status, page],
    queryFn: () => getMembersApi({ search, membershipStatus: status || undefined, page, limit }).then((r) => r.data),
  });

  const members = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: createMemberApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member created');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-sm text-gray-400 mt-1">Manage gym members</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus size={16} />New Member
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search members..."
            className="pl-9 pr-4 py-2.5 bg-gray-900/60 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors w-56" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="py-2.5 px-3 bg-gray-900/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={8} columns={5} />
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {members.map((member) => {
                  const membership = member.memberMemberships?.[0];
                  const memberStatus = membership?.status;
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-900/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold">
                            {member.fullName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-200">{member.fullName}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{member.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{membership?.membershipPlan?.name || '—'}</td>
                      <td className="px-4 py-3">
                        {memberStatus ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[memberStatus] || 'bg-gray-700 text-gray-400'}`}>
                            {memberStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">No plan</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={16} className="text-gray-600 ml-auto" />
                      </td>
                    </tr>
                  );
                })}
                {members.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-500">
                    <Users size={32} className="mx-auto mb-3 opacity-30" />No members found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:border-gray-700'}`}>{p}</button>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateMemberModal
          onClose={() => setShowCreate(false)}
          onSave={(data) => createMutation.mutateAsync(data)}
        />
      )}
    </div>
  );
}
