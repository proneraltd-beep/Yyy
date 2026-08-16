import React, { useState } from 'react';
import { Character, FamilyMember, CoronationStyle } from '../types';
import { Crown, Sparkles, Skull, ArrowRight, Award, Flame, RefreshCw, Shield, Wine, Scroll } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface DeathHeirModalProps {
  deceasedCharacter: Character;
  heirs: FamilyMember[];
  reignYears: number;
  onContinueAsHeir: (heirMember: FamilyMember, coronationStyle: CoronationStyle) => void;
  onStartNewDynasty: () => void;
}

export const DeathHeirModal: React.FC<DeathHeirModalProps> = ({
  deceasedCharacter,
  heirs,
  reignYears,
  onContinueAsHeir,
  onStartNewDynasty
}) => {
  const [selectedHeirId, setSelectedHeirId] = useState<string>(
    heirs.find(h => h.isHeir)?.id || heirs[0]?.id || ''
  );
  const [coronationStyle, setCoronationStyle] = useState<CoronationStyle>('sacred_rites');

  const selectedHeir = heirs.find(h => h.id === selectedHeirId);
  const treasuryGold = deceasedCharacter.stats.gold;

  const coronationOptions: Array<{
    id: CoronationStyle;
    title: string;
    icon: string;
    cost: number;
    description: string;
    benefits: string;
    color: string;
  }> = [
    {
      id: 'sacred_rites',
      title: 'Sacred Rites & Holy Anointing',
      icon: '✨',
      cost: 35,
      description: 'Bless the new monarch with high temple rituals, holy oils, and ancestral blessings.',
      benefits: '+40 Piety/Mana • +30 Vassal Loyalty • High Sanctity',
      color: 'border-blue-500/60 bg-blue-950/40 text-blue-200'
    },
    {
      id: 'martial_triumph',
      title: 'Martial Triumph & Legion Review',
      icon: '⚔️',
      cost: 40,
      description: 'Parade through the realm with armored legions, heavy banners, and chivalric oath ceremonies.',
      benefits: '+40 Martial • +250 Frontline Levies • +30 Renown',
      color: 'border-rose-500/60 bg-rose-950/40 text-rose-200'
    },
    {
      id: 'lavish_feast',
      title: 'Lavish Imperial Feast & Jubilee',
      icon: '🍷',
      cost: 50,
      description: 'Grand three-day tournament, flowing wine, free grain to commoners, and noble banquets.',
      benefits: '+35 Realm Joy • +35 Vassal Opinion • -15 Unrest',
      color: 'border-amber-500/60 bg-amber-950/40 text-amber-200'
    },
    {
      id: 'pragmatic',
      title: 'Pragmatic Low-Key Coronation',
      icon: '📜',
      cost: 0,
      description: 'A modest oath taking in the council chambers to preserve the royal treasury during tight years.',
      benefits: '0 Gold Cost • Conserves State Treasury',
      color: 'border-stone-600/60 bg-stone-900/60 text-stone-300'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-stone-900 border-2 border-amber-600/70 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center space-y-1 border-b border-stone-800 pb-4">
          <div className="w-16 h-16 rounded-full bg-stone-950 border-2 border-stone-700 mx-auto flex items-center justify-center text-3xl shadow-inner">
            <Skull className="w-8 h-8 text-stone-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-cinzel">
            The Sovereign Has Fallen
          </h2>
          <p className="text-xs text-stone-400">
            {deceasedCharacter.name} {deceasedCharacter.dynastyName} passed away at age {deceasedCharacter.age} due to {deceasedCharacter.causeOfDeath || 'natural old age'}.
          </p>
        </div>

        {/* Eulogy & Legacy Summary */}
        <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 space-y-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Reign Legacy Chronicle</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
              <div className="text-[10px] text-stone-400">Reign Length</div>
              <div className="text-sm font-bold text-amber-300 font-mono">{reignYears} Years</div>
            </div>
            <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
              <div className="text-[10px] text-stone-400">Final Renown</div>
              <div className="text-sm font-bold text-purple-300 font-mono">{deceasedCharacter.stats.renown}</div>
            </div>
            <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
              <div className="text-[10px] text-stone-400">Inherited Treasury</div>
              <div className="text-sm font-bold text-yellow-300 font-mono">{Math.round(treasuryGold * 0.8)} 🪙</div>
            </div>
          </div>
        </div>

        {/* Heir Succession Choice */}
        {heirs.length > 0 ? (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-amber-200 font-cinzel flex items-center justify-between mb-2">
                <span>1. Select Your Successor to Continue Dynasty</span>
                <span className="text-stone-400 text-[11px] font-normal">{heirs.length} eligible kin</span>
              </div>

              <div className="space-y-2">
                {heirs.map((heir) => (
                  <div
                    key={heir.id}
                    onClick={() => setSelectedHeirId(heir.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      selectedHeirId === heir.id
                        ? 'bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-500'
                        : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{heir.portrait}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-100">{heir.name}</span>
                          {heir.isHeir && (
                            <span className="text-[9px] font-bold bg-amber-600 text-stone-950 px-1.5 py-0.2 rounded">
                              PRIMARY HEIR
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-400">
                          {heir.species} • Age {heir.age} • {heir.title}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {heir.traits.map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-900 text-amber-300 border border-stone-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Coronation Ceremony Style */}
            {selectedHeir && (
              <div className="space-y-2 pt-1 border-t border-stone-800">
                <div className="text-xs font-bold text-amber-200 font-cinzel flex items-center justify-between">
                  <span>2. Decree Coronation Ceremony Style</span>
                  <span className="text-stone-400 text-[10px]">Select ascent rites</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {coronationOptions.map((opt) => {
                    const isSelected = coronationStyle === opt.id;
                    const canAfford = Math.round(treasuryGold * 0.8) >= opt.cost;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (canAfford) setCoronationStyle(opt.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? `${opt.color} ring-1 ring-amber-500 shadow-md`
                            : canAfford 
                              ? 'bg-stone-950/80 border-stone-800 hover:border-stone-700 text-stone-300' 
                              : 'bg-stone-950/40 border-stone-900 text-stone-600 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span>{opt.icon}</span>
                            <span className="truncate">{opt.title}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-amber-300">
                            {opt.cost > 0 ? `-${opt.cost} 🪙` : 'Free'}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{opt.description}</p>
                        <div className="text-[9px] font-semibold text-emerald-400 mt-1.5">{opt.benefits}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedHeir && (
              <button
                onClick={() => {
                  sound.playFanfare();
                  try {
                    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
                  } catch {}
                  onContinueAsHeir(selectedHeir, coronationStyle);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Crown className="w-5 h-5 text-stone-950" />
                <span>Enact Coronation as {selectedHeir.name}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-rose-300 italic">
              Your noble line has ended with no surviving heirs to inherit the throne.
            </p>
            <button
              onClick={onStartNewDynasty}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Found a New Dynasty</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
