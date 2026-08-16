import React, { useState } from 'react';
import { Character, RealmNPC, Species, FamilyMember } from '../types';
import { SPECIES_DATA } from '../data/speciesData';
import { sound } from '../utils/audio';
import { 
  Crown, 
  Coins, 
  Swords, 
  Eye, 
  Heart, 
  UserPlus, 
  MessageSquare, 
  Sparkles, 
  Shield, 
  X, 
  Award,
  Lock,
  Unlock,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface RealmNPCModalProps {
  npc: RealmNPC;
  playerCharacter: Character;
  onClose: () => void;
  onUpdateNPC: (updatedNpc: RealmNPC) => void;
  onUpdatePlayer: (updates: Partial<Character>) => void;
  onAddChronicle: (entry: { title: string; description: string; type: 'diplomacy' | 'war' | 'intrigue' | 'dynasty' }) => void;
  onEmployNPCAsVassal?: (npc: RealmNPC) => void;
}

export const RealmNPCModal: React.FC<RealmNPCModalProps> = ({
  npc,
  playerCharacter,
  onClose,
  onUpdateNPC,
  onUpdatePlayer,
  onAddChronicle,
  onEmployNPCAsVassal
}) => {
  const [currentNpc, setCurrentNpc] = useState<RealmNPC>(npc);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<boolean | null>(null);

  const speciesInfo = SPECIES_DATA[currentNpc.species] || SPECIES_DATA['Human'];

  // Handle Conversing & Swaying
  const handleSway = () => {
    sound.playClick();
    if (currentNpc.swayed) {
      setActiveMessage(`${currentNpc.name} has already been swayed recently this season.`);
      setActionSuccess(false);
      return;
    }

    const diplomacyRoll = playerCharacter.stats.diplomacy + Math.floor(Math.random() * 20);
    const targetDifficulty = currentNpc.stats.intrigue;

    if (diplomacyRoll >= targetDifficulty) {
      const newOpinion = Math.min(100, currentNpc.opinion + 18);
      const newStatus = newOpinion >= 60 ? 'Friend' : currentNpc.relationshipStatus;
      const updated = {
        ...currentNpc,
        opinion: newOpinion,
        swayed: true,
        relationshipStatus: newStatus
      };
      setCurrentNpc(updated);
      onUpdateNPC(updated);
      setActiveMessage(`✨ Success! You engaged in courtly discussion with ${currentNpc.name}. Opinion rose to ${newOpinion > 0 ? '+' : ''}${newOpinion}.`);
      setActionSuccess(true);
      onAddChronicle({
        title: `Diplomatic Sway: ${currentNpc.name}`,
        description: `Your silver tongue impressed ${currentNpc.title} ${currentNpc.name} of ${currentNpc.realmName}, establishing warm mutual respect.`,
        type: 'diplomacy'
      });
    } else {
      setActiveMessage(`${currentNpc.name} listened politely to your overtures, but remained guarded.`);
      setActionSuccess(false);
    }
  };

  // Handle Bribing / Gifting Gold
  const handleGiftGold = (cost: number = 50) => {
    if (playerCharacter.stats.gold < cost) {
      sound.playError();
      setActiveMessage(`Not enough treasury gold! You need ${cost} 🧈 to present this gift.`);
      setActionSuccess(false);
      return;
    }

    sound.playCoin();
    const newOpinion = Math.min(100, currentNpc.opinion + 25);
    const newLoyalty = Math.min(100, currentNpc.loyalty + 15);
    const newStatus = newOpinion >= 60 ? 'Friend' : currentNpc.relationshipStatus;
    
    const updated = {
      ...currentNpc,
      opinion: newOpinion,
      loyalty: newLoyalty,
      bribed: true,
      hasSecretRevealed: true,
      relationshipStatus: newStatus
    };
    setCurrentNpc(updated);
    onUpdateNPC(updated);
    onUpdatePlayer({
      stats: {
        ...playerCharacter.stats,
        gold: playerCharacter.stats.gold - cost
      }
    });

    setActiveMessage(`🧈 You presented a chest of ${cost} gold and rare silk to ${currentNpc.name}. Their opinion rose to ${newOpinion > 0 ? '+' : ''}${newOpinion} and their secret agenda was revealed!`);
    setActionSuccess(true);
    onAddChronicle({
      title: `Lavish Gift to ${currentNpc.name}`,
      description: `You sent 50 gold to ${currentNpc.name} of ${currentNpc.realmName}. The recipient pledged their goodwill and shared court secrets.`,
      type: 'diplomacy'
    });
  };

  // Handle Employing / Recruiting to Council
  const handleRecruitToCourt = () => {
    if (currentNpc.opinion < 50) {
      sound.playError();
      setActiveMessage(`${currentNpc.name} politely declines your offer. You need at least +50 opinion to recruit them.`);
      setActionSuccess(false);
      return;
    }

    if (currentNpc.isEmployedAtCourt) {
      setActiveMessage(`${currentNpc.name} is already serving as a trusted advisor in your court.`);
      setActionSuccess(true);
      return;
    }

    sound.playFanfare();
    const updated = {
      ...currentNpc,
      isEmployedAtCourt: true,
      relationshipStatus: 'Courtier' as const
    };
    setCurrentNpc(updated);
    onUpdateNPC(updated);

    if (onEmployNPCAsVassal) {
      onEmployNPCAsVassal(updated);
    }

    setActiveMessage(`👑 ${currentNpc.name} accepted your royal invitation! They now serve as an elite Advisor & Officer in your sovereign court.`);
    setActionSuccess(true);
    onAddChronicle({
      title: `Noble Recruited: ${currentNpc.name}`,
      description: `${currentNpc.title} ${currentNpc.name} was officially inducted into your court as a premier advisor.`,
      type: 'dynasty'
    });
  };

  // Handle Intrigue / Plot & Blackmail
  const handleBlackmail = () => {
    sound.playClick();
    const intrigueRoll = playerCharacter.stats.intrigue + Math.floor(Math.random() * 25);
    const targetDifficulty = currentNpc.stats.intrigue + 10;

    if (intrigueRoll >= targetDifficulty) {
      sound.playCoin();
      const updated = {
        ...currentNpc,
        hasSecretRevealed: true
      };
      setCurrentNpc(updated);
      onUpdateNPC(updated);
      onUpdatePlayer({
        stats: {
          ...playerCharacter.stats,
          renown: playerCharacter.stats.renown + 25,
          gold: playerCharacter.stats.gold + 40
        }
      });
      setActiveMessage(`🎭 Intrigue Success! Your spymasters uncovered ${currentNpc.name}'s secret agenda: "${currentNpc.secretAgenda || 'Conspiring for courtly influence'}". You extorted 40 🧈 and gained strong leverage!`);
      setActionSuccess(true);
      onAddChronicle({
        title: `Blackmail Leverage: ${currentNpc.name}`,
        description: `Your network uncovered secret machinations of ${currentNpc.name}, gaining vital intelligence and casus belli advantage.`,
        type: 'intrigue'
      });
    } else {
      sound.playError();
      const newOpinion = Math.max(-100, currentNpc.opinion - 20);
      const updated = {
        ...currentNpc,
        opinion: newOpinion,
        relationshipStatus: 'Rival' as const
      };
      setCurrentNpc(updated);
      onUpdateNPC(updated);
      setActiveMessage(`❌ Spies Detected! ${currentNpc.name} discovered your agents and was deeply offended (Opinion -20).`);
      setActionSuccess(false);
    }
  };

  // Handle Martial Duel
  const handleDuel = () => {
    sound.playWarHorns();
    const playerProwess = (playerCharacter.stats.martial + (playerCharacter.stats.prowess || 75)) / 2;
    const npcProwess = currentNpc.stats.prowess;
    const roll = Math.random() * 30;

    if (playerProwess + roll >= npcProwess + 15) {
      sound.playFanfare();
      const newOpinion = Math.min(100, currentNpc.opinion + 15);
      const updated = {
        ...currentNpc,
        opinion: newOpinion
      };
      setCurrentNpc(updated);
      onUpdateNPC(updated);
      onUpdatePlayer({
        stats: {
          ...playerCharacter.stats,
          renown: playerCharacter.stats.renown + 50
        }
      });
      setActiveMessage(`⚔️ Glorious Victory! You bested ${currentNpc.name} in an honorable combat duel! You gained +50 Renown and earned their martial respect.`);
      setActionSuccess(true);
      onAddChronicle({
        title: `Honorable Duel Won: ${currentNpc.name}`,
        description: `In a spectacular display of martial prowess, you defeated ${currentNpc.name} before the gathered court.`,
        type: 'war'
      });
    } else {
      sound.playError();
      const newHealth = Math.max(20, playerCharacter.stats.health - 15);
      onUpdatePlayer({
        stats: {
          ...playerCharacter.stats,
          health: newHealth
        }
      });
      setActiveMessage(`💥 Defeated! ${currentNpc.name} outmatched your guard and struck a heavy blow. Health reduced by 15.`);
      setActionSuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto">
      <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl max-w-2xl w-full border border-stone-400/80 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#D49B28] px-5 py-3 border-b border-[#B78722] flex items-center justify-between text-[#181512] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentNpc.portrait}</span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg font-cinzel text-stone-950 truncate">
                {currentNpc.title} {currentNpc.name}
              </h2>
              <div className="text-xs text-stone-900 font-semibold">
                House {currentNpc.houseName} • {currentNpc.species} • {currentNpc.realmName}
              </div>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="text-stone-900 hover:text-stone-950 font-black text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-sm">
          
          {/* Quote & Bio Banner */}
          <div className="bg-stone-900 text-stone-100 p-4 rounded-xl border border-stone-800 space-y-2">
            <div className="text-amber-300 italic text-xs sm:text-sm font-serif">
              "{currentNpc.dialogueQuote}"
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {currentNpc.bio}
            </p>
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-stone-800">
              <span className="text-stone-400">
                Primary Role: <strong className="text-amber-200">{currentNpc.role}</strong>
              </span>
              <span className="text-stone-400">
                Relationship: <strong className="text-emerald-400">{currentNpc.relationshipStatus}</strong>
              </span>
              <span className="text-stone-400">
                Opinion: <strong className={currentNpc.opinion >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {currentNpc.opinion > 0 ? `+${currentNpc.opinion}` : currentNpc.opinion}
                </strong>
              </span>
            </div>
          </div>

          {/* Six Core Stats Grid */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#D49B28]" />
              <span>Attributes & Abilities</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-xl border border-stone-300 shadow-2xs">
                <span className="text-[10px] text-stone-500 font-bold block">Martial</span>
                <span className="font-extrabold text-stone-900 font-mono text-sm">{currentNpc.stats.martial}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-300 shadow-2xs">
                <span className="text-[10px] text-stone-500 font-bold block">Diplomacy</span>
                <span className="font-extrabold text-stone-900 font-mono text-sm">{currentNpc.stats.diplomacy}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-300 shadow-2xs">
                <span className="text-[10px] text-stone-500 font-bold block">Intrigue</span>
                <span className="font-extrabold text-stone-900 font-mono text-sm">{currentNpc.stats.intrigue}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-300 shadow-2xs">
                <span className="text-[10px] text-stone-500 font-bold block">Intellect</span>
                <span className="font-extrabold text-stone-900 font-mono text-sm">{currentNpc.stats.intellect}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-300 shadow-2xs">
                <span className="text-[10px] text-stone-500 font-bold block">Prowess</span>
                <span className="font-extrabold text-stone-900 font-mono text-sm">{currentNpc.stats.prowess}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-300 shadow-2xs">
                <span className="text-[10px] text-stone-500 font-bold block">Stewardship</span>
                <span className="font-extrabold text-stone-900 font-mono text-sm">{currentNpc.stats.stewardship}</span>
              </div>
            </div>
          </div>

          {/* Traits & Secret Agenda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl border border-stone-300 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-600 block mb-1.5">Distinguished Traits:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentNpc.traits.map((trait, idx) => (
                  <span key={idx} className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    ✨ {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-300 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-600 block mb-1.5 flex items-center justify-between">
                <span>Secret Motives & Agendas:</span>
                {currentNpc.hasSecretRevealed ? (
                  <span className="text-emerald-700 text-[10px] flex items-center gap-1 font-bold">
                    <Unlock className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="text-stone-400 text-[10px] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Hidden
                  </span>
                )}
              </span>
              <p className="text-xs text-stone-700 italic">
                {currentNpc.hasSecretRevealed 
                  ? currentNpc.secretAgenda 
                  : 'Bribe with gold or deploy spymasters to unveil their hidden agenda.'}
              </p>
            </div>
          </div>

          {/* Dynamic Result Alert */}
          {activeMessage && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              actionSuccess 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                : 'bg-amber-50 text-amber-950 border-amber-300'
            }`}>
              {actionSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
              <span>{activeMessage}</span>
            </div>
          )}

          {/* Interactive Action Buttons */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-2">
              Diplomatic & Intrigue Interactions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              
              {/* Converse & Sway */}
              <button
                onClick={handleSway}
                className="p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 font-bold text-xs flex items-center justify-between shadow-2xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Converse & Sway</span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">Free Action</span>
              </button>

              {/* Gift Gold */}
              <button
                onClick={() => handleGiftGold(50)}
                className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-stone-300 text-stone-900 font-bold text-xs flex items-center justify-between shadow-2xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>Gift 50 Gold & Bribe</span>
                </div>
                <span className="text-[10px] text-amber-700 font-bold font-mono">-50 🧈</span>
              </button>

              {/* Recruit to Privy Council */}
              <button
                onClick={handleRecruitToCourt}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-stone-300 text-stone-900 font-bold text-xs flex items-center justify-between shadow-2xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Recruit to Court</span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">&gt; +50 Opinion</span>
              </button>

              {/* Blackmail & Plot */}
              <button
                onClick={handleBlackmail}
                className="p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-stone-300 text-stone-900 font-bold text-xs flex items-center justify-between shadow-2xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>Plot Scheme & Blackmail</span>
                </div>
                <span className="text-[10px] text-purple-700 font-mono">Intrigue Test</span>
              </button>

              {/* Martial Duel */}
              <button
                onClick={handleDuel}
                className="p-2.5 rounded-xl bg-white hover:bg-red-50 border border-stone-300 text-stone-900 font-bold text-xs flex items-center justify-between shadow-2xs transition-all cursor-pointer sm:col-span-2"
              >
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-red-600" />
                  <span>Challenge to Honorable Martial Duel</span>
                </div>
                <span className="text-[10px] text-red-700 font-mono">+50 Renown on Win</span>
              </button>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-stone-200 px-5 py-3 border-t border-stone-300 flex items-center justify-between text-xs shrink-0">
          <span className="text-stone-600">
            Current Treasury: <strong>{playerCharacter.stats.gold} 🧈</strong>
          </span>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
