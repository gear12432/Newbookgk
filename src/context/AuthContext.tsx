import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isRealFirebaseActive } from '../lib/firebase';
import { 
  UserProfile, 
  UserSettings, 
  FinancialSummary, 
  AppNotification 
} from '../types';
import { 
  getUserProfile, 
  saveUserProfile, 
  subscribeUserProfile, 
  getUserSettings, 
  saveUserSettings, 
  subscribeUserSettings, 
  subscribeFinancialSummary, 
  subscribeNotifications, 
  initDefaultCategories, 
  recalculateFinancialSummary,
  createNotification
} from '../services/dbService';

interface AuthContextType {
  user: UserProfile | null;
  settings: UserSettings;
  summary: FinancialSummary;
  notifications: AppNotification[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (fullName: string, mobile: string, email: string, pass: string, profileImage?: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (fullName: string, mobile: string, profileImage?: string) => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const defaultSummary: FinancialSummary = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  transactionCount: 0,
  updatedAt: Date.now(),
};

const defaultSettingsState: UserSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  language: 'English',
  notificationsEnabled: true,
  darkMode: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettingsState);
  const [summary, setSummary] = useState<FinancialSummary>(defaultSummary);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Apply dark mode class to root document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Initialize Real-time Auth & Database listeners
  useEffect(() => {
    let unSubProfile: (() => void) | null = null;
    let unSubSettings: (() => void) | null = null;
    let unSubSummary: (() => void) | null = null;
    let unSubNotifs: (() => void) | null = null;

    function cleanupSubscriptions() {
      if (unSubProfile) unSubProfile();
      if (unSubSettings) unSubSettings();
      if (unSubSummary) unSubSummary();
      if (unSubNotifs) unSubNotifs();
    }

    async function handleUserAuth(uid: string | null) {
      cleanupSubscriptions();

      if (!uid) {
        setUser(null);
        setSettings(defaultSettingsState);
        setSummary(defaultSummary);
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Subscribe to user profile
      unSubProfile = subscribeUserProfile(uid, (profile) => {
        if (profile) {
          setUser(profile);
        } else {
          // If no profile exists yet in RTDB, check if we can fetch or create
          getUserProfile(uid).then((p) => {
            if (p) setUser(p);
          });
        }
      });

      // Subscribe to settings
      unSubSettings = subscribeUserSettings(uid, (s) => setSettings(s));

      // Subscribe to financial summary
      unSubSummary = subscribeFinancialSummary(uid, (sum) => setSummary(sum));

      // Subscribe to notifications
      unSubNotifs = subscribeNotifications(uid, (n) => setNotifications(n));

      // Ensure default categories and summary are initialized
      await initDefaultCategories(uid);

      setLoading(false);
    }

    if (isRealFirebaseActive && auth) {
      const unsubAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          await handleUserAuth(fbUser.uid);
        } else {
          await handleUserAuth(null);
        }
      });
      return () => {
        unsubAuth();
        cleanupSubscriptions();
      };
    } else {
      // Local session check fallback
      const savedUid = localStorage.getItem('my_wallet_active_uid');
      handleUserAuth(savedUid);
      return () => cleanupSubscriptions();
    }
  }, []);

  // LOGIN
  const login = async (email: string, pass: string) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (isRealFirebaseActive && auth) {
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
          const uid = cred.user.uid;
          let profile = await getUserProfile(uid);
          if (!profile) {
            // Create user record if missing
            profile = {
              uid,
              fullName: cred.user.displayName || email.split('@')[0],
              email: cleanEmail,
              mobile: cred.user.phoneNumber || '',
              status: 'active',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            await saveUserProfile(profile);
          }
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/unauthorized-domain') {
            console.warn('Firebase unauthorized domain, using local fallback auth');
            const storedUsersKey = 'mw_local_auth_users';
            const usersMap = JSON.parse(localStorage.getItem(storedUsersKey) || '{}');
            const userObj = Object.values(usersMap).find((u: any) => u.email === cleanEmail && u.pass === pass) as any;

            if (!userObj) {
              // If not found in local map, allow auto-creating local profile for smoother experience
              const uid = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
              usersMap[uid] = { uid, email: cleanEmail, pass };
              localStorage.setItem(storedUsersKey, JSON.stringify(usersMap));
              localStorage.setItem('my_wallet_active_uid', uid);

              const newProfile: UserProfile = {
                uid,
                fullName: cleanEmail.split('@')[0],
                email: cleanEmail,
                mobile: '',
                status: 'active',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              await saveUserProfile(newProfile);
              await saveUserSettings(uid, defaultSettingsState);
              setUser(newProfile);
              return;
            }

            const uid = userObj.uid;
            localStorage.setItem('my_wallet_active_uid', uid);
            let profile = await getUserProfile(uid);
            if (!profile) {
              profile = {
                uid,
                fullName: cleanEmail.split('@')[0],
                email: cleanEmail,
                mobile: '',
                status: 'active',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              await saveUserProfile(profile);
            }
            setUser(profile);
            return;
          }
          throw fbErr;
        }
      } else {
        // Fallback Auth
        const storedUsersKey = 'mw_local_auth_users';
        const usersMap = JSON.parse(localStorage.getItem(storedUsersKey) || '{}');
        const userObj = Object.values(usersMap).find((u: any) => u.email === cleanEmail && u.pass === pass) as any;

        if (!userObj) {
          throw new Error('Incorrect email or password.');
        }

        const uid = userObj.uid;
        localStorage.setItem('my_wallet_active_uid', uid);
        const profile = await getUserProfile(uid);
        if (profile) setUser(profile);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let message = err.message || 'Login failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'Incorrect email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Please check your internet connection.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'Firebase Error (auth/unauthorized-domain): Domain is not authorized in Firebase Console. Local login mode engaged.';
      }
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE SIGN IN
  const googleSignIn = async () => {
    setLoading(true);
    try {
      if (isRealFirebaseActive && auth) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const cred = await signInWithPopup(auth, provider);
        const fbUser = cred.user;
        const uid = fbUser.uid;

        let profile = await getUserProfile(uid);
        if (!profile) {
          profile = {
            uid,
            fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email?.toLowerCase() || '',
            mobile: fbUser.phoneNumber || '',
            profileImage: fbUser.photoURL || '',
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await saveUserProfile(profile);

          const newSettings: UserSettings = {
            currency: 'INR',
            currencySymbol: '₹',
            language: 'English',
            notificationsEnabled: true,
            darkMode: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await saveUserSettings(uid, newSettings);

          await createNotification(
            uid,
            'Welcome to Cash Book! 🎉',
            'Start tracking your income & expenses easily.',
            'success'
          );
          await initDefaultCategories(uid);
          await recalculateFinancialSummary(uid);
        } else if (fbUser.displayName || fbUser.photoURL) {
          const updatedProfile = {
            ...profile,
            fullName: profile.fullName || fbUser.displayName || '',
            profileImage: profile.profileImage || fbUser.photoURL || '',
            updatedAt: Date.now(),
          };
          await saveUserProfile(updatedProfile);
          setUser(updatedProfile);
        }
      } else {
        throw new Error('Real Google Sign-In requires active Firebase credentials.');
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      let message = 'Unable to sign in with Google. Please try again.';
      if (err.code === 'auth/unauthorized-domain') {
        message = 'Google Sign-In Error: Domain (gear12432.github.io) is not added to Firebase Console > Authentication > Settings > Authorized domains. Please add it or use Email/Password sign up below.';
      } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        message = 'Google sign-in was cancelled.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Please check your internet connection.';
      } else if (err.message) {
        message = err.message;
      }
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // SIGN UP
  const signUp = async (fullName: string, mobile: string, email: string, pass: string, profileImage?: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      let uid = '';

      if (isRealFirebaseActive && auth) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          uid = cred.user.uid;
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/unauthorized-domain') {
            console.warn('Firebase unauthorized domain, creating local user account fallback');
            uid = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            const storedUsersKey = 'mw_local_auth_users';
            const usersMap = JSON.parse(localStorage.getItem(storedUsersKey) || '{}');
            usersMap[uid] = { uid, email: cleanEmail, pass };
            localStorage.setItem(storedUsersKey, JSON.stringify(usersMap));
            localStorage.setItem('my_wallet_active_uid', uid);
          } else {
            throw fbErr;
          }
        }
      } else {
        uid = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        const storedUsersKey = 'mw_local_auth_users';
        const usersMap = JSON.parse(localStorage.getItem(storedUsersKey) || '{}');
        
        // Check duplicate
        if (Object.values(usersMap).some((u: any) => u.email === cleanEmail)) {
          throw new Error('Account with this email already exists.');
        }

        usersMap[uid] = { uid, email: cleanEmail, pass };
        localStorage.setItem(storedUsersKey, JSON.stringify(usersMap));
        localStorage.setItem('my_wallet_active_uid', uid);
      }

      // Create user profile
      const newProfile: UserProfile = {
        uid,
        fullName: fullName.trim(),
        email: cleanEmail,
        mobile: mobile.trim(),
        profileImage: profileImage || '',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await saveUserProfile(newProfile);

      // Create default user settings
      const newSettings: UserSettings = {
        currency: 'INR',
        currencySymbol: '₹',
        language: 'English',
        notificationsEnabled: true,
        darkMode: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveUserSettings(uid, newSettings);

      // Create initial welcome notification
      await createNotification(
        uid,
        'Welcome to My Wallet! 🎉',
        'Start tracking your income & expenses by tapping the + button below.',
        'success'
      );

      // Initialize default categories
      await initDefaultCategories(uid);

      // Initialize financial summary
      await recalculateFinancialSummary(uid);

      setUser(newProfile);
    } catch (err: any) {
      console.error('SignUp error:', err);
      let message = err.message || 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const resetPassword = async (email: string) => {
    if (isRealFirebaseActive && auth) {
      await sendPasswordResetEmail(auth, email.trim());
    } else {
      // Simulated reset
      await new Promise((res) => setTimeout(res, 800));
    }
  };

  // LOGOUT
  const logout = async () => {
    if (isRealFirebaseActive && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem('my_wallet_active_uid');
    }
    setUser(null);
  };

  // UPDATE PROFILE
  const updateProfile = async (fullName: string, mobile: string, profileImage?: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      profileImage: profileImage !== undefined ? profileImage : user.profileImage,
      updatedAt: Date.now(),
    };
    await saveUserProfile(updated);
    setUser(updated);
  };

  // UPDATE SETTINGS
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    const merged: UserSettings = {
      ...settings,
      ...newSettings,
      updatedAt: Date.now(),
    };
    await saveUserSettings(user.uid, merged);
    setSettings(merged);
  };

  // DELETE ACCOUNT
  const deleteAccount = async () => {
    if (!user) return;
    const uid = user.uid;

    // Clear local user keys
    if (!isRealFirebaseActive) {
      localStorage.removeItem(`mw_db_users_${uid}`);
      localStorage.removeItem(`mw_db_userSettings_${uid}`);
      localStorage.removeItem(`mw_db_financialSummary_${uid}`);
      localStorage.removeItem(`mw_db_transactions_${uid}`);
      localStorage.removeItem(`mw_db_categories_${uid}`);
      localStorage.removeItem(`mw_db_notifications_${uid}`);
      localStorage.removeItem('my_wallet_active_uid');
    }

    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        summary,
        notifications,
        loading,
        login,
        signUp,
        googleSignIn,
        resetPassword,
        logout,
        updateProfile,
        updateSettings,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
