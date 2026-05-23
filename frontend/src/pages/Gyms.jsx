import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getGymsApi, createGymApi, updateGymApi, deleteGymApi } from '../api/gym.api';
import { Building2, Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

function GymModal({ gym, onClose, onSave }) {
  const [form, setForm] = useState({
    name: gym?.name || '',
    address: gym?.address || '',
    phone: gym?.phone || '',
    email: gym?.email || '',
    description: gym?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Gym name is required');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save gym');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-bold text-white">{gym ? 'Edit Gym' : 'New Gym'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: 'Gym Name', name: 'name', required: true, placeholder: 'e.g. FitZone Central' },
            { label: 'Address', name: 'address', placeholder: 'Street, City' },
            { label: 'Phone', name: 'phone', placeholder: '+62 ...' },
            { label: 'Email', name: 'email', placeholder: 'contact@gym.com' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </label>
              <input
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the gym..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {gym ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Gyms() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | { gym }
  const [deleteId, setDeleteId] = useState(null);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['gyms', search, page],
    queryFn: () => getGymsApi({ search, page, limit }).then((r) => r.data),
  });

  const gyms = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: createGymApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gyms'] });
      toast.success('Gym created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateGymApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gyms'] });
      toast.success('Gym updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGymApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gyms'] });
      toast.success('Gym deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete gym'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gyms</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all gym locations</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Gym
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search gyms..."
          className="w-full pl-9 pr-4 py-2.5 bg-gray-900/60 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton rows={6} columns={5} />
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Address</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {gyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                          <Building2 size={16} className="text-indigo-400" />
                        </div>
                        <span className="font-medium text-gray-200">{gym.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{gym.address || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{gym.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{gym.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        gym.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {gym.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setModal({ gym })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(gym.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {gyms.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">No gyms found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm transition-colors ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <GymModal
          gym={modal === 'create' ? null : modal.gym}
          onClose={() => setModal(null)}
          onSave={(formData) => {
            if (modal === 'create') return createMutation.mutateAsync(formData);
            return updateMutation.mutateAsync({ id: modal.gym.id, data: formData });
          }}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-4">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Delete Gym?</h3>
            <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-colors text-sm">
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
