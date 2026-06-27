import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVault, useAdmin } from '../hooks/useVault';
import SidebarNav from '../components/Vault/SidebarNav';
import SearchBar from '../components/Vault/SearchBar';
import ConsoleGrid from '../components/Vault/ConsoleGrid';
import StatsPanel from '../components/Vault/StatsPanel';
import AdminLogin from '../components/Vault/AdminLogin';
import EntryModal from '../components/Vault/EntryModal';
import NocturneCore from '../components/Vault/NocturneCore';
import SystemLogs from '../components/Vault/SystemLogs';

/* ── Boot sequence messages ─────────────────────────────── */
const BOOT_LINES = [
  { text: 'NOCTURNE MAINFRAME v2.0.26', color: 'text-neon-green' },
  { text: 'Initializing kernel modules...', color: 'text-nocturne-muted' },
  { text: 'Loading vault_store.json ████████████ OK', color: 'text-nocturne-muted' },
  { text: 'Mounting /dev/console interface...', color: 'text-nocturne-muted' },
  { text: 'Establishing secure data pipeline... OK', color: 'text-nocturne-muted' },
  { text: 'System ready. Welcome, Operator.', color: 'text-neon-green' },
];

export default function TechVault() {
  const navigate = useNavigate();
  const { entries, categories, loading, error, addEntry, updateEntry, deleteEntry } = useVault();
  const { isAdmin, adminKey, login, logout } = useAdmin();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bootComplete, setBootComplete] = useState(false);
  const [visibleBootLines, setVisibleBootLines] = useState(0);

  // Modal states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  // Command center inline form and search states
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineUrl, setInlineUrl] = useState('');
  const [inlineCategory, setInlineCategory] = useState('');
  const [inlineNewCategory, setInlineNewCategory] = useState('');
  const [inlineDescription, setInlineDescription] = useState('');
  const [inlineImage, setInlineImage] = useState('');
  const [inlineReview, setInlineReview] = useState('');
  const [dashboardSearch, setDashboardSearch] = useState('');

  /* ── Sync default inline category ─────────────────────── */
  useEffect(() => {
    if (categories && categories.length > 0 && !inlineCategory) {
      setInlineCategory(categories[0]);
    }
  }, [categories, inlineCategory]);

  /* ── Toast helper ─────────────────────────────────────── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Boot animation ───────────────────────────────────── */
  useEffect(() => {
    if (bootComplete) return;
    const interval = setInterval(() => {
      setVisibleBootLines((prev) => {
        if (prev >= BOOT_LINES.length) {
          clearInterval(interval);
          setTimeout(() => setBootComplete(true), 400);
          return prev;
        }
        return prev + 1;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [bootComplete]);

  /* ── Filter logic ─────────────────────────────────────── */
  const filtered = entries.filter((entry) => {
    const matchCategory = activeCategory === 'all' || entry.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredDashboardEntries = entries.filter((entry) => {
    return !dashboardSearch ||
      entry.title.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
      entry.description.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
      entry.category.toLowerCase().includes(dashboardSearch.toLowerCase());
  });

  /* ── CRUD handlers ────────────────────────────────────── */
  const handleSaveEntry = async (formData, entryId) => {
    try {
      if (entryId) {
        await updateEntry(entryId, formData, adminKey);
        showToast(`Updated: ${formData.title}`);
      } else {
        await addEntry(formData, adminKey);
        showToast(`Added: ${formData.title}`);
      }
      setShowEntryModal(false);
      setEditingEntry(null);
    } catch (err) {
      throw err; // Let modal handle the error
    }
  };

  const handleInlineFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setInlineImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInlineAdd = async (e) => {
    e.preventDefault();
    const finalCategory = inlineCategory === 'new' ? inlineNewCategory.trim() : inlineCategory;
    if (!inlineTitle || !inlineUrl || !finalCategory) {
      showToast('Missing required fields', 'error');
      return;
    }
    try {
      await addEntry({
        title: inlineTitle,
        url: inlineUrl,
        category: finalCategory,
        description: inlineDescription,
        image: inlineImage,
        review: inlineReview,
      }, adminKey);
      showToast(`Added: ${inlineTitle}`);
      // Reset form
      setInlineTitle('');
      setInlineUrl('');
      setInlineCategory(categories[0] || 'tools');
      setInlineNewCategory('');
      setInlineDescription('');
      setInlineImage('');
      setInlineReview('');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowEntryModal(true);
  };

  const handleDeleteEntry = async (entry) => {
    setDeleteConfirm(entry);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteEntry(deleteConfirm.id, adminKey);
      showToast(`Deleted: ${deleteConfirm.title}`, 'warn');
      setDeleteConfirm(null);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleAddNew = () => {
    setEditingEntry(null);
    setShowEntryModal(true);
  };

  /* ── Boot sequence screen ─────────────────────────────── */
  if (!bootComplete) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="crt-overlay" />
        <div className="max-w-2xl w-full font-mono text-sm space-y-1">
          {BOOT_LINES.slice(0, visibleBootLines).map((line, idx) => (
            <div
              key={idx}
              className={`boot-line ${line.color}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <span className="text-neon-green/40 mr-2">[{String(idx).padStart(2, '0')}]</span>
              {line.text}
            </div>
          ))}
          {visibleBootLines < BOOT_LINES.length && (
            <span className="terminal-cursor" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-mono text-white relative">
      {/* CRT Overlay */}
      <div className="crt-overlay" />

      {/* ── Modals ───────────────────────────────────────────── */}
      {showAdminLogin && (
        <AdminLogin
          onLogin={async (key) => {
            const ok = await login(key);
            if (ok) {
              setShowAdminLogin(false);
              showToast('Authenticated as Operator');
            }
            return ok;
          }}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {showEntryModal && (
        <EntryModal
          entry={editingEntry}
          categories={categories}
          onSave={handleSaveEntry}
          onClose={() => { setShowEntryModal(false); setEditingEntry(null); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="console-card w-full max-w-sm mx-4 p-6 border-neon-red/30 text-center">
            <div className="text-2xl mb-3">⚠️</div>
            <h3 className="text-sm font-semibold text-white mb-2">Confirm Deletion</h3>
            <p className="text-xs text-nocturne-muted mb-1">
              Delete <span className="text-neon-red">"{deleteConfirm.title}"</span>?
            </p>
            <p className="text-[10px] text-nocturne-muted/50 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 border border-neon-red/40 text-neon-red font-mono text-xs
                           tracking-wider uppercase rounded-sm cursor-pointer
                           hover:bg-neon-red/10 hover:border-neon-red transition-all"
              >
                → DELETE
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-nocturne-border text-nocturne-muted font-mono text-xs
                           tracking-wider uppercase rounded-sm cursor-pointer
                           hover:border-nocturne-muted hover:text-white transition-all"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 console-card px-4 py-3 animate-slide-in-right
          ${toast.type === 'success' ? 'border-neon-green/40' : ''}
          ${toast.type === 'warn' ? 'border-neon-amber/40' : ''}
          ${toast.type === 'error' ? 'border-neon-red/40' : ''}
        `}>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={
              toast.type === 'success' ? 'text-neon-green' :
              toast.type === 'warn' ? 'text-neon-amber' : 'text-neon-red'
            }>
              {toast.type === 'success' ? '[OK]' : toast.type === 'warn' ? '[WARN]' : '[ERR]'}
            </span>
            <span className="text-white">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Top Bar ────────────────────────────────────────── */}
      <header className="relative z-10 h-[66px] border-b border-[rgba(34,197,94,0.12)] bg-nocturne-darker/80 backdrop-blur-md flex items-center">
        <div className="flex items-center justify-between px-8 w-full">
          {/* Left: Logo + back link */}
          <div className="flex items-center gap-4">
            <h1 className="text-sm neon-green tracking-[0.2em] uppercase">
              Nocturne
            </h1>
            <span className="text-nocturne-border text-xs select-none">|</span>
            <a
              href="https://MoriartyPuth.github.io"
              rel="noopener"
              className="font-mono text-xs text-neon-green/70 hover:text-neon-green transition-colors"
            >
              ← portfolio
            </a>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex items-center gap-3">

            {/* Admin controls */}
            {isAdmin ? (
              <>
                <button
                  onClick={handleAddNew}
                  className="px-2 py-1 text-[10px] font-mono text-neon-green border border-neon-green/30
                             rounded-sm hover:bg-neon-green/10 hover:border-neon-green cursor-pointer
                             transition-all duration-200"
                >
                  + ADD
                </button>
                <button
                  onClick={logout}
                  className="text-nocturne-muted hover:text-neon-red text-xs cursor-pointer transition-colors"
                  title="Logout"
                >
                  [LOCK]
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="text-nocturne-muted hover:text-neon-amber text-xs cursor-pointer transition-colors"
                title="Admin Login"
              >
                [AUTH]
              </button>
            )}

            <div className="w-px h-4 bg-nocturne-border" />

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-neon-green/60 hidden sm:inline">MAINFRAME ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-amber" />
              <span className="text-xs text-neon-amber/60 hidden sm:inline">
                {entries.length} ASSETS
              </span>
            </div>
            <span className="text-xs text-nocturne-muted">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-[calc(100vh-77px)]">

        {/* Sidebar */}
        <aside className="w-56 border-r border-nocturne-border bg-nocturne-darker/40 flex-shrink-0 hidden md:block">
          <div className="p-4">
            <div className="text-xs text-nocturne-muted mb-3 tracking-[0.15em] uppercase">
              Directory
            </div>
            <SidebarNav
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>

          {/* Sidebar footer */}
          <div className="absolute bottom-0 left-0 w-56 p-4 border-t border-nocturne-border">
            <div className="text-xs text-nocturne-muted space-y-1">
              <div className="flex justify-between">
                <span>Memory</span>
                <span className="text-neon-green/60">24.8 MB</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime</span>
                <span className="text-neon-green/60">12:04:33</span>
              </div>
              <div className="flex justify-between">
                <span>Auth</span>
                <span className={isAdmin ? 'text-neon-green/60' : 'text-neon-red/60'}>
                  {isAdmin ? 'OPERATOR' : 'GUEST'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 md:p-12 lg:p-14 overflow-y-auto space-y-10">

          {/* ── STATS VIEW (when /all is selected) ──────────── */}
          {activeCategory === 'all' && !searchQuery ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-nocturne-muted tracking-[0.15em] uppercase">
                    System Analytics
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-[10px] text-neon-green/50">LIVE</span>
                </div>
                <span className="text-xs text-nocturne-muted hidden sm:inline">
                  nocturne:~/dashboard $
                </span>
              </div>

              {/* ── Mainframe Status Node & System Logs Panel ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 border border-nocturne-border bg-nocturne-darker/30 p-4 rounded-sm animate-fade-in relative z-10">
                {/* Left 2/3: System Diagnostic log stream */}
                <div className="lg:col-span-2 border border-nocturne-border rounded-sm bg-black/30 overflow-hidden h-[340px]">
                  <SystemLogs />
                </div>

                {/* Right 1/3: Interactive 3D ASCII Core node */}
                <div className="lg:col-span-1 border border-nocturne-border rounded-sm bg-black/30 flex items-center justify-center p-2 relative h-[340px]">
                  <NocturneCore />
                </div>
              </div>

              {/* Stats Grid */}
              <StatsPanel onCategoryClick={setActiveCategory} />

              {/* ── OPERATOR COMMAND CENTER ─────────────────── */}
              {isAdmin && (
                <div className="mt-8 border border-neon-green/30 bg-black/40 rounded-sm p-5 relative animate-fade-in z-10">
                  <div className="absolute top-0 left-4 -translate-y-1/2 bg-black px-2 text-xs font-bold text-neon-green tracking-wider">
                    [OPERATOR COMMAND CENTER]
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Add Form */}
                    <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-nocturne-border/50 pb-6 lg:pb-0 lg:pr-6">
                      <h3 className="text-xs text-neon-green font-bold uppercase mb-4 tracking-wider">
                        &gt; Quick Add Asset
                      </h3>
                      <form onSubmit={handleInlineAdd} className="space-y-3 font-mono">
                        <div>
                          <label className="block text-[10px] text-nocturne-muted uppercase mb-1">Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. React Documentation"
                            value={inlineTitle}
                            onChange={(e) => setInlineTitle(e.target.value)}
                            className="w-full bg-nocturne-darker border border-nocturne-border focus:border-neon-green px-2 py-1 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-nocturne-muted uppercase mb-1">URL</label>
                          <input
                            type="url"
                            required
                            placeholder="e.g. https://react.dev"
                            value={inlineUrl}
                            onChange={(e) => setInlineUrl(e.target.value)}
                            className="w-full bg-nocturne-darker border border-nocturne-border focus:border-neon-green px-2 py-1 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-nocturne-muted uppercase mb-1">Category</label>
                          <select
                            value={inlineCategory}
                            onChange={(e) => setInlineCategory(e.target.value)}
                            className="w-full bg-nocturne-darker border border-nocturne-border focus:border-neon-green px-2 py-1 text-xs text-white outline-none"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="new">+ Create New Category</option>
                          </select>
                          {inlineCategory === 'new' && (
                            <input
                              type="text"
                              required
                              placeholder="New category name"
                              value={inlineNewCategory}
                              onChange={(e) => setInlineNewCategory(e.target.value)}
                              className="w-full bg-nocturne-darker border border-nocturne-border focus:border-neon-green px-2 py-1 text-xs text-white outline-none mt-2"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] text-nocturne-muted uppercase mb-1">Description</label>
                          <textarea
                            placeholder="Brief description of resource..."
                            value={inlineDescription}
                            onChange={(e) => setInlineDescription(e.target.value)}
                            className="w-full bg-nocturne-darker border border-nocturne-border focus:border-neon-green px-2 py-1 text-xs text-white outline-none h-12 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-nocturne-muted uppercase mb-1">Image Upload</label>
                          {inlineImage ? (
                            <div className="relative border border-nocturne-border/50 rounded-sm overflow-hidden aspect-[16/9] bg-black/30 group mb-2">
                              <img
                                src={inlineImage}
                                alt="Upload Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setInlineImage('')}
                                className="absolute top-1 right-1 bg-black/80 hover:bg-neon-red/20 hover:border-neon-red border border-nocturne-border px-1.5 py-0.5 text-[8px] text-neon-red font-mono rounded-sm transition-all cursor-pointer"
                              >
                                REMOVE
                              </button>
                            </div>
                          ) : (
                            <div className="border border-dashed border-nocturne-border hover:border-neon-green/50 rounded-sm p-2 text-center cursor-pointer transition-colors relative bg-black/20">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleInlineFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <span className="text-[9px] text-nocturne-muted font-mono uppercase tracking-wider block">
                                Click to Upload Image
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] text-nocturne-muted uppercase mb-1">Review / Notes</label>
                          <textarea
                            placeholder="Optional notes/review..."
                            value={inlineReview}
                            onChange={(e) => setInlineReview(e.target.value)}
                            className="w-full bg-nocturne-darker border border-nocturne-border focus:border-neon-green px-2 py-1 text-xs text-white outline-none h-12 resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 border border-neon-green/40 hover:border-neon-green text-neon-green hover:bg-neon-green/10 text-xs tracking-wider uppercase transition-all rounded-sm cursor-pointer"
                        >
                          Execute Add Entry
                        </button>
                      </form>
                    </div>

                    {/* Database Quick Manager List */}
                    <div className="lg:col-span-2 flex flex-col h-[460px] font-mono">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                        <h3 className="text-xs text-neon-cyan font-bold uppercase tracking-wider">
                          &gt; Active Vault Records ({entries.length})
                        </h3>
                        <input
                          type="text"
                          placeholder="Quick search records..."
                          value={dashboardSearch}
                          onChange={(e) => setDashboardSearch(e.target.value)}
                          className="bg-nocturne-darker border border-nocturne-border focus:border-neon-cyan px-2 py-0.5 text-[10px] text-white outline-none w-44"
                        />
                      </div>
                      
                      {/* Scrollable list */}
                      <div className="flex-1 overflow-y-auto border border-nocturne-border/50 bg-nocturne-darker/60 p-2.5 space-y-2 custom-scrollbar">
                        {filteredDashboardEntries.length === 0 ? (
                          <div className="text-center text-xs text-nocturne-muted py-12">
                            No matching records found.
                          </div>
                        ) : (
                          filteredDashboardEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between border-b border-nocturne-border/10 pb-2 text-xs">
                              <div className="min-w-0 pr-4">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`category-badge ${entry.category} text-[9px] px-1.5 py-0.5`}>
                                    {entry.category}
                                  </span>
                                  <span className="text-white font-semibold truncate max-w-[200px]">{entry.title}</span>
                                </div>
                                <div className="text-[10px] text-nocturne-muted truncate max-w-[320px]">{entry.url}</div>
                              </div>
                              
                              <div className="flex items-center gap-2.5 flex-shrink-0">
                                <button
                                  onClick={() => handleEditEntry(entry)}
                                  className="text-[10px] text-neon-cyan hover:underline hover:text-white cursor-pointer"
                                >
                                  [EDIT]
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry)}
                                  className="text-[10px] text-neon-red hover:underline hover:text-white cursor-pointer"
                                >
                                  [DELETE]
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ── FILTERED VIEW (specific category or search) ── */
            <>
              {/* Search Bar */}
              <div className="mb-6">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>

              {/* Mobile category select */}
              <div className="md:hidden mb-4">
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full bg-nocturne-panel border border-nocturne-border text-neon-green text-sm py-2 px-3 rounded-sm font-mono focus:outline-none focus:border-neon-green"
                >
                  <option value="all">&gt; /dashboard</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>&gt; /{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between mb-4 text-xs text-nocturne-muted">
                <span>
                  Showing {filtered.length} of {entries.length} assets
                  {activeCategory !== 'all' && (
                    <span className="text-neon-green"> in /{activeCategory}</span>
                  )}
                  {searchQuery && (
                    <span className="text-neon-amber"> matching "{searchQuery}"</span>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button
                      onClick={handleAddNew}
                      className="text-neon-green hover:text-neon-green text-xs cursor-pointer sm:hidden"
                    >
                      [+ADD]
                    </button>
                  )}
                  <span className="hidden sm:inline">
                    nocturne:~/{activeCategory === 'all' ? '*' : activeCategory} $
                  </span>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="text-neon-green animate-pulse text-sm mb-2">
                      ████████████████████
                    </div>
                    <span className="text-xs text-nocturne-muted">Loading vault data...</span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center console-card p-6 border-neon-red/30">
                    <div className="text-neon-red text-sm mb-2">[ERROR]</div>
                    <p className="text-nocturne-muted text-xs">{error}</p>
                    <p className="text-xs text-nocturne-muted mt-2">
                      Run: <span className="text-neon-amber">cd backend &amp;&amp; npm run dev</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Grid */}
              {!loading && !error && (
                <ConsoleGrid
                  entries={filtered}
                  isAdmin={isAdmin}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
