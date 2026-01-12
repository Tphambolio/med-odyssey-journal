import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Anchor, Calendar, MapPin } from 'lucide-react';
import { RouteMap, MapLegend } from '../components/map';
import stopsData from '../data/stops.json';
import phasesData from '../data/phases.json';
import type { Stop, Phase } from '../types';

const stops = stopsData as Stop[];
const phases = phasesData as Phase[];

export function MapPage() {
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  // Filter stops by selected phase
  const filteredStops = useMemo(() => {
    if (!selectedPhase) return stops;
    return stops.filter((s) => s.phase === selectedPhase);
  }, [selectedPhase]);

  // Get highlighted stop IDs (for the currently selected phase)
  const highlightedStopIds = useMemo(() => {
    return filteredStops.map((s) => s.id);
  }, [filteredStops]);

  // Calculate stats for filtered stops
  const stats = useMemo(() => {
    const totalStops = filteredStops.length;
    const countries = [...new Set(filteredStops.map((s) => s.country))].length;

    // Calculate total days
    let totalDays = 0;
    filteredStops.forEach((stop) => {
      const durationMatch = stop.duration.match(/(\d+)/);
      if (durationMatch) {
        totalDays += parseInt(durationMatch[1], 10);
      }
    });

    return { totalStops, countries, totalDays };
  }, [filteredStops]);

  const handleStopClick = (stop: Stop) => {
    setSelectedStop(stop);
  };

  const handleViewJournals = (stop: Stop) => {
    // Navigate to the blog filtered by stop (or directly to stop detail)
    navigate(`/blog?stop=${stop.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/blog"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Blog</span>
            </Link>

            <div className="flex items-center gap-2 text-white">
              <Compass className="w-5 h-5 text-cyan-500" />
              <span className="font-medium">Mediterranean Odyssey</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Title & Stats */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <Anchor className="w-7 h-7 text-cyan-500" />
            Route Map
          </h1>
          <p className="text-slate-400">
            {selectedPhase ? `${selectedPhase} - ` : ''}
            {stats.totalStops} stops across {stats.countries} {stats.countries === 1 ? 'country' : 'countries'} &bull; {stats.totalDays} days
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <RouteMap
              stops={stops}
              phases={phases}
              height="calc(100vh - 250px)"
              highlightedStops={highlightedStopIds}
              onStopClick={handleStopClick}
              showAllStops={true}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Legend */}
            <MapLegend
              phases={phases}
              selectedPhase={selectedPhase || undefined}
              onPhaseClick={setSelectedPhase}
            />

            {/* Selected Stop Details */}
            {selectedStop && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{selectedStop.name}</h3>
                    <p className="text-sm text-slate-400">{selectedStop.country}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStop(null)}
                    className="text-slate-500 hover:text-white"
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{selectedStop.arrival}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{selectedStop.type}</span>
                  </div>
                  {selectedStop.notes && (
                    <p className="text-slate-400 text-xs mt-2">{selectedStop.notes}</p>
                  )}
                </div>

                <button
                  onClick={() => handleViewJournals(selectedStop)}
                  className="mt-4 w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors"
                >
                  View Journals
                </button>
              </div>
            )}

            {/* Journey Overview */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-3">Journey Overview</h3>
              <div className="text-sm text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Start</span>
                  <span className="text-white">{stops[0]?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>End</span>
                  <span className="text-white">{stops[stops.length - 1]?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Stops</span>
                  <span className="text-white">{stops.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Countries</span>
                  <span className="text-white">{phases.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
