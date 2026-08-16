import React, { useState } from 'react';
import { Character, FamilyMember, Province, Species } from '../../types';
import { sound } from '../../utils/audio';

// ─────────────────────────────────────────────────────────────
// 1. STATS SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface StatsScreenProps {
  character: FamilyMember;
  onBack: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ character, onBack }) => {
  const stats = character.stats || {
    martial: 65,
    diplomacy: 72,
    intrigue: 58,
    intellect: 75,
    prowess: 60,
    stewardship: 70
  };

  const statItems = [
    { label: 'Martial (Warfare & Commands)', value: stats.martial, icon: '⚔️', desc: 'Determines troop morale, battlefield tactical prowess, and levy command effectiveness.' },
    { label: 'Diplomacy (Rhetoric & Charisma)', value: stats.diplomacy, icon: '📜', desc: 'Affects opinion gain from gifts, vassal loyalty, peace treaties, and court prestige.' },
    { label: 'Intrigue (Subterfuge & Secrets)', value: stats.intrigue, icon: '🗡️', desc: 'Increases success of assassination schemes, blackmail, and counter-espionage.' },
    { label: 'Intellect (Learning & Lore)', value: stats.intellect, icon: '📖', desc: 'Accelerates cultural tech, mystical understanding, and tutelage quality.' },
    { label: 'Prowess (Personal Combat)', value: stats.prowess, icon: '🛡️', desc: 'Individual dueling ability, survival in hunts/tournaments, and battlefield defense.' },
    { label: 'Stewardship (Domain & Coin)', value: stats.stewardship, icon: '🪙', desc: 'Increases tax yields, holding capacity, building speeds, and trade caravan profits.' }
  ];

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Character Stats</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-3 bg-[#FFFDF6] p-3 rounded-xl border border-stone-300">
          <span className="text-3xl">{character.portrait}</span>
          <div>
            <div className="font-bold text-sm text-stone-900">{character.name}</div>
            <div className="text-xs text-stone-600">{character.title} • Age {character.age}</div>
          </div>
        </div>

        <div className="space-y-3">
          {statItems.map(st => (
            <div key={st.label} className="bg-[#FFFDF6] p-3.5 rounded-xl border border-stone-300 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <span>{st.icon}</span>
                  <span>{st.label}</span>
                </span>
                <span className="font-mono text-sm text-amber-900 font-extrabold">{st.value} / 100</span>
              </div>
              
              <div className="w-full h-3 bg-stone-300 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    st.value >= 80 ? 'bg-emerald-600' : st.value >= 60 ? 'bg-amber-600' : 'bg-amber-800'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, st.value))}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-600">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. TRAITS SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface TraitsScreenProps {
  character: FamilyMember;
  onBack: () => void;
}

export const TraitsScreen: React.FC<TraitsScreenProps> = ({ character, onBack }) => {
  const traits = character.traits.length > 0 ? character.traits : ['Diligent', 'Noble Blood', 'Charismatic'];

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Traits & Heritage</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-3 bg-[#FFFDF6] p-3 rounded-xl border border-stone-300">
          <span className="text-3xl">{character.portrait}</span>
          <div>
            <div className="font-bold text-sm text-stone-900">{character.name}</div>
            <div className="text-xs text-stone-600">{character.species} • {traits.length} Traits Active</div>
          </div>
        </div>

        <div className="space-y-2.5">
          {traits.map(trait => (
            <div key={trait} className="bg-[#FFFDF6] p-3 rounded-xl border border-stone-300 flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-lg shrink-0">
                🧬
              </div>
              <div>
                <div className="font-bold text-xs text-stone-900">{trait}</div>
                <div className="text-[11px] text-stone-600 mt-0.5">
                  {trait.includes('Ruler') || trait.includes('Crown') ? '+15 Renown, +10 Diplomacy with peers.' :
                   trait.includes('Knight') || trait.includes('Martial') ? '+10 Martial, +8 Prowess in duels.' :
                   trait.includes('Scholar') || trait.includes('Lore') ? '+12 Intellect, +5 Piety generation.' :
                   '+5 Opinion baseline, improves general court standing.'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. CULTURE & SPECIES SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface CultureScreenProps {
  character: FamilyMember;
  onBack: () => void;
}

export const CultureScreen: React.FC<CultureScreenProps> = ({ character, onBack }) => {
  const culture = character.culture || 'Gaelic';

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Culture & Tradition</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="bg-[#FFFDF6] p-4 rounded-xl border border-stone-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h3 className="font-extrabold text-sm text-stone-900 font-cinzel">Culture: {culture}</h3>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            The traditional customs, laws of succession, and chivalric codes of the {culture} people. Fosters deep loyalty among kin and resistance against foreign usurpers.
          </p>
        </div>

        <div className="bg-[#FFFDF6] p-4 rounded-xl border border-stone-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h3 className="font-extrabold text-sm text-stone-900 font-cinzel">Species: {character.species}</h3>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            Natural physiological gifts and supernatural traits associated with the {character.species} bloodline across the multi-species realms.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 4. REALM & COUNTY FIEFDOM SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface RealmFiefdomScreenProps {
  character: FamilyMember;
  onBack: () => void;
}

export const RealmFiefdomScreen: React.FC<RealmFiefdomScreenProps> = ({ character, onBack }) => {
  const county = character.countyName || 'The County of Brecknock';

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Realm & County Title</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="bg-[#FFFDF6] p-4 rounded-xl border border-stone-300 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🚩</span>
            <div>
              <h3 className="font-extrabold text-sm text-stone-900 font-cinzel">{county}</h3>
              <p className="text-xs text-stone-600">Landed Fiefdom under royal crown liege</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200 text-xs">
            <div className="bg-[#FAF7EB] p-2.5 rounded-lg border border-stone-300">
              <span className="text-stone-600 block text-[10px] uppercase font-bold">Troop Levies</span>
              <span className="font-bold text-stone-900 text-sm">1,250 Men-at-arms</span>
            </div>
            <div className="bg-[#FAF7EB] p-2.5 rounded-lg border border-stone-300">
              <span className="text-stone-600 block text-[10px] uppercase font-bold">Annual Tax Yield</span>
              <span className="font-bold text-amber-900 text-sm">45 Gold / Year</span>
            </div>
            <div className="bg-[#FAF7EB] p-2.5 rounded-lg border border-stone-300">
              <span className="text-stone-600 block text-[10px] uppercase font-bold">Prosperity Level</span>
              <span className="font-bold text-emerald-800 text-sm">78% (Thriving)</span>
            </div>
            <div className="bg-[#FAF7EB] p-2.5 rounded-lg border border-stone-300">
              <span className="text-stone-600 block text-[10px] uppercase font-bold">Public Order</span>
              <span className="font-bold text-stone-900 text-sm">92% (Peaceful)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 5. ROYAL DIALOGUE (TALK) SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface TalkDialogueScreenProps {
  character: FamilyMember;
  playerCharacter: Character;
  onOpinionChange: (delta: number) => void;
  onBack: () => void;
}

export const TalkDialogueScreen: React.FC<TalkDialogueScreenProps> = ({
  character,
  playerCharacter,
  onOpinionChange,
  onBack
}) => {
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ sender: string; text: string }>>([
    { sender: character.name, text: `Greetings, my liege. It is always an honor to receive your royal presence. How may I serve your grace today?` }
  ]);

  const choices = [
    { text: `"Tell me how you feel about the state of our dynasty."`, reply: `"Our house stands tall and proud, sire! Under your wise rule, we need fear no rivals."`, delta: 5 },
    { text: `"I value your counsel on court matters and loyal service."`, reply: `"Your praise warms my heart, my sovereign. You have my sworn sword and fealty always."`, delta: 8 },
    { text: `"What rumors have you heard from the tavern and marches?"`, reply: `"Foreign lords whisper of border tensions, but our garrisons remain steadfast."`, delta: 3 },
    { text: `"Ensure your duties to the crown are executed without delay."`, reply: `"As you decree, my liege. The crown's will is absolute."`, delta: -2 }
  ];

  const handleSelectChoice = (ch: typeof choices[0]) => {
    sound.playClick();
    onOpinionChange(ch.delta);
    setDialogueHistory(prev => [
      ...prev,
      { sender: playerCharacter.name, text: ch.text },
      { sender: character.name, text: ch.reply }
    ]);
  };

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Audience with {character.name}</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Chat Stream */}
        <div className="bg-[#FFFDF6] p-4 rounded-xl border border-stone-300 max-h-64 overflow-y-auto space-y-3">
          {dialogueHistory.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.sender === playerCharacter.name ? 'justify-end' : 'justify-start'}`}>
              {msg.sender !== playerCharacter.name && <span className="text-2xl">{character.portrait}</span>}
              <div className={`p-3 rounded-xl max-w-[80%] text-xs ${
                msg.sender === playerCharacter.name ? 'bg-amber-100 text-stone-900 border border-amber-300' : 'bg-stone-100 text-stone-900 border border-stone-300'
              }`}>
                <div className="font-bold text-[10px] text-stone-600 mb-0.5">{msg.sender}</div>
                <div>{msg.text}</div>
              </div>
              {msg.sender === playerCharacter.name && <span className="text-2xl">{playerCharacter.portrait}</span>}
            </div>
          ))}
        </div>

        {/* Choice Buttons */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">Choose your response:</div>
          {choices.map((ch, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectChoice(ch)}
              className="w-full text-left p-3 rounded-xl bg-[#FFFDF6] hover:bg-amber-50 border border-stone-300 hover:border-amber-500 text-xs font-semibold text-stone-900 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>{ch.text}</span>
              <span className="text-[10px] text-emerald-700 font-bold ml-2">
                {ch.delta > 0 ? `+${ch.delta} Opinion` : `${ch.delta} Opinion`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 6. SEND GIFT SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface SendGiftScreenProps {
  character: FamilyMember;
  playerGold: number;
  onSendGift: (cost: number, opinionGain: number, giftName: string) => void;
  onBack: () => void;
}

export const SendGiftScreen: React.FC<SendGiftScreenProps> = ({
  character,
  playerGold,
  onSendGift,
  onBack
}) => {
  const gifts = [
    { name: 'Purse of Golden Ducats', icon: '🪙', cost: 50, opinion: 15, desc: 'A rich purse of gold coins minted in the royal capital.' },
    { name: 'Rare Casket of Jewels', icon: '💎', cost: 120, opinion: 28, desc: 'Sapphires, emeralds and cut rubies from royal vaults.' },
    { name: 'Purebred Valorian Courser', icon: '🐎', cost: 200, opinion: 40, desc: 'A magnificent war steed bred for nobility and honor.' },
    { name: 'Vintage Imperial Ambrosia', icon: '🍷', cost: 75, opinion: 20, desc: 'Decanted vintage aged for fifty seasons in royal cellars.' }
  ];

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Send Royal Gift</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between bg-[#FFFDF6] p-3 rounded-xl border border-stone-300 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{character.portrait}</span>
            <div>
              <span className="font-bold block text-stone-900">{character.name}</span>
              <span className="text-stone-600">Current Opinion: {character.opinion > 0 ? `+${character.opinion}` : character.opinion}</span>
            </div>
          </div>
          <div className="text-right font-bold text-amber-900">
            Treasury: {playerGold} 🪙
          </div>
        </div>

        <div className="space-y-2.5">
          {gifts.map(g => (
            <div key={g.name} className="bg-[#FFFDF6] p-3.5 rounded-xl border border-stone-300 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <div className="font-bold text-xs text-stone-900">{g.name}</div>
                  <div className="text-[11px] text-stone-600">{g.desc}</div>
                  <div className="text-[10px] text-emerald-800 font-bold mt-0.5">+{g.opinion} Opinion</div>
                </div>
              </div>

              <button
                disabled={playerGold < g.cost}
                onClick={() => {
                  sound.playCoin();
                  onSendGift(g.cost, g.opinion, g.name);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  playerGold >= g.cost
                    ? 'bg-[#D49B28] hover:bg-[#B78722] text-stone-950 shadow-sm'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                Send ({g.cost} 🪙)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 7. ASSIGN WARD & EDUCATION SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface AssignWardScreenProps {
  character: FamilyMember;
  onSetEducation: (track: string) => void;
  onBack: () => void;
}

export const AssignWardScreen: React.FC<AssignWardScreenProps> = ({
  character,
  onSetEducation,
  onBack
}) => {
  const tracks = [
    { id: 'Martial & Knightly Chivalry', icon: '⚔️', desc: 'Focuses on combat prowess, tactical command, and knightly honor.' },
    { id: 'Statecraft & Royal Rhetoric', icon: '📜', desc: 'Develops diplomacy, negotiation, public esteem, and realm stewardship.' },
    { id: 'Arcana & Species Sorcery', icon: '🔮', desc: 'Unlocks mystical resonance, arcane lore, and species abilities.' },
    { id: 'Shadow Intrigue & Spies', icon: '🗡️', desc: 'Masters intrigue, stealth, secret plots, and court intrigue defense.' },
    { id: 'Grand Stewardship & Trade', icon: '🪙', desc: 'Focuses on economic management, taxation, and holding development.' }
  ];

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Assign Ward & Education</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="bg-[#FFFDF6] p-3 rounded-xl border border-stone-300 text-xs">
          <div className="font-bold text-stone-900">{character.name} (Age {character.age})</div>
          <div className="text-stone-600">Current Track: {character.educationTrack || 'General Royal Tutelage'}</div>
        </div>

        <div className="space-y-2">
          {tracks.map(tr => (
            <button
              key={tr.id}
              onClick={() => {
                sound.playClick();
                onSetEducation(tr.id);
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                character.educationTrack === tr.id
                  ? 'bg-amber-100 border-[#D49B28] ring-2 ring-[#D49B28]/40'
                  : 'bg-[#FFFDF6] hover:bg-stone-50 border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tr.icon}</span>
                <div>
                  <div className="font-bold text-xs text-stone-900">{tr.id}</div>
                  <div className="text-[11px] text-stone-600">{tr.desc}</div>
                </div>
              </div>
              {character.educationTrack === tr.id && (
                <span className="text-[10px] bg-[#D49B28] text-stone-950 font-bold px-2 py-0.5 rounded">Active</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 8. START SCHEME SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface StartSchemeScreenProps {
  character: FamilyMember;
  onStartScheme: (schemeName: string) => void;
  onBack: () => void;
}

export const StartSchemeScreen: React.FC<StartSchemeScreenProps> = ({
  character,
  onStartScheme,
  onBack
}) => {
  const schemes = [
    { name: 'Sway Lord to Royal Court', icon: '🤝', chance: '85%', desc: 'Gradually increase their opinion of you over successive turns.' },
    { name: 'Befriend & Foster Oath', icon: '🌟', chance: '70%', desc: 'Form an unbreakable personal friendship and mutual pledge.' },
    { name: 'Fabricate Claim on Fiefdom', icon: '📜', chance: '60%', desc: 'Manufacture documents claiming royal right to their county.' },
    { name: 'Blackmail & Dig Secrets', icon: '🗝️', chance: '65%', desc: 'Uncover dark secrets to force their compliance in court.' },
    { name: 'Shadow Assassination Plot', icon: '🗡️', chance: '45%', desc: 'Secretly plot their demise to clear succession paths.' }
  ];

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Start Intrigue Scheme</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="bg-[#FFFDF6] p-3 rounded-xl border border-stone-300 text-xs">
          <div className="font-bold text-stone-900">Target: {character.name}</div>
          <div className="text-stone-600">Active Scheme: {character.activeScheme || 'None'}</div>
        </div>

        <div className="space-y-2.5">
          {schemes.map(sc => (
            <div key={sc.name} className="bg-[#FFFDF6] p-3.5 rounded-xl border border-stone-300 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{sc.icon}</span>
                <div>
                  <div className="font-bold text-xs text-stone-900">{sc.name}</div>
                  <div className="text-[11px] text-stone-600">{sc.desc}</div>
                  <div className="text-[10px] text-amber-900 font-bold mt-0.5">Est. Success: {sc.chance}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onStartScheme(sc.name);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                Launch
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 9. GIVE ITEM SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface GiveItemScreenProps {
  character: FamilyMember;
  onGiveItem: (itemName: string) => void;
  onBack: () => void;
}

export const GiveItemScreen: React.FC<GiveItemScreenProps> = ({
  character,
  onGiveItem,
  onBack
}) => {
  const items = [
    { name: 'Valorian Signet Ring', icon: '💍', desc: '+15 Diplomacy, confers noble prestige.' },
    { name: 'Ancestral Obsidian Blade', icon: '🗡️', desc: '+18 Prowess in martial combat.' },
    { name: 'Apothecary Elixir of Vitality', icon: '🧪', desc: '+20 Health and cures fatigue.' },
    { name: 'Ancient Grimoire of Spells', icon: '📜', desc: '+15 Intellect and Arcane mastery.' },
    { name: 'Dragon-Enamelled Pendant', icon: '📿', desc: '+25 Opinion and deep gratitude.' }
  ];

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Gift Artifact / Item</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="bg-[#FFFDF6] p-3 rounded-xl border border-stone-300 text-xs">
          <div className="font-bold text-stone-900">Recipient: {character.name}</div>
          <div className="text-stone-600">Select an item from the royal vault to bestow.</div>
        </div>

        <div className="space-y-2">
          {items.map(it => (
            <div key={it.name} className="bg-[#FFFDF6] p-3.5 rounded-xl border border-stone-300 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{it.icon}</span>
                <div>
                  <div className="font-bold text-xs text-stone-900">{it.name}</div>
                  <div className="text-[11px] text-stone-600">{it.desc}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onGiveItem(it.name);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#D49B28] hover:bg-[#B78722] text-stone-950 text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                Bestow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 10. GIVE PROVINCE SUB-SCREEN
// ─────────────────────────────────────────────────────────────
interface GiveProvinceScreenProps {
  character: FamilyMember;
  provinces: Province[];
  onGrantProvince: (provinceId: string, provinceName: string) => void;
  onBack: () => void;
}

export const GiveProvinceScreen: React.FC<GiveProvinceScreenProps> = ({
  character,
  provinces,
  onGrantProvince,
  onBack
}) => {
  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
          <span className="text-lg">‹</span>
          <span>Back</span>
        </button>
        <span className="font-bold text-base text-[#181512]">Grant Landed Province</span>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="bg-[#FFFDF6] p-3 rounded-xl border border-stone-300 text-xs">
          <div className="font-bold text-stone-900">Appoint {character.name} as landed lord</div>
          <div className="text-stone-600">Select an imperial province to grant as their feudal seat (+45 Opinion).</div>
        </div>

        <div className="space-y-2">
          {provinces.map(prov => (
            <div key={prov.id} className="bg-[#FFFDF6] p-3.5 rounded-xl border border-stone-300 flex items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>🏰</span>
                  <span>{prov.name}</span>
                </div>
                <div className="text-[11px] text-stone-600">{prov.specialty} • {prov.troops} Troops • {prov.income} Gold/yr</div>
              </div>

              <button
                onClick={() => {
                  sound.playFanfare();
                  onGrantProvince(prov.id, prov.name);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#D49B28] hover:bg-[#B78722] text-stone-950 text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                Grant Title
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
