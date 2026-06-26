/**
 * ConsoleGrid — Responsive grid of vault resource cards.
 * Now supports admin edit/delete actions inline.
 */
export default function ConsoleGrid({ entries, isAdmin, onEdit, onDelete }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-nocturne-muted text-sm mb-2 font-mono">
            <span className="text-neon-amber">[WARN]</span> No assets found in this directory.
          </div>
          <p className="text-xs text-nocturne-muted/50 font-mono">
            Try adjusting your search query or selecting a different category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="vault-grid">
      {entries.map((entry, idx) => (
        <div
          key={entry.id}
          className="console-card p-5 animate-fade-in group relative"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          {/* Admin action buttons */}
          {isAdmin && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(entry); }}
                className="px-2 py-1 text-[10px] font-mono text-neon-cyan border border-neon-cyan/30
                           rounded-sm hover:bg-neon-cyan/10 hover:border-neon-cyan cursor-pointer
                           transition-all duration-200"
                title="Edit entry"
              >
                EDIT
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(entry); }}
                className="px-2 py-1 text-[10px] font-mono text-neon-red border border-neon-red/30
                           rounded-sm hover:bg-neon-red/10 hover:border-neon-red cursor-pointer
                           transition-all duration-200"
                title="Delete entry"
              >
                DEL
              </button>
            </div>
          )}

          {/* Clickable content area */}
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block no-underline"
          >
            {/* Image */}
            {entry.image && (
              <div className="relative overflow-hidden aspect-[16/9] border border-nocturne-border/30 rounded-sm mb-3.5 bg-black/40">
                <div className="absolute inset-0 bg-gradient-to-t from-nocturne-darker/60 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-20 pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                <img
                  src={entry.image}
                  alt={entry.title}
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                {/* Category badge */}
                <span className={`category-badge ${entry.category} mb-2`}>
                  {entry.category}
                </span>

                {/* Title */}
                <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-neon-green transition-colors duration-200 truncate">
                  {entry.title}
                </h3>
              </div>

              {/* External link icon */}
              <span className="text-nocturne-muted/30 group-hover:text-neon-green/60 transition-colors ml-3 text-xs flex-shrink-0 mt-1">
                ↗
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-nocturne-muted leading-relaxed line-clamp-2">
              {entry.description}
            </p>

            {/* Optional Review */}
            {entry.review && (
              <div className="mt-2.5 pt-2 border-t border-nocturne-border/30 text-[10px] text-neon-amber leading-relaxed font-mono">
                <span className="text-nocturne-muted uppercase tracking-wider text-[9px] mr-1">[Review]:</span>
                {entry.review}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-nocturne-border/50">
              <span className="text-[10px] text-nocturne-muted/40 font-mono truncate max-w-[180px]">
                {entry.url.replace(/^https?:\/\//, '').split('/')[0]}
              </span>
              <span className="text-[10px] text-nocturne-muted/30 font-mono">
                {new Date(entry.addedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}
