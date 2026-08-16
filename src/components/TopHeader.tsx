import React from 'react';
import { Character, Realm } from '../types';
import { SPECIES_DATA } from '../data/speciesData';
import { 
  Heart, 
  Smile, 
  Crown, 
  Sparkles, 
  Coins, 
  Shield, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  BookOpen, 
  Flame,
  Save,
  Wand2
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TopHeaderProps {
  character: Character;
  currentYear: number;
  currentRealm: Realm;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenNewGame: () => void;
  onOpenGuide: () => void;
  onOpenSaveLoad: () => void;
  onOpenEditor: () => void;
  totalArmyPower: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  character,
  currentYear,
  currentRealm,
  soundEnabled,
  onToggleSound,
  onOpenNewGame,
  onOpenGuide,
  onOpenSaveLoad,
  onOpenEditor,
  totalArmyPower
}) => {
  const speciesInfo = SPECIES_DATA[character.species];

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-amber-900/40 shadow-xl text-stone-100">
      {/* Top Banner Ribbon */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Ruler Avatar & Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative group shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-stone-800 to-stone-950 border-2 border-amber-500/60 flex items-center justify-center text-2xl sm:text-3xl shadow-md group-hover:scale-105 transition-transform">
                {character.portrait || '👑'}
              </div>
              <span className="absolute -bottom-1.5 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-sm border border-stone-900">
                {character.species.slice(0, 3)}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-amber-200 truncate font-cinzel leading-tight">
                  {character.name} {character.dynastyName ? `${character.dynastyName}` : ''}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-800/80 border border-stone-700 text-stone-300">
                  {character.rank || 'Ruler'}
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate flex items-center gap-1.5">
                <span className="text-amber-400 font-semibold">{currentRealm.name}</span>
                <span>•</span>
                <span>Age {character.age}</span>
                <span>•</span>
                <span className="text-stone-300 font-mono">Year {currentYear} AD</span>
              </p>
            </div>
          </div>

          {/* Right: Sound, Guide, Save/Load & Reset Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onToggleSound}
              id="sound-toggle-btn"
              title={soundEnabled ? 'Disable Audio' : 'Enable Audio'}
              className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>
            <button
              onClick={onOpenGuide}
              id="guide-toggle-btn"
              title="Game Lore & Guide"
              className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Guide</span>
            </button>
            <button
              onClick={onOpenEditor}
              id="ingame-editor-btn"
              title="Imperial In-Game Editor & God Mode (Stats, Provinces, Vassals, Cheats)"
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600/30 to-purple-600/30 hover:from-amber-600/50 hover:to-purple-600/50 border border-amber-500/70 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Editor</span>
            </button>
            <button
              onClick={onOpenSaveLoad}
              id="save-load-btn"
              title="Imperial Archives (Save / Load / Export / Import)"
              className="px-2.5 py-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-700 border border-amber-600/60 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Save / Load</span>
            </button>
            <button
              onClick={onOpenNewGame}
              id="new-dynasty-btn"
              title="Start New Dynasty"
              className="px-2.5 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 border border-amber-600/50 text-amber-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Ruler</span>
            </button>
          </div>
        </div>

        {/* Core Stats Bar */}
        <div className="mt-2.5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">
          {/* Health */}
          <div className="bg-stone-950/80 rounded-lg p-1.5 sm:p-2 border border-stone-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-950/60 border border-rose-800/50 flex items-center justify-center shrink-0">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider leading-none">Health</div>
              <div className="text-xs sm:text-sm font-bold text-rose-300 font-mono">
                {character.stats.health}%
              </div>
            </div>
          </div>

          {/* Happiness */}
          <div className="bg-stone-950/80 rounded-lg p-1.5 sm:p-2 border border-stone-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-950/60 border border-amber-800/50 flex items-center justify-center shrink-0">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider leading-none">Joy</div>
              <div className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
                {character.stats.happiness}%
              </div>
            </div>
          </div>

          {/* Gold */}
          <div className="bg-stone-950/80 rounded-lg p-1.5 sm:p-2 border border-amber-900/30 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-yellow-950/60 border border-yellow-700/50 flex items-center justify-center shrink-0">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider leading-none">Gold</div>
              <div className="text-xs sm:text-sm font-bold text-yellow-300 font-mono">
                {character.stats.gold}
              </div>
            </div>
          </div>

          {/* Renown / Prestige */}
          <div className="bg-stone-950/80 rounded-lg p-1.5 sm:p-2 border border-stone-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-950/60 border border-purple-800/50 flex items-center justify-center shrink-0">
              <Crown className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider leading-none truncate">Prestige</div>
              <div className="text-xs sm:text-sm font-bold text-purple-300 font-mono">
                {character.stats.renown}
              </div>
            </div>
          </div>

          {/* Piety / Mana */}
          <div className="bg-stone-950/80 rounded-lg p-1.5 sm:p-2 border border-stone-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-950/60 border border-blue-800/50 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider leading-none truncate">Piety / Mana</div>
              <div className="text-xs sm:text-sm font-bold text-blue-300 font-mono">
                {character.stats.pietyOrMana}
              </div>
            </div>
          </div>

          {/* Levies & Armies */}
          <div className="bg-stone-950/80 rounded-lg p-1.5 sm:p-2 border border-stone-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-950/60 border border-red-800/50 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider leading-none truncate">Levies</div>
              <div className="text-xs sm:text-sm font-bold text-red-300 font-mono">
                {totalArmyPower.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Species Special Resource */}
          <div className="col-span-3 sm:col-span-1 bg-stone-950/80 rounded-lg p-1.5 sm:p-2 border border-stone-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider leading-none truncate">
                {speciesInfo.specialResourceName}
              </div>
              <div className="text-xs sm:text-sm font-bold text-emerald-300 font-mono">
                {character.stats.specialResource}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
