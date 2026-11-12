import React, { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { AlertsView } from './components/AlertsView';
import { FamilyView } from './components/FamilyView';
import { BottomTabBar, type TabId } from './components/BottomTabBar';
import { BookingModal } from './components/BookingModal';
import { InstallPwaPrompt } from './components/InstallPwaPrompt';
import { AuthGuard } from './components/AuthGuard';
import { format } from 'date-fns';
import type { BookingSlotType } from './types';
import { triggerHaptic } from './lib/haptics';
import { ArrowDown, Loader2, CheckCircle2, WifiOff } from 'lucide-react';

const TABS: TabId[] = ['schedule', 'alerts', 'family'];

const MainApp: React.FC = () => {
  const { unreadNotificationCount, t } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('schedule');
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlotType, setSelectedSlotType] = useState<BookingSlotType | undefined>(undefined);

  // Online / Offline connectivity listener
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Pull-to-Refresh State
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJustUpdated, setIsJustUpdated] = useState(false);
  const pullStartY = useRef<number | null>(null);

  // Swipe and drag navigation between tabs (touch + mouse desktop support)
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleStart = (clientX: number, clientY: number, target: HTMLElement | null) => {
    // Track pull to refresh if near top of window
    if (window.scrollY <= 5 && !isRefreshing) {
      pullStartY.current = clientY;
    }

    // Do not trigger tab swipe if touching horizontal date strips, inputs, or interactive controls
    if (
      target?.closest('.no-scrollbar') ||
      target?.closest('.snap-x') ||
      target?.closest('input') ||
      target?.closest('select') ||
      target?.closest('button') ||
      target?.closest('a')
    ) {
      return;
    }
    dragStartRef.current = { x: clientX, y: clientY, time: Date.now() };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY.current !== null && window.scrollY <= 5 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStartY.current;
      if (diff > 0) {
        // Damped pull distance
        const damped = Math.min(75, Math.pow(diff, 0.85) * 1.4);
        setPullDistance(damped);
      }
    }
  };

  const handleEnd = (clientX: number, clientY: number) => {
    // Process pull-to-refresh
    if (pullDistance > 52 && !isRefreshing) {
      triggerHaptic('medium');
      setIsRefreshing(true);
      setPullDistance(46);
      setTimeout(() => {
        triggerHaptic('success');
        setIsRefreshing(false);
        setIsJustUpdated(true);
        setPullDistance(0);
        setTimeout(() => setIsJustUpdated(false), 2000);
      }, 700);
    } else {
      setPullDistance(0);
    }
    pullStartY.current = null;

    if (!dragStartRef.current) return;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    const elapsed = Date.now() - dragStartRef.current.time;

    dragStartRef.current = null;

    // Decisive horizontal swipe: at least 45px, horizontal > 1.2x vertical, duration < 800ms
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && elapsed < 800) {
      const currentIndex = TABS.indexOf(activeTab);
      if (deltaX < 0) {
        // Swiped left -> Next tab (slides in from right)
        if (currentIndex < TABS.length - 1) {
          triggerHaptic('light');
          setSlideDirection('forward');
          setActiveTab(TABS[currentIndex + 1]);
        }
      } else {
        // Swiped right -> Previous tab (slides in from left)
        if (currentIndex > 0) {
          triggerHaptic('light');
          setSlideDirection('backward');
          setActiveTab(TABS[currentIndex - 1]);
        }
      }
    }
  };

  const handleTabChange = (nextTab: TabId) => {
    if (nextTab === activeTab) return;
    const currentIdx = TABS.indexOf(activeTab);
    const nextIdx = TABS.indexOf(nextTab);
    setSlideDirection(nextIdx > currentIdx ? 'forward' : 'backward');
    setActiveTab(nextTab);
  };

  const handleNavigateToCalendarDate = (_dateStr: string) => {
    setSlideDirection('backward');
    setActiveTab('schedule');
  };

  const handleOpenBooking = (dateStr: string, defaultSlot?: BookingSlotType) => {
    setSelectedBookingDate(dateStr);
    setSelectedSlotType(defaultSlot);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col antialiased transition-colors duration-200 overflow-x-hidden">
      {/* iOS Minimal Top Header with Live Navigation Handlers */}
      <Header onNavigateTab={handleTabChange} />

      {/* Main Content Area with Touch & Mouse Swipe Gesture Support */}
      <main
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target as HTMLElement)}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY, e.target as HTMLElement)}
        onMouseUp={(e) => handleEnd(e.clientX, e.clientY)}
        className="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4 pb-tabbar touch-pan-y select-none"
      >
        {/* Pull-To-Refresh Indicator Badge */}
        {(pullDistance > 0 || isRefreshing || isJustUpdated) && (
          <div
            className="flex items-center justify-center transition-all duration-200 overflow-hidden"
            style={{ height: `${Math.max(pullDistance, isRefreshing ? 44 : 0)}px` }}
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-zinc-800/95 border border-zinc-200 dark:border-zinc-700 shadow-md text-xs font-bold text-zinc-700 dark:text-zinc-200">
              {isRefreshing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0071e3] dark:text-[#0a84ff]" />
                  <span>{t.refreshing}</span>
                </>
              ) : isJustUpdated ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.updatedJustNow}</span>
                </>
              ) : (
                <>
                  <ArrowDown
                    className={`w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff] transition-transform duration-200 ${
                      pullDistance > 52 ? 'rotate-180' : ''
                    }`}
                  />
                  <span>{pullDistance > 52 ? t.releaseToRefresh : t.pullToRefresh}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-center gap-2 font-bold shadow-2xs">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{t.offlineMode}</span>
          </div>
        )}

        {/* PWA Install Guide Banner */}
        <InstallPwaPrompt />

        {/* Tab Content with Apple-Style Directional Slide & Deceleration */}
        <div
          key={activeTab}
          className={slideDirection === 'forward' ? 'animate-ios-slide-right' : 'animate-ios-slide-left'}
        >
          {/* Tab 1: Interactive Schedule */}
          {activeTab === 'schedule' && (
            <CalendarView onOpenBookingModal={handleOpenBooking} />
          )}

          {/* Tab 2: Activity & Alerts */}
          {activeTab === 'alerts' && (
            <AlertsView onNavigateToDate={handleNavigateToCalendarDate} />
          )}

          {/* Tab 3: Family & Settings */}
          {activeTab === 'family' && (
            <FamilyView />
          )}
        </div>
      </main>

      {/* iOS Bottom Navigation Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        unreadCount={unreadNotificationCount}
      />

      {/* iOS Quick Reservation Sheet */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialDate={selectedBookingDate}
        initialSlot={selectedSlotType}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AuthGuard>
        <MainApp />
      </AuthGuard>
    </AppProvider>
  );
}
