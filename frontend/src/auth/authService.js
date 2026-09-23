// GymForge — Authentication Service
import { auth, db, googleProvider, signInWithPopup, fbSignOut, onAuthStateChanged, doc, setDoc, getDoc, isFirebaseConfigured } from '../services/firebase.js';
import { storageService, DEFAULT_USER_PROFILE, DEFAULT_CHARACTER } from '../services/storageService.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.init();
  }

  init() {
    if (isFirebaseConfigured && auth) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await this.handleUserLogin(user);
        } else {
          // If in guest mode, don't clear if user deliberately logged in as guest
          const currentProfile = storageService.getUserProfile();
          if (!currentProfile || currentProfile.userId.startsWith('warrior_')) {
            this.currentUser = currentProfile;
          } else {
            this.currentUser = null;
          }
          this.notifyListeners();
        }
      });
    } else {
      // In local mode, retrieve current local profile
      this.currentUser = storageService.getUserProfile();
      this.notifyListeners();
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  getCurrentUser() {
    return this.currentUser || storageService.getUserProfile();
  }

  async loginWithGoogle() {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      // Fallback in demo mode: simulate Google login
      const demoUser = {
        userId: 'google_warrior_demo',
        nome: 'Aventureiro Google',
        email: 'guerreiro@google.com',
        foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        dataCriacao: new Date().toISOString(),
        ultimoLogin: new Date().toISOString(),
        nivel: 2,
        xp: 180,
        pontosAtributoDisponiveis: 3,
        streakAtual: 3,
        maiorStreak: 5,
        ultimoTreinoData: new Date().toISOString().split('T')[0]
      };
      storageService.saveUserProfile(demoUser);
      this.currentUser = demoUser;
      this.notifyListeners();
      return { success: true, user: demoUser };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await this.handleUserLogin(user);
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Erro no login com Google:', error);
      return { success: false, error: error.message };
    }
  }

  async loginAsGuest() {
    const profile = storageService.getUserProfile();
    this.currentUser = profile;
    this.notifyListeners();
    return { success: true, user: profile };
  }

  async handleUserLogin(firebaseUser) {
    const userId = firebaseUser.uid;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    let profileData;

    if (userSnap.exists()) {
      profileData = userSnap.data();
      profileData.ultimoLogin = new Date().toISOString();
      await setDoc(userRef, { ultimoLogin: profileData.ultimoLogin }, { merge: true });
    } else {
      // Create new user profile in Firestore
      profileData = {
        userId: userId,
        nome: firebaseUser.displayName || 'Guerreiro da Forja',
        email: firebaseUser.email || '',
        foto: firebaseUser.photoURL || DEFAULT_USER_PROFILE.foto,
        dataCriacao: new Date().toISOString(),
        ultimoLogin: new Date().toISOString(),
        nivel: 1,
        xp: 0,
        pontosAtributoDisponiveis: 3,
        streakAtual: 1,
        maiorStreak: 1,
        ultimoTreinoData: null
      };
      await setDoc(userRef, profileData);

      // Create initial character
      const charRef = doc(db, 'characters', userId);
      await setDoc(charRef, { ...DEFAULT_CHARACTER, userId });
    }

    storageService.saveUserProfile(profileData);
    this.currentUser = profileData;
    this.notifyListeners();
  }

  async logout() {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    // Reset to initial guest or clear
    this.currentUser = null;
    this.notifyListeners();
  }
}

export const authService = new AuthService();
