/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { formatINR } from '../utils/formatters';

interface PieSliceData {
  id: string;
  label: string;
  value: number;
  color: string;
  count?: number;
}

interface EnrichedPieSlice extends PieSliceData {
  fraction: number;
  percentage: string;
  strokeDasharray: string;
  strokeDashoffset: number;
}

interface CategoryPieChartProps {
  data: PieSliceData[];
  total: number;
  height?: number;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, total, height = 240 }) => {
  const [hoveredSlice, setHoveredSlice] = useState<EnrichedPieSlice | null>(null);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center mb-2">
          ₹
        </div>
        <p className="text-sm">No expenses recorded for this period</p>
      </div>
    );
  }

  // Generate SVG arcs for Donut Chart
  let cumulativeAngle = 0;
  const radius = 80;
  const strokeWidth = 32;
  const center = 110;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map((item) => {
    const fraction = item.value / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      ...item,
      fraction,
      percentage: (fraction * 100).toFixed(1),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = hoveredSlice || slices[0];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      <div className="relative" style={{ width: 220, height: 220 }}>
        <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90 transform">
          {slices.map((slice) => (
            <circle
              key={slice.id}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoveredSlice?.id === slice.id ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-200 cursor-pointer hover:opacity-90"
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => setHoveredSlice(slice)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
            {activeItem?.label || 'Total'}
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            {formatINR(activeItem?.value || total)}
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {activeItem ? `${activeItem.percentage}%` : '100%'}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full max-h-56 overflow-y-auto space-y-1.5 pr-2">
        {slices.map((slice) => (
          <div
            key={slice.id}
            onMouseEnter={() => setHoveredSlice(slice)}
            onMouseLeave={() => setHoveredSlice(null)}
            className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
              hoveredSlice?.id === slice.id
                ? 'bg-slate-100 dark:bg-slate-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: slice.color }}
              />
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                {slice.label}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatINR(slice.value)}
              </span>
              <span className="text-slate-400 text-[11px] w-10 text-right">
                {slice.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface BarChartItem {
  label: string; // e.g. "Day 1", "Apr", "2026"
  subLabel?: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarChartItem[];
  height?: number;
  valuePrefix?: string;
}

export const ExpenseBarChart: React.FC<BarChartProps> = ({ data, height = 180, valuePrefix = '₹' }) => {
  const [activeBar, setActiveBar] = useState<BarChartItem | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400 text-sm">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      {/* Tooltip banner */}
      <div className="h-6 mb-2 flex items-center justify-between text-xs px-1 text-slate-600 dark:text-slate-300">
        {activeBar ? (
          <>
            <span className="font-semibold">{activeBar.label} {activeBar.subLabel ? `(${activeBar.subLabel})` : ''}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatINR(activeBar.value)}
            </span>
          </>
        ) : (
          <span className="text-slate-400 text-[11px]">Hover or tap bars for breakdown</span>
        )}
      </div>

      <div
        className="flex items-end gap-1.5 w-full pt-4 pb-2 px-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800"
        style={{ height }}
      >
        {data.map((item, idx) => {
          const heightPct = Math.max(4, (item.value / maxValue) * 100);
          const isHighest = item.value === maxValue && item.value > 0;
          const isSelected = activeBar?.label === item.label;

          return (
            <div
              key={idx}
              className="flex-1 min-w-[20px] max-w-[48px] flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setActiveBar(item)}
              onMouseLeave={() => setActiveBar(null)}
              onClick={() => setActiveBar(item)}
            >
              <div
                className={`w-full rounded-t-md transition-all duration-300 relative ${
                  isSelected
                    ? 'bg-emerald-500 shadow-md ring-2 ring-emerald-300'
                    : isHighest
                    ? 'bg-emerald-600 dark:bg-emerald-500'
                    : item.value > 0
                    ? 'bg-emerald-400/80 dark:bg-emerald-600/80 hover:bg-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
                style={{ height: `${heightPct}%` }}
              >
                {isHighest && item.value > 0 && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-500">
                    ★
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface AreaLineChartPoint {
  label: string;
  value: number;
}

interface AreaLineChartProps {
  data: AreaLineChartPoint[];
  height?: number;
}

export const DailySpendingLineChart: React.FC<AreaLineChartProps> = ({ data, height = 160 }) => {
  const [hoveredPoint, setHoveredPoint] = useState<AreaLineChartPoint | null>(null);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400 text-sm">
        Need at least 2 days of records to show trend
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const width = 360;
  const paddingX = 16;
  const paddingY = 24;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = height - paddingY - (d.value / maxValue) * chartHeight;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${
    height - paddingY
  } Z`;

  return (
    <div className="w-full">
      <div className="h-6 mb-1 flex items-center justify-between text-xs px-2 text-slate-600 dark:text-slate-300">
        {hoveredPoint ? (
          <>
            <span className="font-semibold">{hoveredPoint.label}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatINR(hoveredPoint.value)}
            </span>
          </>
        ) : (
          <span className="text-slate-400 text-[11px]">Hover over graph points</span>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        <line
          x1={paddingX}
          y1={paddingY}
          x2={width - paddingX}
          y2={paddingY}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
        />

        {/* Shaded Area */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />

        {/* Interactive Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.label === p.label ? 5 : 3}
              fill="#059669"
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
