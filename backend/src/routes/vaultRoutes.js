const express = require('express');
const router = express.Router();
const {
  getVault,
  getStats,
  addEntry,
  updateEntry,
  deleteEntry,
  verifyAdmin,
  requireAdmin,
} = require('../controllers/vaultController');

// ── Public Routes ────────────────────────────────────────
// GET  /api/vault        → Fetch all vault entries
router.get('/', getVault);

// GET  /api/vault/stats  → Fetch vault statistics
router.get('/stats', getStats);

// POST /api/vault/auth   → Verify admin key
router.post('/auth', verifyAdmin);

// ── Admin-Protected Routes ───────────────────────────────
// POST   /api/vault/add    → Append a new entry
router.post('/add', requireAdmin, addEntry);

// PUT    /api/vault/:id    → Update entry by ID
router.put('/:id', requireAdmin, updateEntry);

// DELETE /api/vault/:id    → Remove entry by ID
router.delete('/:id', requireAdmin, deleteEntry);

module.exports = router;
