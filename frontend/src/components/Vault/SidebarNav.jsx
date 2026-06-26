/**
 * SidebarNav — Terminal-style directory navigation.
 * Translates vault categories into clickable directory buttons.
 */
export default function SidebarNav({ categories, activeCategory, onSelect }) {
  return (
    <nav className="space-y-0.5">
      {/* All files */}
      <button
        onClick={() => onSelect('all')}
        className={`sidebar-item w-full text-left block cursor-pointer ${
          activeCategory === 'all' ? 'active' : ''
        }`}
      >
        <span className="text-neon-green/40 mr-1">&gt;</span> /dashboard
      </button>

      {/* Category directories */}
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`sidebar-item w-full text-left block cursor-pointer ${
            activeCategory === cat ? 'active' : ''
          }`}
        >
          <span className="text-neon-green/40 mr-1">&gt;</span> /{cat}
        </button>
      ))}

      {/* Decorative separator */}
      <div className="pt-4 pb-2">
        <div className="h-px bg-nocturne-border" />
      </div>

      {/* System links */}
      <div className="text-xs text-nocturne-muted/40 space-y-1 pl-4">
        <div className="flex items-center gap-2">
          <span className="text-neon-green/20">■</span>
          <span>sys.config</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neon-amber/20">■</span>
          <span>net.status</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neon-cyan/20">■</span>
          <span>data.pipeline</span>
        </div>
      </div>
    </nav>
  );
}
