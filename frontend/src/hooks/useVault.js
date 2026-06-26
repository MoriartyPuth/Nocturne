import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:4000/api/vault';

/**
 * useVault — Reactive state hook for the Nocturne Vault API.
 * Now supports full CRUD operations with admin authentication.
 */
export function useVault() {
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVault = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntries(data.entries || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error('[VAULT HOOK] Fetch failed:', err.message);
      setError('Failed to connect to Nocturne Mainframe. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  /** Add a new entry (requires admin key) */
  const addEntry = useCallback(async (entry, adminKey) => {
    const res = await fetch(`${API_BASE}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add entry');
    }
    const newEntry = await res.json();
    await fetchVault(); // Refresh
    return newEntry;
  }, [fetchVault]);

  /** Update an existing entry (requires admin key) */
  const updateEntry = useCallback(async (id, updates, adminKey) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update entry');
    }
    const updated = await res.json();
    await fetchVault(); // Refresh
    return updated;
  }, [fetchVault]);

  /** Delete an entry (requires admin key) */
  const deleteEntry = useCallback(async (id, adminKey) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': adminKey,
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete entry');
    }
    await fetchVault(); // Refresh
  }, [fetchVault]);

  return {
    entries, categories, loading, error,
    refetch: fetchVault, addEntry, updateEntry, deleteEntry,
  };
}

/**
 * useAdmin — Admin authentication hook.
 * Stores admin key in sessionStorage so it persists across page reloads.
 */
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKeyState] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('nocturne_admin_key');
    if (stored) {
      setAdminKeyState(stored);
      setIsAdmin(true);
    }
  }, []);

  const login = useCallback(async (key) => {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey: key }),
    });
    const data = await res.json();
    if (data.authenticated) {
      sessionStorage.setItem('nocturne_admin_key', key);
      setAdminKeyState(key);
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('nocturne_admin_key');
    setAdminKeyState('');
    setIsAdmin(false);
  }, []);

  return { isAdmin, adminKey, login, logout };
}

/**
 * useStats — Fetches vault statistics for the dashboard.
 */
export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('[STATS HOOK] Fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetchStats: fetchStats };
}
