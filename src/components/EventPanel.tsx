import React, { useState } from 'react';
import {
  Play, Pause, Eye, EyeOff,
  AlertCircle, AlertTriangle, Info,
  Clock, Settings, Layers
} from 'lucide-react';
import { useStore } from '../store/useStore';

const severityIcons = {
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle
};

const severityColors = {
  info: 'var(--accent)',
  warn: 'var(--status-warn)',
  error: 'var(--status-alarm)'
};

export function EventPanel() {
  const { events, ui, hubs } = useStore();
  const { 
    togglePause, setSpeed, toggleLayer, setFocusHub 
  } = useStore();
  
  const [showControls, setShowControls] = useState(true);

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getHubName = (hubId?: string) => {
    if (!hubId) return null;
    const hub = hubs.find(h => h.id === hubId);
    return hub?.name;
  };

  return (
    <div className="event-panel bg-[var(--bg-primary)] flex flex-col">
      {/* Controls Header */}
      <div className="p-4 border-b border-[var(--bg-tertiary)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--fg-primary)]">Control Center</h2>
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-2 rounded hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>

        {showControls && (
          <div className="space-y-4">
            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--fg-secondary)] text-sm">Simulation</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePause}
                  className="flex items-center gap-1 px-3 py-1 bg-[var(--bg-secondary)] rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  {ui.paused ? <Play size={14} /> : <Pause size={14} />}
                  <span className="text-sm">{ui.paused ? 'Play' : 'Pause'}</span>
                </button>
                
                <select
                  value={ui.speed}
                  onChange={(e) => setSpeed(Number(e.target.value) as 1 | 2)}
                  className="px-2 py-1 bg-[var(--bg-secondary)] rounded text-sm border-none outline-none"
                >
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                </select>
              </div>
            </div>

            {/* Layer Controls */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers size={14} />
                <span className="text-[var(--fg-secondary)] text-sm">Layers</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ui.layers).map(([key, enabled]) => (
                  <button
                    key={key}
                    onClick={() => toggleLayer(key as keyof typeof ui.layers)}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      enabled 
                        ? 'bg-[var(--accent)] text-white' 
                        : 'bg-[var(--bg-secondary)] text-[var(--fg-tertiary)]'
                    }`}
                  >
                    {enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Stream */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 border-b border-[var(--bg-tertiary)]">
          <h3 className="text-[var(--fg-primary)] font-semibold flex items-center gap-2">
            <Clock size={16} />
            Event Stream
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-300px)]">
          {events.length === 0 ? (
            <div className="text-center text-[var(--fg-tertiary)] py-8">
              <Info size={24} className="mx-auto mb-2 opacity-50" />
              <p>No events to display</p>
            </div>
          ) : (
            events.map((event) => {
              const Icon = severityIcons[event.severity];
              const hubName = getHubName(event.hubId);
              
              return (
                <div
                  key={event.id}
                  className="event-item p-3 bg-[var(--bg-secondary)] rounded border-l-4 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                  style={{ 
                    borderLeftColor: severityColors[event.severity] 
                  }}
                  onClick={() => event.hubId && setFocusHub(event.hubId)}
                >
                  <div className="flex items-start gap-3">
                    <Icon 
                      size={16} 
                      style={{ color: severityColors[event.severity] }}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--fg-primary)] text-sm font-medium mb-1">
                        {event.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[var(--fg-tertiary)]">
                        <span>{formatTimestamp(event.tsISO)}</span>
                        {hubName && (
                          <span className="text-[var(--accent)]">{hubName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-[var(--bg-tertiary)] bg-[var(--bg-secondary)]">
        <h4 className="text-[var(--fg-primary)] font-semibold mb-3 text-sm">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--fg-secondary)]">Hub Load</span>
            <span className="text-[var(--fg-tertiary)]">Size = Traffic Volume</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--fg-secondary)]">Status Colors</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--status-ok)'}}></div>
                <span className="text-[var(--fg-tertiary)]">OK</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--status-warn)'}}></div>
                <span className="text-[var(--fg-tertiary)]">Warn</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--status-alarm)'}}></div>
                <span className="text-[var(--fg-tertiary)]">Error</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}