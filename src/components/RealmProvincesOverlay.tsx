import React, { useState } from 'react';
import { Character, Province, Realm, Vassal, FamilyMember, LeaderProfile, RealmNPC } from '../types';
import { sound } from '../utils/audio';
import { BUILDINGS_CONFIG, BuildingConfig } from '../data/buildingsData';
import { SPECIES_DATA } from '../data/speciesData';
import { TargetEntity } from './war/RealmProvinceDetailScreen';
import { DeclareWarModal } from './war/DeclareWarModal';
import { GrantProvinceModal } from './GrantProvinceModal';
import { LeaderProfileModal } from './LeaderProfileModal';
import { RealmNPCModal } from './RealmNPCModal';
import { 
  Castle, 
  Coins, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Hammer, 
  MapPin, 
  Crown, 
  Sparkles, 
  Users, 
  ChevronRight, 
  Gift, 
  Swords, 
  Flag,
  ArrowLeft,
  X,
  HelpCircle,
  Award,
  Scroll,
  UserCheck,
  Flame,
  Globe,
  Search,
  MessageSquare,
  UserPlus,
  Eye
} from 'lucide-react';

interface RealmProvincesOverlayProps {
  realm: Realm;
  character: Character;
  provinces: Province[];
  realms: Realm[];
  vassals: Vassal[];
  familyMembers: FamilyMember[];
  realmNPCs?: RealmNPC[];
  totalImperialTroops?: number;
  onClose: () => void;
  onSelectTargetForWar: (target: TargetEntity) => void;
  onDeclareWarOnTarget?: (target: TargetEntity, claim: string, yearlyTroops: number, commandDirectly: boolean) => void;
  onUpgradeBuilding: (provinceId: string, buildingKey: keyof Province['buildings'], cost: number) => void;
  onInvestProvince: (provinceId: string, cost: number) => void;
  onHoldProvinceFestival: (provinceId: string, cost: number) => void;
  onGrantProvince: (provinceId: string, recipientType: 'family' | 'vassal' | 'new_noble', recipientId: string, recipientName: string) => void;
  onClaimEmperorTitle: (realmId: string, realmName: string) => void;
  onUpdateNPC?: (npc: RealmNPC) => void;
  onUpdateCharacter?: (updates: Partial<Character>) => void;
  onAddChronicle?: (entry: { title: string; description: string; type: 'diplomacy' | 'war' | 'intrigue' | 'dynasty' }) => void;
  onEmployNPCAsVassal?: (npc: RealmNPC) => void;
}

