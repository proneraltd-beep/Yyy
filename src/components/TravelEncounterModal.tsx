import React, { useState } from 'react';
import { Character } from '../types';
import { Compass, Sparkles, Shield, Heart, Award, ArrowRight, Check } from 'lucide-react';
import { sound } from '../utils/audio';

export type ActivityType = 'hunt' | 'pilgrimage';

export interface TravelOutcome {
  gold?: number;
  health?: number;
  martial?: number;
  intellect?: number;
  pietyOrMana?: number;
  renown?: number;
  happiness?: number;
  addTrait?: string;
  removeTrait?: string;
  chronicleTitle: string;
  chronicleDescription: string;
}

export interface EncounterOption {
  id: string;
  text: string;
  description: string;
  traitReward?: string;
  outcome: TravelOutcome;
}

export interface TravelEncounter {
  id: string;
  activity: ActivityType;
  title: string;
  location: string;
  icon: string;
  narrative: string;
  options: EncounterOption[];
}

const HUNT_ENCOUNTERS: TravelEncounter[] = [
  {
    id: 'hunt_white_stag',
    activity: 'hunt',
    title: 'The Great White Stag of the Ancestral Woods',
    location: 'Deep Silverpine Forest',
    icon: '🦌',
    narrative: 'Deep within the ancient glades, misty sunbeams illuminate a legendary White Stag—a creature spoken of only in royal ballads. Your hunting hounds bark furiously at bay. The beast locks its piercing silver eyes upon you, challenging your sovereignty.',
    options: [
      {
        id: 'hunt_spear_combat',
        text: 'Face the Beast Alone in Single Combat with Spear',
        description: 'Dismount and face the legendary stag in single combat to prove sovereign prowess. (Risk: Wounded or Glory)',
        traitReward: 'Master Hunter (or Wounded)',
        outcome: {
          martial: 12,
          renown: 40,
          health: -15,
          addTrait: 'Wounded',
          chronicleTitle: 'Hunting Duel with the White Stag',
          chronicleDescription: 'Faced the mythical White Stag in solitary combat in Silverpine. Though wounded in the fierce grapple, your hunting spear brought down the beast, earning eternal renown across the realm.'
        }
      },
      {
        id: 'hunt_pack_surround',
        text: 'Order the Royal Hounds and Master Archers to Encircle',
        description: 'Use disciplined tactics to fell the quarry cleanly. Secure venison and trophies for a magnificent court feast.',
        traitReward: 'Generous Sovereign',
        outcome: {
          happiness: 25,
          gold: 30,
          renown: 20,
          addTrait: 'Master Hunter',
          chronicleTitle: 'Triumphant Royal Forest Hunt',
          chronicleDescription: 'Masterfully commanded your royal huntsmen and archers to claim the Great White Stag. The quarry stocked the palace larder for lavish feasts.'
        }
      },
      {
        id: 'hunt_spare_stag',
        text: 'Lower Your Bow and Grant the Sacred Beast Royal Pardon',
        description: 'Recognize the stag as a divine woodland omen. Receive spiritual blessing from the spirits of nature.',
        traitReward: 'Nature Mystic',
        outcome: {
          pietyOrMana: 35,
          happiness: 15,
          renown: 15,
          addTrait: 'Nature Mystic',
          chronicleTitle: 'Sacred Pardon of the White Stag',
          chronicleDescription: 'Encountered the legendary White Stag and granted it sovereign amnesty. Druids and subjects praised your spiritual restraint and harmony with the ancient wild.'
        }
      }
    ]
  },
  {
    id: 'hunt_shadow_wolf',
    activity: 'hunt',
    title: 'The Bloodfang Direwolf Pack',
    location: 'Shadowcrag Ravine',
    icon: '🐺',
    narrative: 'As dusk settles over the high crags, eerie howls echo through the pines. A massive alpha direwolf—scarred by countless battles—steps out from the rocks, flanked by its ravenous pack. Your vanguard horses rear in terror.',
    options: [
      {
        id: 'hunt_slay_alpha',
        text: 'Draw Imperial Steel and Slay the Alpha Direwolf',
        description: 'Lead the charge directly into the alpha wolf with royal steel. Prove your martial fury.',
        traitReward: 'Beast Slayer',
        outcome: {
          martial: 15,
          renown: 35,
          health: -5,
          addTrait: 'Beast Slayer',
          chronicleTitle: 'Felled the Bloodfang Alpha',
          chronicleDescription: 'Slew the monstrous alpha direwolf of Shadowcrag Ravine with a single strike of royal steel, hanging its pelts above the Great Throne.'
        }
      },
      {
        id: 'hunt_tame_wolf',
        text: 'Tame a Wounded Wolf Pup Discovered in the Den',
        description: 'Spare a young cub to raise as a royal court companion and guardian.',
        traitReward: 'Beast Master',
        outcome: {
          martial: 8,
          happiness: 20,
          renown: 15,
          addTrait: 'Beast Master',
          chronicleTitle: 'Adopted Royal Direwolf Hound',
          chronicleDescription: 'Rescued and bonded with a direwolf pup during the royal hunt, training it as a loyal throne-room companion.'
        }
      },
      {
        id: 'hunt_tactical_retreat',
        text: 'Fire Burning Arrows to Scatter the Pack Safely',
        description: 'Rely on defensive flame tactics to protect royal retainers without casualty.',
        outcome: {
          martial: 6,
          renown: 10,
          happiness: 10,
          chronicleTitle: 'Huntsmen Repelled Direwolf Ambush',
          chronicleDescription: 'Successfully fended off a ravenous wolf pack using coordinated torchlight tactics without losing a single squire.'
        }
      }
    ]
  }
];

