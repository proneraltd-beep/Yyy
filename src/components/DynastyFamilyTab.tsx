import React, { useState } from 'react';
import { Character, FamilyMember, Province, Realm, Species } from '../types';
import { SPECIES_DATA, CROSS_MARRIAGE_OUTCOMES } from '../data/speciesData';
import { sound } from '../utils/audio';
import { CharacterDetailScreen } from './dynasty/CharacterDetailScreen';
import { FamilyTreeScreen } from './dynasty/FamilyTreeScreen';
import { PastRelationshipsScreen } from './dynasty/PastRelationshipsScreen';

interface DynastyFamilyTabProps {
  character: Character;
  familyMembers: FamilyMember[];
  realms: Realm[];
  provinces?: Province[];
  totalArmyPower?: number;
  onDesignateHeir: (memberId: string) => void;
  onSetEducationTrack: (memberId: string, track: string, mentorName?: string) => void;
  onStudyHarder: (memberId: string, cost: number) => void;
  onGiftFamilyMember: (memberId: string, goldAmount: number) => void;
  onSpendTimeWithMember: (memberId: string) => void;
  onProposeCrossMarriage: (targetRealmId: string, partnerSpecies: Species, partnerName: string, dowry: number) => void;
  onUpdateFamilyMember?: (member: FamilyMember) => void;
  onUpdateFamilyMembers?: (members: FamilyMember[]) => void;
  onUpdatePlayerGold?: (newGold: number) => void;
  onBackToChronicle?: () => void;
}

type ActiveView = 'relations_list' | 'character_detail' | 'family_tree' | 'past_relationships';

