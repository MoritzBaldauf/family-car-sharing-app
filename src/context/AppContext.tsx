import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile, Family, Vehicle, Booking, WaitingListEntry, NotificationItem, BookingSlotType } from '../types';
import { format } from 'date-fns';
import { translations, getDateLocale, type Language } from '../lib/i18n';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured, cleanForFirestore } from '../lib/firebase';
import { triggerHaptic } from '../lib/haptics';

const STORAGE_KEY = 'b_mobil_data_v2';

const SEED_USERS: Record<string, UserProfile> = {
  user_moritz: {
    id: 'user_moritz',
    name: 'Moritz',
    email: 'moritz@b-mobil.local',
    role: 'admin',
    color: '#0071e3',
  }
};

const SEED_VEHICLE: Vehicle = {
  id: 'veh_default',
  name: 'B-Mobil',
  model: 'B-Mobil',
  licensePlate: 'M-BM 2024',
  fuelOrBatteryPercent: 85,
  isElectric: false,
  parkingLocation: 'Einfahrt / Driveway',
  keyLocation: 'Schlüsselbrett im Flur',
  lastUpdatedBy: 'Moritz',
  lastUpdatedAt: new Date().toISOString(),
  gps: {
    latitude: 48.137154,
    longitude: 11.576124,
    address: 'Home',
    updatedAt: new Date().toISOString()
  }
};

const SEED_FAMILY: Family = {
  id: 'fam_bmobil',
  name: 'B-Mobil',
  joinCode: 'BMOBIL',
  passcode: 'BMOBIL2026',
  createdAt: new Date().toISOString(),
  adminId: 'user_moritz',
  members: SEED_USERS,
  vehicle: SEED_VEHICLE
};

const SEED_BOOKINGS: Booking[] = [];
const SEED_WAITING_LIST: WaitingListEntry[] = [];
const SEED_NOTIFICATIONS: NotificationItem[] = [];

interface AppState {
  family: Family;
  bookings: Booking[];
  waitingList: WaitingListEntry[];
  notifications: NotificationItem[];
  currentUserId: string;
}

