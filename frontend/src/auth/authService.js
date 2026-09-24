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

  async loginWithGoogle(customEmail = null, customName = null) {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      // Dynamic Google Auth with distinct Google identity
      const googleId = `google_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
      const email = customEmail || `guerreiro.${Math.floor(Math.random() * 900 + 100)}@gmail.com`;
      const name = customName || (customEmail ? customEmail.split('@')[0] : 'Guerreiro da Forja');
      
      const currentProfile = storageService.getUserProfile();
      const googleUser = {
        ...currentProfile,
        userId: googleId,
        nome: name,
        email: email,
        foto: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        ultimoLogin: new Date().toISOString(),
        isGuest: false
      };
      storageService.saveUserProfile(googleUser);
      this.currentUser = googleUser;
      this.notifyListeners();
      return { success: true, user: googleUser };
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
      profileData.isGuest = false;
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
        ultimoTreinoData: null,
        isGuest: false
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
    const guestUser = {
      ...DEFAULT_USER_PROFILE,
      userId: `warrior_guest_${Date.now()}`,
      nome: 'Guerreiro Visitante',
      email: '',
      isGuest: true
    };
    storageService.saveUserProfile(guestUser);
    this.currentUser = guestUser;
    this.notifyListeners();
  }
}

export const authService = new AuthService();
