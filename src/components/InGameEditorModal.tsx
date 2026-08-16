import React, { useState } from 'react';
import { 
  Character, 
  Realm, 
  Province, 
  Vassal, 
  FamilyMember, 
  RealmLaw, 
  ChronicleEntry, 
  TradeCaravan, 
  WarState, 
  RealmNPC, 
  Species, 
  Gender,
  GameEvent
} from '../types';
import { SPECIES_DATA } from '../data/speciesData';
import { EVENTS_POOL } from '../data/eventsPool';
import { sound } from '../utils/audio';
import { 
  Wand2, 
  Sparkles, 
  Coins, 
  Heart, 
  Smile, 
  Crown, 
  Shield, 
  Swords, 
  Scroll, 
  Users, 
  Castle, 
  Flame, 
  Clock, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Sliders, 
  Compass, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Baby, 
  RefreshCw,
  Award,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface InGameEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Current game state
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  realms: Realm[];
  setRealms: React.Dispatch<React.SetStateAction<Realm[]>>;
  provinces: Province[];
  setProvinces: React.Dispatch<React.SetStateAction<Province[]>>;
  vassals: Vassal[];
  setVassals: React.Dispatch<React.SetStateAction<Vassal[]>>;
  realmLaws: RealmLaw[];
  setRealmLaws: React.Dispatch<React.SetStateAction<RealmLaw[]>>;
  chronicleEntries: ChronicleEntry[];
  setChronicleEntries: React.Dispatch<React.SetStateAction<ChronicleEntry[]>>;
  currentYear: number;
  setCurrentYear: React.Dispatch<React.SetStateAction<number>>;
  reignYears: number;
  setReignYears: React.Dispatch<React.SetStateAction<number>>;
  activeWars: WarState[];
  setActiveWars: React.Dispatch<React.SetStateAction<WarState[]>>;
  onTriggerEvent?: (event: GameEvent) => void;
}

type EditorTab = 'cheats' | 'character' | 'provinces' | 'vassals' | 'laws' | 'world' | 'presets';

const TRAIT_PRESETS = [
  'Immortal', 'God-Emperor', 'Genius', 'Herculean', 'Saint', 'Legendary Ruler',
  'Master Strategist', 'Grand Conqueror', 'Dragon Rider', 'Silver Tongued',
  'Beloved', 'Wealthy Magnate', 'Arcane Archmage', 'Blood Lord', 'Night Prowler',
  'Devout', 'Chivalric Code', 'Iron Will', 'Zealous Benefactor', 'Nature Mystic',
  'Beast Slayer', 'Beast Master', 'Enlightened', 'Theologian', 'Pilgrim',
  'Diligent', 'Brave', 'Charismatic', 'Just', 'Ambitious', 'Gregarious',
  'Wounded', 'Scarred', 'Craven', 'Wrathful', 'Gluttonous', 'Greedy', 'Proud'
];

const PORTRAIT_PRESETS = [
  '👑', '🤴', '👸', '🧙‍♂️', '🧙‍♀️', '🦇', '🧛‍♂️', '🧛‍♀️', '🐺', '🧝‍♂️', '🧝‍♀️', '🦅', '🐉', '⚔️', '🛡️',
  '🦁', '🐅', '🐻', '💀', '🔥', '✨', '💎', '🕊️', '🏹', '🐎', '🪙', '📜', '⚖️'
];

const RANK_OPTIONS = [
  'Emperor', 'Empress', 'High King', 'High Queen', 'King', 'Queen', 
  'Grand Duke', 'Grand Duchess', 'Duke', 'Duchess', 'Count', 'Countess', 
  'Lord Protector', 'Sovereign Archon', 'Overlord', 'Baron'
];

