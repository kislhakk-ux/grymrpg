// GymForge — Arena Firestore Real-Time Service
// Uses Firebase Client SDK for cross-device, cross-browser real-time sync
// Works on PC, mobile, any device, without backend state dependency

import { db, isFirebaseConfigured } from './firebase.js';

// Import Firestore functions
let fsDoc, fsSetDoc, fsGetDoc, fsDeleteDoc, fsOnSnapshot, fsCollection,
    fsQuery, fsWhere, fsUpdateDoc, fsServerTimestamp, fsOrderBy, fsLimit;

// Dynamic import to avoid crashes when Firebase is not configured
async function loadFirestoreFns() {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const mod = await import('firebase/firestore');
    fsDoc = mod.doc;
    fsSetDoc = mod.setDoc;
    fsGetDoc = mod.getDoc;
    fsDeleteDoc = mod.deleteDoc;
    fsOnSnapshot = mod.onSnapshot;
    fsCollection = mod.collection;
    fsQuery = mod.query;
    fsWhere = mod.where;
    fsUpdateDoc = mod.updateDoc;
    fsServerTimestamp = mod.serverTimestamp;
    fsOrderBy = mod.orderBy;
    fsLimit = mod.limit;
    return true;
  } catch (e) {
    console.warn('[ArenaFS] Failed to load Firestore functions:', e);
    return false;
  }
}

// ---- In-Memory Fallback (single tab, local dev) ----
const _memQueue = {};
const _memBroadcast = { current: null };
const _memMatches = {};

let _firestoreReady = false;
loadFirestoreFns().then(ok => { _firestoreReady = ok; });

// ---- Collection Names ----
const COL_QUEUE = 'arena_queue';
const COL_GLOBAL = 'arena_global';
const DOC_BROADCAST = 'arena_broadcast';
const COL_MATCHES = 'arena_matches';

// ---- Queue Operations ----

export async function enterQueue(userId, profile) {
  const entry = { ...profile, userId, timestamp: Date.now() };
  if (_firestoreReady) {
    try {
      await fsSetDoc(fsDoc(db, COL_QUEUE, userId), entry);
      return;
    } catch (e) { console.warn('[ArenaFS] enterQueue failed:', e); }
  }
  _memQueue[userId] = entry;
}

export async function leaveQueue(userId) {
  if (_firestoreReady) {
    try {
      await fsDeleteDoc(fsDoc(db, COL_QUEUE, userId));
      return;
    } catch (e) { console.warn('[ArenaFS] leaveQueue failed:', e); }
  }
  delete _memQueue[userId];
}

export async function getQueue() {
  if (_firestoreReady) {
    try {
      const { getDocs } = await import('firebase/firestore');
      const snap = await getDocs(fsCollection(db, COL_QUEUE));
      const result = {};
      snap.forEach(d => { result[d.id] = d.data(); });
      return result;
    } catch (e) { console.warn('[ArenaFS] getQueue failed:', e); }
  }
  return { ..._memQueue };
}

// ---- Challenge Broadcast ----

export async function broadcastChallenge(challenge) {
  const payload = { ...challenge, timestamp: Date.now() };
  if (_firestoreReady) {
    try {
      await fsSetDoc(fsDoc(db, COL_GLOBAL, DOC_BROADCAST), payload);
      return;
    } catch (e) { console.warn('[ArenaFS] broadcastChallenge failed:', e); }
  }
  _memBroadcast.current = payload;
}

export async function clearChallengeBroadcast() {
  if (_firestoreReady) {
    try {
      await fsDeleteDoc(fsDoc(db, COL_GLOBAL, DOC_BROADCAST));
      return;
    } catch (e) { console.warn('[ArenaFS] clearBroadcast failed:', e); }
  }
  _memBroadcast.current = null;
}

/**
 * Listen for real-time challenge broadcasts (works on any device).
 * Returns an unsubscribe function.
 */
export function listenForChallenges(myUserId, onChallenge) {
  if (_firestoreReady) {
    try {
      return fsOnSnapshot(fsDoc(db, COL_GLOBAL, DOC_BROADCAST), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (!data) return;
        const age = Date.now() - (data.timestamp || 0);
        if (age > 25000) return; // expired
        if (data.challengerId === myUserId) return; // own challenge
        onChallenge(data);
      });
    } catch (e) { console.warn('[ArenaFS] listenForChallenges failed:', e); }
  }
  // In-memory fallback: poll every 2s
  const interval = setInterval(() => {
    const c = _memBroadcast.current;
    if (!c) return;
    const age = Date.now() - (c.timestamp || 0);
    if (age > 25000 || c.challengerId === myUserId) return;
    onChallenge(c);
  }, 2000);
  return () => clearInterval(interval);
}

// ---- Match Operations ----

export async function createMatch(matchId, matchData) {
  if (_firestoreReady) {
    try {
      await fsSetDoc(fsDoc(db, COL_MATCHES, matchId), matchData);
      return;
    } catch (e) { console.warn('[ArenaFS] createMatch failed:', e); }
  }
  _memMatches[matchId] = matchData;
}

export async function getMatch(matchId) {
  if (_firestoreReady) {
    try {
      const snap = await fsGetDoc(fsDoc(db, COL_MATCHES, matchId));
      return snap.exists() ? snap.data() : null;
    } catch (e) { console.warn('[ArenaFS] getMatch failed:', e); }
  }
  return _memMatches[matchId] || null;
}

export async function updateMatchState(matchId, newState) {
  if (_firestoreReady) {
    try {
      await fsUpdateDoc(fsDoc(db, COL_MATCHES, matchId), { battleState: newState });
      return;
    } catch (e) { console.warn('[ArenaFS] updateMatchState failed:', e); }
  }
  if (_memMatches[matchId]) {
    _memMatches[matchId].battleState = newState;
  }
}

/**
 * Listen for real-time match state changes (battle sync across devices).
 * Returns an unsubscribe function.
 */
export function listenMatchState(matchId, onStateChange) {
  if (_firestoreReady) {
    try {
      return fsOnSnapshot(fsDoc(db, COL_MATCHES, matchId), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (data && data.battleState) onStateChange(data);
      });
    } catch (e) { console.warn('[ArenaFS] listenMatchState failed:', e); }
  }
  // In-memory fallback: poll every 1.5s
  let lastTs = 0;
  const interval = setInterval(() => {
    const m = _memMatches[matchId];
    if (!m || !m.battleState) return;
    const ts = m.battleState.lastUpdated || 0;
    if (ts > lastTs) {
      lastTs = ts;
      onStateChange(m);
    }
  }, 1500);
  return () => clearInterval(interval);
}

/**
 * Find if any user in the queue can be matched.
 * Returns { matchId, p1, p2 } or null.
 */
export async function tryMatchFromQueue(myUserId, myProfile) {
  const queue = await getQueue();
  const now = Date.now();
  for (const [uid, entry] of Object.entries(queue)) {
    if (uid === myUserId) continue;
    const age = now - (entry.timestamp || 0);
    if (age > 30000) {
      await leaveQueue(uid); // clean stale
      continue;
    }
    // Match found!
    await leaveQueue(uid);
    await leaveQueue(myUserId);
    return { matchedPlayer: entry };
  }
  return null;
}
