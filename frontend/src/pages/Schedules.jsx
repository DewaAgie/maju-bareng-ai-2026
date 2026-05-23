import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSchedulesApi, createScheduleApi, updateScheduleApi, deleteScheduleApi } from '../api/schedule.api';
import { getClassesApi } from '../api/class.api';
import { getCoachesApi } from '../api/coach.api';
import { getFacilitiesApi } from '../api/facility.api';
import { Calendar, Plus, Edit2, Trash2, X, Check, List, LayoutGrid } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' };
const DAY_FULL = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' };
const DAY_OPTIONS = DAY_ORDER.map((d) => ({ value: d, label: DAY_FULL[d] }));

function ScheduleModal({ schedule, classes, coaches, facilities, onClose, onSave }) {
  const [form, setForm] = useState({
    classId: schedule?.classId || '',
    coachId: schedule?.coachId || '',
    facilityId: schedule?.facilityId || '',
    dayOfWeek: schedule?.dayOfWeek || '',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.classId || !form.coachId || !form.facilityId || !form.dayOfWeek || !form.startTime || !form.endTime) {
      return toast.error('All fields are required');
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const selectClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-bold text-white">{schedule ? 'Edit Schedule' : 'New Schedule'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Class</label>
            <select name="classId" value={form.classId} onChange={handleChange} className={selectClass}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Coach</label>
              <select name="coachId" value={form.coachId} onChange={handleChange} className={selectClass}>
                <option value="">Select coach</option>
                {coaches.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Facility</label>
              <select name="facilityId" value={form.facilityId} onChange={handleChange} className={selectClass}>
                <option value="">Select facility</option>
                {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Day of Week</label>
            <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} className={selectClass}>
              <option value="">Select day</option>
              {DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Time</label>
              <input name="startTime" value={form.startTime} onChange={handleChange} type="time"
                className={selectClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">End Time</label>
              <input name="endTime" value={form.endTime} onChange={handleChange} type="time"
                className={selectClass} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              {schedule ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Schedules() {
  const qc = useQueryClient();
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => getSchedulesApi().then((r) => r.data.data),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-dropdown'],
    queryFn: () => getClassesApi({ isActive: true }).then((r) => r.data.data),
  });

  const { data: coaches = [] } = useQuery({
    queryKey: ['coaches-dropdown'],
    queryFn: () => getCoachesApi({ isActive: true }).then((r) => r.data.data),
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ['facilities-dropdown'],
    queryFn: () => getFacilitiesApi().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: createScheduleApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Schedule created'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateScheduleApi(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Schedule updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScheduleApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Schedule deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete schedule'),
  });

  const grouped = schedules.reduce((acc, s) => {
    if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
    acc[s.dayOfWeek].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedules</h1>
          <p className="text-sm text-gray-400 mt-1">Manage weekly class schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-900/60 border border-gray-800 rounded-xl p-1">
            <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'calendar' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              <LayoutGrid size={14} />Calendar
            </button>
            <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              <List size={14} />List
            </button>
          </div>
          <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Plus size={16} />New Schedule
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} columns={7} />
      ) : view === 'calendar' ? (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[900px]">
            {DAY_ORDER.map((day) => (
              <div key={day} className="flex flex-col gap-2">
                <div className="text-center py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  {DAY_LABELS[day]}
                </div>
                {(grouped[day] || [])
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((slot) => (
                    <div key={slot.id} className="bg-gray-900/60 border border-indigo-500/20 rounded-xl p-3 group relative">
                      <p className="font-medium text-gray-200 text-xs leading-tight">{slot.class?.name}</p>
                      <p className="text-[10px] text-indigo-400 mt-1">{slot.startTime} – {slot.endTime}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{slot.coach?.fullName}</p>
                      <p className="text-[10px] text-gray-500">{slot.facility?.name}</p>
                      <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                        <button onClick={() => setModal({ schedule: slot })} className="p-1 rounded bg-gray-800 text-gray-400 hover:text-indigo-400 transition-colors">
                          <Edit2 size={11} />
                        </button>
                        <button onClick={() => setDeleteId(slot.id)} className="p-1 rounded bg-gray-800 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                {(!grouped[day] || grouped[day].length === 0) && (
                  <div className="text-center py-6 text-xs text-gray-600 border border-dashed border-gray-800 rounded-xl">No class</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-800">
                  {['Day', 'Class', 'Coach', 'Facility', 'Time', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {schedules
                  .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime))
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-gray-900/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{DAY_LABELS[s.dayOfWeek]}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-200">{s.class?.name}</td>
                      <td className="px-4 py-3 text-gray-400">{s.coach?.fullName}</td>
                      <td className="px-4 py-3 text-gray-400">{s.facility?.name}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{s.startTime} – {s.endTime}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setModal({ schedule: s })} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"><Edit2 size={15} /></button>
                          <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {schedules.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-500">No schedules yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <ScheduleModal
          schedule={modal === 'create' ? null : modal.schedule}
          classes={classes}
          coaches={coaches}
          facilities={facilities}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === 'create') return createMutation.mutateAsync(data);
            return updateMutation.mutateAsync({ id: modal.schedule.id, data });
          }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
            <h3 className="font-bold text-white mb-1">Delete Schedule?</h3>
            <p className="text-sm text-gray-400 mb-5">This slot will be removed from the calendar.</p>
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
