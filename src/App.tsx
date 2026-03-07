import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { AdminRoute } from './components/AdminRoute';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { StopCard } from './components/StopCard';
import { StopDetail } from './components/StopDetail';
import { MapView } from './components/map';
import { BlogHub } from './components/blog/BlogHub';
import { PublicJournalPage } from './components/blog/PublicJournalPage';
import { MapPage } from './pages/MapPage';
import { AuthCallback } from './pages/AuthCallback';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { useJournalCounts } from './hooks/useJournalCounts';
import type { Stop } from './types';
import stopsData from './data/stops.json';
import './index.css';

const stops = stopsData as Stop[];

function HomePage() {
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { getJournalCount, getPhotoCount } = useJournalCounts();

  const totalDays = useMemo(() => {
    return stops.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0);
  }, []);

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
            {stops.length} stops across {countries.length} countries &bull; {totalDays} days of adventure
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
            <p className="text-2xl font-bold text-white">{totalDays}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 col-span-2">
            <div className="text-slate-400 text-xs mb-1">Route</div>
            <p className="text-sm text-white">
              {stops[0]?.name} &rarr; {stops[stops.length - 1]?.name}
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
              journalCount={getJournalCount(stop.id)}
              photoCount={getPhotoCount(stop.id)}
              onClick={() => setSelectedStop(stop)}
            />
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 mt-8">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <span>&middot;</span>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
        </div>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

function AdminMapPage() {
  const navigate = useNavigate();

  const handleStopSelect = (stop: Stop) => {
    navigate(`/stop/${stop.id}`);
  };

  return <MapView onStopSelect={handleStopSelect} />;
}

function StopPage() {
  const { stopId } = useParams<{ stopId: string }>();
  const navigate = useNavigate();
  const stop = stops.find((s) => s.id === Number(stopId));

  if (!stop) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Stop not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-cyan-400 hover:text-cyan-300"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return <StopDetail stop={stop} onBack={() => navigate('/')} />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Journal homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Stop detail with journal/photos/info */}
          <Route path="/stop/:stopId" element={<StopPage />} />

          {/* Public route map */}
          <Route path="/map" element={<MapPage />} />

          {/* Admin planning map (requires login + admin) */}
          <Route path="/admin/map" element={<AdminRoute><AdminMapPage /></AdminRoute>} />

          {/* Public blog */}
          <Route path="/blog" element={<BlogHub />} />
          <Route path="/blog/:stopSlug/:journalId" element={<PublicJournalPage />} />

          {/* Auth callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Legal pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
