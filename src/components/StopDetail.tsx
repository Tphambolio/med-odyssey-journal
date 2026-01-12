import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Anchor, ExternalLink, Image, BookOpen, Info, Share2 } from 'lucide-react';
import type { Stop } from '../types';
import { useAuth } from '../context/AuthContext';
import { PhotoGallery } from './PhotoGallery';
import { JournalEditor } from './JournalEditor';

interface StopDetailProps {
  stop: Stop;
  onBack: () => void;
}

const countryFlags: Record<string, string> = {
  'Croatia': '🇭🇷',
  'Montenegro': '🇲🇪',
  'Albania': '🇦🇱',
  'Greece': '🇬🇷',
  'Turkey': '🇹🇷',
  'Cyprus': '🇨🇾',
  'Northern Cyprus': '🇨🇾',
  'Italy': '🇮🇹',
};

type Tab = 'photos' | 'journal' | 'info';

export function StopDetail({ stop, onBack }: StopDetailProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('photos');
  const flag = countryFlags[stop.country] || '🏳️';

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to stops</span>
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{flag}</span>
                <h1 className="text-2xl font-bold text-white">{stop.name}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {stop.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(stop.arrival)} - {formatDate(stop.departure)}
                </span>
                <span className="flex items-center gap-1">
                  <Anchor className="w-4 h-4" />
                  {stop.duration}
                </span>
              </div>
            </div>

            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'photos'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4" />
              Photos
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'journal'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Journal
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'info'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4" />
              Info & Links
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'photos' && (
          <PhotoGallery stopId={stop.id} isLoggedIn={!!user} />
        )}

        {activeTab === 'journal' && (
          <JournalEditor stopId={stop.id} isLoggedIn={!!user} />
        )}

        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Notes */}
            {stop.notes && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="font-medium text-white mb-2">Notes</h3>
                <p className="text-slate-400">{stop.notes}</p>
              </div>
            )}

            {/* Culture Highlight */}
            {stop.cultureHighlight && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="font-medium text-white mb-2">Culture Highlight</h3>
                <p className="text-slate-400">{stop.cultureHighlight}</p>
              </div>
            )}

            {/* Links */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-3">Useful Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stop.marinaUrl && (
                  <a
                    href={stop.marinaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <Anchor className="w-4 h-4" />
                    {stop.marinaName || 'Marina'}
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {stop.wikiUrl && (
                  <a
                    href={stop.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    Wikipedia
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {stop.foodUrl && (
                  <a
                    href={stop.foodUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    🍽️
                    Dining
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {stop.adventureUrl && (
                  <a
                    href={stop.adventureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    🏄
                    Activities
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {stop.provisionsUrl && (
                  <a
                    href={stop.provisionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    🛒
                    Provisions
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-3">Location Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Type</span>
                  <p className="text-slate-300 capitalize">{stop.type}</p>
                </div>
                <div>
                  <span className="text-slate-500">Schengen</span>
                  <p className="text-slate-300">{stop.schengen ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Coordinates</span>
                  <p className="text-slate-300">{stop.lat.toFixed(4)}, {stop.lon.toFixed(4)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Season</span>
                  <p className="text-slate-300 capitalize">{stop.season}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
