import React from 'react';
import { KpiPanel } from './KpiPanel';
import { GlobeCanvas } from './GlobeCanvas';
import { EventPanel } from './EventPanel';

export function AppShell() {
  return (
    <div className="dashboard-grid">
      <div className="bg-[var(--bg-primary)]">
        <KpiPanel />
      </div>
      
      <div className="bg-[var(--bg-primary)] relative h-full">
        <GlobeCanvas />
      </div>
      
      <div className="bg-[var(--bg-primary)]">
        <EventPanel />
      </div>
    </div>
  );
}