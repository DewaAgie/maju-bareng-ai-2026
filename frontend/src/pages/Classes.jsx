import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getClassesApi, createClassApi, updateClassApi, deleteClassApi } from '../api/class.api';
import { Dumbbell, Plus, Search, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CATEGORIES = ['Yoga', 'HIIT', 'Spinning', 'Pilates', 'Zumba', 'Boxing', 'CrossFit', 'Swimming', 'Strength', 'Cardio', 'Other'];

function ClassModal({ cls, onClose, onSave }) {
  const [form, setForm] = useState({
    name: cls?.name || '',
    description: cls?.description || '',
    category: cls?.category || '',
    durationMinutes: cls?.durationMinutes || '',
    maxCapacity: cls?.maxCapacity || '',
  });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Class name is required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (image) fd.append('image', image);
      await onSave(fd);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
          <h2 className="font-bold text-white">{cls ? 'Edit Class' : 'New Class'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Morning Yoga"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors">
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Duration (min)</label>
              <input name="durationMinutes" value={form.durationMinutes} onChange={handleChange} type="number" min="1" placeholder="60"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Max Capacity</label>
            <input name="maxCapacity" value={form.maxCapacity} onChange={handleChange} type="number" min="1" placeholder="20"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe this class..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Class Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 cursor-pointer" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              {cls ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Classes() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes', search, filterCat],
    queryFn: () => getClassesApi({ search, category: filterCat || undefined }).then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: createClassApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); toast.success('Class created'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateClassApi(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); toast.success('Class updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClassApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); toast.success('Class deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete class'),
  });

  const toggleActive = (cls) => {
    const fd = new FormData();
    fd.append('isActive', !cls.isActive);
    updateMutation.mutate({ id: cls.id, data: fd });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Classes</h1>
          <p className="text-sm text-gray-400 mt-1">Manage fitness classes offered at your gym</p>
        </div>
        <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus size={16} />New Class
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search classes..."
            className="pl-9 pr-4 py-2.5 bg-gray-900/60 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors w-56" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="py-2.5 px-3 bg-gray-900/60 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-colors">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} columns={5} />
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Class</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Capacity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {cls.imageUrl ? (
                          <img src={cls.imageUrl} alt={cls.name} className="h-9 w-9 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <Dumbbell size={16} className="text-indigo-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-200">{cls.name}</p>
                          {cls.description && <p className="text-xs text-gray-500 truncate max-w-[180px]">{cls.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {cls.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">{cls.category}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{cls.durationMinutes ? `${cls.durationMinutes} min` : '—'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{cls.maxCapacity || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(cls)} className={`flex items-center gap-1 text-xs ${cls.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {cls.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {cls.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setModal({ cls })} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteId(cls.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {classes.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-500">No classes found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <ClassModal
          cls={modal === 'create' ? null : modal.cls}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === 'create') return createMutation.mutateAsync(data);
            return updateMutation.mutateAsync({ id: modal.cls.id, data });
          }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
            <h3 className="font-bold text-white mb-1">Delete Class?</h3>
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