interface AppContextType {
  family: Family;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  bookings: Booking[];
  waitingList: WaitingListEntry[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  vehicle: Vehicle;
  switchUser: (userId: string) => void;
  createBooking: (data: {
    startDate: string;
    endDate?: string;
    slotType: BookingSlotType;
    startTime?: string;
    endTime?: string;
    destinationNote?: string;
  }) => { success: boolean; conflictBooking?: Booking; booking?: Booking };
  joinWaitingList: (bookingId: string, slotType: BookingSlotType, startTime?: string, endTime?: string) => void;
  leaveWaitingList: (waitingListId: string) => void;
  handoverBookingToWaitingUser: (bookingId: string, waitingListId: string) => void;
  targetCalendarDate: string | null;
  navigateToCalendarDate: (dateStr: string) => void;
  clearTargetCalendarDate: () => void;
  cancelBooking: (bookingId: string) => void;
  claimFreedSlot: (waitingListId: string) => void;
  updateVehicleStatus: (updates: {
    fuelOrBatteryPercent?: number;
    parkingLocation?: string;
    keyLocation?: string;
  }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addFamilyMember: (name: string, email: string, color: string) => void;
  resetToSampleData: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.en;
  dateLocale: any;
  createMultipleBookings: (data: {
    dates: string[];
    slotType: BookingSlotType;
    startTime?: string;
    endTime?: string;
    destinationNote?: string;
  }) => { bookedCount: number; conflictDates: string[] };
  checkConflict: (startDate: string, slotType: BookingSlotType, startTime?: string, endTime?: string) => Booking | null;
  isCloudConnected: boolean;
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  clearTestDataAndStartFresh: () => Promise<void>;
  isFamilyUnlocked: boolean;
  isAuthenticated: boolean;
  unlockFamily: (passcode: string) => boolean;
  loginWithPin: (userId: string, pin: string) => boolean;
  createMemberWithPin: (name: string, color: string, pin: string) => void;
  signOut: () => void;
  updateFamilyPasscode: (newPasscode: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check if family passcode has been unlocked on this device
  const [isFamilyUnlocked, setIsFamilyUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('b_mobil_family_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  // Check if user is authenticated with their personal PIN on this device
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuthUserId = localStorage.getItem('b_mobil_auth_user_id');
      return Boolean(savedAuthUserId);
    } catch {
      return false;
    }
  });

  // Load saved state or use seeds
  const [state, setState] = useState<AppState>(() => {
    const savedUserId = localStorage.getItem('b_mobil_auth_user_id') || localStorage.getItem('b_mobil_user_id') || Object.keys(SEED_USERS)[0];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedUserId && parsed.family?.members?.[savedUserId]) {
          parsed.currentUserId = savedUserId;
        }
        if (!parsed.family.passcode) {
          parsed.family.passcode = 'BMOBIL2026';
        }
        // Data sanitizer: strip out corrupted self-waitlist entries
        if (parsed.waitingList && parsed.bookings) {
          parsed.waitingList = parsed.waitingList.filter((w: any) => {
            const b = parsed.bookings.find((book: any) => book.id === w.bookingId);
            return b ? b.userId !== w.userId : true;
          });
        }
        if (parsed.notifications) {
          parsed.notifications = parsed.notifications.filter((n: any) => {
            return !(n.type === 'waiting_list_joined' && n.message.includes(`${n.actorName} is waiting`));
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
    return {
      family: SEED_FAMILY,
      bookings: SEED_BOOKINGS,
      waitingList: SEED_WAITING_LIST,
      notifications: SEED_NOTIFICATIONS,
      currentUserId: savedUserId
    };
  });

  // Save to localStorage and sync cross-tabs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

  // Listen to cross-tab storage changes so two open tabs update live!
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to parse storage event:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Real-time Cloud Sync with Firestore
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [targetCalendarDate, setTargetCalendarDate] = useState<string | null>(null);

  const navigateToCalendarDate = (dateStr: string) => {
    triggerHaptic('light');
    setTargetCalendarDate(dateStr);
  };

  const clearTargetCalendarDate = () => {
    setTargetCalendarDate(null);
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const familyId = state.family.id;
    const familyDocRef = doc(db, 'families', familyId);
    const bookingsColRef = collection(db, 'families', familyId, 'bookings');
    const waitingListColRef = collection(db, 'families', familyId, 'waitingList');
    const notifsColRef = collection(db, 'families', familyId, 'notifications');

    // Auto-seed or update Firestore on initial connect
    getDoc(familyDocRef)
      .then(async (docSnap) => {
        setIsCloudConnected(true);
        if (!docSnap.exists()) {
          try {
            await setDoc(familyDocRef, cleanForFirestore({
              id: state.family.id,
              name: state.family.name,
              joinCode: state.family.joinCode,
              passcode: state.family.passcode || 'BMOBIL2026',
              createdAt: state.family.createdAt,
              adminId: state.family.adminId,
              members: state.family.members,
              vehicle: state.family.vehicle
            }));

            const batch = writeBatch(db!);
            for (const b of state.bookings) {
              batch.set(doc(bookingsColRef, b.id), cleanForFirestore(b));
            }
            for (const w of state.waitingList) {
              batch.set(doc(waitingListColRef, w.id), cleanForFirestore(w));
            }
            for (const n of state.notifications) {
              batch.set(doc(notifsColRef, n.id), cleanForFirestore(n));
            }
            await batch.commit();
            console.log('[Cloud Sync] Initialized Cloud Firestore database for family', familyId);
          } catch (err) {
            console.warn('[Cloud Sync] Could not auto-seed Firestore:', err);
          }
        } else {
          // If family exists in Firestore, ensure passcode is synced if missing in cloud
          const data = docSnap.data();
          if (!data.passcode && state.family.passcode) {
            updateDoc(familyDocRef, { passcode: state.family.passcode }).catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.warn('[Cloud Sync] Firestore initial check warning:', err);
      });

    // 1. Live subscription for Family & Vehicle status
    const unsubFamily = onSnapshot(
      familyDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setIsCloudConnected(true);
          const data = snapshot.data();
          setState(prev => ({
            ...prev,
            family: {
              ...prev.family,
              ...data,
              passcode: data.passcode || prev.family.passcode || 'BMOBIL2026',
              vehicle: data.vehicle || prev.family.vehicle,
              members: {
                ...prev.family.members,
                ...(data.members || {})
              }
            }
          }));
        }
      },
      (err) => {
        console.warn('[Cloud Sync] Firestore family snapshot warning:', err);
        setIsCloudConnected(false);
      }
    );

    // 2. Live subscription for Bookings with automatic upload of unsynced local bookings
    let isInitialBookingsSnapshot = true;
    const unsubBookings = onSnapshot(
      bookingsColRef,
      async (snapshot) => {
        setIsCloudConnected(true);
        const remoteBookings: Booking[] = [];
        const remoteIds = new Set<string>();

        snapshot.forEach(docSnap => {
          const b = docSnap.data() as Booking;
          remoteBookings.push(b);
          remoteIds.add(b.id);
        });

        // On first snapshot, check if this device has local bookings not yet in Firestore (e.g. from previous failed writes)
        if (isInitialBookingsSnapshot) {
          isInitialBookingsSnapshot = false;
          const unsynced = state.bookings.filter(localB => !remoteIds.has(localB.id));
          if (unsynced.length > 0 && db) {
            console.log(`[Cloud Sync] Uploading ${unsynced.length} unsynced local booking(s) to Firestore...`);
            const batch = writeBatch(db);
            for (const b of unsynced) {
              const safeBooking: Booking = {
                ...b,
                destinationNote: b.destinationNote?.trim() || '',
                startTime: b.startTime || (b.slotType === 'morning' ? '08:00' : b.slotType === 'afternoon' ? '13:00' : b.slotType === 'evening' ? '18:00' : '08:00'),
                endTime: b.endTime || (b.slotType === 'morning' ? '13:00' : b.slotType === 'afternoon' ? '18:00' : b.slotType === 'evening' ? '23:00' : '22:00')
              };
              batch.set(doc(bookingsColRef, b.id), cleanForFirestore(safeBooking));
              remoteBookings.push(safeBooking);
            }
            batch.commit()
              .then(() => console.log(`[Cloud Sync] Successfully pushed ${unsynced.length} local bookings to Firestore`))
              .catch(err => console.error('[Cloud Sync] Failed to upload unsynced bookings:', err));
          }
        }

        remoteBookings.sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
        setState(prev => ({ ...prev, bookings: remoteBookings }));
      },
      (err) => {
        console.warn('[Cloud Sync] Firestore bookings snapshot warning:', err);
        setIsCloudConnected(false);
      }
    );

    // 3. Live subscription for Waiting List
    let isInitialWaitingSnapshot = true;
    const unsubWaiting = onSnapshot(
      waitingListColRef,
      async (snapshot) => {
        setIsCloudConnected(true);
        const remoteWaiting: WaitingListEntry[] = [];
        const remoteWaitingIds = new Set<string>();

        snapshot.forEach(docSnap => {
          const w = docSnap.data() as WaitingListEntry;
          const target = state.bookings.find(b => b.id === w.bookingId);
          if (target && target.userId === w.userId) {
            // Delete corrupt self-waitlist entry from Firestore
            if (db) {
              deleteDoc(doc(db, 'families', familyId, 'waitingList', w.id)).catch(() => {});
            }
          } else {
            remoteWaiting.push(w);
            remoteWaitingIds.add(w.id);
          }
        });

        if (isInitialWaitingSnapshot) {
          isInitialWaitingSnapshot = false;
          const unsyncedWaiting = state.waitingList.filter(localW => !remoteWaitingIds.has(localW.id));
          if (unsyncedWaiting.length > 0 && db) {
            const batch = writeBatch(db);
            for (const w of unsyncedWaiting) {
              batch.set(doc(waitingListColRef, w.id), cleanForFirestore(w));
              remoteWaiting.push(w);
            }
            batch.commit().catch(err => console.error('[Cloud Sync] Failed to upload unsynced waiting items:', err));
          }
        }

        setState(prev => ({ ...prev, waitingList: remoteWaiting }));
      },
      (err) => {
        console.warn('[Cloud Sync] Firestore waiting list snapshot warning:', err);
      }
    );

    // 4. Live subscription for Notifications
    const unsubNotifs = onSnapshot(
      notifsColRef,
      (snapshot) => {
        setIsCloudConnected(true);
        const remoteNotifs: NotificationItem[] = [];
        snapshot.forEach(docSnap => {
          const n = docSnap.data() as NotificationItem;
          if (n.type === 'waiting_list_joined' && n.message.includes(`${n.actorName} is waiting`)) {
            // Delete corrupt self-alert from Firestore
            if (db) {
              deleteDoc(doc(db, 'families', familyId, 'notifications', n.id)).catch(() => {});
            }
          } else {
            remoteNotifs.push(n);
          }
        });
        remoteNotifs.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        setState(prev => ({ ...prev, notifications: remoteNotifs }));
      },
      (err) => console.warn('[Cloud Sync] Firestore notifications snapshot warning:', err)
    );

    return () => {
      unsubFamily();
      unsubBookings();
      unsubWaiting();
      unsubNotifs();
    };
  }, [state.family.id]);

  // Apple iOS Light / Dark mode management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('family_car_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('family_car_theme', theme);
    } catch (e) {
      console.error(e);
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Language management (DE / EN)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('family_car_language');
      if (saved === 'de' || saved === 'en') return saved;
      return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en';
    } catch {
      return 'de';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('family_car_language', language);
    } catch (e) {
      console.error(e);
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'de' ? 'en' : 'de'));
  };

