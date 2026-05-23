import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCoachesApi, createCoachApi, updateCoachApi, deleteCoachApi } from '../api/coach.api';
import { Dumbbell, Plus, Search, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

function CoachModal({ coach, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: coach?.fullName || '',
    email: coach?.email || '',
    phone: coach?.phone || '',
    bio: coach?.bio || '',
    specializations: coach?.specializations?.join(', ') || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error('Full name is required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('bio', form.bio);
      const specs = form.specializations
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      specs.forEach((s) => fd.append('specializations[]', s));
      if (avatar) fd.append('avatar', avatar);

      await onSave(fd);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save coach');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
          <h2 className="font-bold text-white">{coach ? 'Edit Coach' : 'New Coach'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Jane Smith"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="jane@gym.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+62..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Specializations</label>
            <input name="specializations" value={form.specializations} onChange={handleChange} placeholder="Yoga, HIIT, Strength (comma separated)"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
            <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Brief biography..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Avatar Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 cursor-pointer" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              {coach ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Coaches() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: coaches = [], isLoading } = useQuery({
    queryKey: ['coaches', search, filterActive],
    queryFn: () => getCoachesApi({ search, isActive: filterActive || undefined }).then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: createCoachApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coaches'] }); toast.success('Coach created'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCoachApi(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coaches'] }); toast.success('Coach updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoachApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coaches'] }); toast.success('Coach removed'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete coach'),
  });

  const toggleActive = (coach) => {
    const fd = new FormData();
    fd.append('isActive', !coach.isActive);
    updateMutation.mutate({ id: coach.id, data: fd });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coaches</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your coaching staff</p>
        </div>
        <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus size={16} />New Coach
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coaches..."
            className="pl-9 pr-4 py-2.5 bg-gray-900/60 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors w-56" />
        </div>
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}
          className="py-2.5 px-3 bg-gray-900/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} columns={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coaches.map((coach) => (
            <div key={coach.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                {coach.avatarUrl ? (
                  <img src={coach.avatarUrl} alt={coach.fullName} className="h-12 w-12 rounded-full object-cover shrink-0 ring-2 ring-indigo-500/20" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                    {coach.fullName?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{coach.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{coach.email || '—'}</p>
                </div>
              </div>
              {coach.specializations && coach.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {coach.specializations.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{s}</span>
                  ))}
                </div>
              )}
              {coach.bio && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{coach.bio}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                <button onClick={() => toggleActive(coach)} className={`flex items-center gap-1 text-xs ${coach.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {coach.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {coach.isActive ? 'Active' : 'Inactive'}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => setModal({ coach })} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(coach.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {coaches.length === 0 && (
            <div className="col-span-4 text-center py-12 text-gray-500"><Dumbbell size={32} className="mx-auto mb-3 opacity-30" />No coaches found</div>
          )}
        </div>
      )}

      {modal && (
        <CoachModal
          coach={modal === 'create' ? null : modal.coach}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === 'create') return createMutation.mutateAsync(data);
            return updateMutation.mutateAsync({ id: modal.coach.id, data });
          }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
            <h3 className="font-bold text-white mb-1">Remove Coach?</h3>
            <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-colors text-sm">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium transition-colors text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
