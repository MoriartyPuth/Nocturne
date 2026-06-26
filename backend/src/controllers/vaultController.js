const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const VAULT_PATH = path.join(__dirname, '../../data/vault_store.json');

// ── Admin key setup ──────────────────────────────────────
const crypto = require('crypto');
let ADMIN_KEY = process.env.NOCTURNE_ADMIN_KEY;
if (!ADMIN_KEY) {
  ADMIN_KEY = crypto.randomBytes(16).toString('hex');
  console.log(`\n  ⚠️  [SECURITY WARNING]: NOCTURNE_ADMIN_KEY environment variable is not defined.`);
  console.log(`     Generated temporary admin key for this session: \x1b[33m${ADMIN_KEY}\x1b[0m`);
  console.log(`     Please specify a persistent key inside backend/.env\n`);
}

// ── Helpers ──────────────────────────────────────────────

async function readVault() {
  const raw = await fs.readFile(VAULT_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeVault(data) {
  await fs.writeFile(VAULT_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function handleBase64Image(base64DataUrl) {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:image/')) {
    return base64DataUrl;
  }

  const matches = base64DataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image data format');
  }

  const extension = matches[1].toLowerCase();
  const base64Data = matches[2];

  // Restrict allowed file extensions
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
  if (!allowedExtensions.includes(extension)) {
    throw new Error('Upload blocked: invalid image extension. Allowed types: PNG, JPG, JPEG, GIF, WEBP');
  }

  const buffer = Buffer.from(base64Data, 'base64');
  const filename = `${uuidv4()}.${extension}`;
  const uploadsDir = path.join(__dirname, '../../uploads');
  
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/${filename}`;
}

// ── Auth Middleware ──────────────────────────────────────

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin key.' });
  }
  next();
}

// ── Controllers ──────────────────────────────────────────

/**
 * POST /api/vault/auth
 * Validates the admin key and returns success/failure.
 */
async function verifyAdmin(req, res) {
  const { adminKey } = req.body;
  if (adminKey === ADMIN_KEY) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false, error: 'Invalid admin key.' });
  }
}

/**
 * GET /api/vault
 * Returns the full vault object (categories + entries).
 */
async function getVault(_req, res) {
  try {
    const vault = await readVault();
    res.json(vault);
  } catch (err) {
    console.error('[VAULT READ ERROR]', err.message);
    res.status(500).json({ error: 'Failed to read vault data.' });
  }
}

/**
 * GET /api/vault/stats
 * Returns aggregate statistics about the vault.
 */
async function getStats(_req, res) {
  try {
    const vault = await readVault();
    const entries = vault.entries || [];

    // Count per category
    const categoryBreakdown = {};
    for (const cat of vault.categories) {
      categoryBreakdown[cat] = entries.filter((e) => e.category === cat).length;
    }

    // Recent entries (last 5)
    const recent = [...entries]
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, 5);

    // Domain breakdown (top 5)
    const domainCounts = {};
    for (const entry of entries) {
      try {
        const domain = new URL(entry.url).hostname.replace('www.', '');
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch { /* skip invalid urls */ }
    }
    const topDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    // Timeline: entries per month
    const timeline = {};
    for (const entry of entries) {
      const month = entry.addedAt.substring(0, 7); // YYYY-MM
      timeline[month] = (timeline[month] || 0) + 1;
    }

    res.json({
      totalEntries: entries.length,
      totalCategories: vault.categories.length,
      categoryBreakdown,
      recent,
      topDomains,
      timeline,
    });
  } catch (err) {
    console.error('[STATS ERROR]', err.message);
    res.status(500).json({ error: 'Failed to compute stats.' });
  }
}

/**
 * POST /api/vault/add  (admin-protected)
 * Appends a new entry. Requires: title, url, category.
 */
async function addEntry(req, res) {
  try {
    const { title, description, url, category, review, image } = req.body;

    // Validation
    if (!title || !url || !category) {
      return res.status(400).json({
        error: 'Missing required fields: title, url, category.',
      });
    }

    // URL protocol validation
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return res.status(400).json({
          error: 'URL protocol rejected. Must use http:// or https://.',
        });
      }
    } catch {
      return res.status(400).json({
        error: 'URL validation failed. Invalid URL string.',
      });
    }

    const vault = await readVault();

    // Ensure category exists
    if (!vault.categories.includes(category)) {
      vault.categories.push(category);
    }

    const finalImageUrl = await handleBase64Image(image);

    const newEntry = {
      id: uuidv4(),
      title,
      description: description || '',
      url,
      category,
      review: review || '',
      image: finalImageUrl || '',
      addedAt: new Date().toISOString(),
    };

    vault.entries.push(newEntry);
    await writeVault(vault);

    res.status(201).json(newEntry);
  } catch (err) {
    console.error('[VAULT WRITE ERROR]', err.message);
    res.status(500).json({ error: 'Failed to add entry.' });
  }
}

/**
 * PUT /api/vault/:id  (admin-protected)
 * Updates an existing entry by ID.
 */
async function updateEntry(req, res) {
  try {
    const { id } = req.params;
    const { title, description, url, category, review, image } = req.body;

    const vault = await readVault();
    const entryIndex = vault.entries.findIndex((e) => e.id === id);

    if (entryIndex === -1) {
      return res.status(404).json({ error: `Entry with id "${id}" not found.` });
    }

    // URL protocol validation
    if (url !== undefined) {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return res.status(400).json({
            error: 'URL protocol rejected. Must use http:// or https://.',
          });
        }
      } catch {
        return res.status(400).json({
          error: 'URL validation failed. Invalid URL string.',
        });
      }
    }

    // Merge updates
    const existing = vault.entries[entryIndex];
    let finalImageUrl = existing.image;
    if (image !== undefined) {
      finalImageUrl = await handleBase64Image(image);
    }

    vault.entries[entryIndex] = {
      ...existing,
      title: title ?? existing.title,
      description: description ?? existing.description,
      url: url ?? existing.url,
      category: category ?? existing.category,
      review: review ?? existing.review,
      image: finalImageUrl,
    };

    // Ensure category exists
    if (category && !vault.categories.includes(category)) {
      vault.categories.push(category);
    }

    await writeVault(vault);
    res.json(vault.entries[entryIndex]);
  } catch (err) {
    console.error('[VAULT UPDATE ERROR]', err.message);
    res.status(500).json({ error: 'Failed to update entry.' });
  }
}

/**
 * DELETE /api/vault/:id  (admin-protected)
 * Removes entry matching the given ID.
 */
async function deleteEntry(req, res) {
  try {
    const { id } = req.params;
    const vault = await readVault();

    const initialLength = vault.entries.length;
    vault.entries = vault.entries.filter((entry) => entry.id !== id);

    if (vault.entries.length === initialLength) {
      return res.status(404).json({ error: `Entry with id "${id}" not found.` });
    }

    await writeVault(vault);
    res.json({ message: 'Entry deleted.', id });
  } catch (err) {
    console.error('[VAULT DELETE ERROR]', err.message);
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
}

module.exports = { getVault, getStats, addEntry, updateEntry, deleteEntry, verifyAdmin, requireAdmin };
