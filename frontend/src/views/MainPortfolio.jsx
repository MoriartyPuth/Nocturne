import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/* ── Data for portfolio sections ───────────────────────── */
const PROJECTS = [
  {
    title: 'Nocturne Dashboard',
    description: 'A retro cyberpunk data terminal interface for managing personal knowledge assets and digital resources.',
    tags: ['React', 'Node.js', 'Tailwind'],
    color: 'green',
  },
  {
    title: 'Neural Style Engine',
    description: 'Real-time artistic style transfer using convolutional neural networks with GPU acceleration.',
    tags: ['Python', 'PyTorch', 'CUDA'],
    color: 'cyan',
  },
  {
    title: 'Distributed Scheduler',
    description: 'Fault-tolerant distributed task scheduling system with automatic failover and load balancing.',
    tags: ['Node.js', 'Redis', 'Docker'],
    color: 'amber',
  },
  {
    title: 'Quantum Cipher',
    description: 'Post-quantum cryptography toolkit implementing lattice-based encryption algorithms.',
    tags: ['Rust', 'WASM', 'Crypto'],
    color: 'magenta',
  },
];

const SKILLS = [
  { name: 'JavaScript', level: 95 },
  { name: 'React', level: 92 },
  { name: 'Node.js', level: 90 },
  { name: 'Python', level: 88 },
  { name: 'TypeScript', level: 85 },
  { name: 'Docker', level: 80 },
  { name: 'PostgreSQL', level: 78 },
  { name: 'Rust', level: 70 },
];

const TECH_STACK = [
  'React', 'Next.js', 'Vite', 'Tailwind CSS', 'Node.js', 'Express',
  'Python', 'PyTorch', 'Docker', 'Redis', 'PostgreSQL', 'MongoDB',
  'GraphQL', 'TypeScript', 'Rust', 'Git',
];

/* ── Color map for neon accents ─────────────────────────── */
const colorMap = {
  green:   { border: 'border-neon-green/30', glow: 'shadow-neon-green', text: 'text-neon-green', bg: 'bg-neon-green/5' },
  cyan:    { border: 'border-neon-cyan/30',  glow: 'shadow-neon-cyan',  text: 'text-neon-cyan',  bg: 'bg-neon-cyan/5' },
  amber:   { border: 'border-neon-amber/30', glow: 'shadow-neon-amber', text: 'text-neon-amber', bg: 'bg-neon-amber/5' },
  magenta: { border: 'border-neon-magenta/30', glow: '', text: 'text-neon-magenta', bg: 'bg-neon-magenta/5' },
};

