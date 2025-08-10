import type { Feature } from 'geojson';

export interface Hub {
  id: string;
  name: string;
  lon: number;
  lat: number;
  load: number; // 0-1
  status: 'ok' | 'warn' | 'alarm';
}

export interface Link {
  id: string;
  fromHubId: string;
  toHubId: string;
  volume: number;
  latencyMs: number;
  status: 'ok' | 'warn' | 'alarm';
}

export interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  deltaPct: number;
  trend: number[];
}

export interface EventItem {
  id: string;
  tsISO: string;
  severity: 'info' | 'warn' | 'error';
  message: string;
  hubId?: string;
  linkId?: string;
}

export interface UiState {
  paused: boolean;
  speed: 1 | 2;
  layers: {
    arcs: boolean;
    hubs: boolean;
    labels: boolean;
  };
  focusHubId?: string;
}

export interface RootState {
  hubs: Hub[];
  links: Link[];
  kpis: KPI[];
  events: EventItem[];
  ui: UiState;
  seed: number;
  refreshMs: number;
  lastUpdate: number;
  cables: Feature[];
  highlightedCableId?: string;
}