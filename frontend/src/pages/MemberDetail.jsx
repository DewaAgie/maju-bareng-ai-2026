import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { getMemberApi, assignMembershipApi } from '../api/member.api';
import { getMembershipPlansApi } from '../api/membershipPlan.api';
import { ArrowLeft, CreditCard, Calendar, X, Check, QrCode, Barcode as BarcodeIcon, User } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

const STATUS_COLORS = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  EXPIRED: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

function AssignMembershipModal({ memberId, plans, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ membershipPlanId: '', startDate: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => assignMembershipApi(memberId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['member', memberId] });
      toast.success('Membership assigned successfully');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to assign membership'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.membershipPlanId || !form.startDate) return toast.error('Please fill all fields');
    setSaving(true);
    try {
      await mutation.mutateAsync(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-bold text-white">Assign / Renew Membership</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Membership Plan</label>
            <select
              value={form.membershipPlanId}
              onChange={(e) => setForm((p) => ({ ...p, membershipPlanId: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
            >
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {plan.price?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })} / {plan.durationDays} days
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAssign, setShowAssign] = useState(false);
  const [qrTab, setQrTab] = useState('qr'); // 'qr' | 'barcode'

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => getMemberApi(id).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['membership-plans-dropdown'],
    queryFn: () => getMembershipPlansApi({ isActive: true }).then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSkeleton rows={8} columns={4} />;
  if (!member) return <div className="text-center py-20 text-gray-500">Member not found.</div>;

  const activeMembership = member.memberMemberships?.find((m) => m.status === 'ACTIVE') || member.memberMemberships?.[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{member.fullName}</h1>
          <p className="text-sm text-gray-400">{member.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center mb-5">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.fullName} className="h-20 w-20 rounded-full object-cover ring-2 ring-indigo-500/30 mb-3" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {member.fullName?.charAt(0)}
                </div>
              )}
              <h2 className="font-semibold text-white">{member.fullName}</h2>
              <p className="text-sm text-gray-400">{member.email}</p>
              {member.isActive !== undefined && (
                <span className={`mt-2 text-xs px-2 py-0.5 rounded-full ${member.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Phone', value: member.phone },
                { label: 'Gender', value: member.gender },
                {
                  label: 'Date of Birth',
                  value: member.dateOfBirth
                    ? new Date(member.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                    : null,
                },
                { label: 'Member ID', value: member.id?.slice(0, 8) + '...' },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-300 font-medium text-right max-w-[60%] break-all">{value}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Membership Card */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><CreditCard size={16} className="text-indigo-400" />Membership</h3>
              <button onClick={() => setShowAssign(true)} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors">
                {activeMembership ? 'Renew' : 'Assign'}
              </button>
            </div>
            {activeMembership ? (
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan</span>
                  <span className="text-gray-300 font-medium">{activeMembership.membershipPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[activeMembership.status] || 'bg-gray-700 text-gray-400'}`}>{activeMembership.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start</span>
                  <span className="text-gray-300">{new Date(activeMembership.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End</span>
                  <span className="text-gray-300">{new Date(activeMembership.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-3">No active membership</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* QR & Barcode */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex bg-gray-800 rounded-xl p-1">
                <button onClick={() => setQrTab('qr')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${qrTab === 'qr' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                  <QrCode size={13} />QR Code
                </button>
                <button onClick={() => setQrTab('barcode')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${qrTab === 'barcode' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                  <BarcodeIcon size={13} />Barcode
                </button>
              </div>
            </div>
            <div className="flex justify-center py-4">
              {qrTab === 'qr' ? (
                <div className="p-4 bg-white rounded-2xl">
                  <QRCodeSVG value={member.qrCode || member.id} size={160} />
                </div>
              ) : (
                <div className="p-4 bg-white rounded-2xl">
                  <Barcode value={member.barcodeValue || member.id} height={80} width={1.5} fontSize={12} />
                </div>
              )}
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              {qrTab === 'qr' ? member.qrCode : member.barcodeValue}
            </p>
          </div>

          {/* Attendance History */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-indigo-400" />Recent Attendance
            </h3>
            {member.attendanceLogs && member.attendanceLogs.length > 0 ? (
              <div className="space-y-2">
                {member.attendanceLogs.slice(0, 10).map((att) => (
                  <div key={att.id} className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {new Date(att.checkInAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(att.checkInAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      att.method === 'QR_CODE' ? 'bg-indigo-500/10 text-indigo-400' :
                      att.method === 'BARCODE' ? 'bg-teal-500/10 text-teal-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>{att.method}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No attendance records yet.</p>
            )}
          </div>
        </div>
      </div>

      {showAssign && (
        <AssignMembershipModal
          memberId={id}
          plans={plans}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  );
}
