import React from 'react';
import { SPECIES_DATA, CROSS_MARRIAGE_OUTCOMES } from '../data/speciesData';
import { BookOpen, Crown, Castle, Swords, Sparkles, Scale, Heart, Coins } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border-2 border-amber-600/60 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-100 font-cinzel">
                Medieval Realms: Codex & Gameplay Guide
              </h2>
              <p className="text-xs text-stone-400">
                A multi-species feudal dynasty and life simulation RPG guide.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Section 1: The 5 Realms & Species */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-cinzel flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            The Five Sovereign Species Realms
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.values(SPECIES_DATA).map((s) => (
              <div key={s.name} className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="font-bold text-xs text-stone-200">{s.title}</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">{s.lore}</p>
                <div className="text-[10px] text-amber-400 font-semibold mt-1">
                  Unique Resource: {s.specialResourceName} ({s.specialResourceIcon})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Cross-Realm Marriages & Hybrids */}
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-cinzel flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400" />
            Cross-Species Royal Marriages & Hybrid Offspring
          </h3>
          <p className="text-xs text-stone-300">
            Arrange royal betrothals between different species to secure military alliances and unlock powerful hybrid bloodline traits in future heirs:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(CROSS_MARRIAGE_OUTCOMES).slice(0, 6).map(([pair, info], idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800 text-xs">
                <div className="font-bold text-stone-200">{pair.replace('+', ' + ')}</div>
                <div className="text-emerald-400 text-[11px]">{info.hybridName}: {info.perk}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Core Gameplay Loop */}
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-cinzel flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Key Systems Breakdown
          </h3>
          <ul className="space-y-1.5 text-xs text-stone-300 list-disc list-inside">
            <li><strong>Age Up (+1 Year):</strong> Advances the world by one year, collects provincial tax gold, ages your family, and triggers historical dilemmas.</li>
            <li><strong>Provinces & Upgrades:</strong> Construct Castles, Markets, Barracks, Academies, and Species Monuments to multiply wealth and troop levies.</li>
            <li><strong>Dynasty & Education:</strong> Appoint mentors to educate your children, nominate your primary heir, and pass the crown to the next generation upon death.</li>
            <li><strong>Cross-Realm Treaties & War:</strong> Sign trade pacts, dispatch merchant caravans, or declare war to siege and annex neighboring provinces.</li>
            <li><strong>Species Powers:</strong> Cast supernatural rites (Vampire Blood Feasts, Werewolf Full Moon Roars, Witch Coven Hexes, Human Crusades) on the Laws tab.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
