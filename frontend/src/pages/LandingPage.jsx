import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  getPublicGymApi,
  getPublicFacilitiesApi,
  getPublicClassesApi,
  getPublicCoachesApi,
  getPublicMembershipPlansApi,
  getPublicPromotionsApi,
  getPublicSchedulesApi,
  registerPublicMemberApi,
} from '../api/public.api';
import {
  Dumbbell,
  Users,
  Star,
  Heart,
  ChevronRight,
  Check,
  X,
  Calendar,
  Clock,
  MapPin,
  Tag,
  ArrowRight,
} from 'lucide-react';

// ── Zod schema ──────────────────────────────────────────────────────────────
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  membershipPlanId: z.string().optional(),
});

// ── Constants ────────────────────────────────────────────────────────────────
const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-900/60 border border-gray-800 rounded-2xl p-6 h-48" />
      ))}
    </div>
  );
}

// ── Schedule Modal ────────────────────────────────────────────────────────────
function ScheduleModal({ isOpen, onClose, grouped }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-emerald-400" />
            Weekly Class Schedule
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-auto flex-1 p-6">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {DAY_ORDER.map((day) => (
              <div key={day} className="flex flex-col gap-2">
                <div className="text-center py-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  {DAY_LABELS[day]}
                </div>
                {(grouped?.[day] || []).length === 0 && (
                  <p className="text-center text-xs text-gray-600 py-3">—</p>
                )}
                {(grouped?.[day] || []).map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-xs"
                  >
                    <p className="font-semibold text-gray-100 leading-tight">{slot.class?.name}</p>
                    <p className="text-gray-400 mt-1">
                      {slot.startTime} – {slot.endTime}
                    </p>
                    <p className="text-emerald-400 text-[10px] mt-0.5">{slot.coach?.fullName}</p>
                    <p className="text-gray-500 text-[10px]">{slot.facility?.name}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [registered, setRegistered] = useState(false);

  // ── Data Fetching ────────────────────────────────────────────────────────
  const { data: gym } = useQuery({
    queryKey: ['public-gym'],
    queryFn: () => getPublicGymApi().then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const { data: facilities = [], isLoading: loadingFacilities } = useQuery({
    queryKey: ['public-facilities'],
    queryFn: () => getPublicFacilitiesApi().then((r) => r.data.data),
  });

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['public-classes'],
    queryFn: () => getPublicClassesApi().then((r) => r.data.data),
  });

  const { data: coaches = [], isLoading: loadingCoaches } = useQuery({
    queryKey: ['public-coaches'],
    queryFn: () => getPublicCoachesApi().then((r) => r.data.data),
  });

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['public-membership-plans'],
    queryFn: () => getPublicMembershipPlansApi().then((r) => r.data.data),
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ['public-promotions'],
    queryFn: () => getPublicPromotionsApi().then((r) => r.data.data),
  });

  const { data: scheduleData } = useQuery({
    queryKey: ['public-schedules'],
    queryFn: () => getPublicSchedulesApi().then((r) => r.data.data),
  });

  // ── Categories ────────────────────────────────────────────────────────────
  const categories = ['ALL', ...Array.from(new Set(classes.map((c) => c.category).filter(Boolean)))];
  const filteredClasses =
    activeCategory === 'ALL' ? classes : classes.filter((c) => c.category === activeCategory);

  // ── Registration Form ─────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { membershipPlanId: '' },
  });

  const { mutate: registerMember, isPending: registering } = useMutation({
    mutationFn: registerPublicMemberApi,
    onSuccess: () => {
      setRegistered(true);
      reset();
      toast.success('Registration submitted! We will contact you to activate your membership.');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg);
    },
  });

  const onSubmit = (data) => {
    const payload = { ...data };
    if (!payload.membershipPlanId) delete payload.membershipPlanId;
    registerMember(payload);
  };

  const handleChoosePlan = (planId) => {
    setSelectedPlanId(planId);
    setValue('membershipPlanId', planId);
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-950 text-gray-100">

      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #10b981 0%, transparent 50%), radial-gradient(circle at 70% 60%, #0d9488 0%, transparent 50%)' }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8">
            <Dumbbell size={14} />
            <span>Your fitness journey starts here</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Train Harder.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Live Better.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {gym?.description ||
              'World-class equipment, expert coaches, and a community that pushes you to be your best every single day.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() =>
                document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              Join Now
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() =>
                document.getElementById('facilities')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-semibold text-lg transition-all hover:bg-gray-800/50"
            >
              Explore
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. VALUE PROPOSITION ─────────────────────────────────────── */}
      <section className="py-16 border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Dumbbell, title: 'Expert Coaches', desc: 'Certified trainers dedicated to your goals' },
              { icon: Star, title: 'Modern Equipment', desc: 'State-of-the-art machines and free weights' },
              { icon: Tag, title: 'Flexible Plans', desc: 'Membership options for every lifestyle' },
              { icon: Heart, title: 'Community Driven', desc: 'A supportive family that grows together' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-4">
                  <item.icon size={24} className="text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FACILITIES ────────────────────────────────────────────── */}
      <section id="facilities" className="py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Our Facilities</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Premium spaces designed to elevate every workout experience.
            </p>
          </div>

          {loadingFacilities ? (
            <CardSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group"
                >
                  {facility.imageUrl ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={facility.imageUrl}
                        alt={facility.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                      <MapPin size={40} className="text-emerald-400/50" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{facility.name}</h3>
                      {facility.capacity && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {facility.capacity} capacity
                        </span>
                      )}
                    </div>
                    {facility.description && (
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                        {facility.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {facilities.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  No facilities listed yet.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 4 & 5. CLASSES + SCHEDULE MODAL ─────────────────────────── */}
      <section id="classes" className="py-20 bg-gray-900/40 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Classes</h2>
              <p className="text-gray-400">Find the perfect class for your fitness level.</p>
            </div>
            <button
              onClick={() => setScheduleOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-sm font-medium self-start sm:self-auto"
            >
              <Calendar size={16} />
              View Schedule
            </button>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loadingClasses ? (
            <CardSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group"
                >
                  {cls.imageUrl ? (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={cls.imageUrl}
                        alt={cls.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                      <Dumbbell size={36} className="text-emerald-400/50" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {cls.category}
                      </span>
                      {cls.durationMinutes && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={10} />
                          {cls.durationMinutes} min
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-1">{cls.name}</h3>
                    {cls.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{cls.description}</p>
                    )}
                    {cls.maxCapacity && (
                      <p className="text-xs text-gray-500 mt-2">Max {cls.maxCapacity} participants</p>
                    )}
                  </div>
                </div>
              ))}
              {filteredClasses.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  No classes in this category.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <ScheduleModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        grouped={scheduleData?.grouped}
      />

      {/* ── 6. COACHES ───────────────────────────────────────────────── */}
      <section id="coaches" className="py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Meet Our Coaches</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Passionate experts committed to helping you reach your potential.
            </p>
          </div>

          {loadingCoaches ? (
            <CardSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {coaches.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-all"
                >
                  {coach.avatarUrl ? (
                    <img
                      src={coach.avatarUrl}
                      alt={coach.fullName}
                      className="h-20 w-20 rounded-full object-cover mx-auto mb-4 ring-2 ring-emerald-500/30"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                      {coach.fullName?.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold text-white mb-1">{coach.fullName}</h3>
                  {coach.specializations && coach.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {coach.specializations.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                  {coach.bio && (
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{coach.bio}</p>
                  )}
                </div>
              ))}
              {coaches.length === 0 && (
                <div className="col-span-4 text-center py-12 text-gray-500">
                  No coaches listed yet.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 7. MEMBERSHIP PLANS ──────────────────────────────────────── */}
      <section id="membership" className="py-20 bg-gray-900/40 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Membership Plans</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose a plan that fits your goals and budget.
            </p>
          </div>

          {loadingPlans ? (
            <CardSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {plans.map((plan, i) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-6 flex flex-col transition-all hover:scale-[1.02] ${
                    i === 1
                      ? 'bg-gradient-to-b from-emerald-900/40 to-teal-900/40 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-gray-900/60 border-gray-800'
                  }`}
                >
                  {i === 1 && (
                    <div className="text-center mb-4">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-500 text-white font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-extrabold text-emerald-400">
                      {plan.price?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    {plan.durationDays} days access
                  </p>

                  {plan.benefits && plan.benefits.length > 0 && (
                    <ul className="space-y-2 flex-1 mb-6">
                      {plan.benefits.map((benefit) => (
                        <li key={benefit.id} className="flex items-start gap-2 text-sm text-gray-300">
                          <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                          {benefit.description}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => handleChoosePlan(plan.id)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      i === 1
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    } ${selectedPlanId === plan.id ? 'ring-2 ring-emerald-400' : ''}`}
                  >
                    {selectedPlanId === plan.id ? 'Selected' : 'Choose Plan'}
                  </button>
                </div>
              ))}
              {plans.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  No membership plans available yet.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 8. PROMOTIONS ────────────────────────────────────────────── */}
      {promotions.length > 0 && (
        <section id="promotions" className="py-20 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Active Promotions</h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Take advantage of these limited-time offers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all"
                >
                  {promo.imageUrl && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={promo.imageUrl}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{promo.title}</h3>
                      <span className="shrink-0 ml-2 px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-semibold">
                        {promo.discountType === 'PERCENTAGE'
                          ? `${promo.discountValue}% OFF`
                          : `IDR ${promo.discountValue?.toLocaleString()} OFF`}
                      </span>
                    </div>
                    {promo.description && (
                      <p className="text-sm text-gray-400 mb-3">{promo.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Valid until{' '}
                      {new Date(promo.endDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 9. REGISTRATION FORM ─────────────────────────────────────── */}
      <section id="register" className="py-20 bg-gray-900/40 scroll-mt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Join Today</h2>
            <p className="text-gray-400">
              Fill in your details and we'll get you started on your fitness journey.
            </p>
          </div>

          {registered ? (
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mx-auto mb-4">
                <Check size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Registration Submitted!</h3>
              <p className="text-gray-300 mb-6">
                Thank you for joining! We'll contact you soon to activate your membership.
              </p>
              <button
                onClick={() => setRegistered(false)}
                className="px-6 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-sm"
              >
                Register Another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 space-y-5"
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('fullName')}
                  placeholder="John Doe"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
                {errors.fullName && (
                  <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                <input
                  {...register('phone')}
                  placeholder="+62 812 3456 7890"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>

              {/* Gender & DOB */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                  />
                </div>
              </div>

              {/* Membership Plan */}
              {plans.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Membership Plan
                  </label>
                  <select
                    {...register('membershipPlanId')}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                  >
                    <option value="">Select a plan (optional)</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} —{' '}
                        {plan.price?.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        })}{' '}
                        / {plan.durationDays} days
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {registering ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Users size={18} />
                    Register Now
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
