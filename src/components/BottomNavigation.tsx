import React from 'react';
import { 
  ScrollText, 
  Castle, 
  Users, 
  Swords, 
  Sparkles, 
  Wine 
} from 'lucide-react';

export type ActiveTab = 'chronicle' | 'provinces' | 'dynasty' | 'diplomacy' | 'laws' | 'court';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingEventsCount: number;
  hasActiveWar: boolean;
  unassignedCouncilCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  pendingEventsCount,
  hasActiveWar,
  unassignedCouncilCount
}) => {
  const tabs = [
    {
      id: 'chronicle' as ActiveTab,
      label: 'Chronicle',
      icon: ScrollText,
      badge: pendingEventsCount > 0 ? `${pendingEventsCount}` : undefined,
      badgeColor: 'bg-amber-600'
    },
    {
      id: 'provinces' as ActiveTab,
      label: 'Provinces',
      icon: Castle,
    },
    {
      id: 'dynasty' as ActiveTab,
      label: 'Dynasty & Heirs',
      icon: Users,
    },
    {
      id: 'diplomacy' as ActiveTab,
      label: 'War & Realms',
      icon: Swords,
      badge: hasActiveWar ? 'WAR' : undefined,
      badgeColor: 'bg-rose-600 animate-pulse'
    },
    {
      id: 'laws' as ActiveTab,
      label: 'Laws & Powers',
      icon: Sparkles,
      badge: unassignedCouncilCount > 0 ? `${unassignedCouncilCount}` : undefined,
      badgeColor: 'bg-blue-600'
    },
    {
      id: 'court' as ActiveTab,
      label: 'Court Life',
      icon: Wine,
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-stone-950/95 backdrop-blur-md border-t border-amber-900/40 shadow-2xl py-1.5 px-2">
      <div className="max-w-4xl mx-auto grid grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              id={`tab-${tab.id}`}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-600/50 shadow-inner'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400 scale-110' : 'text-stone-400'} transition-transform`} />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold text-white shadow-sm ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-medium tracking-tight mt-1 truncate max-w-full ${
                isActive ? 'text-amber-200 font-bold' : 'text-stone-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