export const RealmProvincesOverlay: React.FC<RealmProvincesOverlayProps> = ({
  realm,
  character,
  provinces,
  realms,
  vassals,
  familyMembers,
  realmNPCs = [],
  totalImperialTroops = 51300,
  onClose,
  onSelectTargetForWar,
  onDeclareWarOnTarget,
  onUpgradeBuilding,
  onInvestProvince,
  onHoldProvinceFestival,
  onGrantProvince,
  onClaimEmperorTitle,
  onUpdateNPC = (_npc: RealmNPC) => {},
  onUpdateCharacter = (_updates: Partial<Character>) => {},
  onAddChronicle = (_entry: { title: string; description: string; type: 'diplomacy' | 'war' | 'intrigue' | 'dynasty' }) => {},
  onEmployNPCAsVassal
}) => {
  // Navigation tabs within realm overlay
  const [activeTab, setActiveTab] = useState<'provinces' | 'court_npcs' | 'realm_laws'>('provinces');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'player' | 'foreign'>('all');

  // Declare war target state
  const [declareWarTarget, setDeclareWarTarget] = useState<TargetEntity | null>(null);

  // Mode: list of provinces for this realm, or detail of selected province
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [showGrantModal, setShowGrantModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [showClaimsModal, setShowClaimsModal] = useState<boolean>(false);
  const [showAllianceModal, setShowAllianceModal] = useState<boolean>(false);

  // Active Leader Profile Modal for clickable leader/governor
  const [inspectedLeader, setInspectedLeader] = useState<LeaderProfile | null>(null);
  // Active NPC Modal
  const [inspectedNPC, setInspectedNPC] = useState<RealmNPC | null>(null);

  // All provinces belonging to this realm
  const realmProvinces = provinces.filter(p => p.realmId === realm.id);
  const playerControlledInRealm = realmProvinces.filter(p => p.isPlayerControlled);
  const foreignInRealm = realmProvinces.filter(p => !p.isPlayerControlled);

  // NPCs for this realm
  const realmNobles = realmNPCs.filter(npc => npc.realmId === realm.id);

  // Percentage of realm controlled by player
  const realmControlPercent = realmProvinces.length > 0
    ? Math.round((playerControlledInRealm.length / realmProvinces.length) * 100)
    : 0;

  const canClaimEmperor = realmControlPercent >= 50 && character.rank !== 'Emperor';

  // Format imperial troop number (e.g. 51.3k)
  const formattedImperialArmy = totalImperialTroops >= 1000 
    ? `${(totalImperialTroops / 1000).toFixed(1)}k` 
    : totalImperialTroops.toString();

  // Selected province details
  const selectedProvince = provinces.find(p => p.id === selectedProvinceId);

  const calculateBuildingCost = (config: BuildingConfig, currentLevel: number) => {
    return Math.round(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
  };

  // Filtered provinces
  const filteredProvinces = realmProvinces.filter(prov => {
    const matchesSearch = prov.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prov.governorName && prov.governorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prov.specialty && prov.specialty.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filterType === 'player') return prov.isPlayerControlled;
    if (filterType === 'foreign') return !prov.isPlayerControlled;
    return true;
  });

  // Helper to open leader modal for a province governor
  const handleOpenGovernorProfile = (prov: Province, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();

    if (prov.governorProfile) {
      setInspectedLeader(prov.governorProfile);
      return;
    }

    const fallbackProfile: LeaderProfile = {
      id: prov.governorId || `gov_${prov.id}`,
      name: prov.governorName || `${prov.name} Castellan`,
      title: prov.isPlayerControlled ? 'Crown Governor' : 'Provincial Governor',
      portrait: prov.isPlayerControlled ? '🛡️' : '🧔🏻',
      species: realm.species,
      gender: 'Male',
      age: 42,
      houseName: prov.name.split(' ')[0] || 'Vassal',
      opinion: prov.isPlayerControlled ? 100 : realm.opinion,
      traits: ['Feudal Administrator', 'Provincial Warden'],
      leadershipType: prov.leadershipType || realm.leadershipType || 'Feudal Lordship',
      troops: prov.troops,
      militaryUnit: prov.militaryUnit || realm.militaryUnit || 'Provincial Garrison',
      stats: { martial: 75, diplomacy: 70, intrigue: 65, intellect: 72, prowess: 78, stewardship: 80 },
      provinceId: prov.id,
      provinceName: prov.name,
      realmId: realm.id,
      realmName: realm.name
    };
    setInspectedLeader(fallbackProfile);
  };

  // Helper to open leader modal for realm sovereign
  const handleOpenRealmLeaderProfile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();

    if (realm.leaderProfile) {
      setInspectedLeader(realm.leaderProfile);
      return;
    }

    const fallbackRealmLeader: LeaderProfile = {
      id: `leader_${realm.id}`,
      name: realm.leaderName,
      title: realm.leaderTitle,
      portrait: realm.leaderPortrait,
      species: realm.leaderSpecies || realm.species,
      gender: 'Male',
      age: 48,
      houseName: realm.name.split(' ')[0] || 'Imperial',
      opinion: realm.opinion,
      traits: ['Sovereign Ruler', 'Great Tactician', 'Crowned Monarch'],
      leadershipType: realm.leadershipType || 'Sovereign Monarchy',
      troops: realm.militaryPower * 20,
      militaryUnit: realm.militaryUnit || 'Imperial Royal Guard',
      stats: { martial: 84, diplomacy: 86, intrigue: 78, intellect: 85, prowess: 82, stewardship: 88 },
      claims: [`Sovereignty of ${realm.name}`, 'High Imperial Throne'],
      bio: realm.cultureDescription,
      realmId: realm.id,
      realmName: realm.name
    };
    setInspectedLeader(fallbackRealmLeader);
  };

  const handleOpenWarForProvince = (prov: Province) => {
    sound.playWarHorns();
    const targetEntity: TargetEntity = {
      id: prov.id,
      name: prov.name,
      type: 'province',
      troops: prov.troops || prov.armyStrength || 650,
      maxTroops: (prov.troops || 650) * 2,
      leaderName: prov.governorName || `${realm.leaderTitle} ${realm.leaderName}`,
      leaderAge: 42,
      leaderTitle: prov.governorName ? 'Governor' : realm.leaderTitle,
      leaderPortrait: prov.governorProfile?.portrait || '🛡️',
      relationship: realm.opinion,
      controlTitle: `${prov.name} Provincial Claim`,
      controlPercent: realmControlPercent,
      claims: ['County De Jure Claim', 'Sovereignty Expansion', 'Forced Vassalization']
    };
    setDeclareWarTarget(targetEntity);
  };

  const handleOpenWarForRealm = () => {
    sound.playWarHorns();
    const targetEntity: TargetEntity = {
      id: realm.id,
      name: realm.name,
      type: 'realm',
      species: realm.species,
      troops: realm.armyStrength || (realm.militaryPower * 20),
      maxTroops: realm.armyStrength ? realm.armyStrength * 2 : (realm.militaryPower * 40),
      leaderName: `${realm.leaderTitle} ${realm.leaderName}`,
      leaderAge: 45,
      leaderTitle: realm.leaderTitle,
      leaderPortrait: realm.leaderPortrait,
      relationship: realm.opinion,
      controlTitle: `${realm.name} Imperial Sovereignty`,
      controlPercent: realmControlPercent,
      claims: [
        'Total Realm Conquest & Annexation',
        'Subjugation of Whole Imperium',
        'Holy Imperial Crusade',
        'Forced Vassalization of All Counties'
      ]
    };
    setDeclareWarTarget(targetEntity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto">
      <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl max-w-4xl w-full border border-stone-400/80 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Top Gold Header Card (#D49B28) */}
        <div className="bg-[#D49B28] px-4 sm:px-5 py-3 border-b border-[#B78722] text-[#181512] shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7EB]/30 border border-[#FAF7EB]/40 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                {character.portrait}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm sm:text-base text-stone-950 truncate font-cinzel">
                  {character.rank} {character.name} '{character.traits[0] || 'The Wise'}'
                </div>
                <div className="text-[11px] text-stone-900 font-semibold truncate">
                  {character.dynastyName || 'House Sovereign'} • Age {character.age}
                </div>
              </div>
            </div>

            {/* 4 Stats: 👑 Prestige, ✝️ Piety, 🧈 Gold, ⚔️ Troops */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-black text-stone-950 bg-[#FAF7EB]/30 px-3 py-1.5 rounded-xl border border-[#FAF7EB]/40 shadow-2xs self-start sm:self-auto">
              <div className="flex items-center gap-1" title="Prestige / Renown">
                <span>👑</span>
                <span>{character.stats.renown}</span>
              </div>
              <span className="text-stone-800/40">|</span>
              <div className="flex items-center gap-1" title="Piety / Mana">
                <span>✝️</span>
                <span>{character.stats.pietyOrMana}</span>
              </div>
              <span className="text-stone-800/40">|</span>
              <div className="flex items-center gap-1" title="Treasury Gold">
                <span>🧈</span>
                <span>{character.stats.gold}</span>
              </div>
              <span className="text-stone-800/40">|</span>
              <div className="flex items-center gap-1" title="Imperial Soldiers">
                <span>⚔️</span>
                <span>{formattedImperialArmy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Header Bar: `‹ Realm / Province ? ✕` */}
        <div className="bg-[#D49B28] px-4 py-2 border-t border-b border-[#B78722] flex items-center justify-between text-[#181512] shadow-sm shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              if (selectedProvinceId) {
                setSelectedProvinceId(null);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="text-xl leading-none">‹</span>
            <span className="text-xs">{selectedProvinceId ? 'Provinces' : 'Map'}</span>
          </button>
          
          <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-[#181512]">
            <span>{selectedProvince ? selectedProvince.name : realm.name}</span>
            <button 
              onClick={() => setShowInfoModal(true)}
              className="w-4 h-4 rounded-full bg-[#FAF7EB]/40 hover:bg-[#FAF7EB]/60 text-[10px] flex items-center justify-center font-bold cursor-pointer"
              title="Help & Rules"
            >
              ?
            </button>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="text-stone-800 hover:text-stone-950 text-sm font-black cursor-pointer px-1"
          >
            ✕
          </button>
        </div>

        {/* Main Realm Navigation Tabs */}
        {!selectedProvinceId && (
          <div className="bg-stone-200/90 px-4 py-2 border-b border-stone-300 flex items-center gap-2 overflow-x-auto shrink-0">
            <button
              onClick={() => { sound.playClick(); setActiveTab('provinces'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'provinces'
                  ? 'bg-[#D49B28] text-stone-950 shadow-xs border border-amber-600'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
              }`}
            >
              <Castle className="w-3.5 h-3.5" />
              <span>Counties & Provinces ({realmProvinces.length})</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveTab('court_npcs'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'court_npcs'
                  ? 'bg-[#D49B28] text-stone-950 shadow-xs border border-amber-600'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Realm Court & Interactive NPCs ({realmNobles.length})</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveTab('realm_laws'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'realm_laws'
                  ? 'bg-[#D49B28] text-stone-950 shadow-xs border border-amber-600'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>Laws & Traditions</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* VIEW 1: REALM OVERVIEW & PROVINCES LIST */}
          {!selectedProvinceId ? (
            <div className="space-y-4">
              
              {/* Realm Header Card with Clickable Sovereign */}
              <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl border border-stone-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{realm.crestIcon}</span>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel">{realm.name}</h2>
                      <div className="text-xs text-stone-400">
                        {SPECIES_DATA[realm.species]?.label} Realm • Capital: {realm.capitalName} • {realmProvinces.length} Chartered Provinces
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:text-right">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Leadership Structure</div>
                      <div className="text-xs font-bold text-amber-300 font-mono">
                        🏛️ {realm.leadershipType || 'Sovereign Monarchy'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regional Distinctiveness Bar */}
                <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Army Strength & Unit</span>
                    <span className="font-bold text-red-400 font-mono">
                      ⚔️ {realm.armyStrength ? realm.armyStrength.toLocaleString() : (realm.militaryPower * 20).toLocaleString()} Troops
                    </span>
                    <span className="text-stone-300 text-[11px] block truncate">
                      {realm.militaryUnit || 'Elite Royal Lances'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Development Level</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      📈 Level {realm.developmentLevel || 80}/100
                    </span>
                    <span className="text-stone-300 text-[11px] block truncate">
                      {realm.developmentTier || 'Flourishing Sovereign Domain'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Unique Realm Rules</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(realm.regionalRules || ['Feudal Oaths', 'Crown Tithes', 'Provincial Levies']).slice(0, 2).map((rule, idx) => (
                        <span key={idx} className="bg-stone-800 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-medium truncate max-w-full">
                          📜 {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CLICKABLE REALM LEADER SECTION */}
                <div 
                  onClick={handleOpenRealmLeaderProfile}
                  className="bg-stone-950/90 p-3 rounded-xl border border-amber-500/30 hover:border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all hover:bg-stone-950 group"
                  title="Click to view full Leader Profile and interact diplomatically!"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="text-3xl group-hover:scale-110 transition-transform block">{realm.leaderPortrait}</span>
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 text-[9px] font-black px-1 rounded-full">
                        INFO
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        <span>{realm.leaderTitle} {realm.leaderName}</span>
                        <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                          (Clickable Sovereign)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-stone-400">Opinion:</span>
                        <div className="w-20 h-1.5 bg-stone-800 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full ${realm.opinion >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, Math.max(10, Math.abs(realm.opinion)))}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold ${realm.opinion >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {realm.opinion > 0 ? `+${realm.opinion}` : realm.opinion}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Realm Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={handleOpenRealmLeaderProfile}
                      className="px-2.5 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-bold border border-amber-700 cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <UserCheck className="w-3 h-3 text-amber-400" />
                      <span>Inspect Leader</span>
                    </button>
                    <button
                      onClick={() => setShowMapModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 cursor-pointer"
                    >
                      <span>Show Map</span>
                    </button>
                    <button
                      onClick={handleOpenWarForRealm}
                      className="px-3 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-800 cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Swords className="w-3 h-3 text-red-400" />
                      <span>Declare War</span>
                    </button>
                    <button
                      onClick={() => setShowAllianceModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 cursor-pointer"
                    >
                      Alliance
                    </button>
                    <button
                      onClick={() => setShowClaimsModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-[#D49B28] hover:bg-amber-500 text-stone-950 text-xs font-black cursor-pointer"
                    >
                      Claims &gt;
                    </button>
                  </div>
                </div>

                {/* REALM CONTROL & IMPERIAL SOVEREIGNTY PROGRESS BAR */}
                <div className="mt-3 bg-stone-950/80 p-3 rounded-xl border border-stone-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-extrabold uppercase tracking-wider text-amber-300 font-cinzel">
                      {realm.name} Control & Imperial Sovereignty
                    </span>
                    <span className="font-mono text-stone-300 font-bold">
                      {playerControlledInRealm.length} / {realmProvinces.length} Provinces ({realmControlPercent}%)
                    </span>
                  </div>
                  
                  <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all rounded-full ${
                        realmControlPercent >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-300 animate-pulse' : 'bg-amber-600'
                      }`}
                      style={{ width: `${Math.max(5, realmControlPercent)}%` }}
                    />
                  </div>

                  {/* EMPEROR TITLE CLAIM PROMOTION */}
                  {canClaimEmperor ? (
                    <div className="bg-gradient-to-r from-amber-950 to-yellow-950/80 p-3 rounded-xl border border-amber-500/80 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />
                        <div>
                          <div className="text-xs font-extrabold text-yellow-300 font-cinzel">
                            Imperial Hegemony Achieved (&gt; 50% Conquered)!
                          </div>
                          <div className="text-[11px] text-amber-200">
                            You command majority domain over {realm.name}. Claim the Imperial Crown!
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          sound.playFanfare();
                          onClaimEmperorTitle(realm.id, realm.name);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-xs font-cinzel shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                      >
                        👑 Claim Emperor Title
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>
                        {playerControlledInRealm.length <= 1 ? (
                          <span>Current Status: <strong className="text-stone-200">Vassal Count</strong> (1 Province)</span>
                        ) : (
                          <span>Current Status: <strong className="text-amber-300">King / Sovereign</strong> (Multiple Provinces)</span>
                        )}
                      </span>
                      <span>Conquer &gt; 50% ({Math.ceil(realmProvinces.length * 0.5)} provinces) to claim <strong>Emperor</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* TAB 1: COUNTIES & PROVINCES (AT LEAST 10-12 PROVINCES) */}
              {activeTab === 'provinces' && (
                <div className="space-y-3">
                  
                  {/* Search and Filters Bar */}
                  <div className="bg-white p-3 rounded-xl border border-stone-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search counties & governors..."
                        className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto self-start sm:self-auto overflow-x-auto">
                      <button
                        onClick={() => setFilterType('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          filterType === 'all' ? 'bg-[#D49B28] text-stone-950' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        All ({realmProvinces.length})
                      </button>
                      <button
                        onClick={() => setFilterType('player')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          filterType === 'player' ? 'bg-[#D49B28] text-stone-950' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Yours ({playerControlledInRealm.length})
                      </button>
                      <button
                        onClick={() => setFilterType('foreign')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          filterType === 'foreign' ? 'bg-[#D49B28] text-stone-950' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Foreign ({foreignInRealm.length})
                      </button>
                    </div>
                  </div>

                  {/* Provinces List Container */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#181512] flex items-center gap-1.5">
                        <Castle className="w-4 h-4 text-[#D49B28]" />
                        <span>Realm Provinces & Counties ({filteredProvinces.length})</span>
                      </h3>
                      <span className="text-[11px] text-stone-600 font-medium">
                        Click Governor for Profile • Click Row to Inspect
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-300 shadow-sm divide-y divide-stone-200 overflow-hidden">
                      {filteredProvinces.length > 0 ? (
                        filteredProvinces.map((prov) => {
                          const troopPercent = Math.min(100, (prov.troops / 1000) * 100);
                          return (
                            <div
                              key={prov.id}
                              onClick={() => { sound.playClick(); setSelectedProvinceId(prov.id); }}
                              className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors cursor-pointer ${
                                prov.isPlayerControlled ? 'hover:bg-amber-50/80 bg-amber-50/20' : 'hover:bg-stone-50'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Clickable Governor Portrait */}
                                <button
                                  onClick={(e) => handleOpenGovernorProfile(prov, e)}
                                  className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 shadow-2xs hover:scale-105 active:scale-95 transition-transform ${
                                    prov.isPlayerControlled ? 'bg-amber-100 border-amber-300' : 'bg-stone-100 border-stone-300'
                                  }`}
                                  title="Click to view Governor Profile and interact!"
                                >
                                  {prov.governorProfile?.portrait || (prov.isPlayerControlled ? '🛡️' : '🧔🏻')}
                                </button>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs sm:text-sm text-stone-950 font-cinzel truncate">
                                      {prov.name}
                                    </span>
                                    {prov.isPlayerControlled ? (
                                      <span className="text-[9px] font-black bg-[#D49B28] text-stone-950 px-1.5 py-0.5 rounded shadow-2xs font-sans">
                                        YOURS
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200">
                                        Level {prov.developmentLevel || 75}
                                      </span>
                                    )}
                                    {prov.unrest && prov.unrest >= 30 ? (
                                      <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 flex items-center gap-0.5" title="High Unrest!">
                                        🔥 {prov.unrest}% Unrest
                                      </span>
                                    ) : null}
                                    {prov.prosperity && prov.prosperity <= 35 ? (
                                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200" title="War Devastation & Low Prosperity">
                                        🏚️ Devastated ({prov.prosperity}%)
                                      </span>
                                    ) : null}
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-stone-600 font-medium mt-0.5">
                                    <span 
                                      onClick={(e) => handleOpenGovernorProfile(prov, e)}
                                      className={`hover:underline font-bold cursor-pointer ${prov.isPlayerControlled ? 'text-amber-900' : 'text-blue-900'}`}
                                      title="Click to open governor profile"
                                    >
                                      👤 {prov.governorName || (prov.isPlayerControlled ? 'Crown Governor' : 'Provincial Lord')}
                                    </span>
                                    <span>•</span>
                                    <span className="text-stone-500 truncate">{prov.leadershipType || 'Feudal Fiefdom'}</span>
                                  </div>
                                  
                                  {/* Troops & garrison bar */}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] text-stone-600 font-semibold">
                                      {prov.isPlayerControlled ? 'Troops:' : 'Garrison:'}
                                    </span>
                                    <div className="w-20 sm:w-32 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${prov.isPlayerControlled ? 'bg-amber-600' : 'bg-red-700'}`}
                                        style={{ width: `${troopPercent}%` }}
                                      />
                                    </div>
                                    <span className="text-[11px] font-mono font-bold text-stone-700">
                                      {prov.troops} Soldiers
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                {prov.isPlayerControlled ? (
                                  <span className="font-mono text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                                    +{prov.income} 🪙/yr
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenWarForProvince(prov);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-800 cursor-pointer flex items-center gap-1 shadow-2xs"
                                  >
                                    <Swords className="w-3 h-3 text-red-400" />
                                    <span>War</span>
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleOpenGovernorProfile(prov, e)}
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold rounded-lg border border-stone-300 flex items-center gap-1 shadow-2xs"
                                  title="Inspect Leader"
                                >
                                  Leader
                                </button>
                                <ChevronRight className="w-4 h-4 text-stone-400" />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-xs text-stone-500 font-medium">
                          No counties match your current search filter.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: REALM COURT & INTERACTIVE NPCS */}
              {activeTab === 'court_npcs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#181512] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#D49B28]" />
                      <span>{realm.name} Court & Distinguished Nobles ({realmNobles.length})</span>
                    </h3>
                    <span className="text-[11px] text-stone-600 font-medium">
                      Click any NPC to Sway, Bribe, Recruit, Plot, or Duel
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {realmNobles.map((npc) => (
                      <div
                        key={npc.id}
                        onClick={() => { sound.playClick(); setInspectedNPC(npc); }}
                        className="bg-white p-3.5 rounded-xl border border-stone-300 hover:border-amber-500/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                            {npc.portrait}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-extrabold text-xs sm:text-sm text-stone-950 font-cinzel truncate group-hover:text-amber-700 transition-colors">
                                {npc.name}
                              </h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                npc.opinion >= 50 ? 'bg-emerald-100 text-emerald-800' : npc.opinion >= 0 ? 'bg-stone-100 text-stone-700' : 'bg-red-100 text-red-800'
                              }`}>
                                {npc.opinion > 0 ? `+${npc.opinion}` : npc.opinion}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-amber-800 truncate">
                              {npc.title}
                            </div>
                            <div className="text-[10px] text-stone-500 truncate">
                              House {npc.houseName} • {npc.role}
                            </div>
                          </div>
                        </div>

                        {/* Dialogue preview */}
                        <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-[11px] text-stone-700 italic truncate">
                          "{npc.dialogueQuote}"
                        </div>

                        {/* Quick Stats & Action buttons */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
                          <div className="flex items-center gap-2 text-[10px] font-mono text-stone-600">
                            <span>⚔️ {npc.stats.martial}</span>
                            <span>📜 {npc.stats.diplomacy}</span>
                            <span>🎭 {npc.stats.intrigue}</span>
                          </div>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => { sound.playClick(); setInspectedNPC(npc); }}
                              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3 text-amber-400" />
                              <span>Interact</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: REALM LAWS & TRADITIONS */}
              {activeTab === 'realm_laws' && (
                <div className="bg-white p-4 rounded-xl border border-stone-300 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-stone-950 font-cinzel flex items-center gap-1.5">
                      <Scroll className="w-4 h-4 text-amber-600" />
                      <span>{realm.name} Governance Laws & Traditions</span>
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      {realm.cultureDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(realm.regionalRules || ['Feudal Oaths', 'Crown Tithes', 'Provincial Levies']).map((rule, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1">
                        <div className="font-bold text-xs text-amber-950">📜 {rule}</div>
                        <div className="text-[11px] text-stone-600">
                          Active regional codex governing provincial taxation, succession rights, and levy obligations.
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-stone-900 text-stone-100 p-3 rounded-xl text-xs space-y-1.5">
                    <div className="font-bold text-amber-300 font-cinzel">Trade Goods & Resources</div>
                    <div className="flex flex-wrap gap-1.5">
                      {realm.tradeGoods.map((good, idx) => (
                        <span key={idx} className="bg-stone-800 text-stone-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          📦 {good}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* VIEW 2: SELECTED PROVINCE MANAGEMENT & DETAILS */
            selectedProvince && (
              <div className="space-y-4">
                
                {/* Header Card for Selected Province with Governor info */}
                <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl border border-stone-800 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-3">
                      {/* Clickable Governor portrait */}
                      <button
                        onClick={(e) => handleOpenGovernorProfile(selectedProvince, e)}
                        className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-2xl shrink-0 shadow-md hover:scale-105 transition-transform cursor-pointer"
                        title="Click to view Governor details"
                      >
                        {selectedProvince.governorProfile?.portrait || '🛡️'}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-amber-200 font-cinzel">{selectedProvince.name}</h2>
                          {selectedProvince.isPlayerControlled ? (
                            <span className="text-[9px] font-black bg-[#D49B28] text-stone-950 px-1.5 py-0.5 rounded">
                              YOUR PROVINCE
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded">
                              FOREIGN DOMAIN
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={(e) => handleOpenGovernorProfile(selectedProvince, e)}
                            className="font-bold text-amber-300 hover:underline cursor-pointer"
                          >
                            Governor: {selectedProvince.governorName || 'Ducal Holder'}
                          </button>
                          <span>•</span>
                          <span>{selectedProvince.specialty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons based on ownership */}
                    {selectedProvince.isPlayerControlled ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => { sound.playClick(); setShowGrantModal(true); }}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>Grant Province</span>
                        </button>
                        <button
                          onClick={() => onInvestProvince(selectedProvince.id, 50)}
                          disabled={character.stats.gold < 50}
                          className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Invest (50 🪙)</span>
                        </button>
                        <button
                          onClick={() => onHoldProvinceFestival(selectedProvince.id, 35)}
                          disabled={character.stats.gold < 35}
                          className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 text-xs font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>Festival (35 🪙)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={(e) => handleOpenGovernorProfile(selectedProvince, e)}
                          className="px-3 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 border border-amber-700 text-amber-200 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Governor Profile</span>
                        </button>
                        <button
                          onClick={() => handleOpenWarForProvince(selectedProvince)}
                          className="px-3.5 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Swords className="w-3.5 h-3.5 text-red-400" />
                          <span>Declare War</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Province Rules & Attributes Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Development Tier</span>
                      <span className="font-bold text-amber-300 font-mono">
                        Level {selectedProvince.developmentLevel || 75}/100
                      </span>
                    </div>
                    <div className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Annual Tax Revenue</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        +{selectedProvince.income} 🪙 / year
                      </span>
                    </div>
                    <div className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Local Troops / Garrison</span>
                      <span className="font-bold text-blue-400 font-mono">
                        ⚔️ {selectedProvince.troops} Men
                      </span>
                    </div>
                    <div className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Regional Unrest</span>
                      <span className={`font-bold font-mono ${selectedProvince.unrest > 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {selectedProvince.unrest}% Unrest
                      </span>
                    </div>
                  </div>
                </div>

                {/* Construction & Upgrades (if player owned) */}
                {selectedProvince.isPlayerControlled ? (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                      <Hammer className="w-4 h-4 text-amber-600" />
                      <span>Provincial Infrastructure & Building Upgrades</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(BUILDINGS_CONFIG).map(([bKey, config]) => {
                        const key = bKey as keyof Province['buildings'];
                        const currentLevel = selectedProvince.buildings[key] || 0;
                        const isMax = currentLevel >= config.maxLevel;
                        const cost = calculateBuildingCost(config, currentLevel);
                        const canAfford = character.stats.gold >= cost;

                        return (
                          <div key={bKey} className="p-3 bg-white rounded-xl border border-stone-300 shadow-xs flex flex-col justify-between gap-2">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{config.icon}</span>
                                  <div>
                                    <h4 className="font-bold text-xs text-stone-950">{config.name}</h4>
                                    <span className="text-[10px] text-stone-500 font-mono">
                                      Tier {currentLevel} / {config.maxLevel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[11px] text-stone-600 leading-snug">
                                {config.description}
                              </p>
                            </div>

                            <button
                              onClick={() => onUpgradeBuilding(selectedProvince.id, key, cost)}
                              disabled={isMax || !canAfford}
                              className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                isMax
                                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                                  : canAfford
                                  ? 'bg-[#D49B28] hover:bg-amber-500 text-stone-950 shadow-xs cursor-pointer'
                                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                              }`}
                            >
                              {isMax ? 'Fully Upgraded' : `Upgrade to Tier ${currentLevel + 1} (${cost} 🪙)`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-stone-300 text-center space-y-2">
                    <div className="text-2xl">🏰</div>
                    <h4 className="font-bold text-xs text-stone-900 font-cinzel">Foreign Controlled Territory</h4>
                    <p className="text-xs text-stone-600 max-w-md mx-auto">
                      This county is currently held by {selectedProvince.governorName || realm.name}. You must launch a military campaign or arrange a diplomatic treaty to annex this territory.
                    </p>
                    <button
                      onClick={() => handleOpenWarForProvince(selectedProvince)}
                      className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 text-xs font-bold rounded-xl border border-red-800 shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Swords className="w-4 h-4 text-red-400" />
                      <span>Declare War on {selectedProvince.name}</span>
                    </button>
                  </div>
                )}

              </div>
            )
          )}

        </div>

        {/* Footer */}
        <div className="bg-stone-200 px-4 py-3 border-t border-stone-300 flex items-center justify-between text-xs text-stone-700 shrink-0">
          <div>
            Realm Control: <strong>{playerControlledInRealm.length} / {realmProvinces.length} Counties Held ({realmControlPercent}%)</strong>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* Grant Province Modal */}
      {showGrantModal && selectedProvince && (
        <GrantProvinceModal
          province={selectedProvince}
          familyMembers={familyMembers}
          vassals={vassals}
          onClose={() => setShowGrantModal(false)}
          onGrant={(recipientType, recipientId, recipientName) => {
            onGrantProvince(selectedProvince.id, recipientType, recipientId, recipientName);
            setShowGrantModal(false);
          }}
        />
      )}

      {/* Active Governor / Sovereign Leader Modal */}
      {inspectedLeader && (
        <LeaderProfileModal
          leader={inspectedLeader}
          isOpen={!!inspectedLeader}
          onClose={() => setInspectedLeader(null)}
          playerCharacter={character}
          familyMembers={familyMembers}
          onDeclareWarTarget={onSelectTargetForWar}
        />
      )}

      {/* Interactive Realm NPC Modal */}
      {inspectedNPC && (
        <RealmNPCModal
          npc={inspectedNPC}
          playerCharacter={character}
          onClose={() => setInspectedNPC(null)}
          onUpdateNPC={(updated) => {
            setInspectedNPC(updated);
            onUpdateNPC(updated);
          }}
          onUpdatePlayer={onUpdateCharacter}
          onAddChronicle={onAddChronicle}
          onEmployNPCAsVassal={onEmployNPCAsVassal}
        />
      )}

      {/* Info Help Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl max-w-md w-full border border-stone-400 shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-300 pb-2">
              <h4 className="font-extrabold text-stone-950 font-cinzel">Realm & Province Guide</h4>
              <button onClick={() => setShowInfoModal(false)} className="text-stone-700 hover:text-stone-950 font-bold cursor-pointer">✕</button>
            </div>
            <div className="text-xs text-stone-700 space-y-2 leading-relaxed">
              <p>• <strong>Interactive NPCs:</strong> Meet court officers, marshals, spymasters, and high priests in every realm to Sway, Bribe, Recruit, Plot, or Duel!</p>
              <p>• <strong>12 Counties per Realm:</strong> Every realm contains 12 chartered provinces with distinct governors, garrisons, and rules.</p>
              <p>• <strong>Vassal Starting Condition:</strong> You begin the game controlling 1 province as a Vassal Count.</p>
              <p>• <strong>Emperor Title:</strong> Conquering over <strong>50%</strong> of a realm unlocks the title of <strong>Emperor</strong>!</p>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2 bg-[#D49B28] text-stone-950 font-bold rounded-xl text-xs cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Claims Modal */}
      {showClaimsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl max-w-md w-full border border-stone-400 shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-300 pb-2">
              <h4 className="font-extrabold text-stone-950 font-cinzel">Active Imperial Claims</h4>
              <button onClick={() => setShowClaimsModal(false)} className="text-stone-700 hover:text-stone-950 font-bold cursor-pointer">✕</button>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <div className="font-bold text-stone-950">De Jure Imperial Reclamation</div>
                <div className="text-stone-600 text-[11px]">Valid claim to subjugate the entire domain of {realm.name}.</div>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <div className="font-bold text-stone-950">Forced Vassalization Statute</div>
                <div className="text-stone-600 text-[11px]">Enforce feudal fealty and demand annual tribute.</div>
              </div>
            </div>
            <button
              onClick={() => setShowClaimsModal(false)}
              className="w-full py-2 bg-[#D49B28] text-stone-950 font-bold rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Alliance Modal */}
      {showAllianceModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl max-w-md w-full border border-stone-400 shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-300 pb-2">
              <h4 className="font-extrabold text-stone-950 font-cinzel">Diplomatic Alliance Pact</h4>
              <button onClick={() => setShowAllianceModal(false)} className="text-stone-700 hover:text-stone-950 font-bold cursor-pointer">✕</button>
            </div>
            <div className="text-xs text-stone-700">
              Propose a formal non-aggression and defensive mutual pact with {realm.leaderTitle} {realm.leaderName} of {realm.name}.
            </div>
            <div className="text-xs font-semibold text-stone-800 bg-stone-100 p-2.5 rounded-xl">
              Current Opinion: <span className="font-bold">{realm.opinion >= 0 ? `+${realm.opinion}` : realm.opinion}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowAllianceModal(false)} className="px-3 py-1.5 text-xs text-stone-600 font-bold cursor-pointer">Cancel</button>
              <button
                onClick={() => {
                  sound.playFanfare();
                  setShowAllianceModal(false);
                }}
                className="px-4 py-1.5 bg-[#D49B28] text-stone-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Sign Pact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl max-w-md w-full border border-stone-400 shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-300 pb-2">
              <h4 className="font-extrabold text-stone-950 font-cinzel">{realm.name} Cartography</h4>
              <button onClick={() => setShowMapModal(false)} className="text-stone-700 hover:text-stone-950 font-bold cursor-pointer">✕</button>
            </div>
            <div className="p-4 bg-stone-900 rounded-xl text-center space-y-2">
              <div className="text-4xl">🗺️</div>
              <div className="text-xs text-amber-200 font-cinzel font-bold">{realm.name} Realm Boundaries</div>
              <div className="text-[11px] text-stone-400">
                Encompasses {realmProvinces.length} chartered counties spanning all major trade routes and fortresses.
              </div>
            </div>
            <button
              onClick={() => setShowMapModal(false)}
              className="w-full py-2 bg-[#D49B28] text-stone-950 font-bold rounded-xl text-xs cursor-pointer"
            >
              Return
            </button>
          </div>
        </div>
      )}

      {/* Declare War Modal */}
      {declareWarTarget && (
        <DeclareWarModal
          targetName={declareWarTarget.name}
          targetType={declareWarTarget.type}
          targetProvincesCount={declareWarTarget.type === 'realm' ? realmProvinces.length : 1}
          totalImperialTroops={totalImperialTroops}
          onConfirmDeclaration={(claim, yearlyTroops, commandDirectly) => {
            if (onDeclareWarOnTarget) {
              onDeclareWarOnTarget(declareWarTarget, claim, yearlyTroops, commandDirectly);
            } else {
              onSelectTargetForWar(declareWarTarget);
            }
            setDeclareWarTarget(null);
            onClose();
          }}
          onClose={() => setDeclareWarTarget(null)}
        />
      )}

    </div>
  );
};
