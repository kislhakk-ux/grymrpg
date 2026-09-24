// GymForge — Arena Firestore Real-Time Service
// Uses Firebase Client SDK for cross-device, cross-browser real-time sync
// Works on PC, mobile, any device, without backend state dependency

import {
  db, isFirebaseConfigured,
  doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, collection, getDocs
} from './firebase.js';

// ---- In-Memory Fallback (used when offline or Firebase credentials not configured) ----
const _memQueue = {};
const _memBroadcast = { current: null };
const _memMatches = {};
const _memQueueListeners = {};

// ---- Collection Names ----
const COL_QUEUE = 'arena_queue';
const COL_GLOBAL = 'arena_global';
const DOC_BROADCAST = 'arena_broadcast';
const COL_MATCHES = 'arena_matches';

// ---- Queue Operations ----

/**
 * Enters the matchmaking queue with 'waiting' status.
 */
export async function enterQueue(userId, profile) {
  const entry = {
    ...profile,
    userId,
    status: 'waiting',
    matchedMatchId: null,
    opponent: null,
    timestamp: Date.now()
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, COL_QUEUE, userId), entry);
      return;
    } catch (e) {
      console.warn('[ArenaFS] enterQueue Firestore error, using memory fallback:', e);
    }
  }
  _memQueue[userId] = entry;
}

/**
 * Listens to our own queue document.
 * When an opponent matches us, they update status to 'matched' and supply matchedMatchId.
 * Returns unsubscribe function.
 */
export function listenMyQueueEntry(myUserId, onMatched) {
  if (isFirebaseConfigured && db) {
    try {
      return onSnapshot(doc(db, COL_QUEUE, myUserId), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (data && data.status === 'matched' && data.matchedMatchId && data.opponent) {
          onMatched({
            matchId: data.matchedMatchId,
            opponent: data.opponent
          });
        }
      });
    } catch (e) {
      console.warn('[ArenaFS] listenMyQueueEntry Firestore error:', e);
    }
  }

  // Memory fallback listener
  _memQueueListeners[myUserId] = onMatched;
  return () => {
    delete _memQueueListeners[myUserId];
  };
}

/**
 * Removes user from queue.
 */
export async function leaveQueue(userId) {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, COL_QUEUE, userId));
      return;
    } catch (e) {
      console.warn('[ArenaFS] leaveQueue Firestore error:', e);
    }
  }
  delete _memQueue[userId];
  delete _memQueueListeners[userId];
}

/**
 * Retrieves all currently queued players.
 */
export async function getQueue() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, COL_QUEUE));
      const result = {};
      snap.forEach(d => { result[d.id] = d.data(); });
      return result;
    } catch (e) {
      console.warn('[ArenaFS] getQueue Firestore error:', e);
    }
  }
  return { ..._memQueue };
}

/**
 * Searches the queue for another waiting warrior.
 * If found, creates the match, notifies the waiting warrior by updating their doc to 'matched',
 * and returns { matchedPlayer, matchId }.
 */
export async function tryMatchFromQueue(myUserId, myProfile) {
  const queue = await getQueue();
  const now = Date.now();

  for (const [uid, entry] of Object.entries(queue)) {
    if (uid === myUserId) continue;

    const age = now - (entry.timestamp || 0);
    if (age > 35000) {
      // Clean stale entry
      await leaveQueue(uid);
      continue;
    }

    if (entry.status !== 'waiting') continue; // Already being matched

    const matchId = `match_${Date.now()}_${myUserId.slice(0, 5)}`;
    const oppMaxHp = 100 + ((entry.atributos?.VITALIDADE || 10) * 15) + ((entry.nivel || 1) * 10);
    const myMaxHp = 100 + ((myProfile.atributos?.VITALIDADE || 10) * 15) + ((myProfile.nivel || 1) * 10);

    const initialMatchData = {
      id: matchId,
      player1Id: entry.userId, // The player who was waiting is Player 1
      player2Id: myUserId,     // The player who joined is Player 2
      player1: { ...entry, maxHp: oppMaxHp, currentHp: oppMaxHp, fury: 0 },
      player2: { ...myProfile, userId: myUserId, maxHp: myMaxHp, currentHp: myMaxHp, fury: 0 },
      battleState: {
        player1Hp: oppMaxHp,
        player2Hp: myMaxHp,
        player1Fury: 0,
        player2Fury: 0,
        player1Blocking: false,
        player2Blocking: false,
        currentTurnUserId: entry.userId,
        status: 'active',
        combatLog: ['⚔️ Duelo sincronizado iniciado! FIGHT!'],
        lastUpdated: Date.now()
      },
      createdAt: Date.now()
    };

    // 1. Create the match in Firestore
    await createMatch(matchId, initialMatchData);

    // 2. Notify the waiting player by updating their queue entry
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, COL_QUEUE, entry.userId), {
          status: 'matched',
          matchedMatchId: matchId,
          opponent: { ...myProfile, userId: myUserId, maxHp: myMaxHp, currentHp: myMaxHp, fury: 0 }
        });
      } catch (e) {
        console.warn('[ArenaFS] Error updating matched queue doc:', e);
      }
    } else {
      if (_memQueue[entry.userId]) {
        _memQueue[entry.userId].status = 'matched';
        _memQueue[entry.userId].matchedMatchId = matchId;
        _memQueue[entry.userId].opponent = myProfile;
        if (_memQueueListeners[entry.userId]) {
          _memQueueListeners[entry.userId]({ matchId, opponent: myProfile });
        }
      }
    }

    // 3. Clean up our own queue entry
    await leaveQueue(myUserId);

    return {
      matchedPlayer: entry,
      matchId: matchId
    };
  }

  return null;
}

