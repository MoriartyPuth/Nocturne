import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStats } from '../hooks/useVault';

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
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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

/* ── Mini bar chart component ───────────────────────────── */
function BarChart({ data, maxWidth = 200 }) {
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
              {/* Animated shimmer */}
              <div className="absolute inset-0 bar-shimmer" />
            </div>
          </div>
          <span className="text-xs text-neon-green font-mono w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Donut ring for category distribution ────────────────── */
function DonutRing({ data, size = 180 }) {
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
              strokeWidth="12"
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
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white font-mono">{total}</span>
        <span className="text-[10px] text-nocturne-muted font-mono uppercase tracking-wider">
          Total
        </span>
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
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  );
}

/* ── Activity timeline spark ────────────────────────────── */
function ActivitySpark({ timeline }) {
  const entries = Object.entries(timeline || {}).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) return null;

  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  const barWidth = Math.max(8, Math.floor(280 / entries.length) - 2);

  return (
    <div className="flex items-end gap-1 justify-center h-20">
      {entries.map(([month, count], idx) => (
        <div key={month} className="flex flex-col items-center gap-1 group">
          <div
            className="rounded-t-sm transition-all duration-700 ease-out activity-bar"
            style={{
              width: barWidth,
              height: `${(count / maxVal) * 100}%`,
              minHeight: 4,
              background: 'linear-gradient(180deg, #22c55e, #16a34a)',
              boxShadow: '0 0 6px rgba(34, 197, 94, 0.3)',
              animationDelay: `${idx * 120}ms`,
            }}
          />
          <span className="text-[8px] text-nocturne-muted/50 font-mono hidden group-hover:block">
            {month.split('-')[1]}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Color map for categories ───────────────────────────── */
const CAT_COLORS = {
  tools:    { stroke: '#00d4ff', glow: 'rgba(0, 212, 255, 0.3)', bar: 'linear-gradient(90deg, #00d4ff, #00a8cc)' },
  papers:   { stroke: '#ffb000', glow: 'rgba(255, 176, 0, 0.3)', bar: 'linear-gradient(90deg, #ffb000, #cc8d00)' },
  reports:  { stroke: '#ff00ff', glow: 'rgba(255, 0, 255, 0.3)', bar: 'linear-gradient(90deg, #ff00ff, #cc00cc)' },
  projects: { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)', bar: 'linear-gradient(90deg, #22c55e, #16a34a)' },
  websites: { stroke: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.3)', bar: 'linear-gradient(90deg, #ff6b6b, #cc5555)' },
};

/* ═══════════════════════════════════════════════════════════
   STATS DASHBOARD — Main Component
   ═══════════════════════════════════════════════════════════ */
export default function StatsDashboard() {
  const navigate = useNavigate();
  const { stats, loading } = useStats();
  const [visible, setVisible] = useState(false);

  const totalEntries = useAnimatedCounter(stats?.totalEntries || 0);
  const totalCategories = useAnimatedCounter(stats?.totalCategories || 0, 1000);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Build chart data from stats
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

  return (
    <div className="min-h-screen bg-black font-mono text-white relative">
      <div className="crt-overlay" />

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-nocturne-border bg-nocturne-darker/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/console')}
              className="text-nocturne-muted hover:text-white transition-colors text-xs cursor-pointer"
            >
              ← CONSOLE
            </button>
            <div className="w-px h-4 bg-nocturne-border" />
            <h1 className="text-sm neon-green tracking-[0.2em] uppercase">
              Dashboard
            </h1>
            <span className="text-xs text-nocturne-muted hidden sm:inline">
              // SYSTEM ANALYTICS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs text-neon-green/60">LIVE</span>
          </div>
        </div>
      </header>

      {/* ── Dashboard Grid ───────────────────────────────────── */}
      <div className={`relative z-10 max-w-7xl mx-auto p-4 md:p-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="text-neon-green animate-pulse text-sm mb-2">████████████████████</div>
              <span className="text-xs text-nocturne-muted">Computing analytics...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* ── Stat Card: Total Entries ──────────────────── */}
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

            {/* ── Stat Card: Categories ─────────────────────── */}
            <div className="console-card p-5 stat-card-anim" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-nocturne-muted tracking-wider uppercase">Categories</span>
                <span className="text-lg opacity-70">📂</span>
              </div>
              <div className="text-4xl font-bold text-neon-cyan text-glow-cyan">{totalCategories}</div>
              <div className="h-px bg-nocturne-border my-3" />
              <div className="flex flex-wrap gap-1">
                {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).map((cat) => (
                  <span key={cat} className={`category-badge ${cat}`}>{cat}</span>
                ))}
              </div>
            </div>

            {/* ── Stat Card: Top Domain ─────────────────────── */}
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

            {/* ── Stat Card: Live Clock ─────────────────────── */}
            <div className="console-card p-5 stat-card-anim" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-nocturne-muted tracking-wider uppercase">System Clock</span>
                <span className="text-lg opacity-70">⏰</span>
              </div>
              <LiveClock />
            </div>

            {/* ── Category Distribution (Bar Chart) ─────────── */}
            <div className="console-card p-5 md:col-span-2 stat-card-anim" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-nocturne-muted tracking-wider uppercase">
                  Category Distribution
                </span>
                <span className="text-xs text-neon-green/40">BAR CHART</span>
              </div>
              <BarChart data={categoryChartData} />
            </div>

            {/* ── Category Distribution (Donut) ─────────────── */}
            <div className="console-card p-5 md:col-span-2 flex flex-col items-center stat-card-anim" style={{ animationDelay: '500ms' }}>
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs text-nocturne-muted tracking-wider uppercase">
                  Allocation Ring
                </span>
                <span className="text-xs text-neon-green/40">DONUT</span>
              </div>
              <DonutRing data={donutData} />
              {/* Legend */}
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

            {/* ── Activity Timeline ─────────────────────────── */}
            <div className="console-card p-5 md:col-span-2 lg:col-span-4 stat-card-anim" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-nocturne-muted tracking-wider uppercase">
                  Activity Timeline
                </span>
                <span className="text-xs text-neon-green/40">MONTHLY</span>
              </div>
              <ActivitySpark timeline={stats?.timeline} />
            </div>

            {/* ── Recent Entries ─────────────────────────────── */}
            <div className="console-card p-5 md:col-span-2 lg:col-span-4 stat-card-anim" style={{ animationDelay: '700ms' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-nocturne-muted tracking-wider uppercase">
                  Recent Additions
                </span>
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
        )}
      </div>
    </div>
  );
}
