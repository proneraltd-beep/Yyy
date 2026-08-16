import React, { useState } from 'react';
import { Character, Realm, Vassal, WarState, TradeCaravan, TreatyType, Species, Province, FamilyMember, ConditionalPeaceTerms } from '../../src/types';
import { SPECIES_DATA } from '../data/speciesData';
import { sound } from '../utils/audio';
import { WarsListScreen } from './war/WarsListScreen';
import { WarDetailScreen } from './war/WarDetailScreen';
import { RealmProvinceDetailScreen, TargetEntity } from './war/RealmProvinceDetailScreen';
import { DeclareWarModal } from './war/DeclareWarModal';
import { 
  Swords, 
  Handshake, 
  Coins, 
  Gift, 
  Users, 
  MapPin, 
  Flame, 
  CheckCircle, 
  Sparkles, 
  ChevronRight, 
  Shield 
} from 'lucide-react';

interface WarDiplomacyTabProps {
  character: Character;
  realms: Realm[];
  vassals: Vassal[];
  provinces?: Province[];
  familyMembers?: FamilyMember[];
  activeWars: WarState[];
  tradeCaravans: TradeCaravan[];
  totalArmyPower?: number;
  currentYear?: number;
  onSendGift: (targetRealmId: string, goldAmount: number) => void;
  onSignTreaty: (targetRealmId: string, treaty: TreatyType) => void;
  onDeclareWarOnTarget: (target: TargetEntity, claim: string, yearlyTroops: number, commandDirectly: boolean) => void;
  onUpdateWar: (updatedWar: WarState) => void;
  onEndWar: (warId: string, outcome: 'enforce_demands' | 'white_peace' | 'surrender') => void;
  onProposeConditionalPeace?: (terms: ConditionalPeaceTerms) => void;
  onDispatchCaravan: (targetRealmId: string, exportGood: string, importGood: string, investment: number) => void;
  onBribeVassal: (vassalId: string, goldAmount: number) => void;
  onAppeaseFaction: (vassalId: string) => void;
  onUpdatePlayerGold?: (newGold: number) => void;
  onUpdatePlayerPrestige?: (newPrestige: number) => void;
  onBackToChronicle?: () => void;
}

type MainWarTabMode = 'wars' | 'realms_provinces' | 'treaties' | 'vassals' | 'trade';

