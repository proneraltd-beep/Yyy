import React, { useState } from 'react';
import { Character, Province, Realm, Vassal, FamilyMember, RealmNPC } from '../types';
import { BUILDINGS_CONFIG, BuildingConfig } from '../data/buildingsData';
import { SPECIES_DATA } from '../data/speciesData';
import { TargetEntity } from './war/RealmProvinceDetailScreen';
import { RealmProvincesOverlay } from './RealmProvincesOverlay';
import { GrantProvinceModal } from './GrantProvinceModal';
import { RealmNPCModal } from './RealmNPCModal';
import { RealmContinentMiniMap } from './RealmContinentMiniMap';
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
  Layers,
  Award,
  MessageSquare,
  Search
} from 'lucide-react';
import { sound } from '../utils/audio';

interface RealmMapTabProps {
  character: Character;
  provinces: Province[];
  realms: Realm[];
  vassals: Vassal[];
  familyMembers?: FamilyMember[];
  realmNPCs?: RealmNPC[];
  onUpgradeBuilding: (provinceId: string, buildingKey: keyof Province['buildings'], cost: number) => void;
  onInvestProvince: (provinceId: string, cost: number) => void;
  onHoldProvinceFestival: (provinceId: string, cost: number) => void;
  onAssignGovernor: (provinceId: string, vassalId: string) => void;
  onGrantProvince?: (provinceId: string, recipientType: 'family' | 'vassal' | 'new_noble', recipientId: string, recipientName: string) => void;
  onSelectTargetForWar?: (target: TargetEntity) => void;
  onDeclareWarOnTarget?: (target: TargetEntity, claim: string, yearlyTroops: number, commandDirectly: boolean) => void;
  onClaimEmperorTitle?: (realmId: string, realmName: string) => void;
  onUpdateNPC?: (npc: RealmNPC) => void;
  onUpdateCharacter?: (updates: Partial<Character>) => void;
  onAddChronicle?: (entry: { title: string; description: string; type: 'diplomacy' | 'war' | 'intrigue' | 'dynasty' }) => void;
  onEmployNPCAsVassal?: (npc: RealmNPC) => void;
}

