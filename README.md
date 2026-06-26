# Nocturne

A modular monorepo featuring a **Node.js/Express backend** ("The Mainframe") and a **React/Vite/Tailwind** frontend with two distinct views:

- **Prelude** — A premium dark developer portfolio at `/`
- **Nocturne Console** — A retro cyberpunk data terminal at `/console`

## Quick Start

### Backend (Port 4000)
```bash
cd backend
npm install
npm run dev
```

### Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Architecture

```
Nocturne/
├── backend/           # Node.js + Express API
│   ├── data/          # vault_store.json (data source)
│   └── src/           # server, routes, controllers
└── frontend/          # React + Vite + Tailwind v3
    └── src/
        ├── views/     # MainPortfolio, TechVault
        ├── components/# Vault UI components
        └── hooks/     # useVault data hook
```

## API Endpoints

| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| GET    | `/api/vault`      | Fetch all entries   |
| POST   | `/api/vault/add`  | Add new entry       |
| DELETE | `/api/vault/:id`  | Delete entry by ID  |
| GET    | `/api/health`     | Health check        |

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v3, React Router v6
- **Backend**: Node.js, Express, fs/promises
- **Design**: CRT scanlines, neon glow effects, glassmorphism
