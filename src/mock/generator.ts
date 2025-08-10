import seedrandom from 'seedrandom';
import type { Hub, Link, KPI, EventItem } from '../types';

const MAJOR_CITIES: Array<{name: string, lon: number, lat: number}> = [
  { name: 'Tokyo', lon: 139.6917, lat: 35.6895 },
  { name: 'Singapore', lon: 103.8198, lat: 1.3521 },
  { name: 'Frankfurt', lon: 8.6821, lat: 50.1109 },
  { name: 'San Francisco', lon: -122.4194, lat: 37.7749 },
  { name: 'New York', lon: -74.0060, lat: 40.7128 },
  { name: 'Sydney', lon: 151.2093, lat: -33.8688 },
  { name: 'London', lon: -0.1276, lat: 51.5074 },
  { name: 'Dubai', lon: 55.2708, lat: 25.2048 },
  { name: 'Mumbai', lon: 72.8777, lat: 19.0760 },
  { name: 'São Paulo', lon: -46.6333, lat: -23.5505 }
];

const EVENT_MESSAGES = [
  'High traffic detected',
  'Latency spike observed',
  'Connection restored',
  'Load balancing activated',
  'Maintenance window started',
  'Capacity threshold exceeded',
  'Redundancy failover initiated',
  'Performance optimization applied',
  'Security scan completed',
  'System health check passed'
];

export class DataGenerator {
  private rng: () => number;
  private eventCounter = 0;

  constructor(seed: number) {
    this.rng = seedrandom(seed.toString());
  }

  private random() {
    return this.rng();
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }

  private randomStatus(): 'ok' | 'warn' | 'alarm' {
    const r = this.random();
    if (r < 0.7) return 'ok';
    if (r < 0.9) return 'warn';
    return 'alarm';
  }

  initHubs(): Hub[] {
    return MAJOR_CITIES.map((city, index) => ({
      id: `hub-${index}`,
      name: city.name,
      lon: city.lon,
      lat: city.lat,
      load: 0.3 + this.random() * 0.4,
      status: this.randomStatus()
    }));
  }

  initLinks(hubs: Hub[]): Link[] {
    const links: Link[] = [];
    
    // Create connections between major hubs
    for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        if (this.random() < 0.4) { // 40% chance of connection
          links.push({
            id: `link-${i}-${j}`,
            fromHubId: hubs[i].id,
            toHubId: hubs[j].id,
            volume: Math.floor(this.random() * 1000) + 100,
            latencyMs: Math.floor(this.random() * 200) + 20,
            status: this.randomStatus()
          });
        }
      }
    }
    
    return links;
  }

  initKPIs(): KPI[] {
    const generateTrend = () => Array.from({length: 20}, () => 
      50 + (this.random() - 0.5) * 40
    );

    return [
      {
        id: 'total-traffic',
        label: 'Total Traffic',
        value: Math.floor(this.random() * 10000) + 5000,
        unit: 'Gbps',
        deltaPct: (this.random() - 0.5) * 20,
        trend: generateTrend()
      },
      {
        id: 'active-connections',
        label: 'Active Connections',
        value: Math.floor(this.random() * 500000) + 100000,
        unit: '',
        deltaPct: (this.random() - 0.5) * 15,
        trend: generateTrend()
      },
      {
        id: 'avg-latency',
        label: 'Average Latency',
        value: Math.floor(this.random() * 100) + 20,
        unit: 'ms',
        deltaPct: (this.random() - 0.5) * 10,
        trend: generateTrend()
      },
      {
        id: 'system-health',
        label: 'System Health',
        value: Math.floor(this.random() * 20) + 80,
        unit: '%',
        deltaPct: (this.random() - 0.5) * 5,
        trend: generateTrend()
      },
      {
        id: 'error-rate',
        label: 'Error Rate',
        value: this.random() * 2,
        unit: '%',
        deltaPct: (this.random() - 0.5) * 50,
        trend: generateTrend()
      },
      {
        id: 'throughput',
        label: 'Throughput',
        value: Math.floor(this.random() * 50000) + 10000,
        unit: 'req/s',
        deltaPct: (this.random() - 0.5) * 25,
        trend: generateTrend()
      }
    ];
  }

  generateEvents(hubs: Hub[], count = 5): EventItem[] {
    const events: EventItem[] = [];
    
    for (let i = 0; i < count; i++) {
      const severity = this.randomChoice(['info', 'warn', 'error'] as const);
      const hub = this.random() < 0.7 ? this.randomChoice(hubs) : undefined;
      
      events.push({
        id: `event-${this.eventCounter++}`,
        tsISO: new Date(Date.now() - this.random() * 300000).toISOString(),
        severity,
        message: this.randomChoice(EVENT_MESSAGES),
        hubId: hub?.id
      });
    }
    
    return events.sort((a, b) => 
      new Date(b.tsISO).getTime() - new Date(a.tsISO).getTime()
    );
  }

  updateData(
    currentHubs: Hub[], 
    currentLinks: Link[], 
    currentKPIs: KPI[],
    currentEvents: EventItem[]
  ): {
    hubs: Hub[];
    links: Link[];
    kpis: KPI[];
    events: EventItem[];
  } {
    // Update hubs with some noise
    const hubs = currentHubs.map(hub => ({
      ...hub,
      load: Math.max(0, Math.min(1, hub.load + (this.random() - 0.5) * 0.1)),
      status: this.random() < 0.1 ? this.randomStatus() : hub.status
    }));

    // Update links
    const links = currentLinks.map(link => ({
      ...link,
      volume: Math.max(0, link.volume + (this.random() - 0.5) * 100),
      latencyMs: Math.max(10, link.latencyMs + (this.random() - 0.5) * 20),
      status: this.random() < 0.1 ? this.randomStatus() : link.status
    }));

    // Update KPIs
    const kpis = currentKPIs.map(kpi => {
      const newValue = Math.max(0, kpi.value + (this.random() - 0.5) * kpi.value * 0.05);
      const newTrend = [...kpi.trend.slice(1), newValue];
      const deltaPct = kpi.trend.length > 1 
        ? ((newValue - kpi.trend[kpi.trend.length - 1]) / kpi.trend[kpi.trend.length - 1]) * 100
        : 0;

      return {
        ...kpi,
        value: newValue,
        trend: newTrend,
        deltaPct
      };
    });

    // Generate new events occasionally
    let events = currentEvents;
    if (this.random() < 0.3) {
      const newEvents = this.generateEvents(hubs, Math.floor(this.random() * 3) + 1);
      events = [...newEvents, ...currentEvents].slice(0, 100); // Keep last 100 events
    }

    return { hubs, links, kpis, events };
  }
}