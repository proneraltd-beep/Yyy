import React, { useState } from 'react';
import { Character, ChronicleEntry, Realm, Vassal } from '../types';
import { SPECIES_DATA } from '../data/speciesData';
import { 
  Sparkles, 
  Calendar, 
  Award, 
  Swords, 
  ShieldAlert, 
  Heart, 
  Scroll, 
  ChevronRight, 
  Compass,
  ArrowUpCircle,
  Users,
  Flag,
  Crown,
  Skull,
  Baby,
  Flame,
  Milestone,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ChronicleTabProps {
  character: Character;
  currentYear: number;
  currentRealm: Realm;
  chronicleEntries: ChronicleEntry[];
  vassals?: Vassal[];
  onAgeUp: () => void;
  onOpenActivities: () => void;
  onOpenProvinces: () => void;
  onOpenDynasty: () => void;
  onOpenVassals: () => void;
  onOpenSaveLoad?: () => void;
}

// Marker style and classification helper
const getChronicleMarker = (entry: ChronicleEntry) => {
  const titleLower = entry.title.toLowerCase();
  const descLower = entry.description.toLowerCase();

  if (entry.type === 'birth' || titleLower.includes('born') || titleLower.includes('heir') || titleLower.includes('child') || descLower.includes('gave birth') || descLower.includes('welcomed a child')) {
    return {
      type: 'birth',
      label: 'Dynasty Birth',
      icon: '👶',
      nodeColor: 'bg-emerald-600',
      glowColor: 'shadow-[0_0_12px_rgba(16,185,129,0.7)]',
      borderColor: 'border-emerald-400',
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
      cardBg: 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-600/60'
    };
  }

  if (entry.type === 'death' || titleLower.includes('death') || titleLower.includes('died') || titleLower.includes('fell') || titleLower.includes('passed away') || titleLower.includes('succumbed') || descLower.includes('passed into eternity')) {
    return {
      type: 'death',
      label: 'Mourned Death',
      icon: '💀',
      nodeColor: 'bg-rose-900',
      glowColor: 'shadow-[0_0_12px_rgba(225,29,72,0.7)]',
      borderColor: 'border-rose-500',
      badgeBg: 'bg-rose-950/90 text-rose-300 border-rose-700/60',
      cardBg: 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700/60'
    };
  }

  if (entry.type === 'war' || titleLower.includes('war') || titleLower.includes('battle') || titleLower.includes('conquest') || titleLower.includes('siege') || titleLower.includes('declared war') || titleLower.includes('surrender')) {
    return {
      type: 'war',
      label: 'War & Conflict',
      icon: '⚔️',
      nodeColor: 'bg-red-600',
      glowColor: 'shadow-[0_0_14px_rgba(239,68,68,0.8)]',
      borderColor: 'border-red-400',
      badgeBg: 'bg-red-950/90 text-red-300 border-red-600/50',
      cardBg: 'bg-red-950/20 border-red-800/40 hover:border-red-600/60'
    };
  }

  if (titleLower.includes('coronation') || titleLower.includes('emperor') || titleLower.includes('crowned') || titleLower.includes('statute') || titleLower.includes('law') || titleLower.includes('enfeoffment')) {
    return {
      type: 'coronation',
      label: 'Imperial Decree',
      icon: '👑',
      nodeColor: 'bg-amber-500',
      glowColor: 'shadow-[0_0_14px_rgba(245,158,11,0.8)]',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
      cardBg: 'bg-amber-950/25 border-amber-700/40 hover:border-amber-500/60'
    };
  }

  if (entry.type === 'diplomacy' || titleLower.includes('treaty') || titleLower.includes('alliance') || titleLower.includes('marriage') || titleLower.includes('wedding')) {
    return {
      type: 'diplomacy',
      label: 'Diplomacy & Treaty',
      icon: '🕊️',
      nodeColor: 'bg-indigo-600',
      glowColor: 'shadow-[0_0_12px_rgba(99,102,241,0.7)]',
      borderColor: 'border-indigo-400',
      badgeBg: 'bg-indigo-950/90 text-indigo-300 border-indigo-600/50',
      cardBg: 'bg-indigo-950/20 border-indigo-800/40 hover:border-indigo-600/60'
    };
  }

  if (entry.type === 'supernatural' || titleLower.includes('hunt') || titleLower.includes('pilgrimage') || titleLower.includes('encounter') || titleLower.includes('power')) {
    return {
      type: 'travel',
      label: 'Encounter & Travel',
      icon: '✨',
      nodeColor: 'bg-purple-600',
      glowColor: 'shadow-[0_0_12px_rgba(168,85,247,0.7)]',
      borderColor: 'border-purple-400',
      badgeBg: 'bg-purple-950/90 text-purple-300 border-purple-600/50',
      cardBg: 'bg-purple-950/20 border-purple-800/40 hover:border-purple-600/60'
    };
  }

  return {
    type: 'general',
    label: 'Realm Record',
    icon: '📜',
    nodeColor: 'bg-stone-700',
    glowColor: 'shadow-none',
    borderColor: 'border-stone-500',
    badgeBg: 'bg-stone-800 text-stone-300 border-stone-700',
    cardBg: 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
  };
};

export const ChronicleTab: React.FC<ChronicleTabProps> = ({
  character,
  currentYear,
  currentRealm,
  chronicleEntries,
  vassals = [],
  onAgeUp,
  onOpenActivities,
  onOpenProvinces,
  onOpenDynasty,
  onOpenVassals,
  onOpenSaveLoad
}) => {
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'birth' | 'death' | 'war' | 'coronation' | 'diplomacy' | 'travel'>('all');
  const [viewMode, setViewMode] = useState<'thread' | 'classic'>('thread');

  const speciesInfo = SPECIES_DATA[character.species];

  // Filter entries
  const filteredChronicle = chronicleEntries.filter(entry => {
    if (timelineFilter === 'all') return true;
    const marker = getChronicleMarker(entry);
    return marker.type === timelineFilter;
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20">
      
      {/* Age Up Banner Button */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 p-4 sm:p-5 rounded-2xl border border-amber-600/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Current Year: {currentYear} AD • Age: {character.age}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-cinzel mt-1">
              Advance the Realm
            </h2>
            <p className="text-xs text-stone-300 max-w-md mt-0.5">
              Progress time by one year. Collect provincial taxes, grow royal crops, educate heirs, and encounter historical cross-realm events.
            </p>
          </div>

          <button
            onClick={onAgeUp}
            id="age-up-btn"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-base rounded-xl shadow-lg hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-300/40 cursor-pointer shrink-0"
          >
            <ArrowUpCircle className="w-5 h-5 text-stone-950 animate-bounce" />
            <span>Age Up (+1 Year)</span>
          </button>
        </div>
      </div>

      {/* Character Profile & Abilities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Traits & Bio Card */}
        <div className="md:col-span-2 bg-stone-900/80 rounded-2xl p-4 border border-stone-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-amber-300 font-cinzel flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Royal Attributes & Bloodline
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
              {speciesInfo.badge}
            </span>
          </div>

          {/* Traits List */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {character.traits.map((trait, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-950/70 text-amber-200 border border-amber-700/50 shadow-sm flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                {trait}
              </span>
            ))}
            {character.traits.length === 0 && (
              <span className="text-xs text-stone-500 italic">No special traits yet.</span>
            )}
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-800">
            <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Martial Skill</div>
              <div className="text-sm font-bold text-red-400 font-mono mt-0.5">{character.stats.martial} / 100</div>
            </div>
            <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Diplomacy</div>
              <div className="text-sm font-bold text-blue-400 font-mono mt-0.5">{character.stats.diplomacy} / 100</div>
            </div>
            <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Intellect</div>
              <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">{character.stats.intellect} / 100</div>
            </div>
            <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Intrigue</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">{character.stats.intrigue} / 100</div>
            </div>
          </div>
        </div>

        {/* Quick Realm Actions Card */}
        <div className="bg-stone-900/80 rounded-2xl p-4 border border-stone-800 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-amber-300 font-cinzel mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Direct Decrees
            </h3>
            <p className="text-xs text-stone-400 mb-3">
              Take royal initiatives to boost stability, entertain lords, or develop territories.
            </p>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={onOpenVassals}
              id="quick-vassals-btn"
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-700/80 to-yellow-700/80 hover:from-amber-600 hover:to-yellow-600 text-stone-950 text-xs font-bold flex items-center justify-between border border-amber-400/40 transition-colors shadow-sm cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-black">
                <span>🚩</span>
                <span>Feudal Vassals & Counties</span>
              </span>
              <ChevronRight className="w-4 h-4 text-stone-950 font-bold" />
            </button>
            <button
              onClick={onOpenActivities}
              id="quick-feast-btn"
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-between border border-stone-700/80 transition-colors cursor-pointer"
            >
              <span>🎉 Host Feast or Hunt</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
            <button
              onClick={onOpenProvinces}
              id="quick-build-btn"
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-between border border-stone-700/80 transition-colors cursor-pointer"
            >
              <span>🏰 Upgrade Provinces</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
            <button
              onClick={onOpenDynasty}
              id="quick-heir-btn"
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-between border border-stone-700/80 transition-colors cursor-pointer"
            >
              <span>👑 Educate Heirs & Marry</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
            {onOpenSaveLoad && (
              <button
                onClick={onOpenSaveLoad}
                id="quick-saveload-btn"
                className="w-full py-2 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 text-xs font-semibold flex items-center justify-between border border-amber-800/60 transition-colors cursor-pointer"
              >
                <span>💾 Save / Load Chronicles</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feudal Vassals & Imperial Counties Direct Banner */}
      <div 
        onClick={onOpenVassals}
        className="p-4 rounded-2xl bg-gradient-to-r from-[#C9972E]/20 via-[#B78722]/30 to-[#C9972E]/20 border border-amber-500/40 shadow-xl hover:border-amber-400 cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-[#C9972E] text-stone-950 flex items-center justify-center text-2xl shadow-md shrink-0">
            🚩
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-base font-extrabold text-amber-200 font-cinzel">
                Feudal Vassals & Imperial Counties ({vassals.length || 12})
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-600/40 font-bold uppercase tracking-wider">
                Political Actions
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Inspect all appointed feudal vassals, troop contributions, county relations, and issue political actions (gifts, praise, insults, schemes, ward assignments, marriage, and imprisonment).
            </p>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onOpenVassals(); }}
          className="px-4 py-2 bg-[#C9972E] hover:bg-[#B78722] text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer group-hover:scale-105"
        >
          <span>Manage Vassals</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Chronicle Timeline Feed */}
      <div className="bg-stone-900/95 rounded-2xl p-4 sm:p-6 border border-stone-800 shadow-2xl">
        
        {/* Timeline Header & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel flex items-center gap-2">
              <Scroll className="w-5 h-5 text-amber-400" />
              Vertical Annals & Chronicle Timeline
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Dynastic history recorded across generations with milestone markers
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => { setViewMode('thread'); sound.playClick(); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'thread'
                    ? 'bg-amber-600 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Timeline Thread
              </button>
              <button
                onClick={() => { setViewMode('classic'); sound.playClick(); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'classic'
                    ? 'bg-amber-600 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Classic List
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5 pb-3 border-b border-stone-800/80">
          <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Annals', icon: '📜' },
            { id: 'birth', label: '👶 Births & Heirs', icon: '👶' },
            { id: 'death', label: '💀 Deaths', icon: '💀' },
            { id: 'war', label: '⚔️ Wars & Battles', icon: '⚔️' },
            { id: 'coronation', label: '👑 Decrees & Coronations', icon: '👑' },
            { id: 'diplomacy', label: '🕊️ Treaties & Marriages', icon: '🕊️' },
            { id: 'travel', label: '✨ Travel & Wonders', icon: '✨' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => { setTimelineFilter(chip.id as any); sound.playClick(); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                timelineFilter === chip.id
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 shadow-xs'
                  : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: VERTICAL TIMELINE THREAD WITH DISTINCT MARKERS */}
        {/* ========================================================================= */}
        {viewMode === 'thread' && (
          <div className="relative pl-6 sm:pl-8 py-2">
            
            {/* Central Vertical Spine Thread Line */}
            <div className="absolute top-0 bottom-0 left-2.5 sm:left-3.5 w-1 bg-gradient-to-b from-amber-500 via-amber-700/60 to-stone-800 rounded-full" />

            <div className="space-y-6">
              {filteredChronicle.map((entry, idx) => {
                const marker = getChronicleMarker(entry);

                return (
                  <div key={entry.id || idx} className="relative group">
                    
                    {/* Glowing Marker Node on Spine */}
                    <div 
                      className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 ${marker.borderColor} ${marker.nodeColor} ${marker.glowColor} flex items-center justify-center text-xs sm:text-sm shadow-lg z-10 transition-transform group-hover:scale-110`}
                      title={marker.label}
                    >
                      <span>{marker.icon}</span>
                    </div>

                    {/* Timeline Event Card */}
                    <div className={`p-4 rounded-xl border transition-all ${marker.cardBg} ${entry.isImportant ? 'ring-1 ring-amber-500/40 shadow-lg' : ''}`}>
                      
                      {/* Top Header of the Timeline Entry */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Year and Age Badge */}
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-black bg-stone-900 text-amber-300 border border-stone-700 shadow-inner">
                            Year {entry.year} AD • Age {entry.age}
                          </span>

                          {/* Marker Category Pill */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${marker.badgeBg}`}>
                            {marker.label}
                          </span>

                          {/* Title */}
                          <h4 className="text-sm sm:text-base font-bold text-stone-100 font-cinzel">
                            {entry.title}
                          </h4>
                        </div>

                        {/* Milestone Badge */}
                        {entry.isImportant && (
                          <span className="text-[10px] uppercase font-black text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-500/60 flex items-center gap-1 shadow-xs">
                            <Crown className="w-3 h-3 text-amber-400" />
                            Epoch Milestone
                          </span>
                        )}
                      </div>

                      {/* Description Text */}
                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed pl-0.5">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredChronicle.length === 0 && (
                <div className="text-center py-10 text-stone-500 text-sm italic pl-2">
                  No records match the selected filter. Advance the years to generate more history!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CLASSIC ANNALS LIST */}
        {/* ========================================================================= */}
        {viewMode === 'classic' && (
          <div className="space-y-3">
            {filteredChronicle.map((entry) => {
              const marker = getChronicleMarker(entry);
              return (
                <div
                  key={entry.id}
                  className={`p-3 sm:p-4 rounded-xl border transition-all ${
                    entry.isImportant
                      ? 'bg-amber-950/40 border-amber-600/50 shadow-md'
                      : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{marker.icon}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-amber-300 border border-stone-700">
                        Age {entry.age} (Year {entry.year})
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-stone-100 font-cinzel">
                        {entry.title}
                      </span>
                    </div>
                    {entry.isImportant && (
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-600/40">
                        Milestone
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed pl-1">
                    {entry.description}
                  </p>
                </div>
              );
            })}

            {filteredChronicle.length === 0 && (
              <div className="text-center py-8 text-stone-500 text-sm italic">
                No entries found.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

