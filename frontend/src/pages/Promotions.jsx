import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getPromotionsApi,
  createPromotionApi,
  updatePromotionApi,
  deletePromotionApi,
} from '../api/promotion.api';
import { Megaphone, Plus, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

function PromotionModal({ promotion, onClose, onSave }) {
  const [form, setForm] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    discountType: promotion?.discountType || 'PERCENTAGE',
    discountValue: promotion?.discountValue || '',
    startDate: promotion?.startDate ? promotion.startDate.split('T')[0] : '',
    endDate: promotion?.endDate ? promotion.endDate.split('T')[0] : '',
  });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.discountValue || isNaN(Number(form.discountValue))) return toast.error('Valid discount value required');
    if (!form.startDate || !form.endDate) return toast.error('Start and end dates are required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (image) fd.append('image', image);
      await onSave(fd);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
          <h2 className="font-bold text-white">{promotion ? 'Edit Promotion' : 'New Promotion'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title <span className="text-red-400">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. New Year Special" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Optional description..."
              className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Discount Type</label>
              <select name="discountType" value={form.discountType} onChange={handleChange} className={inputClass}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (IDR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Discount Value <span className="text-red-400">*</span></label>
              <input name="discountValue" value={form.discountValue} onChange={handleChange} type="number" min="0"
                placeholder={form.discountType === 'PERCENTAGE' ? '20' : '50000'} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Date <span className="text-red-400">*</span></label>
              <input name="startDate" value={form.startDate} onChange={handleChange} type="date" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">End Date <span className="text-red-400">*</span></label>
              <input name="endDate" value={form.endDate} onChange={handleChange} type="date" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Promotion Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 cursor-pointer" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              {promotion ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Promotions() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => getPromotionsApi().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: createPromotionApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }); toast.success('Promotion created'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePromotionApi(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }); toast.success('Promotion updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromotionApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }); toast.success('Promotion deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete promotion'),
  });

  const toggleActive = (promo) => {
    const fd = new FormData();
    fd.append('isActive', !promo.isActive);
    updateMutation.mutate({ id: promo.id, data: fd });
  };

  const isExpired = (endDate) => new Date(endDate) < new Date();
  const isUpcoming = (startDate) => new Date(startDate) > new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Promotions</h1>
          <p className="text-sm text-gray-400 mt-1">Manage discounts and special offers</p>
        </div>
        <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus size={16} />New Promotion
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} columns={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {promotions.map((promo) => {
            const expired = isExpired(promo.endDate);
            const upcoming = isUpcoming(promo.startDate);
            return (
              <div key={promo.id} className={`bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all group ${expired ? 'opacity-60' : ''}`}>
                {promo.imageUrl ? (
                  <div className="h-40 overflow-hidden">
                    <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center">
                    <Tag size={36} className="text-pink-400/40" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white leading-tight">{promo.title}</h3>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-semibold">
                        {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `IDR ${Number(promo.discountValue).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                  {promo.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{promo.description}</p>}
                  <div className="text-xs text-gray-500 mb-3">
                    {new Date(promo.startDate).toLocaleDateString()} — {new Date(promo.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        expired ? 'bg-gray-700 text-gray-400 border-gray-600' :
                        upcoming ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        promo.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-700 text-gray-400 border-gray-600'
                      }`}>
                        {expired ? 'Expired' : upcoming ? 'Upcoming' : promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!expired && (
                        <button onClick={() => toggleActive(promo)} className={`text-sm ${promo.isActive ? 'text-emerald-400' : 'text-gray-500'} hover:opacity-80 transition-opacity`} title="Toggle active">
                          {promo.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                      )}
                      <button onClick={() => setModal({ promotion: promo })} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteId(promo.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {promotions.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-500">
              <Megaphone size={36} className="mx-auto mb-3 opacity-30" />
              No promotions yet.
            </div>
          )}
        </div>
      )}

      {modal && (
        <PromotionModal
          promotion={modal === 'create' ? null : modal.promotion}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === 'create') return createMutation.mutateAsync(data);
            return updateMutation.mutateAsync({ id: modal.promotion.id, data });
          }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
            <h3 className="font-bold text-white mb-1">Delete Promotion?</h3>
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
