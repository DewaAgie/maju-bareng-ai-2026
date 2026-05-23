import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getFacilitiesApi, createFacilityApi, updateFacilityApi, deleteFacilityApi } from '../api/facility.api';
import { MapPin, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

function FacilityModal({ facility, onClose, onSave }) {
  const [form, setForm] = useState({
    name: facility?.name || '',
    description: facility?.description || '',
    capacity: facility?.capacity || '',
  });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (form.capacity) fd.append('capacity', form.capacity);
      if (image) fd.append('image', image);
      await onSave(fd);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save facility');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-bold text-white">{facility ? 'Edit Facility' : 'New Facility'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Main Gym Floor"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the facility..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Capacity</label>
            <input name="capacity" value={form.capacity} onChange={handleChange} type="number" min="1" placeholder="Max persons"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 cursor-pointer" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              {facility ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Facilities() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => getFacilitiesApi().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: createFacilityApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); toast.success('Facility created'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFacilityApi(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); toast.success('Facility updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFacilityApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); toast.success('Facility deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete facility'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Facilities</h1>
          <p className="text-sm text-gray-400 mt-1">Manage gym facilities and spaces</p>
        </div>
        <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus size={16} />New Facility
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={3} columns={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {facilities.map((facility) => (
            <div key={facility.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all group">
              {facility.imageUrl ? (
                <div className="h-44 overflow-hidden">
                  <img src={facility.imageUrl} alt={facility.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-44 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                  <MapPin size={36} className="text-indigo-400/40" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-white">{facility.name}</h3>
                  {facility.capacity && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 ml-2">
                      {facility.capacity} cap
                    </span>
                  )}
                </div>
                {facility.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{facility.description}</p>
                )}
                <div className="flex gap-2 pt-3 border-t border-gray-800">
                  <button onClick={() => setModal({ facility })} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                    <Edit2 size={14} />Edit
                  </button>
                  <button onClick={() => setDeleteId(facility.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {facilities.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-500">
              <MapPin size={36} className="mx-auto mb-3 opacity-30" />
              No facilities yet. Add one to get started.
            </div>
          )}
        </div>
      )}

      {modal && (
        <FacilityModal
          facility={modal === 'create' ? null : modal.facility}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === 'create') return createMutation.mutateAsync(data);
            return updateMutation.mutateAsync({ id: modal.facility.id, data });
          }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
            <h3 className="font-bold text-white mb-1">Delete Facility?</h3>
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
