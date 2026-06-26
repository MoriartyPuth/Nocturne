import { useState, useEffect, useRef, useMemo } from 'react';
import { useStats, useVault } from '../../hooks/useVault';

/* ── Animated counter hook ──────────────────────────────── */
function useAnimatedCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target == null || target === 0) { setCount(0); return; }
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

/* ── Mini bar chart ─────────────────────────────────────── */
function BarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={item.label} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
          <span className="text-xs text-nocturne-muted font-mono w-20 truncate text-right">
            {item.label}
          </span>
          <div className="flex-1 h-5 bg-nocturne-darker rounded-sm overflow-hidden relative">
            <div
              className="h-full rounded-sm transition-all duration-1000 ease-out relative"
              style={{
                width: `${(item.value / maxVal) * 100}%`,
                background: item.color || 'linear-gradient(90deg, #22c55e, #16a34a)',
                boxShadow: `0 0 8px ${item.glowColor || 'rgba(34, 197, 94, 0.3)'}`,
                transitionDelay: `${idx * 100}ms`,
              }}
            >
              <div className="absolute inset-0 bar-shimmer" />
            </div>
          </div>
          <span className="text-xs text-neon-green font-mono w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Donut ring ─────────────────────────────────────────── */
function DonutRing({ data, size = 160 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, idx) => {
          const segmentLength = (item.value / total) * circumference;
          const currentOffset = offset;
          offset += segmentLength;
          return (
            <circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.strokeColor}
              strokeWidth="10"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-currentOffset}
              className="donut-segment"
              style={{
                filter: `drop-shadow(0 0 4px ${item.strokeColor}40)`,
                animationDelay: `${idx * 200}ms`,
              }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white font-mono">{total}</span>
        <span className="text-[10px] text-nocturne-muted font-mono uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}

/* ── Live clock ─────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="font-mono text-center">
      <div className="text-3xl neon-green tracking-wider">
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </div>
      <div className="text-xs text-nocturne-muted mt-1">
        {time.toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })}
      </div>
    </div>
  );
}

/* ── Activity timeline grid (GitHub Commit History style) ── */
function ActivitySpark({ entries }) {
  const contributionGrid = useMemo(() => {
    const grid = [];
    const totalDays = 7 * 24; // 24 weeks of contribution boxes
    const now = new Date();
    
    // Calculate start date (24 weeks ago, aligned to Sunday)
    const startDate = new Date();
    startDate.setDate(now.getDate() - totalDays);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // Back to Sunday

    // Group items by date string (YYYY-MM-DD)
    const counts = {};
    for (const entry of entries || []) {
      if (entry.addedAt) {
        const dateStr = entry.addedAt.substring(0, 10);
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      }
    }

    // Generate grid items
    for (let i = 0; i < totalDays + dayOfWeek; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().substring(0, 10);
      const count = counts[dateStr] || 0;
      grid.push({
        date: dateStr,
        count,
        day: date.getDay()
      });
    }
    return grid;
  }, [entries]);

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center text-xs text-nocturne-muted py-6 font-mono">
        No active repository changes logged.
      </div>
    );
  }

  return (
    <div className="flex gap-2 justify-center items-center py-2 overflow-x-auto select-none custom-scrollbar max-w-full">
      {/* Weekday indicators */}
      <div className="grid grid-rows-7 text-[8px] text-nocturne-muted/70 font-mono pr-1.5 h-[115px] items-center text-right select-none">
        <span>Sun</span>
        <span className="h-2"></span>
        <span>Tue</span>
        <span className="h-2"></span>
        <span>Thu</span>
        <span className="h-2"></span>
        <span>Sat</span>
      </div>

      {/* Grid container: 7 rows high, flowing column by column */}
      <div className="grid grid-flow-col grid-rows-7 gap-1 h-[115px] items-center">
        {contributionGrid.map((cell) => {
          const intensity = cell.count === 0 ? 'bg-nocturne-darker border border-nocturne-border/40' :
                            cell.count === 1 ? 'bg-neon-green/20 border border-neon-green/30' :
                            cell.count === 2 ? 'bg-neon-green/45 border border-neon-green/50' :
                            cell.count === 3 ? 'bg-neon-green/70 border border-neon-green/70' :
                            'bg-neon-green border border-neon-green';
          return (
            <div
              key={cell.date}
              className={`w-3 h-3 rounded-[1.5px] transition-all hover:scale-110 cursor-pointer ${intensity}`}
              title={`${cell.count} items added on ${cell.date}`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Category color map ─────────────────────────────────── */
const CAT_COLORS = {
  tools:    { stroke: '#00d4ff', glow: 'rgba(0, 212, 255, 0.3)', bar: 'linear-gradient(90deg, #00d4ff, #00a8cc)' },
  papers:   { stroke: '#ffb000', glow: 'rgba(255, 176, 0, 0.3)', bar: 'linear-gradient(90deg, #ffb000, #cc8d00)' },
  reports:  { stroke: '#ff00ff', glow: 'rgba(255, 0, 255, 0.3)', bar: 'linear-gradient(90deg, #ff00ff, #cc00cc)' },
  projects: { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)', bar: 'linear-gradient(90deg, #22c55e, #16a34a)' },
  websites: { stroke: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.3)', bar: 'linear-gradient(90deg, #ff6b6b, #cc5555)' },
};

/* ═══════════════════════════════════════════════════════════
   StatsPanel — Inline stats dashboard for the console /all view
   ═══════════════════════════════════════════════════════════ */
export default function StatsPanel({ onCategoryClick }) {
  const { stats, loading } = useStats();
  const { entries } = useVault();
  const totalEntries = useAnimatedCounter(stats?.totalEntries || 0);
  const totalCategories = useAnimatedCounter(stats?.totalCategories || 0, 1000);

  const categoryChartData = stats
    ? Object.entries(stats.categoryBreakdown).map(([cat, count]) => ({
        label: cat,
        value: count,
        color: CAT_COLORS[cat]?.bar || 'linear-gradient(90deg, #666, #444)',
        glowColor: CAT_COLORS[cat]?.glow || 'rgba(100,100,100,0.3)',
      }))
    : [];

  const donutData = stats
    ? Object.entries(stats.categoryBreakdown).map(([cat, count]) => ({
        label: cat,
        value: count,
        strokeColor: CAT_COLORS[cat]?.stroke || '#666',
      }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-neon-green animate-pulse text-sm mb-2">████████████████████</div>
          <span className="text-xs text-nocturne-muted">Computing analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* ── Total Assets ──────────────────────────────────── */}
      <div className="console-card p-5 stat-card-anim" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-nocturne-muted tracking-wider uppercase">Total Assets</span>
          <span className="text-lg opacity-70">📦</span>
        </div>
        <div className="text-4xl font-bold neon-green">{totalEntries}</div>
        <div className="h-px bg-nocturne-border my-3" />
        <div className="text-[10px] text-nocturne-muted">
          Across all categories in vault_store.json
        </div>
      </div>

      {/* ── Categories ────────────────────────────────────── */}
      <div className="console-card p-5 stat-card-anim" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-nocturne-muted tracking-wider uppercase">Categories</span>
          <span className="text-lg opacity-70">📂</span>
        </div>
        <div className="text-4xl font-bold text-neon-cyan text-glow-cyan">{totalCategories}</div>
        <div className="h-px bg-nocturne-border my-3" />
        <div className="flex flex-wrap gap-1">
          {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryClick?.(cat)}
              className={`category-badge ${cat} cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Domain ────────────────────────────────────── */}
      <div className="console-card p-5 stat-card-anim" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-nocturne-muted tracking-wider uppercase">Top Domain</span>
          <span className="text-lg opacity-70">🌐</span>
        </div>
        <div className="text-lg font-bold text-neon-amber neon-amber truncate">
          {stats?.topDomains?.[0]?.domain || '—'}
        </div>
        <div className="text-xs text-nocturne-muted mt-1">
          {stats?.topDomains?.[0]?.count || 0} entries
        </div>
        <div className="h-px bg-nocturne-border my-3" />
        <div className="space-y-1">
          {stats?.topDomains?.slice(1, 4).map((d) => (
            <div key={d.domain} className="flex justify-between text-[10px]">
              <span className="text-nocturne-muted truncate">{d.domain}</span>
              <span className="text-neon-amber/60">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── System Clock ──────────────────────────────────── */}
      <div className="console-card p-5 stat-card-anim" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-nocturne-muted tracking-wider uppercase">System Clock</span>
          <span className="text-lg opacity-70">⏰</span>
        </div>
        <LiveClock />
      </div>

      {/* ── Bar Chart ─────────────────────────────────────── */}
      <div className="console-card p-5 md:col-span-2 stat-card-anim" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-nocturne-muted tracking-wider uppercase">Category Distribution</span>
          <span className="text-xs text-neon-green/40">BAR CHART</span>
        </div>
        <BarChart data={categoryChartData} />
      </div>

      {/* ── Donut Ring ────────────────────────────────────── */}
      <div className="console-card p-5 md:col-span-2 flex flex-col items-center stat-card-anim" style={{ animationDelay: '500ms' }}>
        <div className="w-full flex items-center justify-between mb-4">
          <span className="text-xs text-nocturne-muted tracking-wider uppercase">Allocation Ring</span>
          <span className="text-xs text-neon-green/40">DONUT</span>
        </div>
        <DonutRing data={donutData} />
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {donutData.map((d) => (
            <div key={d.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: d.strokeColor, boxShadow: `0 0 6px ${d.strokeColor}60` }}
              />
              <span className="text-[10px] text-nocturne-muted uppercase tracking-wider">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity Timeline ─────────────────────────────── */}
      <div className="console-card p-5 md:col-span-2 lg:col-span-4 stat-card-anim" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-nocturne-muted tracking-wider uppercase">Activity Timeline</span>
          <span className="text-xs text-neon-green/40">24 WEEKS GRID</span>
        </div>
        <ActivitySpark entries={entries} />
      </div>

      {/* ── Recent Additions ──────────────────────────────── */}
      <div className="console-card p-5 md:col-span-2 lg:col-span-4 stat-card-anim" style={{ animationDelay: '700ms' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-nocturne-muted tracking-wider uppercase">Recent Additions</span>
          <span className="text-xs text-neon-green/40">LATEST 5</span>
        </div>
        <div className="space-y-2">
          {stats?.recent?.map((entry, idx) => (
            <a
              key={entry.id}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-3 rounded-sm
                         hover:bg-neon-green/5 transition-colors group animate-fade-in"
              style={{ animationDelay: `${700 + idx * 80}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-neon-green/30 font-mono">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className={`category-badge ${entry.category}`}>{entry.category}</span>
                <span className="text-sm text-white group-hover:text-neon-green transition-colors truncate">
                  {entry.title}
                </span>
              </div>
              <span className="text-[10px] text-nocturne-muted flex-shrink-0 ml-3">
                {new Date(entry.addedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric',
                })}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
