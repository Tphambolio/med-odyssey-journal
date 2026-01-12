import type { Phase } from '../../types';

interface MapLegendProps {
  phases: Phase[];
  selectedPhase?: string;
  onPhaseClick?: (phaseName: string | null) => void;
}

export function MapLegend({ phases, selectedPhase, onPhaseClick }: MapLegendProps) {
  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
      <div className="text-xs text-slate-400 mb-2 font-medium">Countries</div>
      <div className="space-y-1">
        {onPhaseClick && (
          <button
            onClick={() => onPhaseClick(null)}
            className={`flex items-center gap-2 w-full px-2 py-1 rounded text-left text-sm transition-colors ${
              !selectedPhase
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
            <span>All Countries</span>
          </button>
        )}
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => onPhaseClick?.(phase.name)}
            disabled={!onPhaseClick}
            className={`flex items-center gap-2 w-full px-2 py-1 rounded text-left text-sm transition-colors ${
              selectedPhase === phase.name
                ? 'bg-slate-700 text-white'
                : onPhaseClick
                ? 'text-slate-300 hover:bg-slate-700/50'
                : 'text-slate-300 cursor-default'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: phase.color }}
            />
            <span className="truncate">{phase.name}</span>
            <span className="text-slate-500 text-xs ml-auto">{phase.stops}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