export const DynastyFamilyTab: React.FC<DynastyFamilyTabProps> = ({
  character,
  familyMembers,
  realms,
  provinces = [],
  totalArmyPower = 51300,
  onDesignateHeir,
  onSetEducationTrack,
  onStudyHarder,
  onGiftFamilyMember,
  onSpendTimeWithMember,
  onProposeCrossMarriage,
  onUpdateFamilyMember,
  onUpdateFamilyMembers,
  onUpdatePlayerGold,
  onBackToChronicle
}) => {
  const [activeView, setActiveView] = useState<ActiveView>('relations_list');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showMatchmakingModal, setShowMatchmakingModal] = useState<boolean>(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState<boolean>(false);

  // Cross-realm proposal local state
  const [selectedRealmId, setSelectedRealmId] = useState<string>(realms[1]?.id || 'realm_vampire');
  const [partnerSpecies, setPartnerSpecies] = useState<Species>('Vampire');
  const [partnerName, setPartnerName] = useState<string>('Lady Seraphina of Sangreal');
  const [dowryAmount, setDowryAmount] = useState<number>(100);

  // Group family members by relation categories matching the screenshots
  const primaryHeir = familyMembers.find(m => m.isHeir && m.alive) || familyMembers.find(m => m.relation === 'Child' && m.alive);
  const spouses = familyMembers.filter(m => m.relation === 'Spouse' && m.alive);
  const children = familyMembers.filter(m => m.relation === 'Child' && m.alive);
  const grandchildren = familyMembers.filter(m => m.relation === 'Grandchild' && m.alive);
  const siblings = familyMembers.filter(m => m.relation === 'Sibling' && m.alive);
  const cousins = familyMembers.filter(m => m.relation === 'Cousin' && m.alive);
  const enemies = familyMembers.filter(m => m.relation === 'Enemy' && m.alive);
  const advisors = familyMembers.filter(m => (m.relation === 'Advisor' || m.opinion > 60) && m.alive);

  const selectedMember = familyMembers.find(m => m.id === selectedMemberId);

  const handleOpenCharacter = (memberId: string) => {
    sound.playClick();
    setSelectedMemberId(memberId);
    setActiveView('character_detail');
  };

  const handleUpdateMember = (updated: FamilyMember) => {
    if (onUpdateFamilyMember) {
      onUpdateFamilyMember(updated);
    } else if (onUpdateFamilyMembers) {
      onUpdateFamilyMembers(familyMembers.map(m => m.id === updated.id ? updated : m));
    }
  };

  const handleUpdateGold = (newGold: number) => {
    if (onUpdatePlayerGold) {
      onUpdatePlayerGold(newGold);
    }
  };

  const handleProposeMarriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playFanfare();
    onProposeCrossMarriage(selectedRealmId, partnerSpecies, partnerName, dowryAmount);
    setShowMatchmakingModal(false);
  };

  // Helper for rendering person row matching screenshot
  const renderPersonRow = (member: FamilyMember, labelOverride?: string) => {
    const isBlood = member.relation === 'Child' || member.relation === 'Father' || member.relation === 'Mother' || member.relation === 'Sibling' || member.relation === 'Grandchild' || member.relation === 'Cousin' || member.isBloodRelation;
    const isPositive = member.opinion >= 0;
    const opinionPercent = Math.min(100, Math.max(0, Math.abs(member.opinion)));

    return (
      <div
        key={member.id}
        onClick={() => handleOpenCharacter(member.id)}
        className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors border-b border-stone-200/90 flex items-center justify-between gap-3 cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
            {member.portrait}
          </div>

          <div className="min-w-0">
            <div className="font-extrabold text-xs sm:text-sm text-stone-900 truncate">
              {member.name} ({member.age}) {labelOverride ? `(${labelOverride})` : `(${member.relation})`}
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              {/* Blood Drop indicator */}
              {isBlood && <span className="text-rose-600 text-xs">🩸</span>}
              {member.isFavorite && <span className="text-amber-500 text-xs">⭐</span>}

              {/* Relationship Bar matching screenshot */}
              <div className="w-28 sm:w-36 h-2 bg-stone-300 rounded-full overflow-hidden flex">
                {isPositive ? (
                  <>
                    <div className="h-full bg-stone-300" style={{ width: `${100 - opinionPercent}%` }} />
                    <div className="h-full bg-emerald-700" style={{ width: `${opinionPercent}%` }} />
                  </>
                ) : (
                  <>
                    <div className="h-full bg-stone-300" style={{ width: `${100 - opinionPercent}%` }} />
                    <div className="h-full bg-red-800" style={{ width: `${opinionPercent}%` }} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-stone-400 font-bold text-lg group-hover:text-stone-700 transition-colors">
          ›
        </div>
      </div>
    );
  };

  // Helper for Section Category Header Banner matching screenshot
  const renderCategoryHeader = (title: string) => (
    <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs">
      <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide font-sans">
        {title}
      </span>
    </div>
  );

  // Sub-views switching
  if (activeView === 'family_tree') {
    return (
      <FamilyTreeScreen
        playerCharacter={character}
        familyMembers={familyMembers}
        onSelectMember={(id) => {
          setSelectedMemberId(id);
          setActiveView('character_detail');
        }}
        onBack={() => setActiveView('relations_list')}
      />
    );
  }

  if (activeView === 'past_relationships') {
    return (
      <PastRelationshipsScreen
        playerCharacter={character}
        familyMembers={familyMembers}
        onSelectMember={(id) => {
          setSelectedMemberId(id);
          setActiveView('character_detail');
        }}
        onBack={() => setActiveView('relations_list')}
      />
    );
  }

  if (activeView === 'character_detail' && selectedMember) {
    return (
      <CharacterDetailScreen
        character={selectedMember}
        playerCharacter={character}
        provinces={provinces}
        onBack={() => setActiveView('relations_list')}
        onUpdateMember={handleUpdateMember}
        onUpdatePlayerGold={handleUpdateGold}
        onDesignateHeir={onDesignateHeir}
        onOpenFamilyTree={() => setActiveView('family_tree')}
      />
    );
  }

  // Format army troops number (e.g. 51.3k)
  const formattedArmy = totalArmyPower >= 1000 
    ? `${(totalArmyPower / 1000).toFixed(1)}k` 
    : totalArmyPower.toString();

  return (
    <div className="max-w-3xl mx-auto pb-16 font-sans">
      
      {/* Container with rounded top and border matching screenshot */}
      <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl border border-stone-400/60 shadow-2xl overflow-hidden">
        
        {/* Top Gold / Ochre Header Card (#D49B28) */}
        <div className="bg-[#D49B28] px-4 sm:px-5 py-3.5 border-b border-[#B78722] text-[#181512]">
          
          {/* Top Line: Monarch Name & 4 Stat Badges */}
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

            {/* 4 Stats: 👑 Prestige, ✝️ Piety/Mana, 🧈 Gold, ⚔️ Troops */}
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
                <span>{formattedArmy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Header Bar: `< Relations (?) ✕` */}
        <div className="bg-[#D49B28] px-4 py-2.5 border-t border-b border-[#B78722] flex items-center justify-between text-[#181512] shadow-sm">
          <button
            onClick={() => { sound.playClick(); if (onBackToChronicle) onBackToChronicle(); }}
            className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="text-xl leading-none">‹</span>
          </button>
          
          <div className="flex items-center gap-1.5 font-bold text-base text-[#181512]">
            <span>Relations</span>
            <button 
              onClick={() => setShowInfoTooltip(!showInfoTooltip)}
              className="w-4 h-4 rounded-full bg-[#FAF7EB]/40 hover:bg-[#FAF7EB]/60 text-[10px] flex items-center justify-center font-bold cursor-pointer"
            >
              ?
            </button>
          </div>

          <button
            onClick={() => setShowMatchmakingModal(true)}
            title="Arrange Cross-Realm Marriage"
            className="px-2.5 py-1 bg-[#FAF7EB]/40 hover:bg-[#FAF7EB]/70 rounded-lg text-xs font-bold text-stone-950 flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>💍 Match</span>
          </button>
        </div>

        {/* Info Tooltip Banner */}
        {showInfoTooltip && (
          <div className="bg-stone-900 text-amber-100 text-xs p-3 border-b border-amber-800/50 space-y-1">
            <div className="font-bold text-amber-300">Dynasty & Court Relations Guide:</div>
            <p>
              Tap on any dynastic heir, consort, sibling, or courtier to inspect their dossier, grant landed counties, assign tutelage wards, send royal gifts, or plot political intrigue.
            </p>
          </div>
        )}

        {/* Main List Sections */}
        <div className="divide-y divide-stone-200">
          
          {/* SECTION: ACTIONS */}
          <div>
            {renderCategoryHeader('Actions')}
            <div className="divide-y divide-stone-200">
              {/* Family Tree */}
              <div
                onClick={() => { sound.playClick(); setActiveView('family_tree'); }}
                className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👨‍👩‍👧</span>
                  <span className="font-extrabold text-xs sm:text-sm text-stone-900">Family Tree</span>
                </div>
                <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">›</span>
              </div>

              {/* Past Relationships */}
              <div
                onClick={() => { sound.playClick(); setActiveView('past_relationships'); }}
                className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🪦</span>
                  <span className="font-extrabold text-xs sm:text-sm text-stone-900">Past Relationships</span>
                </div>
                <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">›</span>
              </div>
            </div>
          </div>

          {/* SECTION: HEIR */}
          {primaryHeir && (
            <div>
              {renderCategoryHeader('Heir')}
              {renderPersonRow(primaryHeir, primaryHeir.gender === 'Male' ? 'Son' : 'Daughter')}
            </div>
          )}

          {/* SECTION: SPOUSE */}
          {spouses.length > 0 && (
            <div>
              {renderCategoryHeader('Spouse')}
              {spouses.map(sp => renderPersonRow(sp, 'Spouse'))}
            </div>
          )}

          {/* SECTION: CHILDREN */}
          {children.length > 0 && (
            <div>
              {renderCategoryHeader('Children')}
              {children.map(child => renderPersonRow(child, child.gender === 'Male' ? 'Son' : 'Daughter'))}
            </div>
          )}

          {/* SECTION: GRANDCHILDREN */}
          {grandchildren.length > 0 && (
            <div>
              {renderCategoryHeader('Grandchildren')}
              {grandchildren.map(gc => renderPersonRow(gc, gc.gender === 'Male' ? 'Grandson' : 'Granddaughter'))}
            </div>
          )}

          {/* SECTION: SIBLINGS */}
          {siblings.length > 0 && (
            <div>
              {renderCategoryHeader('Siblings')}
              {siblings.map(sib => renderPersonRow(sib, sib.gender === 'Male' ? 'Brother' : 'Sister'))}
            </div>
          )}

          {/* SECTION: COUSINS */}
          {cousins.length > 0 && (
            <div>
              {renderCategoryHeader('Cousins')}
              {cousins.map(cos => renderPersonRow(cos, 'Cousin'))}
            </div>
          )}

          {/* SECTION: ENEMIES */}
          {enemies.length > 0 && (
            <div>
              {renderCategoryHeader('Enemies')}
              {enemies.map(en => renderPersonRow(en, 'Rival'))}
            </div>
          )}

          {/* SECTION: ADVISORS */}
          {advisors.length > 0 && (
            <div>
              {renderCategoryHeader('Advisors')}
              {advisors.map(adv => renderPersonRow(adv, adv.title || 'Councillor'))}
            </div>
          )}

        </div>
      </div>

      {/* Cross-Realm Marriage Matchmaking Modal */}
      {showMatchmakingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-2xl max-w-lg w-full p-5 text-stone-900 shadow-2xl animate-fade-in font-sans">
            
            <div className="flex items-center justify-between border-b border-stone-300 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💍</span>
                <h3 className="font-extrabold text-base text-stone-900 font-cinzel">
                  Arrange Cross-Realm Royal Marriage
                </h3>
              </div>
              <button
                onClick={() => setShowMatchmakingModal(false)}
                className="text-stone-600 hover:text-stone-900 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProposeMarriageSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Target Foreign Realm</label>
                <select
                  value={selectedRealmId}
                  onChange={(e) => {
                    const rId = e.target.value;
                    setSelectedRealmId(rId);
                    const realmObj = realms.find(r => r.id === rId);
                    if (realmObj) {
                      setPartnerSpecies(realmObj.dominantSpecies);
                      setPartnerName(
                        realmObj.dominantSpecies === 'Vampire' ? 'Countess Carmilla the Pale' :
                        realmObj.dominantSpecies === 'Werewolf' ? 'Lady Freya of Ironclaw' :
                        realmObj.dominantSpecies === 'Witch' ? 'Mistress Morgana of Eldermist' :
                        realmObj.dominantSpecies === 'Elf' ? 'Lady Sylvanna Sun-strider' :
                        'Lady Eleanor of Valoria'
                      );
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-stone-300 font-semibold text-stone-900"
                >
                  {realms.filter(r => r.id !== character.realmId).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.dominantSpecies} Realm)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Noble Suitor / Consort Name</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-stone-300 font-semibold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  Royal Dowry Offering: <span className="font-mono text-amber-900">{dowryAmount} Gold 🪙</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="350"
                  step="25"
                  value={dowryAmount}
                  onChange={(e) => setDowryAmount(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-600 mt-1">
                  <span>50 Gold (Modest)</span>
                  <span>200 Gold (Generous)</span>
                  <span>350 Gold (Imperial Splendor)</span>
                </div>
              </div>

              {/* Cross species outcome preview */}
              {character.species !== partnerSpecies && (
                <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300 text-[11px] text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <span>🧬</span>
                    <span>Cross-Species Offspring Potential:</span>
                  </div>
                  <div>
                    Children born of {character.species} and {partnerSpecies} lineage will inherit hybrid traits, mystical resistance, and cross-realm cultural affinity!
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMatchmakingModal(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 font-bold text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={character.stats.gold < dowryAmount}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    character.stats.gold >= dowryAmount
                      ? 'bg-[#D49B28] hover:bg-[#B78722] text-stone-950 shadow-md'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  {character.stats.gold >= dowryAmount ? `Send Proposal (${dowryAmount} 🪙)` : 'Insufficient Gold'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
