import React from 'react';
import { BarChart3, Activity, Zap } from 'lucide-react';
import { KpiCard } from './KpiCard';
import { useStore } from '../store/useStore';

export function KpiPanel() {
  const kpis = useStore((state) => state.kpis);
  const lastUpdate = useStore((state) => state.lastUpdate);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="kpi-panel bg-[var(--bg-primary)] p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <BarChart3 size={24} />
            Mission Control
          </h2>
          <p className="text-[var(--fg-tertiary)] text-sm mt-1">
            Last updated: {formatTime(lastUpdate)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[var(--status-ok)]">
          <Activity size={16} />
          <span className="text-sm font-medium">LIVE</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-[var(--fg-secondary)] text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap size={16} />
            System Performance
          </h3>
          <div className="grid gap-4">
            {kpis.slice(0, 3).map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>

        <div className="pt-4">
          <h3 className="text-[var(--fg-secondary)] text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity size={16} />
            Network Metrics
          </h3>
          <div className="grid gap-4">
            {kpis.slice(3).map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}