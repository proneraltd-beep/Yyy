import React, { useState } from 'react';
import { Character, Realm, Vassal } from '../types';
import { 
  Wine, 
  Compass, 
  Sparkles, 
  Shield, 
  Scale, 
  Crown, 
  Coins, 
  Heart, 
  Smile, 
  Flame,
  CheckCircle
} from 'lucide-react';
import { sound } from '../utils/audio';

interface CourtActivitiesTabProps {
  character: Character;
  vassals: Vassal[];
  onHostFeast: (cost: number) => void;
  onGoHunting: (cost: number) => void;
  onGoPilgrimage: (cost: number) => void;
  onHostTournament: (cost: number) => void;
  onConductSpeciesCeremony: (cost: number) => void;
  onAdministerJustice: (decisionId: string, outcome: { gold?: number; happiness?: number; renown?: number; unrest?: number }) => void;
}

export const CourtActivitiesTab: React.FC<CourtActivitiesTabProps> = ({
  character,
  vassals,
  onHostFeast,
  onGoHunting,
  onGoPilgrimage,
  onHostTournament,
  onConductSpeciesCeremony,
  onAdministerJustice
}) => {
  const [activeJusticeCase, setActiveJusticeCase] = useState<{
    id: string;
    title: string;
    description: string;
    petitioner: string;
    options: { text: string; outcome: { gold?: number; happiness?: number; renown?: number; unrest?: number } }[];
  } | null>(null);

  const courtCases = [
    {
      id: 'case_1',
      title: 'The Merchant’s Grain Hoard',
      petitioner: 'Guildmaster Bartholomew',
      description: 'A wealthy grain merchant bought all the barley reserves in the lower province before winter and is selling it at triple the normal price. Starving peasants demand price controls.',
      options: [
        {
          text: 'Seize the grain and distribute it freely to the hungry poor (+25 Joy, -Unrest)',
          outcome: { happiness: 25, unrest: -15, renown: 15 }
        },
        {
          text: 'Uphold the merchant’s contract rights and tax 20% of his profits (+80 Gold)',
          outcome: { gold: 80, happiness: -10, renown: 5 }
        },
        {
          text: 'Fine the merchant heavily for price gouging and set fair grain tariffs (+50 Gold, +10 Joy)',
          outcome: { gold: 50, happiness: 10, renown: 10, unrest: -5 }
        }
      ]
    },
    {
      id: 'case_2',
      title: 'The Border Witchcraft Accusation',
      petitioner: 'Father Anselm of the Church',
      description: 'A village priest accuses an elderly herbalist of using unnatural witchcraft to cause a cow to produce sour milk. The herbalist claims she only cured the village children of fever.',
      options: [
        {
          text: 'Declare the herbalist innocent and appoint her as provincial apothecary (+15 Mana, +10 Joy)',
          outcome: { happiness: 10, renown: 10 }
        },
        {
          text: 'Rule in favor of the Church to preserve clerical loyalty (+20 Piety)',
          outcome: { renown: 10, happiness: -5 }
        },
        {
          text: 'Order them to work together to establish a healing hospice (-20 Gold, +20 Prosperity)',
          outcome: { gold: -20, happiness: 15, renown: 15 }
        }
      ]
    }
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20">
      
      {/* Grand Court Activities Header */}
      <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-amber-900/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel flex items-center gap-2">
              <Wine className="w-5 h-5 text-amber-400" />
              Court Activities, Feasts & Royal Ceremonies
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Entertain your nobility, strengthen faith, hold chivalric tournaments, and administer justice across the realm.
            </p>
          </div>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* 1. Grand Royal Feast */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-600/50 flex flex-col justify-between gap-3 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-3xl">🍷</span>
                <div>
                  <h3 className="font-bold text-sm text-stone-100 font-cinzel">Grand Royal Feast</h3>
                  <span className="text-[10px] text-amber-400 font-semibold">Cost: 40 🪙</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-snug">
                Host a lavish banquet with spiced wine and troubadours. Improves opinion with all realm vassals and courtiers.
              </p>
              <div className="text-[11px] text-emerald-400 font-medium mt-2">
                ✨ +20 Vassal Loyalty, +15 Subject Joy, +10 Renown
              </div>
            </div>

            <button
              onClick={() => {
                sound.playFanfare();
                onHostFeast(40);
              }}
              disabled={character.stats.gold < 40}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-40"
            >
              Host Grand Feast (40 🪙)
            </button>
          </div>

          {/* 2. Royal Hunt */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-600/50 flex flex-col justify-between gap-3 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-3xl">🏹</span>
                <div>
                  <h3 className="font-bold text-sm text-stone-100 font-cinzel">Royal Forest Hunt</h3>
                  <span className="text-[10px] text-amber-400 font-semibold">Cost: 25 🪙</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-snug">
                Ride out with hunting hounds and archers to track fierce beasts in the deep ancestral woodlands.
              </p>
              <div className="text-[11px] text-emerald-400 font-medium mt-2">
                ✨ +10 Martial Skill, +10 Health, Chance of Rare Game
              </div>
            </div>

            <button
              onClick={() => {
                sound.playSword();
                onGoHunting(25);
              }}
              disabled={character.stats.gold < 25}
              className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 shadow-md active:scale-95 transition-all disabled:opacity-40"
            >
              Organize Royal Hunt (25 🪙)
            </button>
          </div>

          {/* 3. Holy / Arcane Pilgrimage */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-600/50 flex flex-col justify-between gap-3 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-3xl">✨</span>
                <div>
                  <h3 className="font-bold text-sm text-stone-100 font-cinzel">Holy Pilgrimage</h3>
                  <span className="text-[10px] text-amber-400 font-semibold">Cost: 35 🪙</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-snug">
                Undertake a journey to consecrated cathedrals or ancient leylines in search of divine blessings and enlightenment.
              </p>
              <div className="text-[11px] text-emerald-400 font-medium mt-2">
                ✨ +30 Faith/Mana, +15 Renown, Serenity
              </div>
            </div>

            <button
              onClick={() => {
                sound.playMagic();
                onGoPilgrimage(35);
              }}
              disabled={character.stats.gold < 35}
              className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 shadow-md active:scale-95 transition-all disabled:opacity-40"
            >
              Undertake Pilgrimage (35 🪙)
            </button>
          </div>

          {/* 4. Grand Jousting Tournament */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-600/50 flex flex-col justify-between gap-3 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-3xl">🛡️</span>
                <div>
                  <h3 className="font-bold text-sm text-stone-100 font-cinzel">Grand Tournament</h3>
                  <span className="text-[10px] text-amber-400 font-semibold">Cost: 60 🪙</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-snug">
                Host jousting matches, duels, and archery contests. Attracts champions from all five realms.
              </p>
              <div className="text-[11px] text-emerald-400 font-medium mt-2">
                ✨ +35 Renown, +150 Veteran Recruits, +15 Joy
              </div>
            </div>

            <button
              onClick={() => {
                sound.playFanfare();
                onHostTournament(60);
              }}
              disabled={character.stats.gold < 60}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-40"
            >
              Host Grand Tournament (60 🪙)
            </button>
          </div>
        </div>
      </div>

      {/* Administer Royal Justice Section */}
      <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-amber-200 font-cinzel flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              Administer Royal Justice & Petitions
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Hear court petitions from citizens, guilds, and clergy to maintain the rule of law.
            </p>
          </div>
        </div>

        {activeJusticeCase ? (
          <div className="p-4 rounded-xl bg-stone-950/80 border border-amber-500 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-amber-200 font-cinzel">{activeJusticeCase.title}</span>
              <span className="text-xs text-stone-400">Petitioner: {activeJusticeCase.petitioner}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">{activeJusticeCase.description}</p>

            <div className="space-y-2 pt-2 border-t border-stone-800">
              {activeJusticeCase.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playCoin();
                    onAdministerJustice(activeJusticeCase.id, opt.outcome);
                    setActiveJusticeCase(null);
                  }}
                  className="w-full p-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-left text-xs text-stone-200 font-semibold transition-all hover:border-amber-500"
                >
                  ⚖️ {opt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-stone-400">There are active petitions awaiting your royal judgment:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {courtCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveJusticeCase(c)}
                  className="p-3 rounded-xl bg-stone-950/80 hover:bg-stone-800 border border-stone-800 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-stone-200">{c.title}</div>
                    <div className="text-[10px] text-stone-400">Petitioner: {c.petitioner}</div>
                  </div>
                  <span className="text-xs text-amber-400 font-bold">Hear Case ➔</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