  const t = translations[language];
  const dateLocale = getDateLocale(language);

  const currentUser = state.family.members[state.currentUserId] || Object.values(state.family.members)[0];
  const allUsers = Object.values(state.family.members);
  const vehicle = state.family.vehicle;

  const unreadNotificationCount = state.notifications.filter(
    n => n.recipientUserId === currentUser.id && !n.read
  ).length;

  const switchUser = (userId: string) => {
    if (state.family.members[userId]) {
      setState(prev => ({ ...prev, currentUserId: userId }));
    }
  };

  // Conflict detection helper
  const checkConflict = (
    startDate: string,
    slotType: BookingSlotType,
    startTime?: string,
    endTime?: string
  ): Booking | null => {
    // Find active bookings on the same date
    const sameDateBookings = state.bookings.filter(
      b => b.startDate === startDate && b.status === 'confirmed'
    );

    for (const b of sameDateBookings) {
      // If either is full-day, conflict exists
      if (b.slotType === 'full-day' || slotType === 'full-day') {
        return b;
      }
      // If identical preset slot types (e.g. both 'morning')
      if (b.slotType === slotType && slotType !== 'custom') {
        return b;
      }

      // If time ranges overlap
      const bStart = b.startTime || (b.slotType === 'morning' ? '08:00' : b.slotType === 'afternoon' ? '13:00' : '18:00');
      const bEnd = b.endTime || (b.slotType === 'morning' ? '13:00' : b.slotType === 'afternoon' ? '18:00' : '23:00');

      const reqStart = startTime || (slotType === 'morning' ? '08:00' : slotType === 'afternoon' ? '13:00' : '18:00');
      const reqEnd = endTime || (slotType === 'morning' ? '13:00' : slotType === 'afternoon' ? '18:00' : '23:00');

      if (reqStart < bEnd && reqEnd > bStart) {
        return b;
      }
    }

    return null;
  };