export const WarDiplomacyTab: React.FC<WarDiplomacyTabProps> = ({
  character,
  realms,
  vassals,
  provinces = [],
  familyMembers = [],
  activeWars,
  tradeCaravans,
  totalArmyPower = 450,
  currentYear = 1066,
  onSendGift,
  onSignTreaty,
  onDeclareWarOnTarget,
  onUpdateWar,
  onEndWar,
  onProposeConditionalPeace,
  onDispatchCaravan,
  onBribeVassal,
  onAppeaseFaction,
  onUpdatePlayerGold,
  onUpdatePlayerPrestige,
  onBackToChronicle
}) => {
  const [activeMode, setActiveMode] = useState<MainWarTabMode>('wars');
  const [selectedWarId, setSelectedWarId] = useState<string | null>(activeWars[0]?.id || null);
  const [selectedTargetEntity, setSelectedTargetEntity] = useState<TargetEntity | null>(null);
  const [showDirectDeclareModal, setShowDirectDeclareModal] = useState<boolean>(false);
  const [targetForModal, setTargetForModal] = useState<TargetEntity | null>(null);

  // Active war selected
  const activeSelectedWar = activeWars.find(w => w.id === selectedWarId);

  // Convert foreign realms and foreign provinces to selectable target entities
  const foreignRealms = realms.filter(r => r.id !== character.realmId);
  const foreignProvinces = provinces.filter(p => !p.isPlayerControlled);

  // Dynamic targets based on game world
  const allTargetEntities: TargetEntity[] = [
    ...foreignProvinces.slice(0, 8).map(p => ({
      id: p.id,
      name: p.name,
      type: 'province' as const,
      species: realms.find(r => r.id === p.realmId)?.species || 'Human',
      troops: p.troops || p.armyStrength || 650,
      maxTroops: Math.max(1200, (p.troops || 650) * 2),
      leaderName: p.governorName || 'Provincial Castellan',
      leaderAge: p.governorProfile?.age || 40,
      leaderTitle: p.governorProfile?.title || 'Governor',
      leaderPortrait: p.governorProfile?.portrait || '🛡️',
      relationship: p.governorProfile?.opinion ?? -10,
      relationshipIcon: '⚔️',
      controlTitle: `${p.name} Crown Control`,
      controlPercent: 100 - (p.unrest || 15),
      claims: ['Forced Vassalization', 'Highland Marches Claim', 'Valorian Imperial Reclamation', 'Border Tithe & Conquest']
    })),
    ...foreignRealms.map(r => ({
      id: r.id,
      name: r.name,
      type: 'realm' as const,
      species: r.species,
      troops: r.militaryPower * 10,
      maxTroops: r.militaryPower * 25,
      leaderName: `${r.leaderTitle} ${r.leaderName}`,
      leaderAge: 45,
      leaderTitle: r.leaderTitle,
      leaderPortrait: r.leaderPortrait,
      relationship: r.opinion,
      controlTitle: `${r.name} Imperial Sovereignty`,
      controlPercent: 20,
      claims: ['Forced Vassalization', 'Species Reconquest', 'High Imperial Reclamation', 'Border Tithe & Conquest']
    })),
    ...vassals.map(v => ({
      id: v.id,
      name: v.countyName || `Domain of ${v.name}`,
      type: 'vassal' as const,
      species: v.species,
      troops: Math.max(200, (v.troops || v.levyContribution * 5)),
      maxTroops: v.maxTroops || 3000,
      leaderName: v.name,
      leaderAge: v.age || 38,
      leaderTitle: v.title,
      leaderPortrait: v.portrait,
      relationship: v.opinion,
      controlTitle: `${v.countyName || v.name} Vassal Fealty`,
      controlPercent: v.loyalty,
      claims: ['Forced Vassalization', 'Title Revocation Right']
    }))
  ];

  // Handler for declaring war from any entity
  const handleDeclareWarFromEntity = (target: TargetEntity, claim: string, yearlyTroops: number, commandDirectly: boolean) => {
    onDeclareWarOnTarget(target, claim, yearlyTroops, commandDirectly);
    setSelectedTargetEntity(null);
    setActiveMode('wars');
  };

  // If a specific war detail view is active
  if (activeMode === 'wars' && selectedWarId && activeSelectedWar) {
    return (
      <WarDetailScreen
        character={character}
        war={activeSelectedWar}
        totalImperialTroops={totalArmyPower}
        currentYear={currentYear}
        provinces={provinces}
        realms={realms}
        familyMembers={familyMembers}
        onBack={() => setSelectedWarId(null)}
        onUpdateWar={onUpdateWar}
        onEndWar={(warId, outcome) => {
          onEndWar(warId, outcome);
          setSelectedWarId(null);
        }}
        onProposeConditionalPeace={(terms) => {
          if (onProposeConditionalPeace) {
            onProposeConditionalPeace(terms);
          }
          setSelectedWarId(null);
        }}
        onUpdatePlayerGold={onUpdatePlayerGold}
        onUpdatePlayerPrestige={onUpdatePlayerPrestige}
      />
    );
  }

  // If a specific Realm or Province detail view is active (Screenshots 1 & 2)
  if (selectedTargetEntity) {
    return (
      <RealmProvinceDetailScreen
        character={character}
        target={selectedTargetEntity}
        totalImperialTroops={totalArmyPower}
        onBack={() => setSelectedTargetEntity(null)}
        onDeclareWarSuccess={handleDeclareWarFromEntity}
        onInspectLeader={(name) => {
          sound.playClick();
        }}
        onOpenMap={() => {
          sound.playClick();
        }}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20 font-sans">
      
      {/* Sub-navigation tabs */}
      <div className="bg-[#FAF7EB] rounded-2xl p-1.5 border border-stone-300 flex items-center gap-1 shadow-md">
        {[
          { id: 'wars' as const, label: `Wars (${activeWars.length})`, icon: Swords, highlight: activeWars.length > 0 },
          { id: 'realms_provinces' as const, label: 'Declare War / Realms', icon: MapPin },
          { id: 'treaties' as const, label: 'Treaties', icon: Handshake },
          { id: 'vassals' as const, label: 'Vassals', icon: Users },
          { id: 'trade' as const, label: 'Caravans', icon: Coins }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveMode(tab.id);
                setSelectedWarId(null);
                setSelectedTargetEntity(null);
              }}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#D49B28] text-stone-950 shadow-md'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. DEDICATED WARS LIST (Matching Screenshot 6) */}
      {activeMode === 'wars' && (
        <WarsListScreen
          character={character}
          activeWars={activeWars}
          totalImperialTroops={totalArmyPower}
          onSelectWar={(warId) => setSelectedWarId(warId)}
          onOpenDeclareWarMenu={() => setActiveMode('realms_provinces')}
          onBackToChronicle={onBackToChronicle}
        />
      )}

      {/* 2. REALMS & PROVINCES SELECTOR (Opens Screenshots 1 & 2 Realm/Province detail) */}
      {activeMode === 'realms_provinces' && (
        <div className="bg-[#FAF7EB] rounded-2xl p-4 sm:p-5 border border-stone-300 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-300 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-950 font-cinzel flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-700" />
                Select Realm or Province to Inspect / Declare War
              </h3>
              <p className="text-xs text-stone-700 mt-0.5">
                Choose any independent foreign realm, regional duchy, or recalcitrant county to inspect troops, fabricate claims, or mobilize imperial armies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allTargetEntities.map((entity) => (
              <div
                key={entity.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedTargetEntity(entity);
                }}
                className="p-3.5 rounded-xl bg-white hover:bg-[#F3EED8] border border-stone-300 hover:border-[#D49B28] transition-all flex items-center justify-between gap-3 cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-2xl shrink-0">
                    {entity.leaderPortrait}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm text-stone-950 truncate group-hover:text-amber-900">
                      {entity.name}
                    </div>
                    <div className="text-[11px] text-stone-600 font-semibold truncate">
                      {entity.leaderName} ({entity.leaderAge}) • {entity.troops.toLocaleString()} Troops
                    </div>
                  </div>
                </div>

                <div className="text-stone-400 font-bold text-xl group-hover:text-stone-800">
                  ›
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CROSS-REALM TREATIES & EMBASSY */}
      {activeMode === 'treaties' && (
        <div className="bg-[#FAF7EB] rounded-2xl p-4 sm:p-5 border border-stone-300 shadow-xl space-y-4">
          <div className="border-b border-stone-300 pb-3">
            <h3 className="text-base font-black text-stone-950 font-cinzel flex items-center gap-2">
              <Handshake className="w-5 h-5 text-amber-700" />
              Cross-Realm Diplomatic Chancellery
            </h3>
            <p className="text-xs text-stone-700 mt-0.5">
              Sign non-aggression treaties, commercial trade accords, or send royal gifts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {foreignRealms.map((realm) => (
              <div key={realm.id} className="p-4 rounded-xl bg-white border border-stone-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{realm.crestIcon}</span>
                    <div>
                      <div className="font-bold text-sm text-stone-900">{realm.name}</div>
                      <div className="text-xs text-stone-600">{realm.leaderTitle} {realm.leaderName}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-900">
                    {realm.opinion >= 0 ? `+${realm.opinion}` : realm.opinion} Opinion
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {realm.treaties.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      ✓ {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-1.5 pt-2 border-t border-stone-200">
                  <button
                    onClick={() => {
                      sound.playCoin();
                      onSendGift(realm.id, 40);
                    }}
                    disabled={character.stats.gold < 40}
                    className="flex-1 py-1.5 px-2 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Gift className="w-3 h-3 text-amber-700" />
                    <span>Gift (40 🪙)</span>
                  </button>

                  {!realm.treaties.includes('Non-Aggression Pact') && (
                    <button
                      onClick={() => {
                        sound.playFanfare();
                        onSignTreaty(realm.id, 'Non-Aggression Pact');
                      }}
                      className="flex-1 py-1.5 px-2 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Handshake className="w-3 h-3 text-blue-700" />
                      <span>Pact</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sound.playClick();
                      const ent = allTargetEntities.find(e => e.id === realm.id);
                      if (ent) setSelectedTargetEntity(ent);
                    }}
                    className="py-1.5 px-3 bg-[#D49B28] hover:bg-[#B78722] text-stone-950 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. VASSALS TAB */}
      {activeMode === 'vassals' && (
        <div className="bg-[#FAF7EB] rounded-2xl p-4 sm:p-5 border border-stone-300 shadow-xl space-y-4">
          <div className="border-b border-stone-300 pb-3">
            <h3 className="text-base font-black text-stone-950 font-cinzel flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-700" />
              Imperial Vassal Lords & Factions
            </h3>
            <p className="text-xs text-stone-700 mt-0.5">
              Inspect feudal barons, appease autonomy factions, or enforce high crown authority.
            </p>
          </div>

          <div className="space-y-3">
            {vassals.map((vassal) => (
              <div key={vassal.id} className="p-3.5 rounded-xl bg-white border border-stone-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-2xl shrink-0">
                    {vassal.portrait}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-stone-900">
                      {vassal.title} {vassal.name}
                    </div>
                    <div className="text-xs text-stone-600">
                      Faction: <span className="font-bold text-amber-900">{vassal.faction}</span> • Loyalty: {vassal.loyalty}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playCoin();
                      onBribeVassal(vassal.id, 30);
                    }}
                    disabled={character.stats.gold < 30}
                    className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    Bribe (30 🪙)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      const ent = allTargetEntities.find(e => e.id === vassal.id);
                      if (ent) setSelectedTargetEntity(ent);
                    }}
                    className="px-2.5 py-1.5 bg-[#D49B28] hover:bg-[#B78722] text-stone-950 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TRADE CARAVANS */}
      {activeMode === 'trade' && (
        <div className="bg-[#FAF7EB] rounded-2xl p-4 sm:p-5 border border-stone-300 shadow-xl space-y-4">
          <div className="border-b border-stone-300 pb-3">
            <h3 className="text-base font-black text-stone-950 font-cinzel flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-700" />
              Royal Silk & Spice Trade Caravans
            </h3>
            <p className="text-xs text-stone-700 mt-0.5">
              Finance commercial expeditions across the multi-species realms to generate annual revenue.
            </p>
          </div>

          <div className="space-y-3">
            {tradeCaravans.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl bg-white border border-stone-300 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm text-stone-900">
                    Caravan to {c.targetRealmName}
                  </div>
                  <div className="text-xs text-stone-600">
                    {c.exportGood} ➔ {c.importGood} • Profit: +{c.annualProfit} 🪙/yr
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-900 rounded-lg">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Declare War Modal */}
      {showDirectDeclareModal && targetForModal && (
        <DeclareWarModal
          targetName={targetForModal.name}
          targetType={targetForModal.type}
          totalImperialTroops={totalArmyPower >= 1000 ? totalArmyPower / 1000 : 51.3}
          onConfirmDeclaration={(claim, yearlyTroops, commandDirectly) => {
            handleDeclareWarFromEntity(targetForModal, claim, yearlyTroops, commandDirectly);
            setShowDirectDeclareModal(false);
            setTargetForModal(null);
          }}
          onClose={() => {
            setShowDirectDeclareModal(false);
            setTargetForModal(null);
          }}
        />
      )}

    </div>
  );
};
