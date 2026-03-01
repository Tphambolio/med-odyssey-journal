import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MapView } from './components/map';
import { StopDetail } from './components/StopDetail';
import { BlogHub } from './components/blog/BlogHub';
import { PublicJournalPage } from './components/blog/PublicJournalPage';
import { AuthCallback } from './pages/AuthCallback';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import type { Stop } from './types';
import stopsData from './data/stops.json';
import './index.css';

const stops = stopsData as Stop[];

function HomePage() {
  const navigate = useNavigate();

  const handleStopSelect = (stop: Stop) => {
    navigate(`/stop/${stop.id}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1">
        <MapView onStopSelect={handleStopSelect} />
      </div>
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 py-3 px-4 text-center z-[1000]">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
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
            Back to map
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
          {/* Map homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Stop detail with journal/photos/info */}
          <Route path="/stop/:stopId" element={<StopPage />} />

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
