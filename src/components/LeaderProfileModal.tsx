import React, { useState } from 'react';
import { Character, LeaderProfile, FamilyMember } from '../types';
import { sound } from '../utils/audio';
import { TargetEntity } from './war/RealmProvinceDetailScreen';
import { 
  X, 
  Crown, 
  Shield, 
  Swords, 
  Coins, 
  Sparkles, 
  Heart, 
  Eye, 
  Skull, 
  Zap, 
  Award, 
  ChevronRight, 
  MessageSquare, 
  Gift, 
  Flame, 
  BookOpen, 
  MapPin,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface LeaderProfileModalProps {
  leader: LeaderProfile | null;
  isOpen: boolean;
  onClose: () => void;
  playerCharacter: Character;
  familyMembers?: FamilyMember[];
  onSendGift?: (leader: LeaderProfile, cost: number) => void;
  onSwayLeader?: (leader: LeaderProfile) => void;
  onFabricateClaim?: (leader: LeaderProfile, cost: number) => void;
  onIntrigueScheme?: (leader: LeaderProfile, schemeType: string) => void;
  onChallengeDuel?: (leader: LeaderProfile) => void;
  onDemandFealty?: (leader: LeaderProfile) => void;
  onDeclareWarTarget?: (target: TargetEntity) => void;
  onProposeAlliance?: (leader: LeaderProfile) => void;
}

export const LeaderProfileModal: React.FC<LeaderProfileModalProps> = ({
  leader,
  isOpen,
  onClose,
  playerCharacter,
  familyMembers = [],
  onSendGift,
  onSwayLeader,
  onFabricateClaim,
  onIntrigueScheme,
  onChallengeDuel,
  onDemandFealty,
  onDeclareWarTarget,
  onProposeAlliance
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'diplomacy' | 'military' | 'intrigue'>('profile');
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);

  if (!isOpen || !leader) return null;

  const showFeedback = (message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    setActionFeedback({ message, type });
    setTimeout(() => {
      setActionFeedback(null);
    }, 3800);
  };

  const handleGift = () => {
    if (playerCharacter.stats.gold < 40) {
      sound.playFail();
      showFeedback('Not enough treasury gold (Requires 40 🪙)', 'danger');
      return;
    }
    sound.playCoin();
    if (onSendGift) {
      onSendGift(leader, 40);
    }
    showFeedback(`Sent a gilded chest of 40 gold to ${leader.name}. Opinion increased by +25!`, 'success');
  };

  const handleSway = () => {
    const successRate = Math.min(95, Math.max(25, 40 + (playerCharacter.stats.diplomacy - leader.stats.intrigue) * 0.8));
    const roll = Math.random() * 100;
    if (roll <= successRate) {
      sound.playSuccess();
      if (onSwayLeader) onSwayLeader(leader);
      showFeedback(`Diplomatic envoy succeeded! ${leader.name} was moved by your courtly eloquence (+20 Opinion).`, 'success');
    } else {
      sound.playFail();
      showFeedback(`Your envoys fumbled the courtly etiquette. ${leader.name} remains unmoved.`, 'danger');
    }
  };

  const handleFabricateClaim = () => {
    if (playerCharacter.stats.gold < 60) {
      sound.playFail();
      showFeedback('Requires 60 🪙 to bribe chancellors and forge historic genealogies.', 'danger');
      return;
    }
    sound.playScroll();
    if (onFabricateClaim) onFabricateClaim(leader, 60);
    showFeedback(`Forged parchment documents claiming rightful inheritance over ${leader.title}! Casus Belli acquired.`, 'success');
  };

  const handleScheme = (scheme: string) => {
    sound.playWarHorns();
    if (onIntrigueScheme) onIntrigueScheme(leader, scheme);
    showFeedback(`Spies dispatched to execute '${scheme}' against House ${leader.houseName}.`, 'info');
  };

  const handleDuel = () => {
    sound.playWarHorns();
    if (onChallengeDuel) onChallengeDuel(leader);
    const win = playerCharacter.stats.martial >= leader.stats.martial;
    if (win) {
      showFeedback(`You bested ${leader.name} in single combat! Great renown earned across the continent (+80 Renown).`, 'success');
    } else {
      showFeedback(`The duel was fierce. You suffered minor wounds, but earned their martial respect (+15 Opinion).`, 'info');
    }
  };

  const handleWar = () => {
    sound.playWarHorns();
    onClose();
    if (onDeclareWarTarget) {
      onDeclareWarTarget({
        id: leader.provinceId || leader.realmId || leader.id,
        name: leader.provinceName || leader.realmName || leader.name,
        type: leader.provinceId ? 'province' : 'realm',
        troops: leader.troops,
        difficulty: leader.troops > 1500 ? 'Hard' : leader.troops > 800 ? 'Medium' : 'Easy',
        rewards: [`Dominion over ${leader.provinceName || leader.realmName || 'Region'}`, 'War Spoils: 250 Gold', '+100 Renown'],
        claims: [`Conquest of ${leader.title}`, 'De Jure Sovereign Right']
      });
    }
  };

  const relationColor = leader.opinion > 30 ? 'text-emerald-400' : leader.opinion < -20 ? 'text-red-400' : 'text-amber-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
      <div className="bg-[#1c1611] text-stone-100 rounded-2xl max-w-xl w-full border border-amber-600/40 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#2e1d0c] via-[#452b12] to-[#2e1d0c] p-4 border-b border-amber-500/40 relative">
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {leader.portrait}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel truncate">
                  {leader.title}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                  {leader.species}
                </span>
              </div>
              <div className="text-xs text-stone-300 font-medium truncate mt-0.5">
                {leader.name} • House {leader.houseName} • Age {leader.age}
              </div>
              <div className="text-[11px] text-stone-400 truncate mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{leader.provinceName ? `Governor of ${leader.provinceName}` : `Sovereign of ${leader.realmName || 'Realm'}`}</span>
              </div>
            </div>
          </div>

          {/* Quick Relationship Bar */}
          <div className="mt-3 bg-stone-950/70 p-2 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-400">Opinion of You:</span>
              <span className={`font-bold font-mono ${relationColor}`}>
                {leader.opinion > 0 ? `+${leader.opinion}` : leader.opinion} / 100
              </span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span>Banner Levies: <strong className="text-red-300 font-mono">{leader.troops}</strong></span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className={`p-2.5 px-4 text-xs font-semibold flex items-center gap-2 transition-all ${
            actionFeedback.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-800' :
            actionFeedback.type === 'danger' ? 'bg-red-950/90 text-red-200 border-b border-red-800' :
            'bg-amber-950/90 text-amber-200 border-b border-amber-800'
          }`}>
            {actionFeedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{actionFeedback.message}</span>
          </div>
        )}

        {/* Nav Tabs */}
        <div className="flex items-center border-b border-stone-800 bg-stone-950/90 text-xs px-2 shrink-0">
          <button
            onClick={() => { sound.playClick(); setActiveTab('profile'); }}
            className={`py-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-300 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Noble Profile
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('diplomacy'); }}
            className={`py-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'diplomacy'
                ? 'border-amber-500 text-amber-300 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Diplomatic Actions
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('military'); }}
            className={`py-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'military'
                ? 'border-amber-500 text-amber-300 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Army & War
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('intrigue'); }}
            className={`py-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'intrigue'
                ? 'border-amber-500 text-amber-300 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Schemes & Shadow
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          
          {activeTab === 'profile' && (
            <div className="space-y-3.5">
              {/* Bio & Leadership Rule */}
              <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
                <div className="text-xs font-bold text-amber-300 font-cinzel mb-1 flex items-center justify-between">
                  <span>Leadership & Feudal System</span>
                  <span className="text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded font-sans">
                    {leader.leadershipType || 'Feudal Lordship'}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {leader.bio || `${leader.name} commands the fiefdom of ${leader.provinceName || leader.realmName || 'their ancestral seat'}, adhering to ancient feudal codes and hereditary succession.`}
                </p>
              </div>

              {/* Character Attributes / Stats */}
              <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
                <h3 className="text-xs font-bold text-stone-200 mb-2.5 font-cinzel">Noble Attributes</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 text-center">
                    <div className="text-[10px] text-red-400 font-semibold">Martial</div>
                    <div className="text-base font-bold text-stone-100 font-mono mt-0.5">⚔️ {leader.stats.martial}</div>
                  </div>
                  <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 text-center">
                    <div className="text-[10px] text-blue-400 font-semibold">Diplomacy</div>
                    <div className="text-base font-bold text-stone-100 font-mono mt-0.5">🕊️ {leader.stats.diplomacy}</div>
                  </div>
                  <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 text-center">
                    <div className="text-[10px] text-purple-400 font-semibold">Intrigue</div>
                    <div className="text-base font-bold text-stone-100 font-mono mt-0.5">🗡️ {leader.stats.intrigue}</div>
                  </div>
                  <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 text-center">
                    <div className="text-[10px] text-emerald-400 font-semibold">Stewardship</div>
                    <div className="text-base font-bold text-stone-100 font-mono mt-0.5">🪙 {leader.stats.stewardship}</div>
                  </div>
                  <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 text-center">
                    <div className="text-[10px] text-yellow-400 font-semibold">Prowess</div>
                    <div className="text-base font-bold text-stone-100 font-mono mt-0.5">🛡️ {leader.stats.prowess}</div>
                  </div>
                  <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 text-center">
                    <div className="text-[10px] text-cyan-400 font-semibold">Intellect</div>
                    <div className="text-base font-bold text-stone-100 font-mono mt-0.5">📜 {leader.stats.intellect}</div>
                  </div>
                </div>
              </div>

              {/* Personality Traits */}
              <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
                <h3 className="text-xs font-bold text-stone-200 mb-2 font-cinzel">Noble Traits</h3>
                <div className="flex flex-wrap gap-1.5">
                  {leader.traits.map((trait, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-amber-950/60 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-800/60 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{trait}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diplomacy' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400">
                Establish diplomatic treaties, arrange cross-dynasty marriages, or bestow lavish gifts to sway {leader.name}.
              </p>

              {/* Gift Action */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>Send Gilded Treasury Gift</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Cost: 40 Gold • Increases opinion by +25.
                  </div>
                </div>
                <button
                  onClick={handleGift}
                  disabled={playerCharacter.stats.gold < 40}
                  className="px-3 py-1.5 rounded-lg bg-[#D49B28] hover:bg-[#b78722] text-stone-950 font-bold text-xs shadow-md disabled:opacity-40 cursor-pointer"
                >
                  Bestow (40 🪙)
                </button>
              </div>

              {/* Sway Action */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Courtly Envoy & Diplomatic Sway</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Diplomacy test ({playerCharacter.stats.diplomacy} vs {leader.stats.intrigue}) • Chance to boost opinion.
                  </div>
                </div>
                <button
                  onClick={handleSway}
                  className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-700 text-blue-200 font-bold text-xs cursor-pointer"
                >
                  Send Envoy
                </button>
              </div>

              {/* Propose Betrothal */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Propose Dynastic Alliance</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Seal a non-aggression concordat between houses.
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playFanfare();
                    if (onProposeAlliance) onProposeAlliance(leader);
                    showFeedback(`Dispatched royal herald to negotiate an alliance pact with House ${leader.houseName}.`, 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs cursor-pointer"
                >
                  Offer Pact
                </button>
              </div>

              {/* Demand Vassalage Fealty */}
              {['King', 'Emperor'].includes(playerCharacter.rank) && (
                <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Demand Feudal Submission</span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Demand {leader.name} swear vassal fealty to your imperial throne.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sound.playWarHorns();
                      if (onDemandFealty) onDemandFealty(leader);
                      showFeedback(`Sent sovereign ultimatum demanding fealty from ${leader.name}.`, 'info');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-200 font-bold text-xs cursor-pointer"
                  >
                    Demand Fealty
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'military' && (
            <div className="space-y-3">
              <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200">Standing Forces:</span>
                  <span className="text-sm font-bold text-red-400 font-mono">⚔️ {leader.troops} Levies</span>
                </div>
                {leader.militaryUnit && (
                  <div className="text-xs text-amber-300 bg-stone-900/90 p-2 rounded-lg border border-stone-800">
                    Signature Regiment: <strong>{leader.militaryUnit}</strong>
                  </div>
                )}
              </div>

              {/* Single Combat Duel */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-orange-400" />
                    <span>Challenge to Trial by Combat</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Martial Contest ({playerCharacter.stats.martial} vs {leader.stats.martial}) for prestige and renown.
                  </div>
                </div>
                <button
                  onClick={handleDuel}
                  className="px-3 py-1.5 rounded-lg bg-orange-950 hover:bg-orange-900 border border-orange-700 text-orange-200 font-bold text-xs cursor-pointer"
                >
                  Duel
                </button>
              </div>

              {/* Declare War Direct */}
              <div className="bg-red-950/60 p-3.5 rounded-xl border border-red-800/80 space-y-2">
                <div className="text-xs font-bold text-red-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-400" />
                  <span>Declare War on this Noble's Domain</span>
                </div>
                <p className="text-[11px] text-stone-300">
                  Mobilize your feudal host and march against {leader.provinceName || leader.realmName || leader.name}.
                </p>
                <button
                  onClick={handleWar}
                  className="w-full py-2 rounded-xl bg-red-800 hover:bg-red-700 text-stone-100 font-black text-xs font-cinzel shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Swords className="w-4 h-4" />
                  <span>March to War Against {leader.name}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'intrigue' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400">
                Employ shadowy spies and whispers to undermine, fabricate claims, or extort {leader.name}.
              </p>

              {/* Fabricate Claim */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-yellow-400" />
                    <span>Fabricate Casus Belli Claim</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Cost: 60 Gold • Fabricates historic parchment claims on their title.
                  </div>
                </div>
                <button
                  onClick={handleFabricateClaim}
                  disabled={playerCharacter.stats.gold < 60}
                  className="px-3 py-1.5 rounded-lg bg-yellow-950 hover:bg-yellow-900 border border-yellow-700 text-yellow-200 font-bold text-xs disabled:opacity-40 cursor-pointer"
                >
                  Fabricate (60 🪙)
                </button>
              </div>

              {/* Blackmail Scheme */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span>Dig Up Dark Secrets & Blackmail</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Uses Intrigue ({playerCharacter.stats.intrigue}) to gain leverage over their house.
                  </div>
                </div>
                <button
                  onClick={() => handleScheme('Blackmail')}
                  className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 font-bold text-xs cursor-pointer"
                >
                  Uncover Secret
                </button>
              </div>

              {/* Siphon Wealth */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <Skull className="w-4 h-4 text-red-400" />
                    <span>Infiltrate & Siphon Treasury</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Heist mission to loot provincial revenues.
                  </div>
                </div>
                <button
                  onClick={() => handleScheme('Siphon Wealth')}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs cursor-pointer"
                >
                  Send Thieves
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Close */}
        <div className="bg-stone-950 p-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
