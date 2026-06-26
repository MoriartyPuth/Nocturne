require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const vaultRoutes = require('./routes/vaultRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Security Headers & Middlewares ────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(uploadsDir));

// ── Rate Limiting ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again later.' },
});

app.use('/api/vault/auth', authLimiter);
app.use('/api/', apiLimiter);

// ── Routes ───────────────────────────────────────────────
app.use('/api/vault', vaultRoutes);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// ── Serve Frontend Static Files (Production) ─────────────
const frontendBuildDir = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendBuildDir)) {
  app.use(express.static(frontendBuildDir));
  
  // Single Page Application (SPA) fallback routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuildDir, 'index.html'));
    }
  });
}

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║  NOCTURNE MAINFRAME — ONLINE         ║`);
  console.log(`  ║  Port: ${PORT}                          ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
