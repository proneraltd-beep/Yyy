import React, { useState } from 'react';
import { sound } from '../../utils/audio';

interface DeclareWarModalProps {
  targetName: string;
  targetType: 'realm' | 'province' | 'vassal';
  targetProvincesCount?: number;
  totalImperialTroops?: number; // in thousands or raw number, e.g. 51.3
  onConfirmDeclaration: (claim: string, yearlyTroops: number, commandDirectly: boolean) => void;
  onClose: () => void;
}

export const DeclareWarModal: React.FC<DeclareWarModalProps> = ({
  targetName,
  targetType,
  targetProvincesCount = 12,
  totalImperialTroops = 450,
  onConfirmDeclaration,
  onClose
}) => {
  // Step 1: Select Claim
  // Step 2: Set Yearly Troops & Choose Command
  const [step, setStep] = useState<'select_claim' | 'commit_troops'>('select_claim');
  const [selectedClaim, setSelectedClaim] = useState<string>(
    targetType === 'realm' ? 'Total Realm Conquest & Annexation' : 'Forced Vassalization'
  );
  
  // Convert troop count: if >= 1000, value in k, else raw count
  const isKUnits = totalImperialTroops >= 1000;
  const rawMaxTroops = totalImperialTroops;
  const initialCommitted = Math.max(10, Math.round(totalImperialTroops * 0.6));
  const [committedTroops, setCommittedTroops] = useState<number>(initialCommitted);

  const availableClaims = targetType === 'realm' ? [
    {
      id: 'Total Realm Conquest & Annexation',
      title: 'Total Realm Conquest & Annexation',
      desc: `Invade the whole realm. If victorious, all ${targetProvincesCount} chartered counties and provinces are completely annexed under your crown!`
    },
    {
      id: 'Subjugation of Whole Imperium',
      title: 'Subjugation of Whole Imperium',
      desc: `Force the entire sovereign realm and all provincial castellans to bend the knee and yield all regional territories.`
    },
    {
      id: 'Holy Imperial Crusade',
      title: 'Holy Imperial Crusade',
      desc: `Grand holy campaign to overthrow foreign rule and claim all ${targetProvincesCount} counties for your dynasty.`
    },
    {
      id: 'Forced Vassalization of All Counties',
      title: 'Forced Vassalization of All Counties',
      desc: `Subjugate every provincial holding of ${targetName} under direct royal feudal fealty.`
    }
  ] : [
    {
      id: 'Forced Vassalization',
      title: 'Forced Vassalization',
      desc: 'Subjugate the territory as a direct sworn vassal under your feudal crown.'
    },
    {
      id: 'Highland Marches Claim',
      title: 'Highland Marches Claim',
      desc: 'Enforce sovereign claims over regional marches and ancestral border holds.'
    },
    {
      id: 'Valorian Imperial Reclamation',
      title: 'Valorian Imperial Reclamation',
      desc: 'Reclaim ancestral frontier territories into the realm domain.'
    },
    {
      id: 'Border Tithe & Conquest',
      title: 'Border Tithe & Conquest',
      desc: 'Seize lucrative trade routes and levy annual tribute directly into your treasury.'
    }
  ];

  const handleSelectClaim = (claimTitle: string) => {
    sound.playClick();
    setSelectedClaim(claimTitle);
    setStep('commit_troops');
  };

  const handleFinalize = (commandDirectly: boolean) => {
    sound.playSword();
    // Convert to k if > 1000 or pass raw number
    const troopVal = committedTroops >= 1000 ? committedTroops / 1000 : committedTroops;
    onConfirmDeclaration(selectedClaim, troopVal, commandDirectly);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      
      {/* STEP 1: WHICH CLAIM DO YOU WANT TO USE */}
      {step === 'select_claim' && (
        <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-sm sm:max-w-md w-full p-6 text-stone-900 shadow-2xl animate-fade-in font-sans">
          
          <h3 className="font-black text-xl sm:text-2xl text-stone-950 text-center mb-3 font-sans">
            Declare War
          </h3>

          <p className="text-sm font-semibold text-stone-900 text-center mb-6 leading-snug">
            Which claim do you want to use to declare war against <span className="font-extrabold">{targetName}</span>?
          </p>

          {/* Selectable Claims List */}
          <div className="bg-[#EFEAD4] rounded-2xl p-2 border border-stone-300/80 space-y-1.5 shadow-inner mb-5">
            {availableClaims.map((claim) => (
              <button
                key={claim.id}
                onClick={() => handleSelectClaim(claim.title)}
                className="w-full text-left px-4 py-3 rounded-xl bg-[#FAF7EB] hover:bg-[#D49B28] hover:text-stone-950 text-stone-900 font-extrabold text-sm transition-all border border-stone-200 shadow-2xs flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-extrabold">{claim.title}</div>
                  <div className="text-xs text-stone-600 font-normal">{claim.desc}</div>
                </div>
                <span className="text-xs text-stone-400 group-hover:text-stone-950 font-normal ml-2 shrink-0">
                  Select ›
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-stone-300 hover:bg-stone-400 font-bold text-stone-800 text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DECLARED WAR CONFIRMATION & TROOPS SLIDER */}
      {step === 'commit_troops' && (
        <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-sm sm:max-w-md w-full p-6 text-stone-900 shadow-2xl animate-fade-in font-sans">
          
          <h3 className="font-black text-xl sm:text-2xl text-stone-950 text-center mb-2 font-sans">
            Declared War
          </h3>

          <p className="text-sm font-semibold text-stone-900 text-center mb-5 leading-snug">
            You declared war against <span className="font-extrabold">{targetName}</span> using the <span className="font-bold">{selectedClaim}</span> claim.
          </p>

          {/* Yearly Troops Slider */}
          <div className="mb-6 bg-[#EFEAD4]/70 p-4 rounded-2xl border border-stone-300">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs sm:text-sm text-stone-900">
                Troops Committed:
              </span>
              <span className="font-mono font-black text-base sm:text-lg text-stone-950">
                {committedTroops >= 1000 
                  ? `${(committedTroops / 1000).toFixed(1)}k` 
                  : `${committedTroops} soldiers`}
              </span>
            </div>

            <input
              type="range"
              min={Math.max(10, Math.round(rawMaxTroops * 0.1))}
              max={Math.max(50, rawMaxTroops)}
              step={rawMaxTroops >= 1000 ? 100 : 10}
              value={committedTroops}
              onChange={(e) => setCommittedTroops(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-[#D49B28]"
            />

            <div className="flex justify-between text-[10px] text-stone-600 font-bold mt-1">
              <span>{Math.max(10, Math.round(rawMaxTroops * 0.1))} (Vanguard)</span>
              <span>{Math.round(rawMaxTroops * 0.5)} (Standard)</span>
              <span>{rawMaxTroops} (Full Host)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleFinalize(true)}
              className="w-full py-3 rounded-xl bg-[#D49B28] hover:bg-[#B78722] text-stone-950 font-black text-sm sm:text-base shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Command Army</span>
            </button>

            <button
              onClick={() => handleFinalize(false)}
              className="w-full py-3 rounded-xl bg-[#E0B86C] hover:bg-[#D49B28] text-stone-950 font-bold text-sm sm:text-base shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Too Risky..</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
