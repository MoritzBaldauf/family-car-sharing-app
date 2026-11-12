import React from 'react';
import { Calendar, Bell, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { triggerHaptic } from '../lib/haptics';

export type TabId = 'schedule' | 'alerts' | 'family';

interface BottomTabBarProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  unreadCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onChangeTab,
  unreadCount
}) => {
  const { t } = useApp();

  const tabs = [
    {
      id: 'schedule' as TabId,
      label: t.tabSchedule,
      icon: Calendar
    },
    {
      id: 'alerts' as TabId,
      label: t.tabAlerts,
      icon: Bell,
      badge: unreadCount
    },
    {
      id: 'family' as TabId,
      label: t.tabFamily,
      icon: Users
    }
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl pb-safe transition-colors duration-200"
    >
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                onChangeTab(tab.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active-press select-none relative group cursor-pointer ${
                isActive
                  ? 'text-[#0071e3] dark:text-[#0a84ff]'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 transition-all duration-150 ${
                  isActive ? 'font-semibold tracking-tight' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
