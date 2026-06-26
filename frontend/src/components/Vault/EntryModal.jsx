import { useState, useEffect } from 'react';

/**
 * EntryModal — Add or edit a vault entry.
 * Terminal-styled form with neon accents.
 */
export default function EntryModal({ entry, categories, onSave, onClose }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    category: categories[0] || 'tools',
    review: '',
    image: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (entry) {
      setForm({
        title: entry.title || '',
        description: entry.description || '',
        url: entry.url || '',
        category: entry.category || categories[0] || 'tools',
        review: entry.review || '',
        image: entry.image || '',
      });
    }
  }, [entry, categories]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('image', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) {
      setError('Title and URL are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form, entry?.id);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="console-card w-full max-w-lg mx-4 p-0 border-neon-cyan/30 overflow-hidden">
        {/* Header */}
        <div className="border-b border-nocturne-border px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-xs font-mono text-neon-cyan tracking-wider">
              {isEdit ? 'EDIT ENTRY' : 'NEW ENTRY'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-nocturne-muted hover:text-white text-xs font-mono cursor-pointer transition-colors"
          >
            [ESC]
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs text-nocturne-muted font-mono">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. React Documentation"
              className="modal-input"
              autoFocus
            />
          </div>

          {/* URL */}
          <div className="space-y-1">
            <label className="text-xs text-nocturne-muted font-mono">URL *</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://..."
              className="modal-input"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-nocturne-muted font-mono">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description..."
              rows={3}
              className="modal-input resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs text-nocturne-muted font-mono">Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="modal-input"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  /{cat}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs text-nocturne-muted font-mono block">Image Upload</label>
            
            {/* Preview Box */}
            {form.image ? (
              <div className="relative border border-nocturne-border/50 rounded-sm overflow-hidden aspect-[16/9] bg-black/30 group">
                <img
                  src={form.image}
                  alt="Upload Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleChange('image', '')}
                  className="absolute top-2 right-2 bg-black/80 hover:bg-neon-red/20 hover:border-neon-red border border-nocturne-border px-2 py-1 text-[10px] text-neon-red font-mono rounded-sm transition-all cursor-pointer"
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-nocturne-border hover:border-neon-green/50 rounded-sm p-4 text-center cursor-pointer transition-colors relative bg-black/20">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-[10px] text-nocturne-muted font-mono uppercase tracking-wider block">
                  Click or drag image to upload
                </span>
                <span className="text-[9px] text-nocturne-muted/50 font-mono block mt-1">
                  Supports PNG, JPG, WEBP (Max 5MB)
                </span>
              </div>
            )}
          </div>

          {/* Review / Operator Notes */}
          <div className="space-y-1">
            <label className="text-xs text-nocturne-muted font-mono">Review / Operator Notes</label>
            <textarea
              value={form.review}
              onChange={(e) => handleChange('review', e.target.value)}
              placeholder="Optional system review/notes..."
              rows={3}
              className="modal-input resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-neon-red font-mono animate-fade-in">
              <span className="text-neon-red">[ERR]</span> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 border border-neon-green/40 text-neon-green font-mono text-xs
                         tracking-wider uppercase rounded-sm cursor-pointer
                         hover:bg-neon-green/10 hover:border-neon-green hover:shadow-neon-green
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-300"
            >
              {saving
                ? '▓▓▓ SAVING...'
                : isEdit
                  ? '→ UPDATE ENTRY'
                  : '→ ADD ENTRY'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-nocturne-border text-nocturne-muted font-mono text-xs
                         tracking-wider uppercase rounded-sm cursor-pointer
                         hover:border-nocturne-muted hover:text-white
                         transition-all duration-300"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