const MOCK_VAULT = [
  { id: 'm1', title: 'Hacker News', description: 'The premier tech news aggregator run by Y Combinator. Essential daily reading for developers.', url: 'https://news.ycombinator.com', category: 'websites', addedAt: '2026-06-24T12:00:00Z' },
  { id: 'm2', title: 'MDN Web Docs', description: 'The authoritative reference for web standards, HTML, CSS, JavaScript APIs and browser compatibility.', url: 'https://developer.mozilla.org', category: 'websites', addedAt: '2026-06-24T12:15:00Z' },
  { id: 'm3', title: 'DevDocs', description: 'Fast, offline-capable unified API documentation browser for 100+ programming languages and frameworks.', url: 'https://devdocs.io', category: 'websites', addedAt: '2026-06-24T12:30:00Z' },
  { id: 'm4', title: 'Can I Use', description: 'Browser compatibility tables for modern web technologies — CSS, HTML5, JavaScript and SVG features.', url: 'https://caniuse.com', category: 'websites', addedAt: '2026-06-24T12:45:00Z' },
  { id: 'm5', title: 'Vite Build System', description: 'Next-generation frontend tooling with instant HMR and optimized production builds.', url: 'https://vitejs.dev', category: 'tools', image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80', addedAt: '2026-06-20T10:00:00Z' },
  { id: 'm6', title: 'Tailwind CSS', description: 'Utility-first CSS framework for rapidly building custom user interfaces directly in markup.', url: 'https://tailwindcss.com', category: 'tools', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80', addedAt: '2026-06-20T10:05:00Z' },
  { id: 'm7', title: 'Attention Is All You Need', description: 'The foundational transformer architecture paper that revolutionized natural language processing.', url: 'https://arxiv.org/abs/1706.03762', category: 'papers', addedAt: '2026-06-21T09:00:00Z' },
];

export default function MainPortfolio() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  
  // Vault state
  const [vaultEntries, setVaultEntries] = useState(MOCK_VAULT);
  const [activeTab, setActiveTab] = useState('all');
  const [loadingVault, setLoadingVault] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Fetch live vault entries
  useEffect(() => {
    setLoadingVault(true);
    fetch('/api/vault')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.entries && data.entries.length > 0) {
          setVaultEntries(data.entries);
        }
      })
      .catch((err) => {
        console.warn('[PORTFOLIO] Vault fetch failed, using mock data:', err.message);
      })
      .finally(() => {
        setLoadingVault(false);
      });
  }, []);

  const tabs = ['all', ...new Set(vaultEntries.map((e) => e.category))];

  const filteredVault = vaultEntries.filter((entry) => {
    return activeTab === 'all' || entry.category === activeTab;
  });

  return (
    <div className="min-h-screen bg-transparent font-sans pt-[66px]">

      {/* ── Sticky Header Navbar ──────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nocturne-darker/80 backdrop-blur-md border-b border-[rgba(34,197,94,0.12)] h-[66px] px-8 flex items-center transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
          {/* Left: brand + back link always visible */}
          <div className="flex items-center gap-4">
            <a href="#" className="font-mono text-sm tracking-[0.2em] text-white hover:text-neon-green transition-colors">
              // PRELUDE
            </a>
            <span className="text-nocturne-border text-xs select-none">|</span>
            <a
              href="https://MoriartyPuth.github.io"
              rel="noopener"
              className="font-mono text-xs text-neon-green/70 hover:text-neon-green transition-colors flex items-center gap-1"
            >
              ← portfolio
            </a>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-nocturne-muted">
            <a href="#projects" className="hover:text-white transition-colors">/projects</a>
            <a href="#skills" className="hover:text-white transition-colors">/skills</a>
            <a href="#vault" className="hover:text-white transition-colors">/resource_vault</a>
            <a href="#about" className="hover:text-white transition-colors">/about</a>
          </div>

          {/* Console CTA Button */}
          <button
            onClick={() => navigate('/console')}
            className="px-4 py-1.5 border border-neon-green/30 text-neon-green font-mono text-xs tracking-wider uppercase rounded-sm hover:bg-neon-green/10 hover:border-neon-green hover:shadow-neon-green transition-all duration-300 cursor-pointer"
          >
            Terminal Console
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════ */}
      <header className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />

        {/* Content */}
        <div className={`relative z-10 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="font-mono text-xs text-neon-green/70 tracking-[0.3em] uppercase">
              System Online
            </span>
          </div>

          {/* Name */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-neon-green/60 bg-clip-text text-transparent">
              Moriarty
            </span>
          </h1>

          {/* Title */}
          <p className="text-xl md:text-2xl text-nocturne-muted font-light mb-2">
            Full-Stack Developer &amp; Systems Architect
          </p>

          {/* Subtitle */}
          <p className="font-mono text-sm text-neon-green/50 mb-12">
            {'>'} Building the future, one commit at a time_
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => navigate('/console')}
              className="group relative px-8 py-4 bg-transparent border border-neon-green/40 text-neon-green font-mono text-sm tracking-wider uppercase rounded-sm
                         hover:bg-neon-green/10 hover:border-neon-green hover:shadow-neon-green-lg
                         transition-all duration-300 cursor-pointer"
            >
              <span className="relative z-10">Enter Nocturne Console →</span>
              <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <a
              href="#projects"
              className="px-8 py-4 text-nocturne-muted font-mono text-sm tracking-wider uppercase
                         hover:text-white transition-colors duration-300"
            >
              View Projects ↓
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-neon-green/40 to-transparent" />
        </div>
      </header>

      {/* ════════════════════════════════════════════════════
          PROJECTS SECTION
          ════════════════════════════════════════════════════ */}
      <section id="projects" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-px bg-neon-green/40" />
          <h2 className="text-3xl font-bold text-white tracking-tight">Projects</h2>
          <div className="flex-1 h-px bg-nocturne-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((project, idx) => {
            const c = colorMap[project.color];
            return (
              <div
                key={project.title}
                className={`glass-card p-6 border ${c.border} hover:${c.glow} animate-slide-up`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Project number */}
                <span className={`font-mono text-xs ${c.text} opacity-60 mb-3 block`}>
                  /{String(idx + 1).padStart(2, '0')}
                </span>

                <h3 className="text-xl font-semibold text-white mb-3">{project.title}</h3>
                <p className="text-nocturne-muted text-sm leading-relaxed mb-4">{project.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-0.5 text-xs font-mono ${c.bg} ${c.text} rounded-sm border ${c.border}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SKILLS SECTION
          ════════════════════════════════════════════════════ */}
      <section id="skills" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-px bg-neon-cyan/40" />
          <h2 className="text-3xl font-bold text-white tracking-tight">Skills</h2>
          <div className="flex-1 h-px bg-nocturne-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
          {SKILLS.map((skill, idx) => (
            <div key={skill.name} className="animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-sm text-white">{skill.name}</span>
                <span className="font-mono text-xs text-neon-cyan/70">{skill.level}%</span>
              </div>
              <div className="h-1.5 bg-nocturne-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-cyan/80 to-neon-green/80 transition-all duration-1000 ease-out"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TECH STACK SECTION
          ════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-px bg-neon-amber/40" />
          <h2 className="text-3xl font-bold text-white tracking-tight">Tech Stack</h2>
          <div className="flex-1 h-px bg-nocturne-border" />
        </div>

        <div className="flex flex-wrap gap-3">
          {TECH_STACK.map((tech, idx) => (
            <span
              key={tech}
              className="px-4 py-2 glass-card text-sm font-mono text-nocturne-muted
                         hover:text-neon-amber hover:border-neon-amber/30 cursor-default
                         animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          RESOURCE VAULT SECTION (with Category Subnav)
          ════════════════════════════════════════════════════ */}
      <section id="vault" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px bg-neon-cyan/40" />
          <h2 className="text-3xl font-bold text-white tracking-tight">Resource Vault</h2>
          <div className="flex-1 h-px bg-nocturne-border" />
        </div>

        <p className="text-nocturne-muted text-sm max-w-2xl mb-10 leading-relaxed font-sans">
          A dynamic stream of developer resources, technical papers, system reports, and useful bookmarks fetched straight from the Nocturne Console database.
        </p>

        {/* Dynamic Category Subnav */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-nocturne-border pb-4 font-mono text-xs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 border transition-all duration-300 uppercase tracking-wider rounded-sm cursor-pointer ${
                activeTab === tab
                  ? 'border-neon-cyan text-neon-cyan shadow-[0_0_8px_rgba(0,212,255,0.2)] bg-neon-cyan/5'
                  : 'border-nocturne-border/50 text-nocturne-muted hover:text-white hover:border-nocturne-muted'
              }`}
            >
              [{tab}]
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVault.map((entry, idx) => (
            <div
              key={entry.id}
              className="glass-card p-6 border border-nocturne-border/40 hover:border-neon-cyan/30 hover:shadow-neon-cyan/5 flex flex-col justify-between group transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div>
                {/* Optional Image */}
                {entry.image && (
                  <div className="relative overflow-hidden aspect-[16/9] border border-nocturne-border/30 rounded-sm mb-4 bg-black/40">
                    <div className="absolute inset-0 bg-gradient-to-t from-nocturne-dark/60 via-transparent to-transparent z-10" />
                    <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-15 pointer-events-none z-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                    <img
                      src={entry.image}
                      alt={entry.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <span className={`category-badge ${entry.category} text-[9px] px-2 py-0.5`}>
                    {entry.category}
                  </span>
                  
                  <span className="text-[10px] text-nocturne-muted/40 font-mono">
                    {new Date(entry.addedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-neon-cyan transition-colors duration-200">
                  {entry.title}
                </h3>
                <p className="text-nocturne-muted text-xs leading-relaxed mb-6 font-sans">
                  {entry.description || 'No description provided.'}
                </p>
                {entry.review && (
                  <div className="mt-2 pt-2 border-t border-nocturne-border/30 text-[10px] text-neon-amber leading-relaxed font-mono mb-4">
                    <span className="text-nocturne-muted uppercase tracking-wider text-[9px] mr-1">[Review]:</span>
                    {entry.review}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-nocturne-border/30">
                <span className="text-[10px] text-nocturne-muted/40 font-mono truncate max-w-[150px]">
                  {entry.url.replace(/^https?:\/\//, '').split('/')[0]}
                </span>
                
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neon-cyan font-mono flex items-center gap-1 group-hover:underline cursor-pointer"
                >
                  Visit Site <span className="text-[10px]">↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ABOUT SECTION
          ════════════════════════════════════════════════════ */}
      <section id="about" className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-px bg-neon-green/40" />
          <h2 className="text-3xl font-bold text-white tracking-tight">About</h2>
          <div className="flex-1 h-px bg-nocturne-border" />
        </div>

        <div className="glass-card p-8">
          <p className="text-nocturne-muted leading-relaxed mb-6">
            I'm a passionate developer focused on building high-performance systems and beautiful user interfaces.
            With expertise spanning from low-level systems programming to modern web frameworks, I bring a
            holistic approach to software engineering.
          </p>
          <p className="text-nocturne-muted leading-relaxed mb-6">
            Currently exploring the intersections of distributed computing, machine learning infrastructure,
            and cybersecurity. I believe in writing clean, maintainable code that scales.
          </p>
          <p className="font-mono text-sm text-neon-green/60">
            {'>'} "Any sufficiently advanced technology is indistinguishable from magic." — Arthur C. Clarke
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-nocturne-border py-12 text-center">
        <button
          onClick={() => navigate('/console')}
          className="font-mono text-sm text-neon-green/50 hover:text-neon-green transition-colors duration-300 cursor-pointer"
        >
          {'>'} nocturne --mount console_
        </button>
        <p className="font-mono text-xs text-nocturne-muted mt-4">
          © {new Date().getFullYear()} Moriarty · Built with Nocturne Engine
        </p>
      </footer>
    </div>
  );
}
