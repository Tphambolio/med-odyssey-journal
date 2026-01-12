import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { StopCard } from './components/StopCard';
import { StopDetail } from './components/StopDetail';
import { BlogHub } from './components/blog/BlogHub';
import { PublicJournalPage } from './components/blog/PublicJournalPage';
import type { Stop, Phase } from './types';
import stopsData from './data/stops.json';
import phasesData from './data/phases.json';
import './index.css';

const stops = stopsData as Stop[];
const phases = phasesData as Phase[];

function AppContent() {
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const countries = useMemo(() => {
    const unique = [...new Set(stops.map((s) => s.country))];
    return unique.sort();
  }, []);

  const filteredStops = useMemo(() => {
    return stops.filter((stop) => {
      const matchesSearch =
        searchQuery === '' ||
        stop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stop.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry =
        countryFilter === 'all' || stop.country === countryFilter;

      return matchesSearch && matchesCountry;
    });
  }, [searchQuery, countryFilter]);

  // Mock counts - in real app these would come from Supabase
  const getJournalCount = () => 0;
  const getPhotoCount = () => 0;

  if (selectedStop) {
    return (
      <StopDetail stop={selectedStop} onBack={() => setSelectedStop(null)} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header onAuthClick={() => setAuthModalOpen(true)} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Mediterranean Odyssey 2026-2027
          </h2>
          <p className="text-slate-400">
            {stops.length} stops across {phases.length} countries • 299 days of adventure
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stops..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>

          {showFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800 rounded-xl border border-slate-700">
              <button
                onClick={() => setCountryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  countryFilter === 'all'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All Countries
              </button>
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => setCountryFilter(country)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    countryFilter === country
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Stops</span>
            </div>
            <p className="text-2xl font-bold text-white">{filteredStops.length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Days</span>
            </div>
            <p className="text-2xl font-bold text-white">299</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 col-span-2">
            <div className="text-slate-400 text-xs mb-1">Route</div>
            <p className="text-sm text-white">
              {stops[0]?.name} → {stops[stops.length - 1]?.name}
            </p>
          </div>
        </div>

        {/* Stops List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            {filteredStops.length} {filteredStops.length === 1 ? 'Stop' : 'Stops'}
          </h3>

          {filteredStops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              journalCount={getJournalCount()}
              photoCount={getPhotoCount()}
              onClick={() => setSelectedStop(stop)}
            />
          ))}
        </div>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public blog routes */}
          <Route path="/blog" element={<BlogHub />} />
          <Route path="/blog/:stopSlug/:journalId" element={<PublicJournalPage />} />

          {/* Private app routes */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