export const RealmMapTab: React.FC<RealmMapTabProps> = ({
  character,
  provinces,
  realms,
  vassals,
  familyMembers = [],
  realmNPCs = [],
  onUpgradeBuilding,
  onInvestProvince,
  onHoldProvinceFestival,
  onAssignGovernor,
  onGrantProvince = (_pId: string, _rType: 'family' | 'vassal' | 'new_noble', _rId: string, _rName: string) => {},
  onSelectTargetForWar = (_target: TargetEntity) => {},
  onDeclareWarOnTarget,
  onClaimEmperorTitle = (_realmId: string, _realmName: string) => {},
  onUpdateNPC = (_npc: RealmNPC) => {},
  onUpdateCharacter = (_updates: Partial<Character>) => {},
  onAddChronicle = (_entry: { title: string; description: string; type: 'diplomacy' | 'war' | 'intrigue' | 'dynasty' }) => {},
  onEmployNPCAsVassal
}) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(
    provinces.find(p => p.isPlayerControlled)?.id || provinces[0]?.id || ''
  );
  const [activeRealmOverlay, setActiveRealmOverlay] = useState<Realm | null>(null);
  const [provinceToGrant, setProvinceToGrant] = useState<Province | null>(null);
  const [inspectedNPC, setInspectedNPC] = useState<RealmNPC | null>(null);
  const [npcFilterRealm, setNpcFilterRealm] = useState<string>('all');

  const selectedProvince = provinces.find(p => p.id === selectedProvinceId);
  const playerProvinces = provinces.filter(p => p.isPlayerControlled);
  const homeRealm = realms.find(r => r.id === character.realmId) || realms[0];

  // Calculate realm control percentages
  const homeRealmProvinces = provinces.filter(p => p.realmId === homeRealm.id);
  const homePlayerProvinces = homeRealmProvinces.filter(p => p.isPlayerControlled);
  const homeControlPercent = homeRealmProvinces.length > 0 
    ? Math.round((homePlayerProvinces.length / homeRealmProvinces.length) * 100) 
    : 0;

  const calculateBuildingCost = (config: BuildingConfig, currentLevel: number) => {
    return Math.round(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
  };

  const filteredNPCs = realmNPCs.filter(npc => {
    if (npcFilterRealm === 'all') return true;
    return npc.realmId === npcFilterRealm;
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20 font-sans">
      
      {/* Sovereignty & Rank Status Banner */}
      <div className="bg-gradient-to-r from-[#2a1d0c] to-[#1a1208] rounded-2xl p-4 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-2xl shadow-inner">
            {character.rank === 'Emperor' ? '👑' : character.rank === 'King' ? '🤴' : '🛡️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-amber-200 font-cinzel">
                {character.rank} {character.name}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                character.rank === 'Emperor' 
                  ? 'bg-amber-400 text-stone-950' 
                  : character.rank === 'King'
                  ? 'bg-amber-600 text-stone-950'
                  : 'bg-stone-800 text-stone-300 border border-stone-700'
              }`}>
                {character.rank === 'Emperor' ? 'Imperial Sovereign' : character.rank === 'King' ? 'Sovereign King' : 'Vassal Count'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Domain: <strong className="text-stone-200">{playerProvinces.length} Fiefs Controlled</strong> • Realm Sovereignty: <strong className="text-amber-400">{homeControlPercent}%</strong>
            </p>
          </div>
        </div>

        {/* Emperor Title Claim Button if >= 50% */}
        {homeControlPercent >= 50 && character.rank !== 'Emperor' ? (
          <button
            onClick={() => {
              sound.playFanfare();
              onClaimEmperorTitle(homeRealm.id, homeRealm.name);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-xs font-cinzel shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <Crown className="w-4 h-4 text-stone-950" />
            <span>👑 Claim Emperor Title (&gt; 50%)</span>
          </button>
        ) : (
          <div className="text-xs text-stone-400 bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 self-start sm:self-auto">
            {playerProvinces.length <= 1 ? (
              <span>Start: <strong>Vassal Count</strong> (1 Province)</span>
            ) : (
              <span>Rank: <strong>King</strong> (Conquer &gt; 50% for Emperor)</span>
            )}
          </div>
        )}
      </div>

      {/* Interactive Cartographic Mini-Map Visualization */}
      <RealmContinentMiniMap
        realms={realms}
        provinces={provinces}
        character={character}
        selectedProvinceId={selectedProvinceId}
        onSelectProvince={(pId) => setSelectedProvinceId(pId)}
        onSelectRealm={(r) => setActiveRealmOverlay(r)}
      />

      {/* Realm Continent Overview Header */}
      <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-amber-900/40 shadow-xl">
        <div className="flex items-center justify-between mb-3 border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel">
              Known Realms of the Continent
            </h2>
          </div>
          <span className="text-xs text-stone-400">
            Click any realm to view all its provinces & counties
          </span>
        </div>

        {/* Visual Realm Territory Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {realms.map((realm) => {
            const isHomeRealm = realm.id === character.realmId;
            const rSpecies = SPECIES_DATA[realm.species];
            const rProvinces = provinces.filter(p => p.realmId === realm.id);
            const rControlled = rProvinces.filter(p => p.isPlayerControlled).length;

            return (
              <div
                key={realm.id}
                onClick={() => {
                  sound.playClick();
                  setActiveRealmOverlay(realm);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.03] active:scale-98 ${
                  isHomeRealm
                    ? 'bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{realm.crestIcon}</span>
                  {isHomeRealm ? (
                    <span className="text-[9px] font-black text-amber-300 bg-amber-900/90 px-1.5 py-0.5 rounded">
                      HOME
                    </span>
                  ) : (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      realm.opinion > 40 ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-800 text-stone-400'
                    }`}>
                      {realm.opinion > 0 ? `+${realm.opinion}` : realm.opinion}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-stone-200 truncate">{realm.name}</div>
                <div className="text-[10px] text-amber-400/90 mt-0.5 font-semibold">
                  {rControlled} / {rProvinces.length} Counties
                </div>
                <div className="text-[10px] text-stone-500 mt-1 flex items-center justify-between">
                  <span>{rSpecies?.badge || 'Realm'}</span>
                  <span className="text-stone-400">Inspect &gt;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Player Controlled Provinces Quick Carousel */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Your Personal Demesne ({playerProvinces.length} Provinces Held)</span>
          </div>
          <span className="text-[11px] text-stone-500">Select to develop</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {playerProvinces.map((prov) => (
            <button
              key={prov.id}
              onClick={() => {
                sound.playClick();
                setSelectedProvinceId(prov.id);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 cursor-pointer ${
                selectedProvinceId === prov.id
                  ? 'bg-[#D49B28] text-stone-950 border-amber-300 font-bold shadow-md'
                  : 'bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800'
              }`}
            >
              <Castle className="w-3.5 h-3.5" />
              <span>{prov.name}</span>
              {prov.unrest > 30 && (
                <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Province Details & Construction Dashboard */}
      {selectedProvince && (
        <div className="space-y-4">
          
          {/* Province Stats Summary */}
          <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-stone-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-amber-100 font-cinzel">
                    {selectedProvince.name}
                  </h3>
                  <span className="text-xs text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                    {selectedProvince.specialty}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Administration: <strong className="text-stone-200">{selectedProvince.governorName || 'Direct Crown Demesne'}</strong>
                </p>
              </div>

              {/* Quick Actions: Grant Province, Invest, Festival */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    sound.playClick();
                    setProvinceToGrant(selectedProvince);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5 text-stone-950" />
                  <span>Grant Province</span>
                </button>
                <button
                  onClick={() => onInvestProvince(selectedProvince.id, 50)}
                  disabled={character.stats.gold < 50}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Invest (50 🪙)</span>
                </button>
                <button
                  onClick={() => onHoldProvinceFestival(selectedProvince.id, 35)}
                  disabled={character.stats.gold < 35}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Festival (35 🪙)</span>
                </button>
              </div>
            </div>

            {/* Vital Province Metric Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {/* Annual Tax Income */}
              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                  <span>Yearly Revenue</span>
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <div className="text-base font-bold text-yellow-300 font-mono">
                  +{selectedProvince.income} 🪙/yr
                </div>
              </div>

              {/* Garrison Levies */}
              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                  <span>Troop Garrison</span>
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="text-base font-bold text-red-300 font-mono">
                  {selectedProvince.troops} Soldiers
                </div>
              </div>

              {/* Prosperity */}
              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                  <span>Prosperity</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-base font-bold text-emerald-300 font-mono">
                  {selectedProvince.prosperity}%
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${selectedProvince.prosperity}%` }}
                  />
                </div>
              </div>

              {/* Unrest */}
              <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                  <span>Civil Unrest</span>
                  <AlertTriangle className={`w-3.5 h-3.5 ${selectedProvince.unrest > 30 ? 'text-red-400' : 'text-stone-400'}`} />
                </div>
                <div className={`text-base font-bold font-mono ${selectedProvince.unrest > 30 ? 'text-red-400' : 'text-stone-300'}`}>
                  {selectedProvince.unrest}%
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${selectedProvince.unrest > 30 ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${selectedProvince.unrest}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Building Construction Grid */}
          <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-amber-200 font-cinzel flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-amber-400" />
                  Provincial Infrastructure & Monuments
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Upgrade facilities to multiply taxable income, garrison forces, and cultural renown.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILDINGS_CONFIG.map((bConfig) => {
                const currentLevel = selectedProvince.buildings[bConfig.key] || 0;
                const isMax = currentLevel >= bConfig.maxLevel;
                const cost = calculateBuildingCost(bConfig, currentLevel);
                const canAfford = character.stats.gold >= cost;
                const customName = bConfig.specialtySpeciesName?.[character.species] || bConfig.name;

                return (
                  <div
                    key={bConfig.key}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                      currentLevel > 0 
                        ? 'bg-stone-950/80 border-stone-800 hover:border-stone-700' 
                        : 'bg-stone-950/40 border-dashed border-stone-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{bConfig.icon}</span>
                          <span className="text-xs sm:text-sm font-bold text-stone-200">
                            {customName}
                          </span>
                        </div>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isMax ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'bg-stone-800 text-stone-300'
                        }`}>
                          Tier {currentLevel}/{bConfig.maxLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-snug">
                        {bConfig.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between">
                      <div className="text-[10px] text-stone-400">
                        {bConfig.effectsPerLevel.incomeBonus && <span className="text-yellow-400 mr-2">+{bConfig.effectsPerLevel.incomeBonus} 🪙</span>}
                        {bConfig.effectsPerLevel.troopsBonus && <span className="text-red-400 mr-2">+{bConfig.effectsPerLevel.troopsBonus} ⚔️</span>}
                        {bConfig.effectsPerLevel.unrestReduction && <span className="text-emerald-400 mr-2">-{bConfig.effectsPerLevel.unrestReduction}% Unrest</span>}
                        {bConfig.effectsPerLevel.pietyOrManaBonus && <span className="text-blue-400 mr-2">+{bConfig.effectsPerLevel.pietyOrManaBonus} Mana</span>}
                      </div>

                      <button
                        onClick={() => {
                          sound.playCoin();
                          onUpgradeBuilding(selectedProvince.id, bConfig.key, cost);
                        }}
                        disabled={isMax || !canAfford}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                          isMax
                            ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            : canAfford
                            ? 'bg-[#D49B28] hover:bg-[#b78722] text-stone-950 shadow-md active:scale-95'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        {isMax ? (
                          'Masterpiece'
                        ) : (
                          <>
                            <span>Upgrade</span>
                            <span className="font-mono">({cost} 🪙)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONTINENTAL COURT NOBLES & INTERACTIVE CHARACTERS DIRECTORY */}
      {realmNPCs.length > 0 && (
        <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-amber-200 font-cinzel flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Interactive Realm Court & Traveling Nobles ({realmNPCs.length})</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Interact with high marshals, grand inquisitors, spymasters, and foreign envoys across all realms.
              </p>
            </div>

            {/* Filter by Realm */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 self-start sm:self-auto">
              <button
                onClick={() => setNpcFilterRealm('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  npcFilterRealm === 'all' ? 'bg-[#D49B28] text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                All Realms ({realmNPCs.length})
              </button>
              {realms.map(r => (
                <button
                  key={r.id}
                  onClick={() => setNpcFilterRealm(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    npcFilterRealm === r.id ? 'bg-[#D49B28] text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <span>{r.crestIcon}</span>
                  <span className="truncate max-w-[80px]">{r.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredNPCs.map((npc) => {
              const npcRealm = realms.find(r => r.id === npc.realmId);
              return (
                <div
                  key={npc.id}
                  onClick={() => { sound.playClick(); setInspectedNPC(npc); }}
                  className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/70 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2 group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      {npc.portrait}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-stone-200 truncate group-hover:text-amber-300 transition-colors font-cinzel">
                          {npc.name}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          npc.opinion >= 50 ? 'bg-emerald-950 text-emerald-300' : npc.opinion >= 0 ? 'bg-stone-800 text-stone-300' : 'bg-red-950 text-red-300'
                        }`}>
                          {npc.opinion > 0 ? `+${npc.opinion}` : npc.opinion}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-400 font-semibold truncate">
                        {npc.title}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate flex items-center gap-1">
                        <span>{npcRealm?.crestIcon}</span>
                        <span>{npcRealm?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-400 italic bg-stone-900/60 p-1.5 rounded-lg border border-stone-800/80 truncate">
                    "{npc.dialogueQuote}"
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-800/60 text-[10px]">
                    <div className="flex items-center gap-1.5 text-stone-400 font-mono">
                      <span>⚔️ {npc.stats.martial}</span>
                      <span>📜 {npc.stats.diplomacy}</span>
                      <span>🎭 {npc.stats.intrigue}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        setInspectedNPC(npc);
                      }}
                      className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>Interact</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Realm Provinces Modal Overlay */}
      {activeRealmOverlay && (
        <RealmProvincesOverlay
          realm={activeRealmOverlay}
          character={character}
          provinces={provinces}
          realms={realms}
          vassals={vassals}
          familyMembers={familyMembers}
          realmNPCs={realmNPCs}
          onClose={() => setActiveRealmOverlay(null)}
          onSelectTargetForWar={(target) => {
            setActiveRealmOverlay(null);
            onSelectTargetForWar(target);
          }}
          onDeclareWarOnTarget={onDeclareWarOnTarget}
          onUpgradeBuilding={onUpgradeBuilding}
          onInvestProvince={onInvestProvince}
          onHoldProvinceFestival={onHoldProvinceFestival}
          onGrantProvince={onGrantProvince}
          onClaimEmperorTitle={onClaimEmperorTitle}
          onUpdateNPC={onUpdateNPC}
          onUpdateCharacter={onUpdateCharacter}
          onAddChronicle={onAddChronicle}
          onEmployNPCAsVassal={onEmployNPCAsVassal}
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

      {/* Grant Province Modal */}
      {provinceToGrant && (
        <GrantProvinceModal
          province={provinceToGrant}
          character={character}
          familyMembers={familyMembers}
          vassals={vassals}
          onClose={() => setProvinceToGrant(null)}
          onGrantProvince={(provId, recType, recId, recName) => {
            setProvinceToGrant(null);
            onGrantProvince(provId, recType, recId, recName);
          }}
        />
      )}

    </div>
  );
};