// ---- Challenge Broadcast ----

export async function broadcastChallenge(challenge) {
  const payload = {
    ...challenge,
    id: challenge.id || `chal_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`,
    timestamp: Date.now()
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, COL_GLOBAL, DOC_BROADCAST), payload);
      return;
    } catch (e) {
      console.warn('[ArenaFS] broadcastChallenge error:', e);
    }
  }
  _memBroadcast.current = payload;
}

export async function clearChallengeBroadcast() {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, COL_GLOBAL, DOC_BROADCAST));
      return;
    } catch (e) {
      console.warn('[ArenaFS] clearBroadcast error:', e);
    }
  }
  _memBroadcast.current = null;
}

/**
 * Listens for real-time challenge broadcasts across all connected devices.
 * Returns an unsubscribe function.
 */
export function listenForChallenges(myUserId, onChallenge) {
  if (isFirebaseConfigured && db) {
    try {
      return onSnapshot(doc(db, COL_GLOBAL, DOC_BROADCAST), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (!data) return;
        const age = Date.now() - (data.timestamp || 0);
        if (age > 30000) return; // Expired after 30s
        if (data.challengerId === myUserId) return; // Own challenge
        onChallenge(data);
      });
    } catch (e) {
      console.warn('[ArenaFS] listenForChallenges error:', e);
    }
  }

  // In-memory fallback
  const interval = setInterval(() => {
    const c = _memBroadcast.current;
    if (!c) return;
    const age = Date.now() - (c.timestamp || 0);
    if (age > 30000 || c.challengerId === myUserId) return;
    onChallenge(c);
  }, 2000);
  return () => clearInterval(interval);
}

// ---- Match Operations ----

export async function createMatch(matchId, matchData) {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, COL_MATCHES, matchId), matchData);
      return;
    } catch (e) {
      console.warn('[ArenaFS] createMatch error:', e);
    }
  }
  _memMatches[matchId] = matchData;
}

export async function getMatch(matchId) {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, COL_MATCHES, matchId));
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.warn('[ArenaFS] getMatch error:', e);
    }
  }
  return _memMatches[matchId] || null;
}

export async function updateMatchState(matchId, newState) {
  const updatedState = { ...newState, lastUpdated: Date.now() };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, COL_MATCHES, matchId), { battleState: updatedState });
      return;
    } catch (e) {
      console.warn('[ArenaFS] updateMatchState error:', e);
    }
  }
  if (_memMatches[matchId]) {
    _memMatches[matchId].battleState = updatedState;
  }
}

/**
 * Listens for real-time match state changes during battle.
 * Returns an unsubscribe function.
 */
export function listenMatchState(matchId, onStateChange) {
  if (isFirebaseConfigured && db) {
    try {
      return onSnapshot(doc(db, COL_MATCHES, matchId), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (data && data.battleState) onStateChange(data);
      });
    } catch (e) {
      console.warn('[ArenaFS] listenMatchState error:', e);
    }
  }

  // In-memory fallback
  let lastTs = 0;
  const interval = setInterval(() => {
    const m = _memMatches[matchId];
    if (!m || !m.battleState) return;
    const ts = m.battleState.lastUpdated || 0;
    if (ts > lastTs) {
      lastTs = ts;
      onStateChange(m);
    }
  }, 1000);
  return () => clearInterval(interval);
}
