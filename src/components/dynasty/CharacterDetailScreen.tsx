import React, { useState } from 'react';
import { Character, FamilyMember, Province, Species } from '../../types';
import { sound } from '../../utils/audio';
import { 
  StatsScreen, 
  TraitsScreen, 
  CultureScreen, 
  RealmFiefdomScreen, 
  TalkDialogueScreen, 
  SendGiftScreen, 
  AssignWardScreen, 
  StartSchemeScreen, 
  GiveItemScreen, 
  GiveProvinceScreen 
} from './CharacterSubScreens';

interface CharacterDetailScreenProps {
  character: FamilyMember;
  playerCharacter: Character;
  provinces: Province[];
  onBack: () => void;
  onUpdateMember: (updated: FamilyMember) => void;
  onUpdatePlayerGold: (newGold: number) => void;
  onDesignateHeir: (memberId: string) => void;
  onOpenFamilyTree: () => void;
}

type SubScreenType = 
  | null 
  | 'stats' 
  | 'traits' 
  | 'culture' 
  | 'realm' 
  | 'talk' 
  | 'send_gift' 
  | 'assign_ward' 
  | 'start_scheme' 
  | 'give_item' 
  | 'give_province'
  | 'edit_character';

export const CharacterDetailScreen: React.FC<CharacterDetailScreenProps> = ({
  character,
  playerCharacter,
  provinces,
  onBack,
  onUpdateMember,
  onUpdatePlayerGold,
  onDesignateHeir,
  onOpenFamilyTree
}) => {
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreenType>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit character local state
  const [editName, setEditName] = useState(character.name);
  const [editPortrait, setEditPortrait] = useState(character.portrait);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isBloodRelation = character.relation === 'Child' || character.relation === 'Father' || character.relation === 'Mother' || character.relation === 'Sibling' || character.relation === 'Grandchild' || character.relation === 'Cousin' || character.isBloodRelation;
  const isSpouse = character.relation === 'Spouse';

  // Toggle favorite
  const handleToggleFavorite = () => {
    sound.playClick();
    const updated = { ...character, isFavorite: !character.isFavorite };
    onUpdateMember(updated);
    showToast(updated.isFavorite ? `⭐ Marked ${character.name} as Favorite` : `Removed Favorite`);
  };

  // Compliment
  const handleCompliment = () => {
    sound.playClick();
    const newOpinion = Math.min(100, character.opinion + 10);
    onUpdateMember({ ...character, opinion: newOpinion });
    showToast(`🥰 Complimented ${character.name} (+10 Opinion)`);
  };

  // Insult
  const handleInsult = () => {
    sound.playSword();
    const newOpinion = Math.max(-100, character.opinion - 20);
    onUpdateMember({ ...character, opinion: newOpinion });
    showToast(`😡 Insulted ${character.name} (-20 Opinion)`);
  };

  // Make Love (Spouse)
  const handleMakeLove = () => {
    sound.playMagic();
    const newOpinion = Math.min(100, character.opinion + 15);
    onUpdateMember({ ...character, opinion: newOpinion });
    showToast(`❤️ Shared an intimate night with ${character.name} (+15 Opinion)`);
  };

  // Give Medicine
  const handleGiveMedicine = () => {
    sound.playClick();
    const newHealth = Math.min(100, character.health + 25);
    onUpdateMember({ ...character, health: newHealth });
    showToast(`💊 Administered healing apothecary remedy (+25 Health)`);
  };

  // Take Province
  const handleTakeProvince = () => {
    sound.playSword();
    const newOpinion = Math.max(-100, character.opinion - 35);
    onUpdateMember({ ...character, countyName: undefined, opinion: newOpinion });
    showToast(`🏰 Revoked county title back to the royal crown (-35 Opinion)`);
  };

  // Request Divorce
  const handleDivorce = () => {
    sound.playSword();
    onUpdateMember({ ...character, relation: 'Enemy', opinion: -50 });
    showToast(`💔 Royal marriage annulled with ${character.name}`);
  };

  // Imprison
  const handleImprison = () => {
    sound.playSword();
    const isNowImprisoned = !character.isImprisoned;
    onUpdateMember({ 
      ...character, 
      isImprisoned: isNowImprisoned, 
      opinion: isNowImprisoned ? Math.max(-100, character.opinion - 40) : character.opinion + 10 
    });
    showToast(isNowImprisoned ? `⛓️ Imprisoned in the royal dungeon` : `🕊️ Pardoned and released from dungeon`);
  };

  // Save Edit Character
  const handleSaveEdit = () => {
    sound.playClick();
    onUpdateMember({ ...character, name: editName, portrait: editPortrait });
    setActiveSubScreen(null);
    showToast(`✏️ Character details updated`);
  };

  // If a subscreen is active, render that subscreen
  if (activeSubScreen === 'stats') {
    return <StatsScreen character={character} onBack={() => setActiveSubScreen(null)} />;
  }
  if (activeSubScreen === 'traits') {
    return <TraitsScreen character={character} onBack={() => setActiveSubScreen(null)} />;
  }
  if (activeSubScreen === 'culture') {
    return <CultureScreen character={character} onBack={() => setActiveSubScreen(null)} />;
  }
  if (activeSubScreen === 'realm') {
    return <RealmFiefdomScreen character={character} onBack={() => setActiveSubScreen(null)} />;
  }
  if (activeSubScreen === 'talk') {
    return (
      <TalkDialogueScreen 
        character={character} 
        playerCharacter={playerCharacter} 
        onOpinionChange={(delta) => onUpdateMember({ ...character, opinion: Math.min(100, Math.max(-100, character.opinion + delta)) })} 
        onBack={() => setActiveSubScreen(null)} 
      />
    );
  }
  if (activeSubScreen === 'send_gift') {
    return (
      <SendGiftScreen 
        character={character} 
        playerGold={playerCharacter.stats.gold} 
        onSendGift={(cost, op, giftName) => {
          onUpdatePlayerGold(playerCharacter.stats.gold - cost);
          onUpdateMember({ ...character, opinion: Math.min(100, character.opinion + op) });
          setActiveSubScreen(null);
          showToast(`🪙 Bestowed ${giftName} (+${op} Opinion)`);
        }} 
        onBack={() => setActiveSubScreen(null)} 
      />
    );
  }
  if (activeSubScreen === 'assign_ward') {
    return (
      <AssignWardScreen 
        character={character} 
        onSetEducation={(track) => {
          onUpdateMember({ ...character, educationTrack: track });
          setActiveSubScreen(null);
          showToast(`📖 Assigned education track: ${track}`);
        }} 
        onBack={() => setActiveSubScreen(null)} 
      />
    );
  }
  if (activeSubScreen === 'start_scheme') {
    return (
      <StartSchemeScreen 
        character={character} 
        onStartScheme={(scheme) => {
          onUpdateMember({ ...character, activeScheme: scheme });
          setActiveSubScreen(null);
          showToast(`🔍 Initiated scheme: ${scheme}`);
        }} 
        onBack={() => setActiveSubScreen(null)} 
      />
    );
  }
  if (activeSubScreen === 'give_item') {
    return (
      <GiveItemScreen 
        character={character} 
        onGiveItem={(itemName) => {
          const prevItems = character.itemsGiven || [];
          onUpdateMember({ ...character, itemsGiven: [...prevItems, itemName], opinion: Math.min(100, character.opinion + 20) });
          setActiveSubScreen(null);
          showToast(`🎒 Gifted ${itemName} (+20 Opinion)`);
        }} 
        onBack={() => setActiveSubScreen(null)} 
      />
    );
  }
  if (activeSubScreen === 'give_province') {
    return (
      <GiveProvinceScreen 
        character={character} 
        provinces={provinces} 
        onGrantProvince={(provId, provName) => {
          onUpdateMember({ ...character, provinceId: provId, countyName: `The County of ${provName}`, opinion: Math.min(100, character.opinion + 45) });
          setActiveSubScreen(null);
          showToast(`🏰 Granted ${provName} as landed county title (+45 Opinion)`);
        }} 
        onBack={() => setActiveSubScreen(null)} 
      />
    );
  }
  if (activeSubScreen === 'edit_character') {
    return (
      <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-xl overflow-hidden font-sans">
        <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
          <button onClick={() => setActiveSubScreen(null)} className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 cursor-pointer">
            <span className="text-lg">‹</span>
            <span>Back</span>
          </button>
          <span className="font-bold text-base text-[#181512]">Edit Character</span>
          <button onClick={() => setActiveSubScreen(null)} className="w-7 h-7 flex items-center justify-center font-bold text-[#181512]">✕</button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Character Name & Title</label>
            <input 
              type="text" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-stone-300 text-sm font-semibold text-stone-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Portrait Avatar</label>
            <div className="flex gap-2 text-2xl bg-white p-2.5 rounded-lg border border-stone-300">
              {['🤴', '👸', '👑', '🧙‍♂️', '🧙‍♀️', '🧛', '🧛🏻‍♀️', '🐺', '🧝‍♂️', '🧝‍♀️', '👶', '👦', '👧', '👴🏻', '👵🏻'].map(p => (
                <button 
                  key={p} 
                  type="button"
                  onClick={() => setEditPortrait(p)}
                  className={`p-1 rounded ${editPortrait === p ? 'bg-amber-200 ring-2 ring-amber-500' : 'hover:bg-stone-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveEdit}
            className="w-full py-2.5 bg-[#D49B28] hover:bg-[#B78722] text-stone-950 font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  // Calculate Opinion fill width (0 - 100 range)
  const isPositive = character.opinion >= 0;
  const opinionPercent = Math.min(100, Math.max(0, Math.abs(character.opinion)));

  return (
    <div className="bg-[#FAF7EB] text-[#181512] rounded-xl border border-stone-400/60 shadow-2xl flex flex-col font-sans overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-stone-900 text-amber-200 text-xs font-bold px-4 py-2 text-center animate-fade-in shadow-md">
          {toastMessage}
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-[#D49B28] px-4 py-3 border-b border-[#B78722] flex items-center justify-between shadow-sm">
        <button
          onClick={() => { sound.playClick(); onBack(); }}
          className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-lg">‹</span>
        </button>
        
        <div className="flex items-center gap-1.5 font-bold text-base text-[#181512]">
          <span>Character</span>
          <span className="w-4 h-4 rounded-full bg-[#FAF7EB]/40 text-[10px] flex items-center justify-center font-bold">?</span>
        </div>

        <button
          onClick={() => { sound.playClick(); onBack(); }}
          className="w-7 h-7 flex items-center justify-center text-lg font-bold text-[#181512] hover:opacity-80 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Character Profile Header Row */}
      <div className="p-4 bg-[#FFFDF6] border-b border-stone-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-3xl shrink-0 shadow-xs">
            {character.portrait}
          </div>

          <div className="min-w-0">
            <div className="font-extrabold text-sm text-stone-900 truncate">
              {character.name} {character.houseName ? `(${character.houseName})` : ''} ({character.age}) ({character.relation})
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-stone-800 font-bold mt-1">
              <span>Relationship:</span>
              {isBloodRelation && <span className="text-rose-600 text-xs">🩸</span>}
              {character.isFavorite && <span className="text-amber-500 text-xs">⭐</span>}
              {character.isImprisoned && <span className="text-stone-700 text-xs font-mono font-bold bg-stone-200 px-1 rounded">⛓️ JAILED</span>}
            </div>

            {/* Visual Relationship Bar matching screenshot */}
            <div className="w-44 sm:w-56 h-2.5 bg-stone-300 rounded-full overflow-hidden mt-1.5 flex">
              {isPositive ? (
                <>
                  <div className="h-full bg-stone-300" style={{ width: `${100 - opinionPercent}%` }} />
                  <div className="h-full bg-emerald-700 transition-all" style={{ width: `${opinionPercent}%` }} />
                </>
              ) : (
                <>
                  <div className="h-full bg-stone-300" style={{ width: `${100 - opinionPercent}%` }} />
                  <div className="h-full bg-red-800 transition-all" style={{ width: `${opinionPercent}%` }} />
                </>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={handleToggleFavorite}
          className="w-8 h-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-lg cursor-pointer"
        >
          •••
        </button>
      </div>

      {/* Action Button Rows (Neat list layout matching screenshot) */}
      <div className="overflow-y-auto max-h-[560px] divide-y divide-stone-300/80">
        
        {/* 1. Favorite */}
        <button
          onClick={handleToggleFavorite}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">⭐</span>
            <span className="font-extrabold text-sm text-stone-900">
              {character.isFavorite ? 'Unfavorite' : 'Favorite'}
            </span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 2. Realm / County */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('realm'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">🚩</span>
            <span className="font-extrabold text-sm text-stone-900 truncate">
              Realm: {character.countyName || 'The County of Brecknock'}
            </span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">›</span>
        </button>

        {/* 3. Culture */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('culture'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">📖</span>
            <span className="font-extrabold text-sm text-stone-900">
              Culture: {character.culture || 'Gaelic'}
            </span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 4. Stats */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('stats'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">📊</span>
            <span className="font-extrabold text-sm text-stone-900">Stats</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 5. Traits */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('traits'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">🧬</span>
            <span className="font-extrabold text-sm text-stone-900">Traits</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">›</span>
        </button>

        {/* 6. Edit Character */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('edit_character'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">✏️</span>
            <span className="font-extrabold text-sm text-stone-900">Edit Character</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 7. Talk */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('talk'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">💬</span>
            <span className="font-extrabold text-sm text-stone-900">Talk</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 8. Send Gift */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('send_gift'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">🪙</span>
            <span className="font-extrabold text-sm text-stone-900">Send gift</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 9. Choose New Heir (If Child or Kin) */}
        {character.relation === 'Child' && !character.isHeir && (
          <button
            onClick={() => {
              sound.playFanfare();
              onDesignateHeir(character.id);
              showToast(`👑 ${character.name} designated as Primary Crown Heir!`);
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-2xl">👑</span>
              <span className="font-extrabold text-sm text-stone-900">Choose New Heir</span>
            </div>
            <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
          </button>
        )}

        {/* 10. Compliment */}
        <button
          onClick={handleCompliment}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">🥰</span>
            <span className="font-extrabold text-sm text-stone-900">Compliment</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 11. Insult */}
        <button
          onClick={handleInsult}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">😡</span>
            <span className="font-extrabold text-sm text-stone-900">Insult</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 12. Make Love (if Spouse) */}
        {isSpouse && (
          <button
            onClick={handleMakeLove}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-2xl">❤️</span>
              <span className="font-extrabold text-sm text-stone-900">Make Love</span>
            </div>
            <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
          </button>
        )}

        {/* 13. Give Medicine */}
        <button
          onClick={handleGiveMedicine}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">💊</span>
            <span className="font-extrabold text-sm text-stone-900">Give Medicine</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 14. Give Province */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('give_province'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">🏰</span>
            <span className="font-extrabold text-sm text-stone-900">Give Province</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 15. Take Province (if holds county) */}
        {character.countyName && (
          <button
            onClick={handleTakeProvince}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-2xl">🏰</span>
              <span className="font-extrabold text-sm text-stone-900">Take Province</span>
            </div>
            <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
          </button>
        )}

        {/* 16. Family Tree */}
        <button
          onClick={() => { sound.playClick(); onOpenFamilyTree(); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">👨‍👩‍👧</span>
            <span className="font-extrabold text-sm text-stone-900">Family</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">›</span>
        </button>

        {/* 17. Request Divorce (if Spouse) */}
        {isSpouse && (
          <button
            onClick={handleDivorce}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-2xl">💔</span>
              <span className="font-extrabold text-sm text-stone-900">Request Divorce</span>
            </div>
            <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
          </button>
        )}

        {/* 18. Imprison */}
        <button
          onClick={handleImprison}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">⛓️</span>
            <span className="font-extrabold text-sm text-stone-900">
              {character.isImprisoned ? 'Pardon & Release' : 'Imprison'}
            </span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

        {/* 19. Education / Assign a Ward */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('assign_ward'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">📖</span>
            <span className="font-extrabold text-sm text-stone-900">
              {character.age < 18 ? 'Education' : 'Assign a Ward'}
            </span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">›</span>
        </button>

        {/* 20. Start Scheme */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('start_scheme'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">🔍</span>
            <span className="font-extrabold text-sm text-stone-900">Start Scheme</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">›</span>
        </button>

        {/* 21. Give Item */}
        <button
          onClick={() => { sound.playClick(); setActiveSubScreen('give_item'); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F3EED8] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">🎒</span>
            <span className="font-extrabold text-sm text-stone-900">Give Item</span>
          </div>
          <span className="text-stone-400 font-bold text-lg group-hover:text-stone-700">•••</span>
        </button>

      </div>
    </div>
  );
};