export const InGameEditorModal: React.FC<InGameEditorModalProps> = ({
  isOpen,
  onClose,
  character,
  setCharacter,
  familyMembers,
  setFamilyMembers,
  realms,
  setRealms,
  provinces,
  setProvinces,
  vassals,
  setVassals,
  realmLaws,
  setRealmLaws,
  chronicleEntries,
  setChronicleEntries,
  currentYear,
  setCurrentYear,
  reignYears,
  setReignYears,
  activeWars,
  setActiveWars,
  onTriggerEvent
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('cheats');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newTraitInput, setNewTraitInput] = useState<string>('');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(provinces[0]?.id || '');
  const [selectedVassalId, setSelectedVassalId] = useState<string>(vassals[0]?.id || '');
  
  // Custom Chronicle entry state
  const [customChronicleTitle, setCustomChronicleTitle] = useState<string>('Imperial Golden Jubilee');
  const [customChronicleDesc, setCustomChronicleDesc] = useState<string>('Decreed a glorious festival of imperial splendor throughout all provinces.');
  const [customChronicleType, setCustomChronicleType] = useState<ChronicleEntry['type']>('coronation');
  const [customChronicleMilestone, setCustomChronicleMilestone] = useState<boolean>(true);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    sound.playFanfare();
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // =========================================================================
  // GOD MODE / QUICK CHEAT ACTIONS
  // =========================================================================
  const handleAddGold = (amount: number) => {
    setCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, gold: Math.max(0, prev.stats.gold + amount) }
    }));
    sound.playCoin();
    showToast(`Added ${amount.toLocaleString()} Imperial Gold to the Royal Treasury!`);
  };

  const handleSetMaxHealthHappiness = () => {
    setCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, health: 100, happiness: 100 },
      traits: prev.traits.filter(t => t !== 'Wounded' && t !== 'Sick' && t !== 'Fever')
    }));
    sound.playChime();
    showToast('Restored 100% Health & 100% Happiness! Cured all mortal ailments.');
  };

  const handleAscendToEmperor = () => {
    setCharacter(prev => ({
      ...prev,
      rank: 'Emperor',
      title: 'High Emperor of the Realms',
      stats: {
        ...prev.stats,
        renown: prev.stats.renown + 2000,
        pietyOrMana: Math.min(100, prev.stats.pietyOrMana + 50)
      },
      traits: Array.from(new Set([...prev.traits, 'God-Emperor', 'Legendary Ruler']))
    }));
    sound.playFanfare();
    showToast('Ascended to Sovereign Emperor rank with +2,000 Renown and Imperial traits!');
  };

  const handleMaxAllStats = () => {
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        martial: 100,
        intellect: 100,
        intrigue: 100,
        diplomacy: 100,
        pietyOrMana: 100,
        specialResource: 100,
        health: 100,
        happiness: 100
      }
    }));
    sound.playChime();
    showToast('All Ruler Attributes, Martial, and Mana boosted to Maximum 100!');
  };

  const handlePaxImperialis = () => {
    // 0% unrest on all provinces, 100% loyalty on all vassals, 100 opinion
    setProvinces(prev => prev.map(p => ({ ...p, unrest: 0, prosperity: 100 })));
    setVassals(prev => prev.map(v => ({ ...v, loyalty: 100, opinion: 100, faction: 'Loyalist' })));
    setRealms(prev => prev.map(r => ({ ...r, opinion: 100, isAtWarWithPlayer: false })));
    setActiveWars([]);
    sound.playFanfare();
    showToast('Pax Imperialis enacted: 0% Unrest worldwide, 100% Vassal Loyalty & all wars resolved!');
  };

  const handleConquerAllProvinces = () => {
    setProvinces(prev => prev.map(p => ({
      ...p,
      isPlayerControlled: true,
      realmId: character.realmId,
      unrest: 0
    })));
    sound.playSwordClash();
    showToast('Total Conquest! All world provinces are now under direct imperial control.');
  };

  const handleMaxAllBuildings = () => {
    setProvinces(prev => prev.map(p => {
      if (!p.isPlayerControlled) return p;
      return {
        ...p,
        developmentLevel: 100,
        prosperity: 100,
        troops: Math.max(p.troops, 2500),
        income: Math.max(p.income, 80),
        buildings: {
          castle: 5,
          churchOrShrine: 5,
          market: 5,
          barracks: 5,
          academy: 5,
          governorOffice: 5,
          farms: 5,
          realmSpecialStructure: 5
        }
      };
    }));
    sound.playChime();
    showToast('All player provinces upgraded with Level 5 Imperial Infrastructure!');
  };

  const handleSpawnDivineHeir = () => {
    const heirId = `divine_heir_${Date.now()}`;
    const newHeir: FamilyMember = {
      id: heirId,
      name: 'Prince Aurelius',
      species: character.species,
      gender: 'Male',
      relation: 'Child',
      age: 16,
      alive: true,
      health: 100,
      opinion: 100,
      childrenIds: [],
      realmId: character.realmId,
      title: 'Crown Imperial Heir',
      isHeir: true,
      traits: ['Genius', 'Herculean', 'Beloved', 'Chivalric Code'],
      portrait: '🤴',
      stats: {
        martial: 95,
        diplomacy: 90,
        intrigue: 85,
        intellect: 95,
        prowess: 90,
        stewardship: 92
      }
    };

    setFamilyMembers(prev => [newHeir, ...prev.map(f => ({ ...f, isHeir: false }))]);
    setCharacter(prev => ({
      ...prev,
      childrenIds: [...prev.childrenIds, heirId]
    }));
    sound.playFanfare();
    showToast('Spawned Divine Prodigy Crown Prince Aurelius with legendary stats!');
  };

  const handleSummonSpouse = () => {
    const spouseId = `noble_spouse_${Date.now()}`;
    const newSpouse: FamilyMember = {
      id: spouseId,
      name: 'High Duchess Eleanor of Valyria',
      species: character.species,
      gender: character.gender === 'Male' ? 'Female' : 'Male',
      relation: 'Spouse',
      age: Math.max(18, character.age - 2),
      alive: true,
      health: 100,
      opinion: 100,
      childrenIds: [],
      realmId: character.realmId,
      title: 'Imperial Consort & Empress',
      isHeir: false,
      traits: ['Beloved', 'Wealthy Magnate', 'Silver Tongued'],
      portrait: character.gender === 'Male' ? '👸' : '🤴'
    };

    setFamilyMembers(prev => [newSpouse, ...prev.filter(f => f.relation !== 'Spouse')]);
    setCharacter(prev => ({
      ...prev,
      spouseId: spouseId,
      spouseName: newSpouse.name,
      spouseSpecies: newSpouse.species
    }));
    sound.playChime();
    showToast(`Imperial Marriage celebrated with ${newSpouse.name}!`);
  };

  // =========================================================================
  // TRAIT MANAGEMENT
  // =========================================================================
  const handleAddTrait = (traitName: string) => {
    const trimmed = traitName.trim();
    if (!trimmed) return;
    if (!character.traits.includes(trimmed)) {
      setCharacter(prev => ({
        ...prev,
        traits: [...prev.traits, trimmed]
      }));
      sound.playClick();
      showToast(`Added trait: "${trimmed}"`);
    }
    setNewTraitInput('');
  };

  const handleRemoveTrait = (traitName: string) => {
    setCharacter(prev => ({
      ...prev,
      traits: prev.traits.filter(t => t !== traitName)
    }));
    sound.playClick();
    showToast(`Removed trait: "${traitName}"`);
  };

  // =========================================================================
  // PROVINCE EDITING
  // =========================================================================
  const currentProvince = provinces.find(p => p.id === selectedProvinceId) || provinces[0];

  const updateCurrentProvince = (updater: (prev: Province) => Province) => {
    setProvinces(all => all.map(p => (p.id === currentProvince.id ? updater(p) : p)));
  };

  // =========================================================================
  // VASSAL EDITING
  // =========================================================================
  const currentVassal = vassals.find(v => v.id === selectedVassalId) || vassals[0];

  const updateCurrentVassal = (updater: (prev: Vassal) => Vassal) => {
    setVassals(all => all.map(v => (v.id === currentVassal.id ? updater(v) : v)));
  };

  // =========================================================================
  // LAWS FORCE ENACT
  // =========================================================================
  const handleForceEnactLaw = (lawId: string, optionId: string) => {
    setRealmLaws(prev => prev.map(law => {
      if (law.id === lawId) {
        return { ...law, currentOptionId: optionId };
      }
      return law;
    }));
    sound.playFanfare();
    showToast('Enacted Realm Law override with Imperial Executive Authority!');
  };

  // =========================================================================
  // CHRONICLE ENTRY ADDITION
  // =========================================================================
  const handleAddCustomChronicle = () => {
    if (!customChronicleTitle.trim()) return;

    const newEntry: ChronicleEntry = {
      id: `chronicle_custom_${Date.now()}`,
      year: currentYear,
      age: character.age,
      title: customChronicleTitle.trim(),
      description: customChronicleDesc.trim() || 'Recorded by royal decree.',
      isImportant: customChronicleMilestone,
      type: customChronicleType
    };

    setChronicleEntries(prev => [newEntry, ...prev]);
    sound.playFanfare();
    showToast(`Inscribed "${customChronicleTitle}" into the Royal Chronicle!`);
  };

  // =========================================================================
  // PRESET PROFILES
  // =========================================================================
  const applyPresetProfile = (presetKey: string) => {
    if (presetKey === 'god_emperor') {
      setCharacter(prev => ({
        ...prev,
        rank: 'Emperor',
        title: 'Eternal High God-Emperor',
        age: 30,
        stats: {
          health: 100,
          happiness: 100,
          gold: 50000,
          renown: 10000,
          pietyOrMana: 100,
          martial: 100,
          intellect: 100,
          intrigue: 100,
          diplomacy: 100,
          specialResource: 100
        },
        traits: ['God-Emperor', 'Immortal', 'Genius', 'Herculean', 'Master Strategist', 'Dragon Rider', 'Beloved']
      }));
      setProvinces(prev => prev.map(p => ({ ...p, unrest: 0, prosperity: 100, isPlayerControlled: true })));
      setVassals(prev => prev.map(v => ({ ...v, loyalty: 100, opinion: 100 })));
      showToast('Loaded God-Emperor Sandbox Profile!');
    } else if (presetKey === 'warlord') {
      setCharacter(prev => ({
        ...prev,
        rank: 'Grand Conqueror',
        title: 'Lord General of the Iron Host',
        stats: {
          ...prev.stats,
          gold: 15000,
          martial: 100,
          health: 100,
          renown: 5000
        },
        traits: ['Grand Conqueror', 'Master Strategist', 'Beast Slayer', 'Brave', 'Herculean']
      }));
      showToast('Loaded Iron Warlord Profile!');
    } else if (presetKey === 'merchant_prince') {
      setCharacter(prev => ({
        ...prev,
        rank: 'Grand Duke',
        title: 'Grand Merchant Prince',
        stats: {
          ...prev.stats,
          gold: 99999,
          diplomacy: 100,
          intellect: 90,
          renown: 3500
        },
        traits: ['Wealthy Magnate', 'Silver Tongued', 'Diligent', 'Beloved']
      }));
      showToast('Loaded Merchant Prince Profile with 99,999 Gold!');
    } else if (presetKey === 'arcane_archmage') {
      setCharacter(prev => ({
        ...prev,
        species: 'HighElf',
        title: 'Archmage Sovereign of the Arcane Veil',
        portrait: '🧙‍♂️',
        stats: {
          ...prev.stats,
          pietyOrMana: 100,
          intellect: 100,
          specialResource: 100
        },
        traits: ['Arcane Archmage', 'Enlightened', 'Genius', 'Immortal']
      }));
      showToast('Loaded Arcane Archmage Profile!');
    }
    sound.playFanfare();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="w-full max-w-5xl bg-stone-900 border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* ========================================================================= */}
        {/* HEADER BAR */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-600/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 border border-amber-300 flex items-center justify-center text-stone-950 shadow-md">
              <Wand2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-amber-200 font-cinzel tracking-wide flex items-center gap-1.5">
                  <span>Imperial In-Game Editor & God Mode</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950 uppercase tracking-wider">
                  Sandbox Active
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Modify character attributes, realm provinces, feudal vassals, laws, and trigger god powers in real time.
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer"
            title="Close Editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast notification banner */}
        {toastMessage && (
          <div className="bg-amber-600 text-stone-950 px-4 py-2 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-150">
            <Sparkles className="w-4 h-4 text-stone-950 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB NAVIGATION */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1 p-2 bg-stone-950 border-b border-stone-800 overflow-x-auto shrink-0 scrollbar-thin">
          {[
            { id: 'cheats', label: '⚡ God Powers', icon: Zap },
            { id: 'character', label: '👤 Ruler & Stats', icon: Sliders },
            { id: 'provinces', label: '🏰 Provinces & Map', icon: Castle },
            { id: 'vassals', label: '👥 Vassals & Factions', icon: Users },
            { id: 'laws', label: '📜 Laws Override', icon: BookOpen },
            { id: 'world', label: '⏳ Time & Events', icon: Clock },
            { id: 'presets', label: '✨ Cheat Presets', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as EditorTab); sound.playClick(); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                    : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY CONTENT AREA */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-stone-200">
          
          {/* ======================================================================= */}
          {/* TAB 1: GOD POWERS & CHEATS */}
          {/* ======================================================================= */}
          {activeTab === 'cheats' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-amber-200 font-cinzel mb-1 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Instant Sovereign Cheat Commands
                </h3>
                <p className="text-xs text-stone-400">
                  One-click god mode actions to alter realm state, economy, and military immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Add Gold */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                      <Coins className="w-4 h-4" />
                      <span>Treasury Vaults</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">
                      Current Gold: <strong className="text-amber-300 font-mono">{character.stats.gold.toLocaleString()}</strong>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleAddGold(1000)}
                      className="py-1.5 px-2 bg-amber-600/20 hover:bg-amber-600 text-amber-200 hover:text-stone-950 border border-amber-600/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      +1,000 Gold
                    </button>
                    <button
                      onClick={() => handleAddGold(10000)}
                      className="py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm"
                    >
                      +10,000 Gold
                    </button>
                  </div>
                </div>

                {/* 2. Full Heal & Vigor */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-rose-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
                      <Heart className="w-4 h-4" />
                      <span>Full Health & Vigor</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">
                      Health: <span className="text-rose-300 font-bold">{character.stats.health}%</span> • Happiness: <span className="text-amber-300 font-bold">{character.stats.happiness}%</span>
                    </p>
                  </div>
                  <button
                    onClick={handleSetMaxHealthHappiness}
                    className="w-full py-2 bg-rose-950 hover:bg-rose-900 border border-rose-600/60 text-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Restore 100% Health & Cures
                  </button>
                </div>

                {/* 3. Ascend to Emperor */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-1">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Ascend to Emperor</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">
                      Current Rank: <strong className="text-stone-200">{character.rank || 'Ruler'}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleAscendToEmperor}
                    className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm"
                  >
                    Ascend to Emperor (+2k Renown)
                  </button>
                </div>

                {/* 4. Max All Stats (100) */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Max All Attributes (100)</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">
                      Boost Martial, Intellect, Intrigue, Diplomacy, Piety/Mana to 100.
                    </p>
                  </div>
                  <button
                    onClick={handleMaxAllStats}
                    className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-600/60 text-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Max Attributes to 100
                  </button>
                </div>

                {/* 5. Pax Imperialis */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pax Imperialis (Total Peace)</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">
                      Set 0% Unrest worldwide, 100% Vassal Loyalty & end all hostilities.
                    </p>
                  </div>
                  <button
                    onClick={handlePaxImperialis}
                    className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Enact Pax Imperialis
                  </button>
                </div>

                {/* 6. Conquer All Provinces */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-red-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
                      <Swords className="w-4 h-4" />
                      <span>Conquer All World Provinces</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">
                      Claim all territories across the entire map under your crown.
                    </p>
                  </div>
                  <button
                    onClick={handleConquerAllProvinces}
                    className="w-full py-2 bg-red-950 hover:bg-red-900 border border-red-600/60 text-red-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Claim All Provinces
                  </button>
                </div>

                {/* 7. Max Infrastructure */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                      <Castle className="w-4 h-4" />
                      <span>Max Player Buildings</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">
                      Upgrade all Castle, Barracks, Markets and Academies to Level 5.
                    </p>
                  </div>
                  <button
                    onClick={handleMaxAllBuildings}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Build Max Infrastructure
                  </button>
                </div>

                {/* 8. Spawn Prodigy Heir */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-purple-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                      <Baby className="w-4 h-4" />
                      <span>Spawn Divine Heir</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">
                      Create an elite Crown Prince with Genius, Herculean & 90+ attributes.
                    </p>
                  </div>
                  <button
                    onClick={handleSpawnDivineHeir}
                    className="w-full py-2 bg-purple-950 hover:bg-purple-900 border border-purple-600/60 text-purple-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Spawn Crown Heir
                  </button>
                </div>

                {/* 9. Summon High Noble Spouse */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-1">
                      <Crown className="w-4 h-4" />
                      <span>Summon Royal Consort</span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">
                      Instantly wed a high-born consort with high stats and 100 opinion.
                    </p>
                  </div>
                  <button
                    onClick={handleSummonSpouse}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Marry High Consort
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 2: RULER & STATS CUSTOMIZER */}
          {/* ======================================================================= */}
          {activeTab === 'character' && (
            <div className="space-y-6">
              
              {/* Identity & Appearance */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="font-bold text-amber-200 text-sm font-cinzel border-b border-stone-800 pb-2 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Ruler Identity & Lineage
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={character.name}
                      onChange={e => setCharacter(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                      Dynasty / House Name
                    </label>
                    <input
                      type="text"
                      value={character.dynastyName}
                      onChange={e => setCharacter(p => ({ ...p, dynastyName: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                      Imperial Rank
                    </label>
                    <select
                      value={character.rank}
                      onChange={e => setCharacter(p => ({ ...p, rank: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      {RANK_OPTIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                      Species / Lineage
                    </label>
                    <select
                      value={character.species}
                      onChange={e => setCharacter(p => ({ ...p, species: e.target.value as Species }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Human">Human</option>
                      <option value="Vampire">Vampire</option>
                      <option value="Werewolf">Werewolf</option>
                      <option value="Witch">Witch</option>
                      <option value="HighElf">High Elf</option>
                    </select>
                  </div>
                </div>

                {/* Portrait Emoji Selector */}
                <div>
                  <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1.5">
                    Portrait Icon (Current: {character.portrait})
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-stone-900/80 rounded-lg border border-stone-800">
                    {PORTRAIT_PRESETS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { setCharacter(p => ({ ...p, portrait: emoji })); sound.playClick(); }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                          character.portrait === emoji
                            ? 'bg-amber-600 text-stone-950 scale-110 shadow-sm border border-amber-300'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attributes & Sliders */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="font-bold text-amber-200 text-sm font-cinzel border-b border-stone-800 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Attributes & Resource Sliders
                  </span>
                  <button
                    onClick={handleMaxAllStats}
                    className="text-[11px] px-2 py-0.5 rounded bg-amber-600/30 text-amber-300 hover:bg-amber-600 hover:text-stone-950 font-bold transition-all cursor-pointer"
                  >
                    Max All to 100
                  </button>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* Age */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400 font-bold">Age</span>
                      <span className="font-mono text-amber-300 font-bold">{character.age} Years</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="150"
                      value={character.age}
                      onChange={e => setCharacter(p => ({ ...p, age: Number(e.target.value) }))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Health */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-rose-400 font-bold">Health</span>
                      <span className="font-mono text-rose-300 font-bold">{character.stats.health}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={character.stats.health}
                      onChange={e => setCharacter(p => ({ ...p, stats: { ...p.stats, health: Number(e.target.value) } }))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  {/* Happiness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-amber-400 font-bold">Happiness</span>
                      <span className="font-mono text-amber-300 font-bold">{character.stats.happiness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={character.stats.happiness}
                      onChange={e => setCharacter(p => ({ ...p, stats: { ...p.stats, happiness: Number(e.target.value) } }))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Martial */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400 font-bold">Martial Prowess</span>
                      <span className="font-mono text-red-300 font-bold">{character.stats.martial}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={character.stats.martial}
                      onChange={e => setCharacter(p => ({ ...p, stats: { ...p.stats, martial: Number(e.target.value) } }))}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                  </div>

                  {/* Diplomacy */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-400 font-bold">Diplomacy</span>
                      <span className="font-mono text-blue-300 font-bold">{character.stats.diplomacy}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={character.stats.diplomacy}
                      onChange={e => setCharacter(p => ({ ...p, stats: { ...p.stats, diplomacy: Number(e.target.value) } }))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Intellect */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-400 font-bold">Intellect & Learning</span>
                      <span className="font-mono text-purple-300 font-bold">{character.stats.intellect}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={character.stats.intellect}
                      onChange={e => setCharacter(p => ({ ...p, stats: { ...p.stats, intellect: Number(e.target.value) } }))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Intrigue */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-400 font-bold">Intrigue & Spymastery</span>
                      <span className="font-mono text-emerald-300 font-bold">{character.stats.intrigue}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={character.stats.intrigue}
                      onChange={e => setCharacter(p => ({ ...p, stats: { ...p.stats, intrigue: Number(e.target.value) } }))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Piety / Mana */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-indigo-400 font-bold">Piety / Arcane Mana</span>
                      <span className="font-mono text-indigo-300 font-bold">{character.stats.pietyOrMana}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={character.stats.pietyOrMana}
                      onChange={e => setCharacter(p => ({ ...p, stats: { ...p.stats, pietyOrMana: Number(e.target.value) } }))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Renown */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-amber-400 font-bold">Imperial Renown</span>
                      <span className="font-mono text-amber-300 font-bold">{character.stats.renown}</span>
                    </div>
                    <input
                      type="number"
                      value={character.stats.renown}
                      onChange={e => setCharacter(p => ({ ...p, stats: { ...p.stats, renown: Math.max(0, Number(e.target.value)) } }))}
                      className="w-full px-3 py-1 rounded bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Traits Manager */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <h4 className="font-bold text-amber-200 text-sm font-cinzel border-b border-stone-800 pb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Active Traits & Custom Inscriptions
                </h4>

                {/* Current Active Traits */}
                <div className="flex flex-wrap gap-1.5">
                  {character.traits.map(trait => (
                    <span
                      key={trait}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950/80 text-amber-200 border border-amber-600/50 flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{trait}</span>
                      <button
                        onClick={() => handleRemoveTrait(trait)}
                        className="text-amber-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove Trait"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {character.traits.length === 0 && (
                    <span className="text-xs text-stone-500 italic">No active traits.</span>
                  )}
                </div>

                {/* Custom trait input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Type custom trait name..."
                    value={newTraitInput}
                    onChange={e => setNewTraitInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTrait(newTraitInput)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddTrait(newTraitInput)}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Trait</span>
                  </button>
                </div>

                {/* Quick Add Trait Catalog */}
                <div className="pt-2">
                  <div className="text-[11px] text-stone-400 font-bold uppercase mb-1.5">
                    Quick Add from Trait Catalog:
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-stone-900/60 rounded-lg border border-stone-800">
                    {TRAIT_PRESETS.map(t => {
                      const isAdded = character.traits.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => (isAdded ? handleRemoveTrait(t) : handleAddTrait(t))}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {isAdded ? `✓ ${t}` : `+ ${t}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 3: PROVINCES & REALM MAP */}
          {/* ======================================================================= */}
          {activeTab === 'provinces' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-amber-200 font-cinzel flex items-center gap-2">
                    <Castle className="w-5 h-5 text-amber-400" />
                    Province & Territory Customizer
                  </h3>
                  <p className="text-xs text-stone-400">
                    Edit territorial ownership, development, unrest, garrison, and buildings.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleConquerAllProvinces}
                    className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-600/60 text-red-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Claim All for Player
                  </button>
                  <button
                    onClick={() => {
                      setProvinces(prev => prev.map(p => ({ ...p, unrest: 0, prosperity: 100 })));
                      sound.playChime();
                      showToast('Pacified all world provinces to 0% Unrest & 100% Prosperity!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Pacify All Unrest
                  </button>
                </div>
              </div>

              {/* Province Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                    Select Province ({provinces.length} Total)
                  </label>
                  <select
                    value={currentProvince.id}
                    onChange={e => { setSelectedProvinceId(e.target.value); sound.playClick(); }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.isPlayerControlled ? '👑 ' : '🏰 '} {p.name} ({p.isPlayerControlled ? 'Demesne' : p.realmId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-amber-300 font-cinzel">
                      {currentProvince.name}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Status: {currentProvince.isPlayerControlled ? 'Crown Demesne (Player Controlled)' : `Realm: ${currentProvince.realmId}`}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      updateCurrentProvince(p => ({ ...p, isPlayerControlled: !p.isPlayerControlled, realmId: !p.isPlayerControlled ? character.realmId : 'realm_independent' }));
                      sound.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentProvince.isPlayerControlled
                        ? 'bg-amber-600 text-stone-950 font-black'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {currentProvince.isPlayerControlled ? '✓ Controlled by Player' : '+ Claim for Player'}
                  </button>
                </div>
              </div>

              {/* Province Stats Sliders */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Prosperity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400 font-bold">Prosperity</span>
                    <span className="font-mono text-amber-300 font-bold">{currentProvince.prosperity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentProvince.prosperity}
                    onChange={e => updateCurrentProvince(p => ({ ...p, prosperity: Number(e.target.value) }))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Unrest */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-400 font-bold">Unrest / Rebellion</span>
                    <span className="font-mono text-red-300 font-bold">{currentProvince.unrest}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentProvince.unrest}
                    onChange={e => updateCurrentProvince(p => ({ ...p, unrest: Number(e.target.value) }))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>

                {/* Development */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-400 font-bold">Development Level</span>
                    <span className="font-mono text-blue-300 font-bold">{currentProvince.developmentLevel || 50}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentProvince.developmentLevel || 50}
                    onChange={e => updateCurrentProvince(p => ({ ...p, developmentLevel: Number(e.target.value) }))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Garrison Troops */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400 font-bold">Garrison Troops</span>
                    <span className="font-mono text-emerald-300 font-bold">{currentProvince.troops}</span>
                  </div>
                  <input
                    type="number"
                    value={currentProvince.troops}
                    onChange={e => updateCurrentProvince(p => ({ ...p, troops: Math.max(0, Number(e.target.value)) }))}
                    className="w-full px-2 py-1 rounded bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Province Buildings Levels */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <h4 className="font-bold text-amber-200 text-sm font-cinzel border-b border-stone-800 pb-2">
                  Building Infrastructure Levels (0 to 5)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'castle', label: '🏰 Castle / Fort' },
                    { key: 'market', label: '🪙 Market Square' },
                    { key: 'barracks', label: '⚔️ War Barracks' },
                    { key: 'academy', label: '📚 Royal Academy' },
                    { key: 'churchOrShrine', label: '⛪ Cathedral / Shrine' },
                    { key: 'governorOffice', label: '🏛️ Governor Office' },
                    { key: 'farms', label: '🌾 Farmlands' },
                    { key: 'realmSpecialStructure', label: '✨ Arcane Wonder' }
                  ].map(b => {
                    const currentLvl = (currentProvince.buildings as any)[b.key] || 0;
                    return (
                      <div key={b.key} className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-800 flex items-center justify-between">
                        <div className="text-xs font-semibold text-stone-300">{b.label}</div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCurrentProvince(p => ({ ...p, buildings: { ...p.buildings, [b.key]: Math.max(0, currentLvl - 1) } }))}
                            className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono text-amber-300 font-bold text-xs w-4 text-center">
                            {currentLvl}
                          </span>
                          <button
                            onClick={() => updateCurrentProvince(p => ({ ...p, buildings: { ...p.buildings, [b.key]: Math.min(5, currentLvl + 1) } }))}
                            className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 4: VASSALS & FACTIONS */}
          {/* ======================================================================= */}
          {activeTab === 'vassals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-amber-200 font-cinzel flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    Feudal Vassal & Loyalty Overlord
                  </h3>
                  <p className="text-xs text-stone-400">
                    Adjust feudal lord loyalties, opinions, factions, and levy quotas.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setVassals(prev => prev.map(v => ({ ...v, loyalty: 100, opinion: 100, faction: 'Loyalist' })));
                    sound.playFanfare();
                    showToast('Set All Vassals to 100% Supreme Devotion & Loyalist faction!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-black transition-all cursor-pointer shadow-sm"
                >
                  Max All Vassal Loyalty (100%)
                </button>
              </div>

              {/* Vassal selector */}
              <div>
                <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                  Select Vassal Lord ({vassals.length} Vassals)
                </label>
                <select
                  value={currentVassal.id}
                  onChange={e => { setSelectedVassalId(e.target.value); sound.playClick(); }}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                >
                  {vassals.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.portrait} {v.name} ({v.title}) • Loyalty: {v.loyalty}% • Opinion: {v.opinion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vassal Controls */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 border border-amber-600/50 flex items-center justify-center text-2xl">
                    {currentVassal.portrait}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-100 text-sm font-cinzel">
                      {currentVassal.name}
                    </h4>
                    <p className="text-xs text-stone-400">
                      {currentVassal.title} • {currentVassal.countyName || 'Feudal Holding'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Loyalty */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-amber-400 font-bold">Allegiance / Loyalty</span>
                      <span className="font-mono text-amber-300 font-bold">{currentVassal.loyalty}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentVassal.loyalty}
                      onChange={e => updateCurrentVassal(v => ({ ...v, loyalty: Number(e.target.value) }))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Opinion */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-400 font-bold">Personal Opinion</span>
                      <span className="font-mono text-blue-300 font-bold">{currentVassal.opinion}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={currentVassal.opinion}
                      onChange={e => updateCurrentVassal(v => ({ ...v, opinion: Number(e.target.value) }))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Faction */}
                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                      Political Faction
                    </label>
                    <select
                      value={currentVassal.faction}
                      onChange={e => updateCurrentVassal(v => ({ ...v, faction: e.target.value as any }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs"
                    >
                      <option value="Loyalist">Loyalist</option>
                      <option value="Autonomy">Autonomy League</option>
                      <option value="LowerTaxes">Tax Revolt</option>
                      <option value="CrossRealmSympathizers">Cross-Realm Faction</option>
                      <option value="PretenderClaimant">Pretender Claimant</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 5: REALM LAWS OVERRIDE */}
          {/* ======================================================================= */}
          {activeTab === 'laws' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-amber-200 font-cinzel mb-1 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Imperial Realm Laws Override
                </h3>
                <p className="text-xs text-stone-400">
                  Force-enact any statute or codex without cost, council approval, or rank prerequisites.
                </p>
              </div>

              <div className="space-y-4">
                {realmLaws.map(law => (
                  <div key={law.id} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-amber-300 text-sm font-cinzel">
                        {law.name}
                      </div>
                      <span className="text-[11px] text-stone-400 italic">
                        {law.description}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {law.options.map(opt => {
                        const isEnacted = law.currentOptionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleForceEnactLaw(law.id, opt.id)}
                            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                              isEnacted
                                ? 'bg-amber-600/30 border-amber-400 text-amber-100 ring-1 ring-amber-400/50'
                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-850'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs">{opt.name}</span>
                              {isEnacted && <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded">ACTIVE</span>}
                            </div>
                            <p className="text-[10px] text-stone-400 leading-snug">
                              {opt.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 6: WORLD TIME & CHRONICLE INSCRIBER */}
          {/* ======================================================================= */}
          {activeTab === 'world' && (
            <div className="space-y-6">
              
              {/* Year & Reign Adjuster */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="font-bold text-amber-200 text-sm font-cinzel border-b border-stone-800 pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Chronos Temporal Manipulation
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                      Current World Year (AD)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setCurrentYear(y => y - 1); sound.playClick(); }}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs cursor-pointer"
                      >
                        -1 Year
                      </button>
                      <input
                        type="number"
                        value={currentYear}
                        onChange={e => setCurrentYear(Number(e.target.value))}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-amber-300 font-mono text-xs font-bold text-center"
                      />
                      <button
                        onClick={() => { setCurrentYear(y => y + 1); sound.playClick(); }}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs cursor-pointer"
                      >
                        +1 Year
                      </button>
                      <button
                        onClick={() => { setCurrentYear(y => y + 5); sound.playClick(); }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs cursor-pointer"
                      >
                        +5 Years
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                      Years of Sovereign Reign
                    </label>
                    <input
                      type="number"
                      value={reignYears}
                      onChange={e => setReignYears(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Trigger Random Event */}
              {onTriggerEvent && (
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <h4 className="font-bold text-amber-200 text-sm font-cinzel border-b border-stone-800 pb-2 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Trigger Dynamic Court Event
                  </h4>
                  <p className="text-xs text-stone-400">
                    Instantly summon any royal dilemma or narrative event from the grand pool.
                  </p>

                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-stone-900/60 rounded-lg border border-stone-800">
                    {EVENTS_POOL.map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => {
                          onTriggerEvent(ev);
                          sound.playFanfare();
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{ev.imagePromptIcon || '📜'}</span>
                        <span>{ev.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Chronicle Entry Inscriber */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <h4 className="font-bold text-amber-200 text-sm font-cinzel border-b border-stone-800 pb-2 flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-amber-400" />
                  Inscribe Custom Royal Chronicle Record
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                      Chronicle Title
                    </label>
                    <input
                      type="text"
                      value={customChronicleTitle}
                      onChange={e => setCustomChronicleTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                      Category Type
                    </label>
                    <select
                      value={customChronicleType}
                      onChange={e => setCustomChronicleType(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs"
                    >
                      <option value="coronation">👑 Imperial Decree / Coronation</option>
                      <option value="war">⚔️ War & Battle</option>
                      <option value="diplomacy">🕊️ Diplomacy & Alliance</option>
                      <option value="birth">👶 Dynasty Birth</option>
                      <option value="death">💀 Mourned Passing</option>
                      <option value="supernatural">✨ Arcane / Wonder</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 uppercase font-bold mb-1">
                    Historical Narrative Description
                  </label>
                  <textarea
                    rows={2}
                    value={customChronicleDesc}
                    onChange={e => setCustomChronicleDesc(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customChronicleMilestone}
                      onChange={e => setCustomChronicleMilestone(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Mark as Epoch Milestone (Gold Border)</span>
                  </label>

                  <button
                    onClick={handleAddCustomChronicle}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Inscribe to Annals
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 7: PRESET CHEAT PROFILES */}
          {/* ======================================================================= */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-amber-200 font-cinzel mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Thematic Sandbox Archetypes
                </h3>
                <p className="text-xs text-stone-400">
                  Instantly transform your sovereign ruler and realm into iconic grand strategy archetypes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. God Emperor */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-stone-950 border border-amber-500/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center text-2xl font-black">
                      👑
                    </div>
                    <div>
                      <h4 className="font-black text-amber-200 text-sm font-cinzel">
                        Eternal God-Emperor
                      </h4>
                      <p className="text-xs text-stone-400">
                        Total omnipotence • 50k Gold • 100 All Attributes • Immortal Traits
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => applyPresetProfile('god_emperor')}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Apply God-Emperor Archetype
                  </button>
                </div>

                {/* 2. Iron Warlord */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/60 to-stone-950 border border-red-500/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-2xl font-black">
                      ⚔️
                    </div>
                    <div>
                      <h4 className="font-black text-red-200 text-sm font-cinzel">
                        Iron Grand Conqueror
                      </h4>
                      <p className="text-xs text-stone-400">
                        100 Martial • Master Strategist • 15k Gold • Vast Armies
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => applyPresetProfile('warlord')}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Apply Iron Warlord Archetype
                  </button>
                </div>

                {/* 3. Merchant Prince */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-950/60 to-stone-950 border border-yellow-500/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500 text-stone-950 flex items-center justify-center text-2xl font-black">
                      🪙
                    </div>
                    <div>
                      <h4 className="font-black text-yellow-200 text-sm font-cinzel">
                        Grand Merchant Prince
                      </h4>
                      <p className="text-xs text-stone-400">
                        99,999 Gold • Max Diplomacy • Wealthy Magnate
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => applyPresetProfile('merchant_prince')}
                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Apply Merchant Prince Archetype
                  </button>
                </div>

                {/* 4. Arcane Archmage */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-stone-950 border border-purple-500/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-2xl font-black">
                      🧙‍♂️
                    </div>
                    <div>
                      <h4 className="font-black text-purple-200 text-sm font-cinzel">
                        Arcane Sovereign Archmage
                      </h4>
                      <p className="text-xs text-stone-400">
                        100 Mana • 100 Learning • Archmage Traits • High Elf Lineage
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => applyPresetProfile('arcane_archmage')}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Apply Arcane Archmage Archetype
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* FOOTER BAR */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>All modifications apply in real-time immediately to active game memory.</span>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            Done / Close Editor
          </button>
        </div>

      </div>
    </div>
  );
};
