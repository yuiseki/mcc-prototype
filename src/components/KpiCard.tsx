import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { KPI } from '../types';

interface SparklineProps {
  values: number[];
  className?: string;
}

function Sparkline({ values, className = '' }: SparklineProps) {
  if (values.length < 2) return null;

  const width = 120;
  const height = 40;
  const padding = 4;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`sparkline-container ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          opacity="0.7"
          className="transition-all duration-300"
        />
        <circle
          cx={values.length > 0 ? padding + ((values.length - 1) / (values.length - 1)) * (width - 2 * padding) : padding}
          cy={values.length > 0 ? height - padding - ((values[values.length - 1] - min) / range) * (height - 2 * padding) : height / 2}
          r="3"
          fill="var(--accent)"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

interface KpiCardProps {
  kpi: KPI;
  className?: string;
}

export function KpiCard({ kpi, className = '' }: KpiCardProps) {
  const isPositive = kpi.deltaPct > 0;
  const isNeutral = Math.abs(kpi.deltaPct) < 0.1;
  
  const statusColor = isNeutral 
    ? 'var(--fg-secondary)' 
    : isPositive 
      ? 'var(--status-ok)' 
      : 'var(--status-warn)';

  const formatValue = (value: number, unit: string) => {
    if (value > 1000000) {
      return `${(value / 1000000).toFixed(1)}M${unit}`;
    } else if (value > 1000) {
      return `${(value / 1000).toFixed(1)}k${unit}`;
    } else if (unit === '%' || unit === 'ms') {
      return `${value.toFixed(1)}${unit}`;
    }
    return `${Math.floor(value)}${unit}`;
  };

  return (
    <div className={`kpi-card bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--bg-tertiary)] transition-all duration-300 hover:border-[var(--accent)] hover:shadow-lg ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-[var(--fg-secondary)] text-sm font-medium">
          {kpi.label}
        </h3>
        <div className="flex items-center space-x-1" style={{ color: statusColor }}>
          {!isNeutral && (
            isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />
          )}
          <span className="text-xs font-medium">
            {isNeutral ? '—' : `${isPositive ? '+' : ''}${kpi.deltaPct.toFixed(1)}%`}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="text-2xl font-bold tabular-nums text-[var(--fg-primary)]">
          {formatValue(kpi.value, kpi.unit)}
        </div>
      </div>
      
      <div className="flex justify-center">
        <Sparkline values={kpi.trend} />
      </div>
    </div>
  );
}