  const createBooking = (data: {
    startDate: string;
    endDate?: string;
    slotType: BookingSlotType;
    startTime?: string;
    endTime?: string;
    destinationNote?: string;
  }) => {
    const conflict = checkConflict(data.startDate, data.slotType, data.startTime, data.endTime);
    if (conflict) {
      return { success: false, conflictBooking: conflict };
    }

    const newBooking: Booking = {
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyId: state.family.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color,
      startDate: data.startDate,
      endDate: data.endDate || data.startDate,
      slotType: data.slotType,
      startTime: data.startTime || (data.slotType === 'morning' ? '08:00' : data.slotType === 'afternoon' ? '13:00' : data.slotType === 'evening' ? '18:00' : '08:00'),
      endTime: data.endTime || (data.slotType === 'morning' ? '13:00' : data.slotType === 'afternoon' ? '18:00' : data.slotType === 'evening' ? '23:00' : '22:00'),
      destinationNote: data.destinationNote?.trim() || '',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings]
    }));

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'families', state.family.id, 'bookings', newBooking.id), cleanForFirestore(newBooking))
        .then(() => console.log('[Cloud Sync] Booking saved to Firestore:', newBooking.id))
        .catch(err => console.error('[Cloud Sync] Firestore createBooking error:', err));
    }

    return { success: true, booking: newBooking };
  };

  const createMultipleBookings = (data: {
    dates: string[];
    slotType: BookingSlotType;
    startTime?: string;
    endTime?: string;
    destinationNote?: string;
  }) => {
    const conflictDates: string[] = [];
    const validBookings: Booking[] = [];

    for (const d of data.dates) {
      const conflict = checkConflict(d, data.slotType, data.startTime, data.endTime);
      if (conflict) {
        conflictDates.push(d);
      } else {
        const newBooking: Booking = {
          id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          familyId: state.family.id,
          userId: currentUser.id,
          userName: currentUser.name,
          userColor: currentUser.color,
          startDate: d,
          endDate: d,
          slotType: data.slotType,
          startTime: data.startTime || (data.slotType === 'morning' ? '08:00' : data.slotType === 'afternoon' ? '13:00' : data.slotType === 'evening' ? '18:00' : '08:00'),
          endTime: data.endTime || (data.slotType === 'morning' ? '13:00' : data.slotType === 'afternoon' ? '18:00' : data.slotType === 'evening' ? '23:00' : '22:00'),
          destinationNote: data.destinationNote?.trim() || '',
          status: 'confirmed',
          createdAt: new Date().toISOString()
        };
        validBookings.push(newBooking);
      }
    }

    if (validBookings.length > 0) {
      setState(prev => ({
        ...prev,
        bookings: [...validBookings, ...prev.bookings]
      }));

      if (isFirebaseConfigured && db) {
        const batch = writeBatch(db);
        validBookings.forEach(b => {
          batch.set(doc(db!, 'families', state.family.id, 'bookings', b.id), cleanForFirestore(b));
        });
        batch.commit()
          .then(() => console.log(`[Cloud Sync] Saved ${validBookings.length} bookings to Firestore`))
          .catch(err => console.error('[Cloud Sync] Firestore createMultipleBookings error:', err));
      }
    }

    return { bookedCount: validBookings.length, conflictDates };
  };

  const joinWaitingList = (
    bookingId: string,
    slotType: BookingSlotType,
    startTime?: string,
    endTime?: string
  ) => {
    const targetBooking = state.bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    // Self-waitlist bug prevention: NEVER allow a user to join waiting list on their own booking!
    if (targetBooking.userId === currentUser.id) {
      console.warn('Cannot join waiting list for your own booking.');
      return;
    }

    const newEntry: WaitingListEntry = {
      id: `wait_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyId: state.family.id,
      bookingId,
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color,
      date: targetBooking.startDate,
      slotType,
      startTime: startTime || targetBooking.startTime || '',
      endTime: endTime || targetBooking.endTime || '',
      status: 'waiting',
      createdAt: new Date().toISOString()
    };

    // Create in-app notification for the current car booking owner
    const newNotification: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyId: state.family.id,
      recipientUserId: targetBooking.userId,
      actorName: currentUser.name,
      title: 'Waiting List Alert',
      message: `${currentUser.name} is waiting for your car slot on ${targetBooking.startDate} (${targetBooking.startTime || targetBooking.slotType} - ${targetBooking.endTime || ''}).`,
      date: targetBooking.startDate,
      type: 'waiting_list_joined',
      read: false,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      waitingList: [newEntry, ...prev.waitingList],
      notifications: [newNotification, ...prev.notifications]
    }));

    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      batch.set(doc(db, 'families', state.family.id, 'waitingList', newEntry.id), cleanForFirestore(newEntry));
      batch.set(doc(db, 'families', state.family.id, 'notifications', newNotification.id), cleanForFirestore(newNotification));
      batch.commit().catch(err => console.error('[Cloud Sync] Firestore joinWaitingList error:', err));
    }
  };

  const leaveWaitingList = (waitingListId: string) => {
    const entry = state.waitingList.find(w => w.id === waitingListId);
    if (!entry) return;

    triggerHaptic('medium');

    setState(prev => ({
      ...prev,
      waitingList: prev.waitingList.filter(w => w.id !== waitingListId),
      // Clean up any unread notification related to this waitlist entry
      notifications: prev.notifications.filter(n => !(n.type === 'waiting_list_joined' && n.date === entry.date && n.actorName === entry.userName))
    }));

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'families', state.family.id, 'waitingList', waitingListId))
        .catch(err => console.error('[Cloud Sync] Firestore leaveWaitingList error:', err));
    }
  };

  const handoverBookingToWaitingUser = (bookingId: string, waitingListId: string) => {
    const booking = state.bookings.find(b => b.id === bookingId);
    const waitingEntry = state.waitingList.find(w => w.id === waitingListId);
    if (!booking || !waitingEntry) return;

    triggerHaptic('success');

    // Transfer the booking ownership to the waiting user
    const updatedBookings = state.bookings.map(b =>
      b.id === bookingId
        ? {
            ...b,
            userId: waitingEntry.userId,
            userName: waitingEntry.userName,
            userColor: waitingEntry.userColor,
            destinationNote: b.destinationNote
              ? `${b.destinationNote} (Übergeben von ${booking.userName})`
              : `Übergeben von ${booking.userName}`
          }
        : b
    );

    // Resolve the waiting list entry
    const updatedWaitingList = state.waitingList.map(w =>
      w.id === waitingListId ? { ...w, status: 'resolved' as const } : w
    );

    // Create notification for the recipient
    const recipientNotification: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyId: state.family.id,
      recipientUserId: waitingEntry.userId,
      actorName: currentUser.name,
      title: 'Booking Handed Over! 🚗',
      message: `${currentUser.name} has handed over their car reservation for ${booking.startDate} directly to you. Have a great drive!`,
      date: booking.startDate,
      type: 'slot_freed',
      read: false,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      bookings: updatedBookings,
      waitingList: updatedWaitingList,
      notifications: [recipientNotification, ...prev.notifications]
    }));

    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      batch.update(doc(db, 'families', state.family.id, 'bookings', bookingId), {
        userId: waitingEntry.userId,
        userName: waitingEntry.userName,
        userColor: waitingEntry.userColor,
        destinationNote: booking.destinationNote
          ? `${booking.destinationNote} (Übergeben von ${booking.userName})`
          : `Übergeben von ${booking.userName}`
      });
      batch.update(doc(db, 'families', state.family.id, 'waitingList', waitingListId), { status: 'resolved' });
      batch.set(doc(db, 'families', state.family.id, 'notifications', recipientNotification.id), cleanForFirestore(recipientNotification));
      batch.commit().catch(err => console.error('[Cloud Sync] Firestore handoverBooking error:', err));
    }
  };

  const cancelBooking = (bookingId: string) => {
    const bookingToCancel = state.bookings.find(b => b.id === bookingId);
    if (!bookingToCancel) return;

    // Check if anyone was waiting for this slot
    const waitingForThis = state.waitingList.filter(
      w => w.bookingId === bookingId && w.status === 'waiting'
    );

    const updatedBookings = state.bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );

    // Notify each waiting person that the slot is now open!
    const newNotifs: NotificationItem[] = waitingForThis.map(w => ({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyId: state.family.id,
      recipientUserId: w.userId,
      actorName: bookingToCancel.userName,
      title: 'Car Slot Freed Up!',
      message: `${bookingToCancel.userName} canceled their reservation for ${bookingToCancel.startDate}. You can now confirm this slot!`,
      date: bookingToCancel.startDate,
      type: 'slot_freed',
      read: false,
      createdAt: new Date().toISOString()
    }));

    // Update status of waiting entries to 'offered'
    const updatedWaitingList = state.waitingList.map(w =>
      w.bookingId === bookingId ? { ...w, status: 'offered' as const } : w
    );

    setState(prev => ({
      ...prev,
      bookings: updatedBookings,
      waitingList: updatedWaitingList,
      notifications: [...newNotifs, ...prev.notifications]
    }));

    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      batch.update(doc(db, 'families', state.family.id, 'bookings', bookingId), { status: 'cancelled' });
      waitingForThis.forEach(w => {
        batch.update(doc(db!, 'families', state.family.id, 'waitingList', w.id), { status: 'offered' });
      });
      newNotifs.forEach(n => {
        batch.set(doc(db!, 'families', state.family.id, 'notifications', n.id), cleanForFirestore(n));
      });
      batch.commit().catch(err => console.error('[Cloud Sync] Firestore cancelBooking error:', err));
    }
  };

  const claimFreedSlot = (waitingListId: string) => {
    const entry = state.waitingList.find(w => w.id === waitingListId);
    if (!entry) return;

    // Convert waiting list entry into confirmed booking
    const newBooking: Booking = {
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyId: state.family.id,
      userId: entry.userId,
      userName: entry.userName,
      userColor: entry.userColor,
      startDate: entry.date,
      endDate: entry.date,
      slotType: entry.slotType,
      startTime: entry.startTime || '08:00',
      endTime: entry.endTime || '20:00',
      destinationNote: 'Claimed from waiting list',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      waitingList: prev.waitingList.map(w =>
        w.id === waitingListId ? { ...w, status: 'resolved' as const } : w
      )
    }));

    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      batch.set(doc(db, 'families', state.family.id, 'bookings', newBooking.id), cleanForFirestore(newBooking));
      batch.update(doc(db, 'families', state.family.id, 'waitingList', waitingListId), { status: 'resolved' });
      batch.commit().catch(err => console.error('[Cloud Sync] Firestore claimFreedSlot error:', err));
    }
  };

  const updateVehicleStatus = (updates: {
    fuelOrBatteryPercent?: number;
    parkingLocation?: string;
    keyLocation?: string;
  }) => {
    const updatedVehicle: Vehicle = {
      ...state.family.vehicle,
      fuelOrBatteryPercent: updates.fuelOrBatteryPercent ?? state.family.vehicle.fuelOrBatteryPercent,
      parkingLocation: updates.parkingLocation || state.family.vehicle.parkingLocation,
      keyLocation: updates.keyLocation || state.family.vehicle.keyLocation,
      lastUpdatedBy: currentUser.name,
      lastUpdatedAt: new Date().toISOString(),
      gps: {
        ...state.family.vehicle.gps!,
        updatedAt: new Date().toISOString(),
        address: updates.parkingLocation || state.family.vehicle.gps?.address || 'Updated Location'
      }
    };

    // Notify family members that car was returned/updated
    const returnNotification: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyId: state.family.id,
      recipientUserId: 'all', // Broadcast or for other members
      actorName: currentUser.name,
      title: 'Car Status Updated',
      message: `${currentUser.name} parked the car (${updates.parkingLocation || 'Driveway'}) with ${updates.fuelOrBatteryPercent ?? state.family.vehicle.fuelOrBatteryPercent}% fuel.`,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'car_returned',
      read: false,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      family: {
        ...prev.family,
        vehicle: updatedVehicle
      },
      notifications: [returnNotification, ...prev.notifications]
    }));

    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      batch.update(doc(db, 'families', state.family.id), { vehicle: cleanForFirestore(updatedVehicle) });
      batch.set(doc(db, 'families', state.family.id, 'notifications', returnNotification.id), cleanForFirestore(returnNotification));
      batch.commit().catch(err => console.error('[Cloud Sync] Firestore updateVehicleStatus error:', err));
    }
  };

  const markNotificationAsRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    }));

    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'families', state.family.id, 'notifications', id), { read: true }).catch(err =>
        console.error('[Cloud Sync] Firestore markNotificationAsRead error:', err)
      );
    }
  };

  const markAllNotificationsAsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));

    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      state.notifications.forEach(n => {
        if (!n.read) {
          batch.update(doc(db!, 'families', state.family.id, 'notifications', n.id), { read: true });
        }
      });
      batch.commit().catch(err => console.error('[Cloud Sync] Firestore markAllNotificationsAsRead error:', err));
    }
  };

  const addFamilyMember = (name: string, email: string, color: string) => {
    const newId = `user_${Date.now()}`;
    const newMember: UserProfile = {
      id: newId,
      name,
      email,
      color,
      role: 'member'
    };

    setState(prev => ({
      ...prev,
      family: {
        ...prev.family,
        members: {
          ...prev.family.members,
          [newId]: newMember
        }
      }
    }));

    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'families', state.family.id), {
        [`members.${newId}`]: cleanForFirestore(newMember)
      }).catch(err => console.error('[Cloud Sync] Firestore addFamilyMember error:', err));
    }
  };

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    const hasJoinParam = typeof window !== 'undefined' && window.location.search.includes('join=');
    const hasSavedUser = typeof window !== 'undefined' && Boolean(localStorage.getItem('b_mobil_user_id'));
    return hasJoinParam || !hasSavedUser;
  });

  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  const clearTestDataAndStartFresh = async () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('b_mobil_user_id');
    const cleanState = {
      family: SEED_FAMILY,
      bookings: [],
      waitingList: [],
      notifications: [],
      currentUserId: 'user_moritz'
    };
    setState(cleanState);

    if (isFirebaseConfigured && db) {
      try {
        const familyDocRef = doc(db, 'families', SEED_FAMILY.id);
        await setDoc(familyDocRef, cleanForFirestore(SEED_FAMILY));
        console.log('[Cloud Sync] Cleared test data and reset to B-Mobil clean state in Firestore');
      } catch (err) {
        console.error('[Cloud Sync] Error resetting Firestore:', err);
      }
    }
  };

  const resetToSampleData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      family: SEED_FAMILY,
      bookings: SEED_BOOKINGS,
      waitingList: SEED_WAITING_LIST,
      notifications: SEED_NOTIFICATIONS,
      currentUserId: 'user_moritz'
    });

    if (isFirebaseConfigured && db) {
      const familyDocRef = doc(db, 'families', SEED_FAMILY.id);
      setDoc(familyDocRef, cleanForFirestore(SEED_FAMILY)).catch(console.error);
    }
  };

  const unlockFamily = (enteredPasscode: string): boolean => {
    const currentPasscode = state.family.passcode || 'BMOBIL2026';
    if (enteredPasscode.trim().toUpperCase() === currentPasscode.toUpperCase()) {
      try {
        localStorage.setItem('b_mobil_family_unlocked', 'true');
      } catch (e) {
        console.error(e);
      }
      setIsFamilyUnlocked(true);
      return true;
    }
    return false;
  };

  const loginWithPin = (userId: string, enteredPin: string): boolean => {
    const member = state.family.members[userId];
    if (!member) return false;

    // If user has no PIN yet, set it on first sign-in
    if (!member.pin) {
      const updatedMember = { ...member, pin: enteredPin.trim() };
      const updatedMembers = { ...state.family.members, [userId]: updatedMember };
      setState(prev => ({
        ...prev,
        currentUserId: userId,
        family: { ...prev.family, members: updatedMembers }
      }));
      localStorage.setItem('b_mobil_auth_user_id', userId);
      localStorage.setItem('b_mobil_user_id', userId);
      setIsAuthenticated(true);

      if (isFirebaseConfigured && db) {
        updateDoc(doc(db, 'families', state.family.id), {
          [`members.${userId}`]: cleanForFirestore(updatedMember)
        }).catch(err => console.error('[Cloud Sync] Firestore loginWithPin save PIN error:', err));
      }
      return true;
    }

    if (member.pin === enteredPin.trim()) {
      setState(prev => ({ ...prev, currentUserId: userId }));
      localStorage.setItem('b_mobil_auth_user_id', userId);
      localStorage.setItem('b_mobil_user_id', userId);
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  const createMemberWithPin = (name: string, color: string, pin: string) => {
    const newId = `user_${Date.now()}`;
    const newMember: UserProfile = {
      id: newId,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@b-mobil.local`,
      color,
      role: 'member',
      pin: pin.trim()
    };

    const updatedMembers = { ...state.family.members, [newId]: newMember };

    setState(prev => ({
      ...prev,
      currentUserId: newId,
      family: {
        ...prev.family,
        members: updatedMembers
      }
    }));

    localStorage.setItem('b_mobil_auth_user_id', newId);
    localStorage.setItem('b_mobil_user_id', newId);
    setIsAuthenticated(true);

    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'families', state.family.id), {
        [`members.${newId}`]: cleanForFirestore(newMember)
      }).catch(err => console.error('[Cloud Sync] Firestore createMemberWithPin error:', err));
    }
  };

  const signOut = () => {
    localStorage.removeItem('b_mobil_auth_user_id');
    setIsAuthenticated(false);
  };

  const updateFamilyPasscode = (newPasscode: string) => {
    const trimmed = newPasscode.trim();
    if (!trimmed) return;
    setState(prev => ({
      ...prev,
      family: { ...prev.family, passcode: trimmed }
    }));
    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'families', state.family.id), {
        passcode: trimmed
      }).catch(err => console.error('Firestore updateFamilyPasscode error:', err));
    }
  };

  return (
    <AppContext.Provider
      value={{
        family: state.family,
        currentUser,
        allUsers,
        bookings: state.bookings,
        waitingList: state.waitingList,
        notifications: state.notifications,
        unreadNotificationCount,
        vehicle,
        switchUser,
        createBooking,
        joinWaitingList,
        leaveWaitingList,
        handoverBookingToWaitingUser,
        targetCalendarDate,
        navigateToCalendarDate,
        clearTargetCalendarDate,
        cancelBooking,
        claimFreedSlot,
        updateVehicleStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addFamilyMember,
        resetToSampleData,
        checkConflict,
        theme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        t,
        dateLocale,
        createMultipleBookings,
        isCloudConnected,
        isOnboardingOpen,
        openOnboarding,
        closeOnboarding,
        clearTestDataAndStartFresh,
        isFamilyUnlocked,
        isAuthenticated,
        unlockFamily,
        loginWithPin,
        createMemberWithPin,
        signOut,
        updateFamilyPasscode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