const PILGRIMAGE_ENCOUNTERS: TravelEncounter[] = [
  {
    id: 'pilgrim_ancient_hermit',
    activity: 'pilgrimage',
    title: 'The Mountain Hermit & the Altar of Truth',
    location: 'Mount Celestia Summit Altar',
    icon: '✨',
    narrative: 'After weeks of ascending steep, snow-swept stairs, you reach the sanctuary of the High Hermit of Celestia. The holy sage is surrounded by floating sacred runes and asks you what you seek from the heavens.',
    options: [
      {
        id: 'pilgrim_enlightenment',
        text: 'Undergo Three Days of Silent Fasting Beneath the Altar',
        description: 'Abstain from royal pride, meditate upon the eternal cosmic order, and achieve spiritual enlightenment.',
        traitReward: 'Enlightened',
        outcome: {
          pietyOrMana: 45,
          intellect: 15,
          happiness: 25,
          addTrait: 'Enlightened',
          chronicleTitle: 'Attained Spiritual Enlightenment',
          chronicleDescription: 'Endured sacred fasting atop Mount Celestia, receiving a divine vision of cosmic harmony and earning the revered trait "Enlightened".'
        }
      },
      {
        id: 'pilgrim_monastic_endowment',
        text: 'Endow the Monastery with Generous Gold and Royal Relics',
        description: 'Fund the construction of a grand library and hospice for traveling pilgrims.',
        traitReward: 'Zealous Benefactor',
        outcome: {
          gold: -30,
          pietyOrMana: 50,
          renown: 35,
          addTrait: 'Zealous Benefactor',
          chronicleTitle: 'Endowed the High Mount Monastery',
          chronicleDescription: 'Generously financed the Holy Monastery of Celestia. The High Clergy anointed your dynasty with sacred imperial benedictions.'
        }
      },
      {
        id: 'pilgrim_theology_debate',
        text: 'Engage the Hermit in Philosophical Debate over Sacred Texts',
        description: 'Sharpen your theological and rhetorical mastery through scholarly dialogue.',
        traitReward: 'Theologian',
        outcome: {
          intellect: 14,
          pietyOrMana: 25,
          renown: 20,
          addTrait: 'Theologian',
          chronicleTitle: 'Scriptural Scholarly Debate',
          chronicleDescription: 'Debated high metaphysics and theology with the Hermit of Celestia, earning widespread renown for unmatched royal intellect.'
        }
      }
    ]
  },
  {
    id: 'pilgrim_river_penance',
    activity: 'pilgrimage',
    title: 'The River of Tears & the Weeping Shrine',
    location: 'Valley of the Martyrs',
    icon: '🕊️',
    narrative: 'Your pilgrimage caravan arrives at a rushing glacial river where thousands of poor pilgrims gather to pray before an ancient weeping monument. An elderly sick traveler pleads for safe crossing.',
    options: [
      {
        id: 'pilgrim_penance_wade',
        text: 'Carry the Sick Pilgrim Across the Glacial Torrent Yourself',
        description: 'Wade barefoot into the freezing waters to carry the pilgrim across in deep humility. (Risk of Frost / Wounded or Divine Grace)',
        traitReward: 'Pilgrim (Devout)',
        outcome: {
          pietyOrMana: 40,
          renown: 25,
          health: -10,
          addTrait: 'Pilgrim',
          chronicleTitle: 'Act of Sovereign Humility at the Weeping Shrine',
          chronicleDescription: 'Humbly carried suffering pilgrims across the freezing glacial rapids, hailed by commoners as a truly righteous sovereign of divine mercy.'
        }
      },
      {
        id: 'pilgrim_build_bridge',
        text: 'Order Your Royal Engineers to Construct a Permanent Stone Bridge',
        description: 'Spend royal gold to ensure every traveler can cross safely forever.',
        traitReward: 'Benevolent Ruler',
        outcome: {
          gold: -25,
          happiness: 25,
          renown: 30,
          pietyOrMana: 20,
          addTrait: 'Benevolent Ruler',
          chronicleTitle: 'Built the Bridge of Saint Benedict',
          chronicleDescription: 'Commissioned a grand stone arched bridge across the Valley of the Martyrs, establishing safe pilgrimage routes for centuries.'
        }
      },
      {
        id: 'pilgrim_consecrated_water',
        text: 'Collect Vials of Blessed River Water to Consecrate the Capital',
        description: 'Bless your home court provinces with miraculous healing water.',
        traitReward: 'Divine Favor',
        outcome: {
          pietyOrMana: 30,
          health: 15,
          happiness: 15,
          addTrait: 'Divine Favor',
          chronicleTitle: 'Consecrated Capital with Sacred Waters',
          chronicleDescription: 'Returned from the Holy Pilgrimage with vials of blessed spring water, consecrating the royal cathedral and purifying the court.'
        }
      }
    ]
  }
];

