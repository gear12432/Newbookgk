import { 
  ref, 
  set, 
  get, 
  onValue, 
  push, 
  update, 
  remove, 
  Unsubscribe 
} from 'firebase/database';
import { rtdb, isRealFirebaseActive } from '../lib/firebase';
import { 
  UserProfile, 
  UserSettings, 
  FinancialSummary, 
  Transaction, 
  Category, 
  AppNotification, 
  TransactionType,
  CashBook
} from '../types';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../utils/defaultCategories';

// Simple event emitter for local storage mode fallback
type ListenerCallback<T> = (data: T) => void;
const localListeners: Map<string, Set<ListenerCallback<any>>> = new Map();

function notifyLocalListeners<T>(key: string, data: T) {
  const listeners = localListeners.get(key);
  if (listeners) {
    listeners.forEach((cb) => cb(data));
  }
}

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`mw_db_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`mw_db_${key}`, JSON.stringify(data));
    notifyLocalListeners(key, data);
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

/**
 * Recalculate financial summary for a user
 */
export async function recalculateFinancialSummary(uid: string): Promise<FinancialSummary> {
  const transactions = await getTransactions(uid);
  
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += Number(tx.amount) || 0;
    } else if (tx.type === 'expense') {
      totalExpense += Number(tx.amount) || 0;
    }
  });

  const balance = totalIncome - totalExpense;
  const summary: FinancialSummary = {
    totalIncome,
    totalExpense,
    balance,
    transactionCount: transactions.length,
    updatedAt: Date.now(),
  };

  await saveFinancialSummary(uid, summary);
  return summary;
}

// ==================== USER PROFILE ====================

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (isRealFirebaseActive && rtdb) {
    const userRef = ref(rtdb, `users/${profile.uid}`);
    await set(userRef, profile);
  } else {
    setLocalData(`users_${profile.uid}`, profile);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isRealFirebaseActive && rtdb) {
    const userRef = ref(rtdb, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? (snapshot.val() as UserProfile) : null;
  } else {
    return getLocalData<UserProfile | null>(`users_${uid}`, null);
  }
}

export function subscribeUserProfile(uid: string, callback: (profile: UserProfile | null) => void): Unsubscribe {
  if (isRealFirebaseActive && rtdb) {
    const userRef = ref(rtdb, `users/${uid}`);
    return onValue(userRef, (snapshot) => {
      callback(snapshot.exists() ? (snapshot.val() as UserProfile) : null);
    });
  } else {
    const key = `users_${uid}`;
    if (!localListeners.has(key)) localListeners.set(key, new Set());
    localListeners.get(key)!.add(callback);
    callback(getLocalData<UserProfile | null>(key, null));
    return () => localListeners.get(key)?.delete(callback);
  }
}

// ==================== USER SETTINGS ====================

export async function saveUserSettings(uid: string, settings: UserSettings): Promise<void> {
  if (isRealFirebaseActive && rtdb) {
    const settingsRef = ref(rtdb, `userSettings/${uid}`);
    await set(settingsRef, settings);
  } else {
    setLocalData(`userSettings_${uid}`, settings);
  }
}

export async function getUserSettings(uid: string): Promise<UserSettings> {
  const defaultSettings: UserSettings = {
    currency: 'INR',
    currencySymbol: '₹',
    language: 'English',
    notificationsEnabled: true,
    darkMode: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isRealFirebaseActive && rtdb) {
    const settingsRef = ref(rtdb, `userSettings/${uid}`);
    const snapshot = await get(settingsRef);
    return snapshot.exists() ? (snapshot.val() as UserSettings) : defaultSettings;
  } else {
    return getLocalData<UserSettings>(`userSettings_${uid}`, defaultSettings);
  }
}

export function subscribeUserSettings(uid: string, callback: (settings: UserSettings) => void): Unsubscribe {
  const defaultSettings: UserSettings = {
    currency: 'INR',
    currencySymbol: '₹',
    language: 'English',
    notificationsEnabled: true,
    darkMode: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isRealFirebaseActive && rtdb) {
    const settingsRef = ref(rtdb, `userSettings/${uid}`);
    return onValue(settingsRef, (snapshot) => {
      callback(snapshot.exists() ? (snapshot.val() as UserSettings) : defaultSettings);
    });
  } else {
    const key = `userSettings_${uid}`;
    if (!localListeners.has(key)) localListeners.set(key, new Set());
    localListeners.get(key)!.add(callback);
    callback(getLocalData<UserSettings>(key, defaultSettings));
    return () => localListeners.get(key)?.delete(callback);
  }
}

// ==================== FINANCIAL SUMMARY ====================

export async function saveFinancialSummary(uid: string, summary: FinancialSummary): Promise<void> {
  if (isRealFirebaseActive && rtdb) {
    const summaryRef = ref(rtdb, `financialSummary/${uid}`);
    await set(summaryRef, summary);
  } else {
    setLocalData(`financialSummary_${uid}`, summary);
  }
}

export function subscribeFinancialSummary(uid: string, callback: (summary: FinancialSummary) => void): Unsubscribe {
  const defaultSummary: FinancialSummary = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
    updatedAt: Date.now(),
  };

  if (isRealFirebaseActive && rtdb) {
    const summaryRef = ref(rtdb, `financialSummary/${uid}`);
    return onValue(summaryRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as FinancialSummary);
      } else {
        recalculateFinancialSummary(uid).then(callback);
      }
    });
  } else {
    const key = `financialSummary_${uid}`;
    if (!localListeners.has(key)) localListeners.set(key, new Set());
    localListeners.get(key)!.add(callback);
    
    const existing = getLocalData<FinancialSummary | null>(key, null);
    if (existing) {
      callback(existing);
    } else {
      recalculateFinancialSummary(uid).then(callback);
    }
    return () => localListeners.get(key)?.delete(callback);
  }
}

// ==================== TRANSACTIONS ====================

export async function addTransaction(transaction: Omit<Transaction, 'transactionId'>): Promise<string> {
  const now = Date.now();
  
  if (isRealFirebaseActive && rtdb) {
    const txListRef = ref(rtdb, `transactions/${transaction.uid}`);
    const newTxRef = push(txListRef);
    const transactionId = newTxRef.key!;
    const fullTx: Transaction = {
      ...transaction,
      transactionId,
      createdAt: now,
      updatedAt: now,
    };
    await set(newTxRef, fullTx);
    await recalculateFinancialSummary(transaction.uid);
    return transactionId;
  } else {
    const key = `transactions_${transaction.uid}`;
    const txList = getLocalData<Transaction[]>(key, []);
    const transactionId = 'tx_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    const fullTx: Transaction = {
      ...transaction,
      transactionId,
      createdAt: now,
      updatedAt: now,
    };
    txList.unshift(fullTx);
    setLocalData(key, txList);
    await recalculateFinancialSummary(transaction.uid);
    return transactionId;
  }
}

export async function updateTransaction(transaction: Transaction): Promise<void> {
  const updatedTx = { ...transaction, updatedAt: Date.now() };

  if (isRealFirebaseActive && rtdb) {
    const txRef = ref(rtdb, `transactions/${transaction.uid}/${transaction.transactionId}`);
    await set(txRef, updatedTx);
  } else {
    const key = `transactions_${transaction.uid}`;
    let txList = getLocalData<Transaction[]>(key, []);
    txList = txList.map((t) => (t.transactionId === transaction.transactionId ? updatedTx : t));
    setLocalData(key, txList);
  }
  
  await recalculateFinancialSummary(transaction.uid);
}

export async function deleteTransaction(uid: string, transactionId: string): Promise<void> {
  if (isRealFirebaseActive && rtdb) {
    const txRef = ref(rtdb, `transactions/${uid}/${transactionId}`);
    await remove(txRef);
  } else {
    const key = `transactions_${uid}`;
    let txList = getLocalData<Transaction[]>(key, []);
    txList = txList.filter((t) => t.transactionId !== transactionId);
    setLocalData(key, txList);
  }

  await recalculateFinancialSummary(uid);
}

export async function getTransactions(uid: string): Promise<Transaction[]> {
  if (isRealFirebaseActive && rtdb) {
    const txRef = ref(rtdb, `transactions/${uid}`);
    const snapshot = await get(txRef);
    if (!snapshot.exists()) return [];
    const val = snapshot.val();
    const list: Transaction[] = Object.values(val);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } else {
    const key = `transactions_${uid}`;
    const list = getLocalData<Transaction[]>(key, []);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export function subscribeTransactions(uid: string, callback: (transactions: Transaction[]) => void): Unsubscribe {
  if (isRealFirebaseActive && rtdb) {
    const txRef = ref(rtdb, `transactions/${uid}`);
    return onValue(txRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const val = snapshot.val();
      const list: Transaction[] = Object.values(val);
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
      callback(list);
    });
  } else {
    const key = `transactions_${uid}`;
    if (!localListeners.has(key)) localListeners.set(key, new Set());
    localListeners.get(key)!.add(callback);
    const list = getLocalData<Transaction[]>(key, []);
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
    callback(list);
    return () => localListeners.get(key)?.delete(callback);
  }
}

// ==================== CATEGORIES ====================

export async function initDefaultCategories(uid: string): Promise<void> {
  const existing = await getCategories(uid);
  if (existing && existing.length > 0) return;

  const now = Date.now();
  const allDefaults = [
    ...DEFAULT_INCOME_CATEGORIES,
    ...DEFAULT_EXPENSE_CATEGORIES,
  ];

  for (const cat of allDefaults) {
    const categoryId = 'cat_' + Math.random().toString(36).substr(2, 9);
    const fullCat: Category = {
      ...cat,
      categoryId,
      uid,
      createdAt: now,
      updatedAt: now,
    };
    if (isRealFirebaseActive && rtdb) {
      const catRef = ref(rtdb, `categories/${uid}/${categoryId}`);
      await set(catRef, fullCat);
    } else {
      const key = `categories_${uid}`;
      const list = getLocalData<Category[]>(key, []);
      list.push(fullCat);
      setLocalData(key, list);
    }
  }
}

export async function getCategories(uid: string): Promise<Category[]> {
  if (isRealFirebaseActive && rtdb) {
    const catRef = ref(rtdb, `categories/${uid}`);
    const snapshot = await get(catRef);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
  } else {
    const key = `categories_${uid}`;
    return getLocalData<Category[]>(key, []);
  }
}

export function subscribeCategories(uid: string, callback: (categories: Category[]) => void): Unsubscribe {
  if (isRealFirebaseActive && rtdb) {
    const catRef = ref(rtdb, `categories/${uid}`);
    return onValue(catRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      callback(Object.values(snapshot.val()));
    });
  } else {
    const key = `categories_${uid}`;
    if (!localListeners.has(key)) localListeners.set(key, new Set());
    localListeners.get(key)!.add(callback);
    callback(getLocalData<Category[]>(key, []));
    return () => localListeners.get(key)?.delete(callback);
  }
}

export async function addCategory(uid: string, name: string, type: TransactionType, icon: string, color: string): Promise<void> {
  const categoryId = 'cat_' + Math.random().toString(36).substr(2, 9);
  const now = Date.now();
  const newCat: Category = {
    categoryId,
    uid,
    name,
    type,
    icon,
    color,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };

  if (isRealFirebaseActive && rtdb) {
    const catRef = ref(rtdb, `categories/${uid}/${categoryId}`);
    await set(catRef, newCat);
  } else {
    const key = `categories_${uid}`;
    const list = getLocalData<Category[]>(key, []);
    list.push(newCat);
    setLocalData(key, list);
  }
}

export async function deleteCategory(uid: string, categoryId: string): Promise<void> {
  if (isRealFirebaseActive && rtdb) {
    const catRef = ref(rtdb, `categories/${uid}/${categoryId}`);
    await remove(catRef);
  } else {
    const key = `categories_${uid}`;
    let list = getLocalData<Category[]>(key, []);
    list = list.filter((c) => c.categoryId !== categoryId);
    setLocalData(key, list);
  }
}

// ==================== NOTIFICATIONS ====================

export async function createNotification(uid: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info'): Promise<void> {
  const notificationId = 'notif_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  const notif: AppNotification = {
    notificationId,
    title,
    message,
    type,
    read: false,
    createdAt: Date.now(),
  };

  if (isRealFirebaseActive && rtdb) {
    const notifRef = ref(rtdb, `notifications/${uid}/${notificationId}`);
    await set(notifRef, notif);
  } else {
    const key = `notifications_${uid}`;
    const list = getLocalData<AppNotification[]>(key, []);
    list.unshift(notif);
    setLocalData(key, list);
  }
}

export function subscribeNotifications(uid: string, callback: (notifications: AppNotification[]) => void): Unsubscribe {
  if (isRealFirebaseActive && rtdb) {
    const notifRef = ref(rtdb, `notifications/${uid}`);
    return onValue(notifRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const list: AppNotification[] = Object.values(snapshot.val());
      list.sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    });
  } else {
    const key = `notifications_${uid}`;
    if (!localListeners.has(key)) localListeners.set(key, new Set());
    localListeners.get(key)!.add(callback);
    const list = getLocalData<AppNotification[]>(key, []);
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
    return () => localListeners.get(key)?.delete(callback);
  }
}

export async function markNotificationAsRead(uid: string, notificationId: string): Promise<void> {
  if (isRealFirebaseActive && rtdb) {
    const notifRef = ref(rtdb, `notifications/${uid}/${notificationId}`);
    await update(notifRef, { read: true });
  } else {
    const key = `notifications_${uid}`;
    let list = getLocalData<AppNotification[]>(key, []);
    list = list.map((n) => (n.notificationId === notificationId ? { ...n, read: true } : n));
    setLocalData(key, list);
  }
}

export async function markAllNotificationsAsRead(uid: string): Promise<void> {
  if (isRealFirebaseActive && rtdb) {
    const notifRef = ref(rtdb, `notifications/${uid}`);
    const snapshot = await get(notifRef);
    if (snapshot.exists()) {
      const updates: Record<string, any> = {};
      Object.keys(snapshot.val()).forEach((id) => {
        updates[`${id}/read`] = true;
      });
      await update(notifRef, updates);
    }
  } else {
    const key = `notifications_${uid}`;
    let list = getLocalData<AppNotification[]>(key, []);
    list = list.map((n) => ({ ...n, read: true }));
    setLocalData(key, list);
  }
}

// ==================== CASH BOOKS ====================

export async function addCashBook(uid: string, name: string): Promise<CashBook> {
  const bookId = 'book_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  const now = Date.now();
  const newBook: CashBook = {
    bookId,
    uid,
    name: name.trim(),
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };

  if (isRealFirebaseActive && rtdb) {
    const bookRef = ref(rtdb!, `cashBooks/${uid}/${bookId}`);
    await set(bookRef, newBook);
  } else {
    const key = `cashBooks_${uid}`;
    const list = getLocalData<CashBook[]>(key, []);
    list.push(newBook);
    setLocalData(key, list);
  }
  return newBook;
}

export function subscribeCashBooks(uid: string, callback: (books: CashBook[]) => void): Unsubscribe {
  const defaultBook: CashBook = {
    bookId: 'default_' + uid,
    uid,
    name: 'Primary Cash Book',
    isDefault: true,
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 100000,
  };

  if (isRealFirebaseActive && rtdb) {
    const booksRef = ref(rtdb!, `cashBooks/${uid}`);
    return onValue(booksRef, (snapshot) => {
      if (!snapshot.exists()) {
        const initialRef = ref(rtdb!, `cashBooks/${uid}/${defaultBook.bookId}`);
        set(initialRef, defaultBook);
        callback([defaultBook]);
        return;
      }
      const val = snapshot.val();
      const list: CashBook[] = Object.values(val);
      list.sort((a, b) => a.createdAt - b.createdAt);
      callback(list);
    });
  } else {
    const key = `cashBooks_${uid}`;
    if (!localListeners.has(key)) localListeners.set(key, new Set());
    localListeners.get(key)!.add(callback);
    let list = getLocalData<CashBook[]>(key, []);
    if (list.length === 0) {
      list = [defaultBook];
      setLocalData(key, list);
    }
    list.sort((a, b) => a.createdAt - b.createdAt);
    callback(list);
    return () => localListeners.get(key)?.delete(callback);
  }
}

export async function deleteCashBook(uid: string, bookId: string): Promise<void> {
  if (isRealFirebaseActive && rtdb) {
    const bookRef = ref(rtdb!, `cashBooks/${uid}/${bookId}`);
    await remove(bookRef);
  } else {
    const key = `cashBooks_${uid}`;
    let list = getLocalData<CashBook[]>(key, []);
    list = list.filter((b) => b.bookId !== bookId);
    setLocalData(key, list);
  }
}
