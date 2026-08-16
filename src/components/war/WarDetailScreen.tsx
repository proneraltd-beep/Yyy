import React, { useState } from 'react';
import { Character, FamilyMember, Province, Realm, WarCommander, WarState, ConditionalPeaceTerms } from '../../types';
import { sound } from '../../utils/audio';
import { WAR_TACTICS, WarTactic } from '../../data/warTacticsData';
import { ConditionalPeaceModal } from './ConditionalPeaceModal';

interface WarDetailScreenProps {
  character: Character;
  war: WarState;
  totalImperialTroops?: number;
  currentYear?: number;
  provinces?: Province[];
  realms?: Realm[];
  familyMembers?: FamilyMember[];
  onBack: () => void;
  onUpdateWar: (updated: WarState) => void;
  onEndWar: (warId: string, outcome: 'enforce_demands' | 'white_peace' | 'surrender') => void;
  onProposeConditionalPeace?: (terms: ConditionalPeaceTerms) => void;
  onUpdatePlayerGold?: (newGold: number) => void;
  onUpdatePlayerPrestige?: (newPrestige: number) => void;
}

export const WarDetailScreen: React.FC<WarDetailScreenProps> = ({
  character,
  war,
  totalImperialTroops = 450,
  currentYear = 1066,
  provinces = [],
  realms = [],
  familyMembers = [],
  onBack,
  onUpdateWar,
  onEndWar,
  onProposeConditionalPeace,
  onUpdatePlayerGold,
  onUpdatePlayerPrestige
}) => {
  // Modals for actions
  const [showYearlyArmyModal, setShowYearlyArmyModal] = useState<boolean>(false);
  const [showChooseTacticsModal, setShowChooseTacticsModal] = useState<boolean>(false);
  const [showEnemyTacticsModal, setShowEnemyTacticsModal] = useState<boolean>(false);
  const [showPlunderModal, setShowPlunderModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showWarOverviewModal, setShowWarOverviewModal] = useState<boolean>(false);
  const [showEnemyDetailModal, setShowEnemyDetailModal] = useState<boolean>(false);
  const [showYourRealmModal, setShowYourRealmModal] = useState<boolean>(false);
  const [showConditionalPeaceModal, setShowConditionalPeaceModal] = useState<boolean>(false);
  const [showFullBattleLogModal, setShowFullBattleLogModal] = useState<boolean>(false);
  const [replacingCommanderId, setReplacingCommanderId] = useState<string | null>(null);

  // Local state for adjusting yearly army slider
  const [tempYearlyTroops, setTempYearlyTroops] = useState<number>(
    war.yearlyTroops || (totalImperialTroops >= 1000 ? Math.round(totalImperialTroops * 0.6) / 1000 : Math.round(totalImperialTroops * 0.6))
  );
  const [plunderToast, setPlunderToast] = useState<string | null>(null);
  const [tacticFeedbackToast, setTacticFeedbackToast] = useState<string | null>(null);

  // Format army troops number (e.g. 51.3k or 450)
  const formattedImperialArmy = totalImperialTroops >= 1000 
    ? `${(totalImperialTroops / 1000).toFixed(1)}k` 
    : `${totalImperialTroops}`;

  // Strict yearly tactics change rule
  const isTacticLockedThisYear = war.lastTacticsChangeYear === currentYear;

  // Active enemy realm & provinces
  const enemyRealm = realms.find(r => r.id === war.targetRealmId || r.name.toLowerCase() === war.targetRealmName.toLowerCase());
  const enemyProvinces = provinces.filter(p => {
    if (enemyRealm) return (p.realmId === enemyRealm.id || p.realmId === war.targetRealmId) && !p.isPlayerControlled;
    return p.realmId === war.targetRealmId && !p.isPlayerControlled;
  });
  const playerProvinces = provinces.filter(p => p.isPlayerControlled);

  // Active tactics objects
  const playerTacticObj = WAR_TACTICS.find(t => t.name === war.playerTactics) || WAR_TACTICS[0];
  const enemyTacticName = war.enemyTactics || 'Fortified Shieldwall & Defilade';
  const enemyTacticObj = WAR_TACTICS.find(t => t.name === enemyTacticName);

  // Tactical matchup calculation
  let tacticalCounterStatus: 'Advantage' | 'Disadvantage' | 'Neutral' = 'Neutral';
  if (playerTacticObj.strengthsAgainst.includes(enemyTacticName)) {
    tacticalCounterStatus = 'Advantage';
  } else if (playerTacticObj.weaknessesAgainst.includes(enemyTacticName)) {
    tacticalCounterStatus = 'Disadvantage';
  }

  // Military ratio
  const playerTroops = Math.max(50, war.playerLevies);
  const enemyTroops = Math.max(50, war.enemyLevies);
  const militaryRatio = (playerTroops / enemyTroops).toFixed(2);

  // Annual Upkeep Calculation
  const annualLevyCount = war.yearlyTroops >= 1 ? Math.round(war.yearlyTroops * 1000) : war.playerLevies;
  const annualUpkeepGold = Math.round(annualLevyCount * 0.003);

  // War Fatigue Level
  const warFatigueStage = war.warYear >= 6 ? 3 : war.warYear === 5 ? 2 : war.warYear === 4 ? 1 : 0;

  // Helper for center-split war score bar
  const renderWarScoreBar = (score: number) => {
    const clampedScore = Math.min(100, Math.max(-100, score));
    return (
      <div className="w-32 sm:w-48 h-2 bg-stone-300 rounded-full relative overflow-hidden flex">
        <div className="w-1/2 h-full bg-stone-300 flex justify-end">
          {clampedScore < 0 && (
            <div
              className="h-full bg-[#8B1E1E]"
              style={{ width: `${Math.min(100, Math.abs(clampedScore))}%` }}
            />
          )}
        </div>
        <div className="w-0.5 h-full bg-stone-700 shrink-0" />
        <div className="w-1/2 h-full bg-stone-300 flex justify-start">
          {clampedScore > 0 && (
            <div
              className="h-full bg-emerald-700"
              style={{ width: `${Math.min(100, clampedScore)}%` }}
            />
          )}
        </div>
      </div>
    );
  };

  // 5 Royal Commanders fallback generator if not initialized
  const commanders: WarCommander[] = war.commanders && war.commanders.length === 5 
    ? war.commanders 
    : [
        {
          id: 'cmd_1',
          name: 'Count Benjamin I Walpole',
          role: 'Grand Marshal',
          portrait: '👨🏽',
          martial: 26,
          trait: 'Master Tactician & Iron Will',
          assignedTroops: Math.round((war.yearlyTroops * 1000) * 0.35),
          status: 'Engaged'
        },
        {
          id: 'cmd_2',
          name: 'Prince Cuthbert Calvin',
          role: 'Vanguard Commander',
          portrait: '🤴',
          martial: 28,
          trait: 'Knight Commander & Fearless Charge',
          assignedTroops: Math.round((war.yearlyTroops * 1000) * 0.25),
          status: 'Ready'
        },
        {
          id: 'cmd_3',
          name: 'Bartholomew Calvin',
          role: 'Left Flank',
          portrait: '👨',
          martial: 23,
          trait: 'Disciplined Shieldwall Expert',
          assignedTroops: Math.round((war.yearlyTroops * 1000) * 0.15),
          status: 'Ready'
        },
        {
          id: 'cmd_4',
          name: 'Countess Susanna I Calvin',
          role: 'Right Flank',
          portrait: '👩',
          martial: 22,
          trait: 'Outflanking & Light Cavalry',
          assignedTroops: Math.round((war.yearlyTroops * 1000) * 0.15),
          status: 'Ready'
        },
        {
          id: 'cmd_5',
          name: 'Grand Inquisitor Aldous',
          role: 'Reserve & Magic',
          portrait: '🔮',
          martial: 25,
          trait: 'Arcane Siege & War Spells',
          assignedTroops: Math.round((war.yearlyTroops * 1000) * 0.10),
          status: 'Ready'
        }
      ];

  // Candidates for replacing captured or dead commanders
  const replacementCandidates = [
    { name: 'Sir Matthew the Lionheart', portrait: '🛡️', martial: 27, trait: 'Fearless Vanguard Knight' },
    { name: 'Dame Vivienne Ironwood', portrait: '⚔️', martial: 25, trait: 'Shieldwall Veteran & Pavise Expert' },
    { name: 'Baron Walter of Essex', portrait: '🏹', martial: 24, trait: 'Master Bowman & Outflanker' },
    { name: 'Archmage Theron the Wise', portrait: '🧙‍♂️', martial: 26, trait: 'Arcane Siege & Elemental Wards' }
  ];

  const handleAppointReplacement = (candidate: typeof replacementCandidates[0]) => {
    if (!replacingCommanderId) return;
    sound.playFanfare();

    const targetCmd = commanders.find(c => c.id === replacingCommanderId);
    if (!targetCmd) return;

    const newCmdList: WarCommander[] = commanders.map(c => {
      if (c.id === replacingCommanderId) {
        return {
          ...c,
          name: candidate.name,
          portrait: candidate.portrait,
          martial: candidate.martial,
          trait: candidate.trait,
          status: 'Ready',
          woundDescription: undefined,
          woundYearsRemaining: undefined,
          assignedTroops: Math.round(annualLevyCount * 0.20)
        };
      }
      return c;
    });

    onUpdateWar({
      ...war,
      commanders: newCmdList
    });

    setReplacingCommanderId(null);
    setTacticFeedbackToast(`🎖️ Appointed ${candidate.name} as new ${targetCmd.role}!`);
    setTimeout(() => setTacticFeedbackToast(null), 4000);
  };

  const handleSaveYearlyTroops = () => {
    sound.playSword();
    const updated: WarState = {
      ...war,
      yearlyTroops: tempYearlyTroops,
      playerLevies: Math.round(tempYearlyTroops * 1000),
      commanders: commanders.map((c, i) => ({
        ...c,
        assignedTroops: Math.round((tempYearlyTroops * 1000) * [0.35, 0.25, 0.15, 0.15, 0.10][i])
      }))
    };
    onUpdateWar(updated);
    setShowYearlyArmyModal(false);
  };

  const handleSelectTactics = (tacticName: string) => {
    if (isTacticLockedThisYear) {
      sound.playClick();
      setTacticFeedbackToast(`🔒 Tactics locked for Year ${currentYear}. You can only change tactical doctrine once per year. Advance the year (Age Up) to choose new tactics for Year ${currentYear + 1}.`);
      setTimeout(() => setTacticFeedbackToast(null), 5000);
      return;
    }

    sound.playSword();
    const updated: WarState = {
      ...war,
      playerTactics: tacticName,
      lastTacticsChangeYear: currentYear
    };
    onUpdateWar(updated);
    setShowChooseTacticsModal(false);
    setTacticFeedbackToast(`📜 Set active doctrine to "${tacticName}". Locked until next year.`);
    setTimeout(() => setTacticFeedbackToast(null), 4000);
  };

  const handleToggleCommandArmy = () => {
    sound.playSword();
    const updated: WarState = {
      ...war,
      isPlayerCommanding: !war.isPlayerCommanding
    };
    onUpdateWar(updated);
  };

  const handlePlunderHoldings = () => {
    sound.playCoin();
    const lootGold = 45 + Math.floor(Math.random() * 55);
    const lootPrestige = 15;

    if (onUpdatePlayerGold) onUpdatePlayerGold(character.stats.gold + lootGold);
    if (onUpdatePlayerPrestige) onUpdatePlayerPrestige(character.stats.renown + lootPrestige);

    const updated: WarState = {
      ...war,
      plunderCount: (war.plunderCount || 0) + 1,
      warScore: Math.min(100, war.warScore + 2)
    };
    onUpdateWar(updated);

    setPlunderToast(`🏰 Plundered enemy estates: +${lootGold} 🪙 Gold, +${lootPrestige} 👑 Prestige!`);
    setTimeout(() => setPlunderToast(null), 4000);
    setShowPlunderModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 font-sans">
      
      {/* Toast notifications */}
      {plunderToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#D49B28] text-stone-950 font-black px-4 py-2 rounded-2xl shadow-2xl border border-stone-800 text-xs animate-bounce">
          {plunderToast}
        </div>
      )}
      {tacticFeedbackToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-amber-300 font-bold px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-[#D49B28] text-xs max-w-md text-center animate-fade-in">
          {tacticFeedbackToast}
        </div>
      )}

      {/* Container with rounded top and border matching Screenshot 7 */}
      <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl border border-stone-400/60 shadow-2xl overflow-hidden">
        
        {/* Top Gold Header Card (#D49B28) matching Screenshot 7 */}
        <div className="bg-[#D49B28] px-4 sm:px-5 py-3.5 border-b border-[#B78722] text-[#181512]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-black text-stone-950 bg-[#FAF7EB]/30 px-3 py-1.5 rounded-xl border border-[#FAF7EB]/40 shadow-2xs">
              <div className="flex items-center gap-1">
                <span>👑</span>
                <span>{character.stats.renown}</span>
              </div>
              <span className="text-stone-800/40">|</span>
              <div className="flex items-center gap-1">
                <span>✝️</span>
                <span>{character.stats.pietyOrMana}</span>
              </div>
              <span className="text-stone-800/40">|</span>
              <div className="flex items-center gap-1">
                <span>🧈</span>
                <span>{character.stats.gold}</span>
              </div>
              <span className="text-stone-800/40">|</span>
              <div className="flex items-center gap-1">
                <span>⚔️</span>
                <span>{formattedImperialArmy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Header Bar: `‹ War ? ✕` matching Screenshot 7 */}
        <div className="bg-[#D49B28] px-4 py-2.5 border-t border-b border-[#B78722] flex items-center justify-between text-[#181512] shadow-sm">
          <button
            onClick={() => { sound.playClick(); onBack(); }}
            className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="text-xl leading-none">‹</span>
          </button>
          
          <div className="flex items-center gap-1.5 font-bold text-base text-[#181512]">
            <span>War Command Room</span>
            <button 
              onClick={() => setShowInfoModal(true)}
              className="w-4 h-4 rounded-full bg-[#FAF7EB]/40 hover:bg-[#FAF7EB]/60 text-[10px] flex items-center justify-center font-bold cursor-pointer"
            >
              ?
            </button>
          </div>

          <button
            onClick={() => { sound.playClick(); onBack(); }}
            className="text-stone-800 hover:text-stone-950 text-sm font-black cursor-pointer px-1"
          >
            ✕
          </button>
        </div>

        {/* War Fatigue Alert Banner (Wars > 3 Years) */}
        {warFatigueStage > 0 && (
          <div className={`mx-4 my-3 p-3.5 rounded-xl border text-xs shadow-xs ${
            warFatigueStage === 3
              ? 'bg-rose-50 border-rose-400 text-rose-950'
              : warFatigueStage === 2
              ? 'bg-amber-50 border-amber-400 text-amber-950'
              : 'bg-yellow-50 border-yellow-400 text-yellow-950'
          }`}>
            <div className="flex items-center justify-between font-black mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{warFatigueStage === 3 ? '☠️' : '⚠️'}</span>
                <span>War Fatigue: Stage {warFatigueStage} ({warFatigueStage === 3 ? 'Devastating' : warFatigueStage === 2 ? 'Heavy Exhaustion' : 'Growing Weariness'})</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/10 font-bold">
                Year {war.warYear || 4} of Campaign
              </span>
            </div>
            <p className="text-[11px] leading-relaxed mb-2 opacity-90">
              {warFatigueStage === 3
                ? 'Prolonged war has devastated the countryside. Peasantry is near mutiny, trade is paralyzed, and recruitment is cripplingly diminished.'
                : warFatigueStage === 2
                ? 'Five years of relentless campaigning have severely strained provincial prosperity and increased unrest across your provinces.'
                : 'Four years of active warfare are beginning to exhaust local garrisons, lowering province prosperity and breeding unrest.'}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5 text-[10px] font-black">
                <span className="bg-rose-100/90 px-2 py-0.5 rounded border border-rose-200 text-rose-900">
                  📉 -{warFatigueStage === 3 ? '10%' : warFatigueStage === 2 ? '6%' : '3%'} Prosperity
                </span>
                <span className="bg-amber-100/90 px-2 py-0.5 rounded border border-amber-200 text-amber-900">
                  🔥 +{warFatigueStage === 3 ? '12%' : warFatigueStage === 2 ? '8%' : '5%'} Unrest
                </span>
                <span className="bg-stone-200/90 px-2 py-0.5 rounded border border-stone-300 text-stone-800">
                  👥 -{warFatigueStage === 3 ? '35%' : warFatigueStage === 2 ? '20%' : '10%'} Levy Growth
                </span>
              </div>
              <button
                onClick={() => setShowConditionalPeaceModal(true)}
                className="text-[10px] font-black bg-[#D49B28] hover:bg-[#B78722] text-stone-950 px-2.5 py-1 rounded-lg shadow-xs cursor-pointer"
              >
                🕊️ Propose Peace Accord
              </button>
            </div>
          </div>
        )}

        {/* Section 1: War Title & Score matching Screenshot 7 */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-b border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              War
            </span>
          </div>

          <div 
            onClick={() => { sound.playClick(); setShowWarOverviewModal(true); }}
            className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors border-b border-stone-200 flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">⚔️</span>
              <div className="min-w-0">
                <div className="font-black text-sm text-stone-950 truncate">
                  {war.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-stone-800">
                    War Score:
                  </span>
                  {renderWarScoreBar(war.warScore)}
                  <span className={`text-[11px] font-mono font-black ${
                    war.warScore > 0 ? 'text-emerald-700' : war.warScore < 0 ? 'text-red-700' : 'text-stone-800'
                  }`}>
                    {war.warScore > 0 ? `+${war.warScore}%` : `${war.warScore}%`}
                  </span>
                </div>
              </div>
            </div>

            <span className="text-stone-500 font-extrabold text-xs tracking-widest group-hover:text-stone-800">
              •••
            </span>
          </div>
        </div>

        {/* Section 2: Enemy matching Screenshot 7 */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              Enemy
            </span>
          </div>

          <div 
            onClick={() => { sound.playClick(); setShowEnemyDetailModal(true); }}
            className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors border-b border-stone-200 flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">🚩</span>
              <div className="min-w-0">
                <div className="font-black text-sm text-stone-950 truncate">
                  {war.targetProvinceName || war.targetRealmName}
                </div>
                <div className="mt-1">
                  <div className="text-[11px] font-bold text-stone-700 mb-0.5">
                    Troops: {war.enemyLevies.toLocaleString()}
                  </div>
                  <div className="w-36 sm:w-56 h-2 bg-stone-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#8B1E1E]"
                      style={{ 
                        width: `${Math.min(100, Math.max(10, (war.enemyLevies / (war.enemyMaxLevies || 15000)) * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-stone-400 font-bold text-xl group-hover:text-stone-700">
              ›
            </div>
          </div>
        </div>

        {/* Section 3: Your Realm matching Screenshot 7 with Annual Upkeep breakdown */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              Your Realm & Military Logistics
            </span>
          </div>

          <div 
            onClick={() => { sound.playClick(); setShowYourRealmModal(true); }}
            className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors border-b border-stone-200 flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">🚩</span>
              <div className="min-w-0">
                <div className="font-black text-sm text-stone-950 truncate flex items-center gap-2">
                  <span>The Empire of Britannia</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    🪙 -{annualUpkeepGold} Gold/yr Upkeep
                  </span>
                </div>
                <div className="mt-1">
                  <div className="text-[11px] font-bold text-stone-700 mb-0.5">
                    Troops: {annualLevyCount.toLocaleString()} (Committed)
                  </div>
                  <div className="w-36 sm:w-56 h-2 bg-stone-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-700"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-stone-400 font-bold text-xl group-hover:text-stone-700">
              ›
            </div>
          </div>
        </div>

        {/* Section 4: 5 Royal Commanders with Wounded/Captured/Killed statuses */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs flex items-center justify-between">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide mx-auto">
              5 Royal Commanders & Vanguard Officers
            </span>
          </div>

          <div className="divide-y divide-stone-200/90 bg-[#FFFDF6]">
            {commanders.map((cmd) => (
              <div key={cmd.id} className="px-4 py-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                    {cmd.status === 'Killed' ? '💀' : cmd.status === 'Captured' ? '⛓️' : cmd.portrait}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-stone-900 truncate flex items-center gap-1.5 flex-wrap">
                      <span>{cmd.name}</span>
                      <span className="font-semibold text-stone-500 text-[11px]">({cmd.role})</span>
                      {cmd.veteranTrait === 'Legendary Warmaster' && (
                        <span className="bg-amber-300 text-stone-950 px-1.5 py-0.2 rounded font-black text-[9px] border border-amber-500 shadow-2xs">
                          ⚔️ Legendary Warmaster (+35 Martial)
                        </span>
                      )}
                      {cmd.veteranTrait === 'Heroic Commander' && (
                        <span className="bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded font-black text-[9px] border border-purple-300 shadow-2xs">
                          🏆 Heroic Commander (+22 Martial)
                        </span>
                      )}
                      {cmd.veteranTrait === 'War Veteran' && (
                        <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-black text-[9px] border border-amber-300 shadow-2xs">
                          ⭐ War Veteran (+10 Martial)
                        </span>
                      )}
                    </div>
                    
                    {cmd.status === 'Wounded' ? (
                      <div className="text-[10px] text-rose-700 font-bold flex items-center gap-1 flex-wrap">
                        <span>🩸 {cmd.woundDescription || 'Suffered battlefield injuries'}</span>
                        <span>•</span>
                        <span>Martial: {Math.round(cmd.martial * 0.55)} (-45%)</span>
                        <span>•</span>
                        <span>{cmd.woundYearsRemaining || 1} yr recovery</span>
                        {(cmd.battlesSurvived || 0) > 0 && (
                          <span className="text-stone-500 font-normal">({cmd.battlesSurvived} battles survived)</span>
                        )}
                      </div>
                    ) : cmd.status === 'Captured' ? (
                      <div className="text-[10px] text-stone-600 font-bold">
                        ⛓️ Imprisoned in enemy dungeon. Inactive on battlefield.
                      </div>
                    ) : cmd.status === 'Killed' ? (
                      <div className="text-[10px] text-stone-500 font-bold">
                        💀 Slain in the line of duty. Commander seat is vacant!
                      </div>
                    ) : (
                      <div className="text-[10px] text-stone-600 font-medium truncate flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-stone-800">⚔️ Martial: {cmd.martial}</span>
                        <span>•</span>
                        <span>{cmd.assignedTroops.toLocaleString()} troops</span>
                        <span>•</span>
                        <span className="italic text-stone-500">{cmd.trait}</span>
                        {(cmd.battlesSurvived || 0) > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-stone-700">🎖️ {cmd.battlesSurvived} clashes ({cmd.victoriesCount || 0} wins)</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cmd.status === 'Killed' ? 'bg-stone-900 text-stone-100 border border-stone-700' :
                    cmd.status === 'Captured' ? 'bg-stone-300 text-stone-800 border border-stone-400' :
                    cmd.status === 'Wounded' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                    cmd.status === 'Engaged' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    cmd.status === 'Victorious' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                    'bg-stone-200 text-stone-800'
                  }`}>
                    {cmd.status}
                  </span>

                  {cmd.status === 'Captured' && (
                    <button
                      onClick={() => {
                        if ((character.stats?.gold || 0) < 45) {
                          sound.playFail();
                          setPlunderToast('⚠️ Insufficient Gold: You need 45 🪙 in the treasury to pay the ransom.');
                          setTimeout(() => setPlunderToast(null), 3000);
                          return;
                        }
                        sound.playCoin();
                        if (onUpdatePlayerGold) {
                          onUpdatePlayerGold((character.stats?.gold || 0) - 45);
                        }
                        const updatedCommanders = (war.commanders || []).map(c => 
                          c.id === cmd.id ? { ...c, status: 'Ready' as const } : c
                        );
                        onUpdateWar({ ...war, commanders: updatedCommanders });
                        setPlunderToast(`💰 Ransom Paid (45 🪙): Commander ${cmd.name} has been freed from captivity and returned to command!`);
                        setTimeout(() => setPlunderToast(null), 3500);
                      }}
                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] shadow-xs cursor-pointer"
                      title="Pay 45 gold to ransom this commander immediately"
                    >
                      💰 Ransom (45 🪙)
                    </button>
                  )}

                  {(cmd.status === 'Killed' || cmd.status === 'Captured') && (
                    <button
                      onClick={() => setReplacingCommanderId(cmd.id)}
                      className="px-2 py-1 rounded-lg bg-[#D49B28] hover:bg-[#B78722] text-stone-950 font-black text-[10px] shadow-xs cursor-pointer"
                    >
                      Appoint Successor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4.2: Recent Annual Battle Clash & Tactical Outcome Narrative */}
        {war.lastBattleReport && (
          <div>
            <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs flex items-center justify-between">
              <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
                Latest Annual Battle Report (Year {war.lastBattleReport.year})
              </span>
              <button
                onClick={() => setShowFullBattleLogModal(true)}
                className="text-[10px] font-black text-stone-800 hover:text-stone-950 underline cursor-pointer"
              >
                Campaign History ({war.battleLog.length})
              </button>
            </div>

            <div className="p-3.5 bg-[#FFFDF6] border-b border-stone-300 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-stone-950">
                  <span className="text-base">{war.lastBattleReport.won ? '🏆' : '🛡️'}</span>
                  <span>{war.lastBattleReport.title}</span>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  war.lastBattleReport.won ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  War Score {war.lastBattleReport.scoreDelta >= 0 ? `+${war.lastBattleReport.scoreDelta}%` : `${war.lastBattleReport.scoreDelta}%`}
                </span>
              </div>

              {/* Specific Tactical Matchup Description */}
              {war.lastBattleReport.tacticalMatchup && (
                <div className="text-[11px] text-stone-800 bg-[#FAF7EB] p-3 rounded-xl border border-stone-300 leading-relaxed italic">
                  "{war.lastBattleReport.tacticalMatchup}"
                </div>
              )}

              {/* Casualties comparison */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-950">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">Imperial Casualties</div>
                  <div className="font-extrabold text-sm">{war.lastBattleReport.casualtiesPlayer.toLocaleString()} fallen</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-rose-950">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-rose-800">Enemy Casualties</div>
                  <div className="font-extrabold text-sm">{war.lastBattleReport.casualtiesEnemy.toLocaleString()} fallen</div>
                </div>
              </div>

              {/* Commander Events */}
              {war.lastBattleReport.commanderEvents && war.lastBattleReport.commanderEvents.length > 0 && (
                <div className="space-y-1">
                  {war.lastBattleReport.commanderEvents.map((evText, idx) => (
                    <div key={idx} className="text-[10px] font-bold text-amber-950 bg-amber-100/70 border border-amber-300 px-2.5 py-1.5 rounded-lg">
                      {evText}
                    </div>
                  ))}
                </div>
              )}

              {/* Infrastructure Devastation */}
              {war.lastBattleReport.infrastructureDamageText && (
                <div className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-2.5 py-1.5 rounded-lg border border-stone-300 flex items-center gap-1.5">
                  <span>🔥 Theater Devastation:</span>
                  <span>{war.lastBattleReport.infrastructureDamageText}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 4.5: Annual Tactical Intelligence & Matchup Preview */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              Upcoming Annual Tactical Strategy & Intelligence
            </span>
          </div>

          <div className="p-3.5 bg-[#FAF7EB] border-b border-stone-300 space-y-2.5 text-xs">
            {/* Player vs Enemy Doctrine with Counter Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-stone-300 shadow-2xs">
                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Your Active Doctrine</div>
                <div className="font-extrabold text-stone-950 flex items-center gap-1.5 mt-0.5">
                  <span className="text-base">{playerTacticObj.icon}</span>
                  <span>{playerTacticObj.name}</span>
                </div>
                <div className="text-[10px] text-stone-600 mt-1">
                  Scaled by: <strong className="text-amber-800 capitalize">{playerTacticObj.statScaling.label} ({character.stats[playerTacticObj.statScaling.stat] || character.stats.martial})</strong>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-300 shadow-2xs">
                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Scouted Enemy Doctrine</div>
                <div className="font-extrabold text-stone-950 flex items-center gap-1.5 mt-0.5">
                  <span className="text-base">{enemyTacticObj?.icon || '🛡️'}</span>
                  <span>{enemyTacticName}</span>
                </div>
                <div className="text-[10px] text-stone-600 mt-1">
                  Tactical Matchup: <span className={`font-black px-1.5 py-0.5 rounded ${
                    tacticalCounterStatus === 'Advantage' ? 'bg-emerald-100 text-emerald-800' :
                    tacticalCounterStatus === 'Disadvantage' ? 'bg-rose-100 text-rose-800' :
                    'bg-stone-100 text-stone-700'
                  }`}>
                    {tacticalCounterStatus === 'Advantage' ? '⚡ +35% Advantage (Countered!)' :
                     tacticalCounterStatus === 'Disadvantage' ? '⚠️ -25% Disadvantage (Enemy Counter)' :
                     '⚖️ Balanced Clash'}
                  </span>
                </div>
              </div>
            </div>

            {/* Combat Modifiers Summary Bar */}
            <div className="bg-[#EFEAD4] p-2.5 rounded-xl border border-stone-300 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-stone-800">
              <div>
                <span>Military Balance: </span>
                <strong className="text-stone-950">{playerTroops.toLocaleString()} vs {enemyTroops.toLocaleString()} ({militaryRatio}x)</strong>
              </div>
              <div className="flex items-center gap-3">
                <span>Martial Impact: <strong className="text-amber-900">+{Math.floor((character.stats.martial - 50) * 0.8)}%</strong></span>
                <span>Intellect Foresight: <strong className="text-indigo-900">+{Math.floor((character.stats.intellect - 50) * 0.8)}%</strong></span>
              </div>
            </div>

            {/* Tactics Lock Status Bar */}
            <div className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-between ${
              isTacticLockedThisYear 
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <div className="flex items-center gap-1.5">
                <span>{isTacticLockedThisYear ? '🔒' : '🟢'}</span>
                <span>
                  {isTacticLockedThisYear 
                    ? `Doctrine Locked for Year ${currentYear} (Can change in Year ${currentYear + 1} after Age Up)`
                    : `Doctrine can be adjusted for Year ${currentYear} campaign`}
                </span>
              </div>
              {!isTacticLockedThisYear && (
                <button
                  onClick={() => setShowChooseTacticsModal(true)}
                  className="px-2 py-0.5 rounded-lg bg-[#D49B28] text-stone-950 text-[10px] font-black hover:bg-[#B78722] cursor-pointer"
                >
                  Change Tactic
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Actions matching Screenshot 7 */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              Actions
            </span>
          </div>

          <div className="divide-y divide-stone-200/90">
            
            {/* Choose Yearly Army */}
            <div 
              onClick={() => { sound.playClick(); setShowYearlyArmyModal(true); }}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚔️</span>
                <div>
                  <div className="font-extrabold text-sm text-stone-900">
                    Choose Yearly Army ({war.yearlyTroops >= 10 ? war.yearlyTroops.toFixed(1) : Math.round(war.yearlyTroops)}k)
                  </div>
                  <div className="text-[11px] text-stone-600">
                    Annual Upkeep: ~{annualUpkeepGold} 🪙/yr from Treasury
                  </div>
                </div>
              </div>
              <span className="text-stone-500 font-extrabold text-xs tracking-widest group-hover:text-stone-800">
                •••
              </span>
            </div>

            {/* Choose Tactics */}
            <div 
              onClick={() => { sound.playClick(); setShowChooseTacticsModal(true); }}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <span className="font-extrabold text-sm text-stone-900">
                  Choose Tactics {war.playerTactics ? `(${war.playerTactics})` : ''}
                </span>
              </div>
              <span className="text-stone-500 font-extrabold text-xs tracking-widest group-hover:text-stone-800">
                •••
              </span>
            </div>

            {/* Enemy Tactics */}
            <div 
              onClick={() => { sound.playClick(); setShowEnemyTacticsModal(true); }}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <span className="font-extrabold text-sm text-stone-900">
                  Enemy Tactics ({enemyTacticName})
                </span>
              </div>
              <div className="text-stone-400 font-bold text-xl group-hover:text-stone-700">
                ›
              </div>
            </div>

            {/* Stop Commanding Army / Command Army */}
            <div 
              onClick={handleToggleCommandArmy}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💂</span>
                <span className="font-extrabold text-sm text-stone-900">
                  {war.isPlayerCommanding ? 'Stop Commanding Army' : 'Command Army (Personal Leadership)'}
                </span>
              </div>
              <span className="text-stone-500 font-extrabold text-xs tracking-widest group-hover:text-stone-800">
                •••
              </span>
            </div>

            {/* Plunder */}
            <div 
              onClick={() => { sound.playClick(); setShowPlunderModal(true); }}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏰</span>
                <span className="font-extrabold text-sm text-stone-900">
                  Plunder {war.plunderCount ? `(Raid x${war.plunderCount})` : ''}
                </span>
              </div>
              <span className="text-stone-500 font-extrabold text-xs tracking-widest group-hover:text-stone-800">
                •••
              </span>
            </div>

            {/* Negotiate Conditional Peace */}
            <div 
              onClick={() => { sound.playClick(); setShowConditionalPeaceModal(true); }}
              className="px-4 py-3 bg-[#FAF3DD] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group border-l-4 border-l-[#D49B28]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕊️</span>
                <div>
                  <div className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                    <span>Negotiate Conditional Peace</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black">
                      Treaty Menu
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600">
                    Propose terms: demand/offer gold, specific provinces, or marriage alliances
                  </div>
                </div>
              </div>
              <span className="text-[#D49B28] font-black text-xs tracking-widest group-hover:text-amber-900">
                PROPOSE ›
              </span>
            </div>

          </div>
        </div>

        {/* Section 6: End War Actions */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              End War Actions
            </span>
          </div>

          <div className="p-4 bg-[#FAF7EB] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Conditional Peace (Highlighted golden option) */}
            <button
              onClick={() => {
                sound.playClick();
                setShowConditionalPeaceModal(true);
              }}
              className="py-3 px-3 rounded-xl bg-gradient-to-b from-[#FFFDF6] to-[#FDF3D5] hover:to-[#FCE9B6] border-2 border-[#D49B28] text-stone-950 font-black text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer ring-1 ring-amber-400/50"
            >
              <span className="flex items-center gap-1">
                <span>🕊️ Conditional Peace</span>
              </span>
              <span className="text-[10px] text-amber-900 font-bold">Gold, Land & Marriage</span>
            </button>

            {/* Enforce Demands */}
            <button
              onClick={() => {
                sound.playFanfare();
                onEndWar(war.id, 'enforce_demands');
              }}
              disabled={war.warScore < 50}
              className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer ${
                war.warScore >= 50
                  ? 'bg-[#D49B28] hover:bg-[#B78722] text-stone-950 active:scale-95'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
              }`}
            >
              <span>👑 Enforce Demands</span>
              <span className="text-[10px] font-normal">
                {war.warScore >= 50 ? 'Score Favorable (Total Victory)' : 'Requires +50% War Score'}
              </span>
            </button>

            {/* White Peace */}
            <button
              onClick={() => {
                sound.playClick();
                onEndWar(war.id, 'white_peace');
              }}
              className="py-3 px-3 rounded-xl bg-[#E0B86C] hover:bg-[#D49B28] text-stone-950 font-black text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <span>🤝 White Peace</span>
              <span className="text-[10px] font-normal">Ceasefire (Status Quo)</span>
            </button>

            {/* Surrender */}
            <button
              onClick={() => {
                sound.playClick();
                onEndWar(war.id, 'surrender');
              }}
              className="py-3 px-3 rounded-xl bg-stone-300 hover:bg-rose-200 text-stone-800 hover:text-rose-950 font-black text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <span>🏳️ Surrender</span>
              <span className="text-[10px] font-normal">Pay War Indemnity</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: CHOOSE YEARLY ARMY WITH LIVE UPKEEP PREVIEW */}
      {showYearlyArmyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-sm sm:max-w-md w-full p-6 text-stone-900 shadow-2xl animate-fade-in font-sans">
            <h3 className="font-black text-xl text-stone-950 text-center mb-2 font-cinzel">
              Choose Yearly Army Commitment
            </h3>
            <p className="text-xs font-semibold text-stone-800 text-center mb-4">
              Allocate the number of royal regiments mobilized each year for this frontline.
            </p>

            <div className="bg-[#EFEAD4] p-4 rounded-2xl border border-stone-300 mb-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-stone-900">Yearly Levies:</span>
                <span className="font-mono font-black text-lg text-stone-950">
                  {tempYearlyTroops >= 10 ? tempYearlyTroops.toFixed(1) : Math.round(tempYearlyTroops)}k Troops
                </span>
              </div>

              <input
                type="range"
                min="5"
                max={Math.max(25, totalImperialTroops >= 1000 ? totalImperialTroops / 1000 : 51.3)}
                step="0.5"
                value={tempYearlyTroops}
                onChange={(e) => setTempYearlyTroops(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-[#D49B28]"
              />

              <div className="flex justify-between text-[10px] text-stone-600 font-bold">
                <span>5.0k (Minimal)</span>
                <span>25.0k (Heavy Vanguard)</span>
                <span>{totalImperialTroops >= 1000 ? (totalImperialTroops / 1000).toFixed(1) : '51.3'}k (All Banners)</span>
              </div>

              {/* Annual Upkeep Preview */}
              <div className="bg-amber-100/80 border border-amber-300 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-amber-950">
                <div className="flex items-center gap-1.5">
                  <span>🪙</span>
                  <span>Annual Treasury Upkeep:</span>
                </div>
                <span className="font-mono font-black">
                  -{Math.round((tempYearlyTroops * 1000) * 0.003)} Gold / yr
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowYearlyArmyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-300 hover:bg-stone-400 font-bold text-stone-800 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveYearlyTroops}
                className="flex-1 py-2.5 rounded-xl bg-[#D49B28] hover:bg-[#B78722] font-black text-stone-950 text-xs shadow-md"
              >
                Commit Troops
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHOOSE TACTICS */}
      {showChooseTacticsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-lg w-full p-5 sm:p-6 text-stone-900 shadow-2xl animate-fade-in font-sans max-h-[90vh] flex flex-col">
            <h3 className="font-black text-xl text-stone-950 text-center mb-1 font-cinzel">
              Choose Battlefield Tactics
            </h3>
            <p className="text-xs text-stone-700 text-center mb-3">
              Instruct your Imperial Commanders on the tactical doctrine for the upcoming clash.
            </p>

            {/* Lock status banner */}
            {isTacticLockedThisYear ? (
              <div className="bg-amber-100 border border-amber-400 text-amber-950 p-3 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <div>
                  <div>Doctrine Locked for Year {currentYear}</div>
                  <div className="text-[11px] font-normal text-amber-900">
                    Tactics can only be adjusted once per year. Advance the year to enact new orders for Year {currentYear + 1}.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-2.5 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                <span className="text-base">🟢</span>
                <span>Select a doctrine to guide your forces during the Year {currentYear} clash.</span>
              </div>
            )}

            <div className="space-y-2 mb-4 overflow-y-auto flex-1 pr-1">
              {WAR_TACTICS.map((t) => {
                const isCurrent = war.playerTactics === t.name;
                const statVal = character.stats[t.statScaling.stat] || character.stats.martial;
                return (
                  <button
                    key={t.name}
                    onClick={() => handleSelectTactics(t.name)}
                    disabled={isTacticLockedThisYear && !isCurrent}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all shadow-2xs group cursor-pointer ${
                      isCurrent
                        ? 'bg-[#D49B28] text-stone-950 border-[#B78722] ring-2 ring-amber-600'
                        : isTacticLockedThisYear
                        ? 'bg-stone-200/60 text-stone-400 border-stone-300 cursor-not-allowed'
                        : 'bg-white hover:bg-[#F3EED8] text-stone-900 border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-extrabold flex items-center gap-1.5 text-sm">
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </div>
                      {isCurrent && (
                        <span className="bg-stone-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 mb-2 leading-relaxed">
                      {t.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                      <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                        Scaled by {t.statScaling.label}: {statVal}
                      </span>
                      {t.strengthsAgainst.length > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Counters: {t.strengthsAgainst[0]}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowChooseTacticsModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-300 hover:bg-stone-400 font-bold text-stone-800 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ENEMY TACTICS */}
      {showEnemyTacticsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-2xl animate-fade-in font-sans">
            <h3 className="font-black text-xl text-stone-950 flex items-center gap-2 mb-2 font-cinzel">
              <span>{enemyTacticObj?.icon || '📜'}</span>
              <span>Scouted Enemy Doctrine</span>
            </h3>
            <p className="text-xs text-stone-700 mb-4 leading-relaxed">
              Your scouts report that {war.targetRealmName} forces have adopted the <strong>"{enemyTacticName}"</strong> doctrine.
            </p>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-300 space-y-2 text-xs mb-4">
              <div className="font-bold text-stone-900">Analysis:</div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                {enemyTacticObj?.description || 'The enemy is digging into defensive earthworks and preparing fortifications.'}
              </p>
            </div>

            <button
              onClick={() => setShowEnemyTacticsModal(false)}
              className="w-full py-2.5 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl cursor-pointer"
            >
              Dismiss Intelligence
            </button>
          </div>
        </div>
      )}

      {/* MODAL: APPOINT REPLACEMENT COMMANDER */}
      {replacingCommanderId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-2xl animate-fade-in font-sans">
            <h3 className="font-black text-xl text-stone-950 mb-1 font-cinzel">
              Appoint Successor Commander
            </h3>
            <p className="text-xs text-stone-700 mb-4">
              Select an eminent noble or veteran knight to take command of this battle wing.
            </p>

            <div className="space-y-2 mb-4">
              {replacementCandidates.map((candidate, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAppointReplacement(candidate)}
                  className="p-3 bg-white hover:bg-[#F3EED8] transition-colors rounded-xl border border-stone-300 flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{candidate.portrait}</span>
                    <div>
                      <div className="font-extrabold text-stone-950 text-xs">
                        {candidate.name}
                      </div>
                      <div className="text-[10px] text-stone-600 font-medium">
                        ⚔️ Martial: {candidate.martial} • {candidate.trait}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-[#D49B28] text-stone-950 px-2 py-1 rounded-lg">
                    Appoint
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setReplacingCommanderId(null)}
              className="w-full py-2 bg-stone-300 font-bold text-xs text-stone-800 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODAL: FULL BATTLE LOG HISTORY */}
      {showFullBattleLogModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-lg w-full p-5 text-stone-900 shadow-2xl animate-fade-in font-sans max-h-[85vh] flex flex-col">
            <h3 className="font-black text-xl text-stone-950 mb-1 font-cinzel">
              Campaign Battle Chronicles
            </h3>
            <p className="text-xs text-stone-700 mb-4">
              Historical record of all yearly clashes on this campaign front.
            </p>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1 mb-4">
              {war.battleLog.length > 0 ? (
                war.battleLog.map((b, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-2xl border border-stone-300 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-black">
                      <div className="flex items-center gap-1.5">
                        <span>{b.won ? '🏆' : '🛡️'}</span>
                        <span>Year {b.year}: {b.title}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        b.won ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                      }`}>
                        {b.won ? 'Victory' : 'Repulse'}
                      </span>
                    </div>

                    {b.tacticalMatchup && (
                      <p className="text-[11px] text-stone-700 italic bg-[#FAF7EB] p-2 rounded-xl border border-stone-200">
                        "{b.tacticalMatchup}"
                      </p>
                    )}

                    <div className="flex justify-between text-[10px] font-bold text-stone-600">
                      <span>Imperial Losses: {b.casualtiesPlayer.toLocaleString()}</span>
                      <span>Enemy Losses: {b.casualtiesEnemy.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-stone-500 text-xs">
                  No previous annual clashes yet recorded.
                </div>
              )}
            </div>

            <button
              onClick={() => setShowFullBattleLogModal(false)}
              className="w-full py-2.5 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl"
            >
              Close Chronicles
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PLUNDER */}
      {showPlunderModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-2xl animate-fade-in font-sans">
            <h3 className="font-black text-xl text-stone-950 flex items-center gap-2 mb-2 font-cinzel">
              <span>🏰</span>
              <span>Plunder Enemy Estates</span>
            </h3>
            <p className="text-xs text-stone-700 mb-4 leading-relaxed">
              Authorize your royal vanguard to raid manor houses, grain silos, and merchant caravans across {war.targetProvinceName || war.targetRealmName}. This yields gold and glory while destabilizing enemy war logistics.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPlunderModal(false)}
                className="flex-1 py-2.5 bg-stone-300 font-bold text-xs text-stone-800 rounded-xl"
              >
                Hold Fire
              </button>
              <button
                onClick={handlePlunderHoldings}
                className="flex-1 py-2.5 bg-[#D49B28] hover:bg-[#B78722] font-black text-xs text-stone-950 rounded-xl shadow-md"
              >
                Raid Holdings (+🪙)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WAR OVERVIEW / INFO */}
      {(showWarOverviewModal || showInfoModal) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-2xl animate-fade-in font-sans">
            <h3 className="font-black text-lg text-stone-950 mb-2 font-cinzel">War Command Center</h3>
            <p className="text-xs text-stone-700 leading-relaxed mb-4">
              Here you supervise the frontline war effort. Adjust your yearly army commitment, choose combat tactics, oversee your 5 commanders, raid enemy territory, or conclude peace accords when war score reaches your favor.
            </p>
            <button
              onClick={() => { setShowWarOverviewModal(false); setShowInfoModal(false); }}
              className="w-full py-2.5 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ENEMY DETAIL */}
      {showEnemyDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-2xl animate-fade-in font-sans">
            <h3 className="font-black text-lg text-stone-950 mb-2 font-cinzel">
              Enemy Realm: {war.targetProvinceName || war.targetRealmName}
            </h3>
            <p className="text-xs text-stone-700 mb-4">
              Forces remaining: {war.enemyLevies.toLocaleString()} warriors. War goal: {war.warGoal}.
            </p>
            <button
              onClick={() => setShowEnemyDetailModal(false)}
              className="w-full py-2.5 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: YOUR REALM DETAIL */}
      {showYourRealmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-2xl animate-fade-in font-sans">
            <h3 className="font-black text-lg text-stone-950 mb-2 font-cinzel">
              The Empire of Britannia Imperial Army
            </h3>
            <p className="text-xs text-stone-700 mb-4">
              Total Imperial Troops: {formattedImperialArmy} • Frontline Levy Commitment: {annualLevyCount.toLocaleString()} • Annual Treasury Upkeep: ~{annualUpkeepGold} 🪙/yr.
            </p>
            <button
              onClick={() => setShowYourRealmModal(false)}
              className="w-full py-2.5 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CONDITIONAL PEACE NEGOTIATIONS */}
      {showConditionalPeaceModal && (
        <ConditionalPeaceModal
          character={character}
          war={war}
          enemyRealm={enemyRealm}
          enemyProvinces={enemyProvinces}
          playerProvinces={playerProvinces}
          familyMembers={familyMembers}
          currentYear={currentYear}
          onConfirmPeace={(terms) => {
            setShowConditionalPeaceModal(false);
            if (onProposeConditionalPeace) {
              onProposeConditionalPeace(terms);
            } else {
              onEndWar(war.id, 'white_peace');
            }
          }}
          onClose={() => setShowConditionalPeaceModal(false)}
        />
      )}

    </div>
  );
};
