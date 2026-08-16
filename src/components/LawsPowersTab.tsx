import React, { useState } from 'react';
import { Character, CouncilRole, RealmLaw, RealmLawOption, SpeciesAbility, Vassal } from '../types';
import { SPECIES_ABILITIES } from '../data/lawsData';
import { SPECIES_DATA } from '../data/speciesData';
import { 
  Scale, 
  Crown, 
  Flame, 
  Zap, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  HelpCircle, 
  MoreHorizontal, 
  Check, 
  Coins, 
  Shield, 
  Scroll, 
  AlertCircle,
  Users,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/audio';

interface LawsPowersTabProps {
  character: Character;
  realmLaws: RealmLaw[];
  vassals: Vassal[];
  totalArmyPower?: number;
  onEnactLaw: (lawId: string, optionId: string) => void;
  onUseSpeciesAbility: (abilityId: string) => void;
  onAssignCouncil: (vassalId: string, role: CouncilRole) => void;
  onUpdatePlayerPrestige?: (newPrestige: number) => void;
  onUpdatePlayerPiety?: (newPiety: number) => void;
  onBackToChronicle?: () => void;
}

export const LawsPowersTab: React.FC<LawsPowersTabProps> = ({
  character,
  realmLaws,
  vassals,
  totalArmyPower = 51300,
  onEnactLaw,
  onUseSpeciesAbility,
  onAssignCouncil,
  onUpdatePlayerPrestige,
  onUpdatePlayerPiety,
  onBackToChronicle
}) => {
  const [mainView, setMainView] = useState<'laws' | 'crown_authority' | 'powers' | 'council'>('laws');
  const [selectedLawId, setSelectedLawId] = useState<string | null>(null);
  const [inspectingOption, setInspectingOption] = useState<{ law: RealmLaw; option: RealmLawOption } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Active Law for detail view
  const activeLaw = selectedLawId ? realmLaws.find(l => l.id === selectedLawId) : null;
  const currentOption = activeLaw ? activeLaw.options.find(o => o.id === activeLaw.currentOptionId) : null;
  const otherOptions = activeLaw ? activeLaw.options.filter(o => o.id !== activeLaw.currentOptionId) : [];

  // Species info & abilities
  const speciesAbilities = SPECIES_ABILITIES[character.species] || [];
  const speciesInfo = SPECIES_DATA[character.species];

  // Council Roles
  const councilRoles: { role: CouncilRole; title: string; icon: string; desc: string }[] = [
    { role: 'Marshal', title: 'High Marshal', icon: '⚔️', desc: 'Commands provincial armies and drills levies.' },
    { role: 'Chancellor', title: 'Grand Chancellor', icon: '📜', desc: 'Conducts foreign diplomacy and treaties.' },
    { role: 'Spymaster', title: 'Master of Whispers', icon: '🗡️', desc: 'Discovers intrigues and protects from plots.' },
    { role: 'CourtMage', title: 'High Court Mage / Shaman', icon: '🔮', desc: 'Conducts species rituals and alchemy.' },
    { role: 'GrandTreasurer', title: 'High Treasurer', icon: '🪙', desc: 'Optimizes provincial taxes and tariffs.' },
    { role: 'HighPriest', title: 'High Cleric / Patriarch', icon: '✨', desc: 'Maintains faith, piety, and moral order.' }
  ];

  // Format troop count display
  const troopCountDisplay = totalArmyPower >= 1000 
    ? `${(totalArmyPower / 1000).toFixed(1)}k` 
    : `${totalArmyPower}`;

  // Emperor check: player must be Emperor / Empress to change realm laws
  const isEmperor = character.rank?.toLowerCase() === 'emperor' || 
                    character.title?.toLowerCase().includes('emperor') || 
                    character.title?.toLowerCase().includes('empress');

  // Handle law enactment
  const handleConfirmEnact = (law: RealmLaw, option: RealmLawOption) => {
    if (law.currentOptionId === option.id) {
      setInspectingOption(null);
      return;
    }

    if (!isEmperor) {
      sound.playClick();
      alert(`Imperial Decree Restricted: You must achieve the imperial rank of Emperor or Empress to change Realm Laws! Your current sovereign rank is "${character.rank || character.title}".`);
      return;
    }

    const prestigeCost = option.prestigeCost || 0;
    const pietyCost = option.pietyCost || 0;

    if (character.stats.renown < prestigeCost) {
      alert(`You require at least ${prestigeCost} Prestige (👑) to enact this law!`);
      return;
    }
    if (character.stats.pietyOrMana < pietyCost) {
      alert(`You require at least ${pietyCost} Piety/Mana (✝️) to enact this law!`);
      return;
    }

    if (onUpdatePlayerPrestige && prestigeCost > 0) {
      onUpdatePlayerPrestige(character.stats.renown - prestigeCost);
    }
    if (onUpdatePlayerPiety && pietyCost > 0) {
      onUpdatePlayerPiety(character.stats.pietyOrMana - pietyCost);
    }

    sound.playFanfare();
    onEnactLaw(law.id, option.id);
    setInspectingOption(null);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FCF8E3] pb-24 shadow-2xl flex flex-col font-sans select-none border-x border-amber-900/20">
      
      {/* 1. Sovereign Top Gold Header */}
      <div className="bg-[#C58F2C] text-stone-950 px-4 pt-3 pb-3.5 shadow-md relative border-b border-amber-800/30">
        
        {/* Top Sovereign Row */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          {/* Avatar & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-13 h-13 rounded-full bg-[#E5B54A] border-2 border-amber-900/30 flex items-center justify-center text-3xl shadow-inner shrink-0 overflow-hidden">
              {character.portrait || '👑'}
            </div>
            <div className="min-w-0 leading-tight">
              <h2 className="font-extrabold text-sm sm:text-base text-stone-950 truncate tracking-tight">
                {character.title} {character.name}
              </h2>
              <div className="text-xs font-bold text-amber-950/80 truncate">
                House {character.dynastyName} • {character.realmName}
              </div>
            </div>
          </div>

          {/* Top 4 Imperial Indicators */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-right shrink-0">
            <div className="flex items-center justify-end gap-1 font-bold text-xs sm:text-sm text-stone-950">
              <span className="text-sm">👑</span>
              <span>{character.stats.renown}</span>
            </div>
            <div className="flex items-center justify-end gap-1 font-bold text-xs sm:text-sm text-stone-950">
              <span className="text-sm">✝️</span>
              <span>{character.stats.pietyOrMana}</span>
            </div>
            <div className="flex items-center justify-end gap-1 font-bold text-xs sm:text-sm text-stone-950">
              <span className="text-sm">🧈</span>
              <span>{character.stats.gold}</span>
            </div>
            <div className="flex items-center justify-end gap-1 font-bold text-xs sm:text-sm text-stone-950">
              <span className="text-sm">⚔️</span>
              <span>{troopCountDisplay}</span>
            </div>
          </div>
        </div>

        {/* Screen Title & Navigation Row */}
        <div className="flex items-center justify-between pt-1 relative">
          {activeLaw ? (
            <button
              onClick={() => {
                sound.playClick();
                setSelectedLawId(null);
              }}
              className="p-1 text-stone-900 hover:text-stone-950 active:scale-95 transition-transform"
              title="Back to Realm Laws"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Center Title */}
          <div className="flex items-center gap-1.5 font-black text-lg sm:text-xl text-stone-950 tracking-tight">
            <span>{activeLaw ? activeLaw.title : 'Realm Laws'}</span>
            <button
              onClick={() => {
                sound.playClick();
                setShowHelpModal(true);
              }}
              className="w-5 h-5 rounded-full border border-stone-800/60 flex items-center justify-center text-xs font-bold text-stone-900 hover:bg-amber-600/30 transition-colors"
              title="Realm Laws Codex"
            >
              ?
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (activeLaw) {
                setSelectedLawId(null);
              } else if (onBackToChronicle) {
                onBackToChronicle();
              }
            }}
            className="p-1 text-stone-900 hover:text-stone-950 active:scale-95 transition-transform"
            title="Close"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs (Laws, Crown Power, Species Rites, Royal Council) */}
      {!activeLaw && (
        <div className="bg-[#EAE4C8] border-b border-amber-900/20 p-1 flex items-center gap-1">
          {[
            { id: 'laws' as const, label: 'Realm Laws', icon: Scale },
            { id: 'crown_authority' as const, label: 'Decrees & Power', icon: Crown },
            { id: 'powers' as const, label: `${character.species} Rites`, icon: Zap },
            { id: 'council' as const, label: 'Council', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = mainView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setMainView(tab.id);
                }}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  isActive
                    ? 'bg-[#C58F2C] text-stone-950 shadow font-black'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Main Content Views */}

      {/* A. REALM LAWS DRILL-DOWN SUB-SCREEN (When a Law Category is Selected) */}
      {activeLaw && (
        <div className="flex-1 flex flex-col">
          
          {/* Section 1: Current Law Banner */}
          <div className="bg-[#E2E7C3] border-b border-amber-900/15 py-1.5 px-4 text-center">
            <h3 className="font-extrabold text-xs text-stone-900 tracking-wide">
              Current Law
            </h3>
          </div>

          {/* Current Law Item */}
          {currentOption && (
            <div
              onClick={() => {
                sound.playClick();
                setInspectingOption({ law: activeLaw, option: currentOption });
              }}
              className="bg-[#FCF8E3] border-b border-amber-900/15 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 active:bg-amber-200/50 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-2xl shrink-0">{currentOption.icon || '📜'}</span>
                <span className="font-extrabold text-sm sm:text-base text-stone-950 truncate">
                  {currentOption.name}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  setInspectingOption({ law: activeLaw, option: currentOption });
                }}
                className="p-1 text-stone-700 hover:text-stone-950"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Section 2: Other Law Banner */}
          <div className="bg-[#E2E7C3] border-y border-amber-900/15 py-1.5 px-4 text-center mt-1">
            <h3 className="font-extrabold text-xs text-stone-900 tracking-wide">
              Other Law
            </h3>
          </div>

          {/* List of Other Laws */}
          <div className="divide-y divide-amber-900/10">
            {otherOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => {
                  sound.playClick();
                  setInspectingOption({ law: activeLaw, option: opt });
                }}
                className="bg-[#FCF8E3] px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 active:bg-amber-200/50 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-2xl shrink-0">{opt.icon || '📜'}</span>
                  <span className="font-extrabold text-sm sm:text-base text-stone-950 truncate">
                    {opt.name}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    setInspectingOption({ law: activeLaw, option: opt });
                  }}
                  className="p-1 text-stone-700 hover:text-stone-950"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* B. MAIN REALM LAWS MENU (Matching IMG_6774.png) */}
      {!activeLaw && mainView === 'laws' && (
        <div className="flex-1 divide-y divide-amber-900/15 bg-[#FCF8E3]">
          
          {/* Imperial Rank Requirement Warning Banner */}
          {!isEmperor && (
            <div className="m-3 p-3 rounded-xl bg-amber-900/10 border border-amber-800/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-700/20 border border-amber-700/40 flex items-center justify-center text-lg shrink-0 mt-0.5">
                🔒
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs text-amber-950 uppercase tracking-wide flex items-center gap-1">
                  <span>Imperial Prerogative Required</span>
                </div>
                <div className="text-[11px] text-stone-700 font-medium leading-snug mt-0.5">
                  Realm Laws can only be decreed by an <strong>Emperor</strong> or <strong>Empress</strong>. Your current sovereign rank is <span className="font-bold text-amber-950">"{character.rank || character.title}"</span>. Expand realm holdings and vassals to ascend to Emperor!
                </div>
              </div>
            </div>
          )}

          {realmLaws.map((law) => {
            const currentOpt = law.options.find(o => o.id === law.currentOptionId);

            return (
              <div
                key={law.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedLawId(law.id);
                }}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 active:bg-amber-200/50 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-2xl shrink-0">{law.icon || '📜'}</span>
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm sm:text-base text-stone-950 truncate">
                      {law.title}
                    </div>
                    {currentOpt && (
                      <div className="text-xs font-semibold text-stone-600 truncate flex items-center gap-1 mt-0.5">
                        <span>Current:</span>
                        <span className="font-bold text-stone-900">{currentOpt.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-stone-700 shrink-0 stroke-[2.5]" />
              </div>
            );
          })}
        </div>
      )}

      {/* C. CROWN POWER & IMPERIAL DECREES */}
      {!activeLaw && mainView === 'crown_authority' && (
        <div className="p-4 space-y-4">
          
          {/* Crown Authority Tier Card */}
          <div className="bg-[#FAF4D3] rounded-xl p-4 border border-amber-900/20 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-amber-900/15 pb-2">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-700" />
                Imperial Crown Authority
              </h3>
              <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-400">
                Tier III: High Authority
              </span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Crown Authority determines the extent to which the Sovereign can compel vassals, seize titles, demand maximum levies, and outlaw private feudal wars.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-300 flex flex-col justify-between">
                <span className="font-bold text-stone-900">Demesne Levies</span>
                <span className="font-extrabold text-emerald-800 text-sm mt-1">+35% Available</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-300 flex flex-col justify-between">
                <span className="font-bold text-stone-900">Vassal Tax Rate</span>
                <span className="font-extrabold text-emerald-800 text-sm mt-1">+20% Standard</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-300 flex flex-col justify-between">
                <span className="font-bold text-stone-900">Title Revocation</span>
                <span className="font-extrabold text-blue-800 text-sm mt-1">Allowed with Mandate</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-300 flex flex-col justify-between">
                <span className="font-bold text-stone-900">Vassal War Right</span>
                <span className="font-extrabold text-red-800 text-sm mt-1">Crown Approval Req.</span>
              </div>
            </div>
          </div>

          {/* Additional Realm Decrees (Taxation & Military) */}
          {realmLaws.filter(l => l.categoryKey === 'taxation' || l.categoryKey === 'military').map((law) => {
            const cur = law.options.find(o => o.id === law.currentOptionId);

            return (
              <div key={law.id} className="bg-[#FAF4D3] rounded-xl p-4 border border-amber-900/20 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between border-b border-amber-900/15 pb-2">
                  <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                    <span>{law.icon || '⚖️'}</span>
                    {law.title}
                  </h3>
                  <span className="text-xs font-bold text-stone-600">
                    Active: <strong className="text-stone-950">{cur?.name}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {law.options.map((opt) => {
                    const isSelected = opt.id === law.currentOptionId;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          sound.playFanfare();
                          onEnactLaw(law.id, opt.id);
                        }}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#E3E8C4] border-amber-600 shadow-sm ring-1 ring-amber-500 font-bold'
                            : 'bg-stone-50 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{opt.icon || '📜'}</span>
                            <span className="font-bold text-xs text-stone-950">{opt.name}</span>
                          </div>
                          <div className="text-[11px] text-stone-600 mt-0.5">{opt.effects}</div>
                        </div>

                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <button className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-900 text-[10px] font-bold rounded shrink-0">
                            Enact
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* D. SPECIES RITES & POWERS */}
      {!activeLaw && mainView === 'powers' && (
        <div className="p-4 space-y-3">
          <div className="bg-[#FAF4D3] rounded-xl p-3.5 border border-amber-900/20 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-700" />
                {speciesInfo.title} Ancestral Powers
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Channel supernatural bloodline rites.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-stone-500 font-bold uppercase">{speciesInfo.specialResourceName}</div>
              <div className="text-base font-black text-emerald-800">
                {character.stats.specialResource} / 100
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {speciesAbilities.map((ability) => {
              const onCooldown = ability.currentCooldown > 0;
              const canAfford = 
                (!ability.cost.gold || character.stats.gold >= ability.cost.gold) &&
                (!ability.cost.specialResource || character.stats.specialResource >= ability.cost.specialResource) &&
                (!ability.cost.pietyOrMana || character.stats.pietyOrMana >= ability.cost.pietyOrMana) &&
                (!ability.cost.health || character.stats.health >= ability.cost.health);

              return (
                <div
                  key={ability.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-300 shadow-sm flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{ability.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-xs text-stone-950">{ability.name}</h4>
                        <div className="text-[10px] text-stone-500">Cooldown: {ability.cooldownTurns}y</div>
                      </div>
                    </div>

                    <div className="text-[10px] font-bold text-stone-600 text-right">
                      {ability.cost.gold && <span className="mr-1.5 text-amber-800">{ability.cost.gold} 🧈</span>}
                      {ability.cost.specialResource && <span className="mr-1.5 text-emerald-800">{ability.cost.specialResource} {speciesInfo.specialResourceIcon}</span>}
                      {ability.cost.pietyOrMana && <span className="text-blue-800">{ability.cost.pietyOrMana} ✝️</span>}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-snug">
                    {ability.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                    <div className="text-[11px] font-bold text-amber-900">
                      ⚡ {ability.effectSummary}
                    </div>

                    <button
                      onClick={() => {
                        sound.playMagic();
                        onUseSpeciesAbility(ability.id);
                      }}
                      disabled={onCooldown || !canAfford}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        onCooldown
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : canAfford
                          ? 'bg-[#C58F2C] hover:bg-amber-600 text-stone-950 active:scale-95 font-extrabold'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {onCooldown ? `Wait ${ability.currentCooldown}y` : 'Invoke'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* E. HIGH IMPERIAL COUNCIL */}
      {!activeLaw && mainView === 'council' && (
        <div className="p-4 space-y-3">
          <div className="bg-[#FAF4D3] rounded-xl p-3.5 border border-amber-900/20 shadow-sm">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-700" />
              The High Imperial Council
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Appoint vassals and councilors to administer the realm's military, diplomacy, and treasury.
            </p>
          </div>

          <div className="space-y-2.5">
            {councilRoles.map(({ role, title, icon, desc }) => {
              const appointee = vassals.find(v => v.councilRole === role);

              return (
                <div
                  key={role}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-300 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-stone-950 truncate">{title}</div>
                      <div className="text-[11px] text-stone-600 truncate">{desc}</div>
                      <div className="text-xs font-bold text-amber-900 mt-0.5">
                        {appointee ? `Appointed: ${appointee.name}` : 'Vacant Seat'}
                      </div>
                    </div>
                  </div>

                  <select
                    value={appointee?.id || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        sound.playCoin();
                        onAssignCouncil(e.target.value, role);
                      }
                    }}
                    className="bg-white border border-stone-400 text-stone-950 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-600 shrink-0 font-bold"
                  >
                    <option value="">Choose Noble...</option>
                    {vassals.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.species})
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LAW INSPECTION & ENACTMENT MODAL */}
      {inspectingOption && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8E7] rounded-2xl max-w-sm w-full border-2 border-amber-800/40 shadow-2xl overflow-hidden text-stone-950">
            
            {/* Modal Header */}
            <div className="bg-[#C58F2C] px-4 py-3 flex items-center justify-between border-b border-amber-900/20">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl shrink-0">{inspectingOption.option.icon || '📜'}</span>
                <div className="min-w-0">
                  <h3 className="font-black text-sm text-stone-950 truncate">
                    {inspectingOption.option.name}
                  </h3>
                  <div className="text-[11px] font-bold text-amber-950/80 truncate">
                    {inspectingOption.law.title}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectingOption(null)}
                className="p-1 text-stone-900 hover:text-stone-950"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 text-xs">
              
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-600">Status:</span>
                {inspectingOption.law.currentOptionId === inspectingOption.option.id ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Active Realm Law
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold">
                    Available for Enactment
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="p-3 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 leading-relaxed">
                {inspectingOption.option.description}
              </div>

              {/* Effects */}
              <div className="space-y-1">
                <span className="font-bold text-stone-900">Sovereign Effects:</span>
                <div className="p-2.5 rounded-lg bg-amber-100/70 border border-amber-300 text-amber-950 font-bold">
                  ⚡ {inspectingOption.option.effects}
                </div>
              </div>

              {/* Enactment Cost Requirements */}
              {inspectingOption.law.currentOptionId !== inspectingOption.option.id && (
                <div className="p-2.5 rounded-lg bg-stone-200 border border-stone-300 flex items-center justify-between">
                  <span className="font-bold text-stone-800">Enactment Cost:</span>
                  <div className="flex items-center gap-2 font-black text-stone-950">
                    {(inspectingOption.option.prestigeCost || 0) > 0 && (
                      <span className={`${character.stats.renown >= (inspectingOption.option.prestigeCost || 0) ? 'text-stone-900' : 'text-red-600'}`}>
                        👑 {inspectingOption.option.prestigeCost} Prestige
                      </span>
                    )}
                    {(inspectingOption.option.pietyCost || 0) > 0 && (
                      <span className={`${character.stats.pietyOrMana >= (inspectingOption.option.pietyCost || 0) ? 'text-stone-900' : 'text-red-600'}`}>
                        ✝️ {inspectingOption.option.pietyCost} Piety
                      </span>
                    )}
                    {!(inspectingOption.option.prestigeCost || inspectingOption.option.pietyCost) && (
                      <span className="text-emerald-700 font-bold">Free Decree</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-100 border-t border-stone-300 flex items-center gap-2">
              <button
                onClick={() => setInspectingOption(null)}
                className="flex-1 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-900 font-bold text-xs transition-colors"
              >
                Close
              </button>

              {inspectingOption.law.currentOptionId !== inspectingOption.option.id ? (
                !isEmperor ? (
                  <button
                    onClick={() => handleConfirmEnact(inspectingOption.law, inspectingOption.option)}
                    className="flex-1 py-2 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                    title="Emperor rank required"
                  >
                    <span>🔒 Enact (Emperor Only)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleConfirmEnact(inspectingOption.law, inspectingOption.option)}
                    className="flex-1 py-2 rounded-xl bg-[#C58F2C] hover:bg-amber-600 text-stone-950 font-black text-xs shadow-md active:scale-95 transition-transform"
                  >
                    Enact This Law
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs opacity-90 cursor-default flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Currently Enacted
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. REALM LAWS CODEX & HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8E7] rounded-2xl max-w-md w-full border-2 border-amber-800/40 shadow-2xl overflow-hidden text-stone-950 max-h-[85vh] flex flex-col">
            <div className="bg-[#C58F2C] px-4 py-3 flex items-center justify-between border-b border-amber-900/20 shrink-0">
              <h3 className="font-black text-base text-stone-950 flex items-center gap-1.5">
                <HelpCircle className="w-5 h-5" />
                Realm Laws & Succession Codex
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-stone-900 hover:text-stone-950"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto text-xs text-stone-800 leading-relaxed">
              <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-300">
                <h4 className="font-black text-stone-950 text-xs mb-1">⚥ Gender Succession</h4>
                <p>Governs inheritance rights by gender across children and dynasty members (Male Preference, Men Only, Equal, Female Preference, Women Only).</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 border border-stone-300">
                <h4 className="font-black text-stone-950 text-xs mb-1">👑 Imperial Succession</h4>
                <p>Allows activating the Imperial Elective Diet where Elector Counts and Marshals vote on the most qualified candidate to claim the imperial throne.</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 border border-stone-300">
                <h4 className="font-black text-stone-950 text-xs mb-1">💍 Marriage Laws</h4>
                <p>Determines kinship restrictions. Familial Ban prevents inbreeding penalties; Unrestricted Marriages allows preserving ancient supernatural bloodlines.</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 border border-stone-300">
                <h4 className="font-black text-stone-950 text-xs mb-1">👰 Polygamy</h4>
                <p>Enables the Sovereign to take multiple lawful spouses to secure multiple alliances and rapid dynastic expansion.</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 border border-stone-300">
                <h4 className="font-black text-stone-950 text-xs mb-1">🏰 Province Seizure</h4>
                <p>Empowers the Crown to revoke vassal titles and reclaim provincial holdings directly into the Imperial demesne.</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 border border-stone-300">
                <h4 className="font-black text-stone-950 text-xs mb-1">👨‍👩‍👦 Realm Succession</h4>
                <p>Defines how the primary crown passes on ruler death: Primogeniture (eldest), Ultimogeniture (youngest), Gavelkind (partitioned), or Elective.</p>
              </div>
            </div>

            <div className="p-3 bg-stone-100 border-t border-stone-300 shrink-0 text-center">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2 bg-[#C58F2C] hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl transition-colors"
              >
                Understood, Your Majesty
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
