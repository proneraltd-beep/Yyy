import React from 'react';
import { Character, FamilyMember, Species } from '../../types';
import { sound } from '../../utils/audio';

interface FamilyTreeScreenProps {
  playerCharacter: Character;
  familyMembers: FamilyMember[];
  onSelectMember: (memberId: string) => void;
  onBack: () => void;
}

export const FamilyTreeScreen: React.FC<FamilyTreeScreenProps> = ({
  playerCharacter,
  familyMembers,
  onSelectMember,
  onBack
}) => {
  const parents = familyMembers.filter(m => m.relation === 'Father' || m.relation === 'Mother');
  const spouses = familyMembers.filter(m => m.relation === 'Spouse');
  const siblings = familyMembers.filter(m => m.relation === 'Sibling');
  const children = familyMembers.filter(m => m.relation === 'Child');
  const grandchildren = familyMembers.filter(m => m.relation === 'Grandchild');
  const cousins = familyMembers.filter(m => m.relation === 'Cousin');

  return (
    <div className="min-h-[580px] bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-2xl flex flex-col font-sans overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button
          onClick={() => { sound.playClick(); onBack(); }}
          className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        
        <div className="flex items-center gap-1.5 font-bold text-base text-[#181512]">
          <span>Family Tree</span>
          <span className="w-4 h-4 rounded-full bg-[#FAF7EB]/40 text-[10px] flex items-center justify-center font-bold">?</span>
        </div>

        <button
          onClick={() => { sound.playClick(); onBack(); }}
          className="w-7 h-7 flex items-center justify-center text-lg font-bold text-[#181512] hover:opacity-80 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Main Tree Canvas Area */}
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[620px] space-y-6">
        
        <div className="text-center mb-2">
          <h2 className="text-base font-extrabold text-stone-900 tracking-wide font-cinzel">
            The Royal Lineage of {playerCharacter.dynastyName || 'House Sovereign'}
          </h2>
          <p className="text-xs text-stone-600">
            Select any ancestor, consort, or descendant to inspect full dossier and political actions.
          </p>
        </div>

        {/* Level 1: Ancestors / Parents */}
        <div className="bg-[#EFEAD3]/80 p-4 rounded-xl border border-stone-300">
          <div className="text-[11px] font-extrabold text-stone-600 uppercase tracking-wider mb-3 text-center">
            ── Generation I: Forebears & Parents ──
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {parents.length > 0 ? (
              parents.map(parent => (
                <div
                  key={parent.id}
                  onClick={() => { sound.playClick(); onSelectMember(parent.id); }}
                  className="bg-[#FFFDF6] p-3 rounded-lg border border-stone-300 hover:border-amber-600 shadow-sm cursor-pointer transition-all flex items-center gap-3 w-60 hover:scale-102"
                >
                  <span className="text-3xl">{parent.portrait}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-stone-900 truncate">{parent.name}</div>
                    <div className="text-[10px] text-stone-600">{parent.relation} • {parent.alive ? `Age ${parent.age}` : `🪦 Deceased (${parent.causeOfDeath || 'Natural Causes'})`}</div>
                    <div className="text-[10px] text-amber-800 font-semibold">{parent.title}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-stone-500 italic">Forebears recorded in royal archives.</div>
            )}
          </div>
        </div>

        {/* Tree Branch Connector */}
        <div className="flex justify-center -my-3">
          <div className="w-0.5 h-6 bg-stone-400"></div>
        </div>

        {/* Level 2: Ruler & Spouses & Siblings */}
        <div className="bg-[#E8E2C4] p-4 rounded-xl border border-stone-400/80 shadow-md">
          <div className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider mb-3 text-center">
            ── Generation II: Sovereign, Consorts & Royal Siblings ──
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-3">
            {/* The Sovereign (Player) */}
            <div className="bg-[#FFF8D6] p-3.5 rounded-xl border-2 border-[#D49B28] shadow-md flex items-center gap-3 w-64 ring-2 ring-[#D49B28]/30">
              <div className="w-12 h-12 rounded-lg bg-[#D49B28] flex items-center justify-center text-3xl shrink-0">
                {playerCharacter.portrait}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-xs text-stone-900 truncate">{playerCharacter.name}</span>
                  <span className="text-[9px] bg-amber-800 text-amber-100 font-bold px-1.5 py-0.2 rounded">RULER</span>
                </div>
                <div className="text-[11px] text-stone-700 font-medium">{playerCharacter.rank} • Age {playerCharacter.age}</div>
                <div className="text-[10px] text-stone-600 truncate">{playerCharacter.species} • {playerCharacter.dynastyName}</div>
              </div>
            </div>

            {/* Marriage Link Heart */}
            <span className="text-xl text-rose-600 font-bold">💍</span>

            {/* Spouses */}
            {spouses.length > 0 ? (
              spouses.map(spouse => (
                <div
                  key={spouse.id}
                  onClick={() => { sound.playClick(); onSelectMember(spouse.id); }}
                  className="bg-[#FFFDF6] p-3 rounded-lg border border-rose-300 hover:border-rose-600 shadow-sm cursor-pointer transition-all flex items-center gap-3 w-60 hover:scale-102"
                >
                  <span className="text-3xl">{spouse.portrait}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-stone-900 truncate">{spouse.name}</span>
                      <span className="text-[9px] bg-rose-200 text-rose-900 font-bold px-1 rounded">SPOUSE</span>
                    </div>
                    <div className="text-[10px] text-stone-600">{spouse.species} • Age {spouse.age}</div>
                    <div className="text-[10px] text-rose-800 font-semibold">{spouse.title}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-stone-600 italic bg-[#FFFDF6] p-3 rounded-lg border border-dashed border-stone-300">
                No Royal Consort yet.
              </div>
            )}
          </div>

          {/* Siblings */}
          {siblings.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-300/80">
              <div className="text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-2 text-center">Siblings:</div>
              <div className="flex flex-wrap justify-center gap-2">
                {siblings.map(sib => (
                  <div
                    key={sib.id}
                    onClick={() => { sound.playClick(); onSelectMember(sib.id); }}
                    className="bg-[#FFFDF6] px-3 py-2 rounded-lg border border-stone-300 hover:border-amber-600 shadow-xs cursor-pointer flex items-center gap-2 text-xs hover:scale-102 transition-all"
                  >
                    <span>{sib.portrait}</span>
                    <span className="font-bold text-stone-800">{sib.name} ({sib.age})</span>
                    <span className="text-[10px] text-stone-500">({sib.gender === 'Male' ? 'Brother' : 'Sister'})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tree Branch Connector */}
        <div className="flex justify-center -my-3">
          <div className="w-0.5 h-6 bg-stone-400"></div>
        </div>

        {/* Level 3: Children / Successors */}
        <div className="bg-[#EFEAD3]/80 p-4 rounded-xl border border-stone-300">
          <div className="text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-3 text-center">
            ── Generation III: Royal Offspring & Successors ({children.length}) ──
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {children.length > 0 ? (
              children.map(child => (
                <div
                  key={child.id}
                  onClick={() => { sound.playClick(); onSelectMember(child.id); }}
                  className={`bg-[#FFFDF6] p-3 rounded-xl border shadow-sm cursor-pointer transition-all flex items-center gap-3 w-64 hover:scale-102 ${
                    child.isHeir ? 'border-amber-600 ring-2 ring-amber-400/40 bg-amber-50/60' : 'border-stone-300 hover:border-amber-500'
                  }`}
                >
                  <div className="text-3xl">{child.portrait}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-stone-900 truncate">{child.name}</span>
                      {child.isHeir && (
                        <span className="text-[9px] bg-[#D49B28] text-stone-950 font-black px-1.5 py-0.2 rounded">HEIR</span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-600">{child.gender === 'Male' ? 'Son' : 'Daughter'} • Age {child.age}</div>
                    <div className="text-[10px] text-amber-800 font-semibold truncate">{child.title}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-stone-500 italic py-2">No direct offspring yet.</div>
            )}
          </div>
        </div>

        {/* Level 4: Grandchildren & Extended Cousins */}
        {(grandchildren.length > 0 || cousins.length > 0) && (
          <div className="bg-[#EFEAD3]/60 p-4 rounded-xl border border-stone-300">
            <div className="text-[11px] font-extrabold text-stone-600 uppercase tracking-wider mb-3 text-center">
              ── Generation IV & Extended Dynasty Branch ──
            </div>
            
            <div className="flex flex-wrap justify-center gap-2.5">
              {grandchildren.map(gc => (
                <div
                  key={gc.id}
                  onClick={() => { sound.playClick(); onSelectMember(gc.id); }}
                  className="bg-[#FFFDF6] px-3 py-2 rounded-lg border border-stone-300 hover:border-amber-600 shadow-xs cursor-pointer flex items-center gap-2 text-xs hover:scale-102 transition-all"
                >
                  <span>{gc.portrait}</span>
                  <span className="font-bold text-stone-800">{gc.name} ({gc.age})</span>
                  <span className="text-[10px] text-stone-500">({gc.gender === 'Male' ? 'Grandson' : 'Granddaughter'})</span>
                </div>
              ))}

              {cousins.map(cousin => (
                <div
                  key={cousin.id}
                  onClick={() => { sound.playClick(); onSelectMember(cousin.id); }}
                  className="bg-[#FFFDF6] px-3 py-2 rounded-lg border border-stone-300 hover:border-amber-600 shadow-xs cursor-pointer flex items-center gap-2 text-xs hover:scale-102 transition-all"
                >
                  <span>{cousin.portrait}</span>
                  <span className="font-bold text-stone-800">{cousin.name} ({cousin.age})</span>
                  <span className="text-[10px] text-stone-500">(Cousin)</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
