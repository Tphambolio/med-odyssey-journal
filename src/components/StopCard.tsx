import { MapPin, Calendar, Image, BookOpen, ChevronRight } from 'lucide-react';
import type { Stop } from '../types';

interface StopCardProps {
  stop: Stop;
  journalCount: number;
  photoCount: number;
  onClick: () => void;
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

export function StopCard({ stop, journalCount, photoCount, onClick }: StopCardProps) {
  const flag = countryFlags[stop.country] || '🏳️';
  const hasContent = journalCount > 0 || photoCount > 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{flag}</span>
            <h3 className="font-semibold text-white truncate">{stop.name}</h3>
            {hasContent && (
              <span className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {stop.country}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(stop.arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {hasContent && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {photoCount > 0 && (
                <span className="flex items-center gap-1">
                  <Image className="w-3.5 h-3.5" />
                  {photoCount} photo{photoCount !== 1 ? 's' : ''}
                </span>
              )}
              {journalCount > 0 && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {journalCount} entr{journalCount !== 1 ? 'ies' : 'y'}
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}