interface TravelEncounterModalProps {
  isOpen: boolean;
  activity: ActivityType;
  character: Character;
  onResolve: (outcome: TravelOutcome) => void;
  onClose: () => void;
}

export const TravelEncounterModal: React.FC<TravelEncounterModalProps> = ({
  isOpen,
  activity,
  character,
  onResolve,
  onClose
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [resolvedOutcome, setResolvedOutcome] = useState<TravelOutcome | null>(null);

  if (!isOpen) return null;

  // Pick an encounter based on activity
  const encounterList = activity === 'hunt' ? HUNT_ENCOUNTERS : PILGRIMAGE_ENCOUNTERS;
  const encounter = encounterList[Math.floor(Math.random() * encounterList.length)] || encounterList[0];

  const handleSelectOption = (opt: EncounterOption) => {
    setSelectedOptionId(opt.id);
    sound.playClick();
  };

  const handleConfirmDecision = () => {
    const chosen = encounter.options.find(o => o.id === selectedOptionId);
    if (!chosen) return;

    if (chosen.outcome.health && chosen.outcome.health < 0) {
      sound.playSwordClash();
    } else {
      sound.playFanfare();
    }

    setResolvedOutcome(chosen.outcome);
  };

  const handleFinish = () => {
    if (resolvedOutcome) {
      onResolve(resolvedOutcome);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="w-full max-w-xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Activity Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-700/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-400/50 flex items-center justify-center text-2xl shadow-md">
              {encounter.icon}
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Travel Dialogue Event • {encounter.location}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-amber-100 font-cinzel">
                {encounter.title}
              </h2>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: ACTIVE ENCOUNTER DIALOGUE CHOICES */}
        {/* ========================================================================= */}
        {!resolvedOutcome ? (
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Narrative Box */}
            <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-200 text-xs sm:text-sm leading-relaxed italic shadow-inner">
              "{encounter.narrative}"
            </div>

            <div className="text-xs font-bold text-amber-300 font-cinzel uppercase tracking-wide">
              Choose Your Royal Response:
            </div>

            {/* Choices list */}
            <div className="space-y-2.5">
              {encounter.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-stone-900/70 border-stone-800 hover:border-stone-700 hover:bg-stone-850'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-100 font-cinzel">
                        {opt.text}
                      </h4>
                      {opt.traitReward && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/60 font-bold shrink-0">
                          Trait: {opt.traitReward}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer Action Button */}
            <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
              <button
                onClick={handleConfirmDecision}
                disabled={!selectedOptionId}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Commit to Royal Choice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: RESOLVED EVENT OUTCOME */
          /* ========================================================================= */
          <div className="p-4 sm:p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 mx-auto flex items-center justify-center text-3xl shadow-lg">
              {encounter.icon}
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 font-cinzel">
                {resolvedOutcome.chronicleTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-md mx-auto leading-relaxed">
                {resolvedOutcome.chronicleDescription}
              </p>
            </div>

            {/* Trait & Consequence Pill Summary */}
            <div className="p-3.5 bg-stone-900/90 rounded-xl border border-stone-800 flex flex-wrap items-center justify-center gap-2">
              {resolvedOutcome.addTrait && (
                <div className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg bg-purple-900/60 text-purple-200 border border-purple-500/60 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>Gained Trait: {resolvedOutcome.addTrait}</span>
                </div>
              )}
              {resolvedOutcome.health !== undefined && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${resolvedOutcome.health < 0 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                  Health: {resolvedOutcome.health > 0 ? `+${resolvedOutcome.health}` : resolvedOutcome.health}
                </span>
              )}
              {resolvedOutcome.pietyOrMana && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Piety/Mana: +{resolvedOutcome.pietyOrMana}
                </span>
              )}
              {resolvedOutcome.martial && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-950 text-red-300 border border-red-800">
                  Martial: +{resolvedOutcome.martial}
                </span>
              )}
              {resolvedOutcome.renown && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800">
                  Renown: +{resolvedOutcome.renown}
                </span>
              )}
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Return to Royal Court</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
