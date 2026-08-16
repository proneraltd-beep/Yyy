import React, { useState } from 'react';
import { Species, Gender } from '../types';
import { PRESET_DYNASTIES } from '../data/initialWorld';
import { SPECIES_DATA } from '../data/speciesData';
import { Crown, Sparkles, UserCheck, Shield, ChevronRight, Wand2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    name: string;
    dynastyName: string;
    gender: Gender;
    species: Species;
    rank: string;
    portrait: string;
    traits: string[];
    motto: string;
  }) => void;
}

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  isOpen,
  onClose,
  onStartGame
}) => {
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Human');
  const [name, setName] = useState<string>('Arthur');
  const [dynastyName, setDynastyName] = useState<string>('House Pendragon');
  const [gender, setGender] = useState<Gender>('Male');
  const [portrait, setPortrait] = useState<string>('👑');
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['Just Ruler', 'Master Tactician']);
  const [motto, setMotto] = useState<string>('Honor and Steel');

  if (!isOpen) return null;

  const availableTraits = [
    'Just Ruler', 'Master Tactician', 'Silver-Tongued', 'Arcane Scholar', 
    'Brave Warrior', 'Devout & Pious', 'Astute Merchant', 'Ancient Lore',
    'Apex Predator', 'Prophetic Sight', 'Immortal Lineage', 'Charming'
  ];

  const speciesPortraits: Record<Species, string[]> = {
    Human: ['👑', '🤴', '👸', '⚔️', '🛡️', '🧙‍♂️'],
    Vampire: ['🧛', '🥀', '🦇', '🩸', '👁️', '🖤'],
    Werewolf: ['🐺', '🌕', '🐾', '⚡', '🐕', '🌲'],
    Witch: ['🔮', '✨', '🧙‍♀️', '🧪', '🌙', '🦉'],
    HighElf: ['🧝', '☀️', '🏹', '🌟', '🕊️', '💎']
  };

  const handleToggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      if (selectedTraits.length < 3) {
        setSelectedTraits([...selectedTraits, trait]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border-2 border-amber-500/70 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-xl font-black text-amber-200 font-cinzel flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" />
              Begin A New Dynasty
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Choose a legendary dynasty ruler preset or forge your own noble lineage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setTab('presets')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'presets' ? 'bg-amber-600 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
            }`}
          >
            Iconic Dynasty Presets
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'custom' ? 'bg-amber-600 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
            }`}
          >
            Custom Ruler Creator
          </button>
        </div>

        {/* Presets Mode */}
        {tab === 'presets' && (
          <div className="space-y-3">
            {PRESET_DYNASTIES.map((preset) => {
              const sInfo = SPECIES_DATA[preset.species];

              return (
                <div
                  key={preset.id}
                  className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-stone-900 border-2 border-amber-500/50 flex items-center justify-center text-3xl shrink-0 shadow-md">
                      {preset.portrait}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-amber-100 font-cinzel">
                          {preset.name} ({preset.dynastyName})
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-amber-300">
                          {preset.species}
                        </span>
                      </div>
                      <div className="text-xs text-stone-400 font-semibold">{preset.title}</div>
                      <p className="text-xs text-stone-400 italic mt-1">"{preset.motto}"</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {preset.traits.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playFanfare();
                      onStartGame({
                        name: preset.name,
                        dynastyName: preset.dynastyName,
                        gender: preset.gender,
                        species: preset.species,
                        rank: preset.rank,
                        portrait: preset.portrait,
                        traits: preset.traits,
                        motto: preset.motto
                      });
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs shadow-md active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1"
                  >
                    <span>Play Dynasty</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Creator Mode */}
        {tab === 'custom' && (
          <div className="space-y-4">
            {/* Species Picker */}
            <div>
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2">
                Choose Species Realm
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['Human', 'Vampire', 'Werewolf', 'Witch', 'HighElf'] as Species[]).map((sp) => {
                  const info = SPECIES_DATA[sp];
                  const isSelected = selectedSpecies === sp;
                  return (
                    <button
                      key={sp}
                      onClick={() => {
                        setSelectedSpecies(sp);
                        setPortrait(speciesPortraits[sp][0]);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-amber-950 border-amber-500 shadow-md'
                          : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{info.icon}</div>
                      <div className="text-xs font-bold text-stone-200">{sp}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name & Dynasty Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Ruler First Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Dynasty / House Name</label>
                <input
                  type="text"
                  value={dynastyName}
                  onChange={(e) => setDynastyName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Portrait Picker */}
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Ruler Portrait Emblem</label>
              <div className="flex items-center gap-2">
                {speciesPortraits[selectedSpecies].map((icon, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPortrait(icon)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl transition-all ${
                      portrait === icon ? 'bg-amber-950 border-amber-500 scale-110 shadow-md' : 'bg-stone-950 border-stone-800'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Starting Traits (Pick 2-3) */}
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                Select Starting Traits ({selectedTraits.length}/3)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTraits.map((t) => {
                  const isSelected = selectedTraits.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => handleToggleTrait(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-stone-950 border-amber-400 shadow-sm'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                sound.playFanfare();
                onStartGame({
                  name: name || 'Arthur',
                  dynastyName: dynastyName || 'House Sovereign',
                  gender,
                  species: selectedSpecies,
                  rank: selectedSpecies === 'Vampire' ? 'Grand Sovereign' : selectedSpecies === 'Werewolf' ? 'High Alpha' : selectedSpecies === 'Witch' ? 'High Matriarch' : 'King',
                  portrait: portrait || '👑',
                  traits: selectedTraits,
                  motto: motto || 'For Blood and Honor'
                });
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-sm shadow-xl active:scale-95 transition-all"
            >
              Found Dynasty & Ascend Throne
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
