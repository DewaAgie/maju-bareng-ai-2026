import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicGymApi } from '../api/public.api';
import LandingChatbotWidget from '../components/LandingChatbotWidget';
import { Menu, X, Dumbbell } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', id: 'hero' },
  { label: 'Facilities', id: 'facilities' },
  { label: 'Classes', id: 'classes' },
  { label: 'Coaches', id: 'coaches' },
  { label: 'Membership', id: 'membership' },
  { label: 'Promotions', id: 'promotions' },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function LandingLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: gym } = useQuery({
    queryKey: ['public-gym'],
    queryFn: () => getPublicGymApi().then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const handleNavClick = (id) => {
    setDrawerOpen(false);
    setTimeout(() => scrollTo(id), drawerOpen ? 300 : 0);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Sticky Navbar ──────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => scrollTo('hero')}
              className="flex items-center gap-2 focus:outline-none"
            >
              {gym?.logoUrl ? (
                <img src={gym.logoUrl} alt={gym.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg">
                  <Dumbbell size={18} />
                </div>
              )}
              <span className="text-lg font-bold text-white">{gym?.name || 'GymCore'}</span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleNavClick('register')}
                className="ml-3 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                Join Now
              </button>
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ───────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-72 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <span className="font-semibold text-white">{gym?.name || 'GymCore'}</span>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => handleNavClick('register')}
                className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Content ─────────────────────────────────────────────── */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Dumbbell size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">{gym?.name || 'GymCore'}</span>
              </div>
              {gym?.description && (
                <p className="text-sm text-gray-400 leading-relaxed">{gym.description}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {gym?.address && <li>{gym.address}</li>}
                {gym?.phone && (
                  <li>
                    <a href={`tel:${gym.phone}`} className="hover:text-emerald-400 transition-colors">
                      {gym.phone}
                    </a>
                  </li>
                )}
                {gym?.email && (
                  <li>
                    <a href={`mailto:${gym.email}`} className="hover:text-emerald-400 transition-colors">
                      {gym.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {gym?.name || 'GymCore'}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Chatbot Widget ──────────────────────────────────────────── */}
      <LandingChatbotWidget />
    </div>
  );
}
