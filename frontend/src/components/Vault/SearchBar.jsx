/**
 * SearchBar — Terminal-style search input with prompt prefix.
 * Captures string tokens for real-time filtering.
 */
export default function SearchBar({ value, onChange }) {
  return (
    <div className="flex items-center bg-nocturne-darker border border-nocturne-border rounded-sm
                    focus-within:border-neon-green/40 transition-colors duration-200 group">
      {/* Terminal prompt */}
      <span className="pl-3 pr-2 text-neon-green/50 text-xs whitespace-nowrap select-none font-mono">
        nocturne:~/search $
      </span>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="type to filter assets..."
        className="flex-1 bg-transparent text-neon-green text-sm py-2.5 pr-3 font-mono
                   placeholder:text-nocturne-muted/40 focus:outline-none"
        spellCheck={false}
        autoComplete="off"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="px-3 text-nocturne-muted hover:text-neon-red text-xs transition-colors cursor-pointer"
          title="Clear search"
        >
          [×]
        </button>
      )}

      {/* Cursor indicator */}
      {!value && (
        <span className="terminal-cursor mr-3 opacity-40 group-focus-within:opacity-100" />
      )}
    </div>
  );
}
