import React from 'react';
import { Character, FamilyMember } from '../../types';
import { sound } from '../../utils/audio';

interface PastRelationshipsScreenProps {
  playerCharacter: Character;
  familyMembers: FamilyMember[];
  onSelectMember: (memberId: string) => void;
  onBack: () => void;
}

export const PastRelationshipsScreen: React.FC<PastRelationshipsScreenProps> = ({
  playerCharacter,
  familyMembers,
  onSelectMember,
  onBack
}) => {
  const deceasedMembers = familyMembers.filter(m => !m.alive);

  // Fallback deceased entries if none exist yet
  const displayDeceased: FamilyMember[] = deceasedMembers.length > 0 ? deceasedMembers : [
    {
      id: 'past_ruler_1',
      name: 'King Roderick I "The Ironhearted"',
      species: playerCharacter.species,
      gender: 'Male',
      relation: 'Father',
      age: 64,
      alive: false,
      health: 0,
      opinion: 95,
      childrenIds: [playerCharacter.id],
      realmId: playerCharacter.realmId,
      title: 'Late High King of Valoria',
      isHeir: false,
      traits: ['Grand Conqueror', 'Legendary Ruler', 'Unyielding'],
      causeOfDeath: 'Old Age & Battle Wounds',
      portrait: '👑',
      culture: 'Gaelic',
      stats: { martial: 88, diplomacy: 75, intrigue: 60, intellect: 80, prowess: 84, stewardship: 78 }
    },
    {
      id: 'past_ruler_2',
      name: 'Queen Yvaine "The Blessed"',
      species: playerCharacter.species,
      gender: 'Female',
      relation: 'Mother',
      age: 58,
      alive: false,
      health: 0,
      opinion: 92,
      childrenIds: [playerCharacter.id],
      realmId: playerCharacter.realmId,
      title: 'Late Queen Mother',
      isHeir: false,
      traits: ['Beloved', 'Devout', 'Saintly Patron'],
      causeOfDeath: 'Winter Fever',
      portrait: '👸',
      culture: 'Gaelic',
      stats: { martial: 40, diplomacy: 92, intrigue: 50, intellect: 88, prowess: 35, stewardship: 85 }
    },
    {
      id: 'past_spouse_1',
      name: 'Princess Rosamund of Aquitaine',
      species: 'Human',
      gender: 'Female',
      relation: 'Spouse',
      age: 26,
      alive: false,
      health: 0,
      opinion: 88,
      childrenIds: [],
      realmId: playerCharacter.realmId,
      title: 'Former Royal Consort',
      isHeir: false,
      traits: ['Poetic Grace', 'Frail'],
      causeOfDeath: 'Childbed Malady',
      portrait: '🥀',
      culture: 'Frankish',
      stats: { martial: 30, diplomacy: 85, intrigue: 65, intellect: 78, prowess: 25, stewardship: 70 }
    }
  ];

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
          <span>Past Relationships & Tombs</span>
          <span className="w-4 h-4 rounded-full bg-[#FAF7EB]/40 text-[10px] flex items-center justify-center font-bold">?</span>
        </div>

        <button
          onClick={() => { sound.playClick(); onBack(); }}
          className="w-7 h-7 flex items-center justify-center text-lg font-bold text-[#181512] hover:opacity-80 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Main List */}
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[620px] space-y-4">
        <div className="text-center mb-2">
          <h2 className="text-base font-extrabold text-stone-900 tracking-wide font-cinzel">
            Royal Necropolis & Memorial Annals
          </h2>
          <p className="text-xs text-stone-600">
            Departed forebears, former consorts, and fallen heirs enshrined in the ancestral crypt.
          </p>
        </div>

        <div className="space-y-3">
          {displayDeceased.map(member => (
            <div
              key={member.id}
              onClick={() => { sound.playClick(); onSelectMember(member.id); }}
              className="bg-[#FFFDF6] p-4 rounded-xl border border-stone-300 hover:border-stone-500 shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3 hover:scale-101"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-stone-200 border border-stone-400 flex items-center justify-center text-3xl shrink-0 grayscale opacity-85">
                  {member.portrait}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-stone-900 truncate">{member.name}</span>
                    <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span>🪦</span>
                      <span>DECEASED</span>
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 font-medium">
                    {member.title} • {member.relation} (Died at Age {member.age})
                  </div>
                  <div className="text-[11px] text-rose-900 font-semibold mt-0.5">
                    Cause: {member.causeOfDeath || 'Natural Causes'}
                  </div>
                </div>
              </div>

              <div className="text-stone-400 text-lg font-bold">›</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
