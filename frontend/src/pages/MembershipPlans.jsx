import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getMembershipPlansApi,
  createMembershipPlanApi,
  updateMembershipPlanApi,
  deleteMembershipPlanApi,
} from '../api/membershipPlan.api';
import { CreditCard, Plus, Edit2, Trash2, X, Check, CheckCircle } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

function PlanModal({ plan, onClose, onSave }) {
  const [form, setForm] = useState({
    name: plan?.name || '',
    price: plan?.price || '',
    durationDays: plan?.durationDays || '',
    description: plan?.description || '',
  });
  const [benefits, setBenefits] = useState(
    plan?.benefits?.map((b) => b.description) || ['']
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addBenefit = () => setBenefits((p) => [...p, '']);
  const removeBenefit = (i) => setBenefits((p) => p.filter((_, idx) => idx !== i));
  const updateBenefit = (i, val) => setBenefits((p) => p.map((b, idx) => idx === i ? val : b));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Plan name is required');
    if (!form.price || isNaN(Number(form.price))) return toast.error('Valid price is required');
    if (!form.durationDays || isNaN(Number(form.durationDays))) return toast.error('Valid duration is required');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        description: form.description,
        benefits: benefits.filter((b) => b.trim()),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save plan');
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
          <h2 className="font-bold text-white">{plan ? 'Edit Plan' : 'New Membership Plan'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Plan Name <span className="text-red-400">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Monthly Premium" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Price (IDR) <span className="text-red-400">*</span></label>
              <input name="price" value={form.price} onChange={handleChange} type="number" min="0" placeholder="150000" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Duration (days) <span className="text-red-400">*</span></label>
              <input name="durationDays" value={form.durationDays} onChange={handleChange} type="number" min="1" placeholder="30" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Optional description..."
              className={`${inputClass} resize-none`} />
          </div>

          {/* Benefits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Benefits</label>
              <button type="button" onClick={addBenefit} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <Plus size={13} />Add benefit
              </button>
            </div>
            <div className="space-y-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  <input
                    value={benefit}
                    onChange={(e) => updateBenefit(i, e.target.value)}
                    placeholder={`Benefit ${i + 1}...`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  {benefits.length > 1 && (
                    <button type="button" onClick={() => removeBenefit(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              {plan ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MembershipPlans() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: () => getMembershipPlansApi().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: createMembershipPlanApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['membership-plans'] }); toast.success('Plan created'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMembershipPlanApi(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['membership-plans'] }); toast.success('Plan updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMembershipPlanApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['membership-plans'] }); toast.success('Plan deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete plan'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Membership Plans</h1>
          <p className="text-sm text-gray-400 mt-1">Manage pricing and membership options</p>
        </div>
        <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus size={16} />New Plan
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={3} columns={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.id} className={`rounded-2xl border p-6 flex flex-col hover:scale-[1.01] transition-all ${plan.isActive ? 'bg-gray-900/60 border-gray-800 hover:border-indigo-500/30' : 'bg-gray-900/30 border-gray-800/50 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  {plan.description && <p className="text-xs text-gray-400 mt-0.5">{plan.description}</p>}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => setModal({ plan })} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(plan.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-indigo-400">
                    {Number(plan.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{plan.durationDays} days</p>
              </div>

              {plan.benefits && plan.benefits.length > 0 && (
                <ul className="space-y-1.5 flex-1">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit.id} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      {benefit.description}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 pt-4 border-t border-gray-800">
                <span className={`text-xs px-2 py-0.5 rounded-full ${plan.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-500">
              <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
              No membership plans yet.
            </div>
          )}
        </div>
      )}

      {modal && (
        <PlanModal
          plan={modal === 'create' ? null : modal.plan}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === 'create') return createMutation.mutateAsync(data);
            return updateMutation.mutateAsync({ id: modal.plan.id, data });
          }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
            <h3 className="font-bold text-white mb-1">Delete Plan?</h3>
            <p className="text-sm text-gray-400 mb-5">This may affect existing memberships.</p>
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
