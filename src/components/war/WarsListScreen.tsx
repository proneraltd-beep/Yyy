import React, { useState } from 'react';
import { Character, WarState } from '../../types';
import { sound } from '../../utils/audio';

interface WarsListScreenProps {
  character: Character;
  activeWars: WarState[];
  totalImperialTroops?: number;
  onSelectWar: (warId: string) => void;
  onOpenDeclareWarMenu: () => void;
  onBackToChronicle?: () => void;
}

export const WarsListScreen: React.FC<WarsListScreenProps> = ({
  character,
  activeWars,
  totalImperialTroops = 51300,
  onSelectWar,
  onOpenDeclareWarMenu,
  onBackToChronicle
}) => {
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Format army troops number (e.g. 51.3k)
  const formattedImperialArmy = totalImperialTroops >= 1000 
    ? `${(totalImperialTroops / 1000).toFixed(1)}k` 
    : totalImperialTroops.toString();

  // Helper for rendering the center-split war score bar matching Screenshot 6
  // War Score is -100 to +100. Center (0) is in middle. Left is red (negative), Right is green (positive)
  const renderWarScoreBar = (score: number) => {
    // clamp score between -100 and +100
    const clampedScore = Math.min(100, Math.max(-100, score));

    return (
      <div className="w-40 sm:w-60 h-2 bg-stone-300 rounded-full relative overflow-hidden flex">
        {/* Left half (0 to -100) */}
        <div className="w-1/2 h-full bg-stone-300 flex justify-end">
          {clampedScore < 0 && (
            <div
              className="h-full bg-[#8B1E1E]"
              style={{ width: `${Math.min(100, Math.abs(clampedScore))}%` }}
            />
          )}
        </div>

        {/* Center Divider line */}
        <div className="w-0.5 h-full bg-stone-700 shrink-0" />

        {/* Right half (0 to +100) */}
        <div className="w-1/2 h-full bg-stone-300 flex justify-start">
          {clampedScore > 0 && (
            <div
              className="h-full bg-emerald-700"
              style={{ width: `${Math.min(100, clampedScore)}%` }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 font-sans">
      
      {/* Container with rounded top and border matching Screenshot 6 */}
      <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl border border-stone-400/60 shadow-2xl overflow-hidden min-h-[500px]">
        
        {/* Top Gold Header Card (#D49B28) matching Screenshot 6 */}
        <div className="bg-[#D49B28] px-4 sm:px-5 py-3.5 border-b border-[#B78722] text-[#181512]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7EB]/30 border border-[#FAF7EB]/40 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                {character.portrait}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm sm:text-base text-stone-950 truncate font-cinzel">
                  {character.rank} {character.name} '{character.traits[0] || 'The Wise'}'
                </div>
                <div className="text-[11px] text-stone-900 font-semibold truncate">
                  {character.dynastyName || 'House Sovereign'} • Age {character.age}
                </div>
              </div>
            </div>

            {/* 4 Stats: 👑 Prestige, ✝️ Piety, 🧈 Gold, ⚔️ Troops */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-black text-stone-950 bg-[#FAF7EB]/30 px-3 py-1.5 rounded-xl border border-[#FAF7EB]/40 shadow-2xs">
              <div className="flex items-center gap-1">
                <span>👑</span>
                <span>{character.stats.renown}</span>
              </div>
              <span className="text-stone-800/40">|</span>
              <div className="flex items-center gap-1">
                <span>✝️</span>
                <span>{character.stats.pietyOrMana}</span>
              </div>
              <span className="text-stone-800/40">|</span>
              <div className="flex items-center gap-1">
                <span>🧈</span>
                <span>{character.stats.gold}</span>
              </div>
              <span className="text-stone-800/40">|</span>
              <div className="flex items-center gap-1">
                <span>⚔️</span>
                <span>{formattedImperialArmy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Header Bar: `‹ Wars ? ✕` matching Screenshot 6 */}
        <div className="bg-[#D49B28] px-4 py-2.5 border-t border-b border-[#B78722] flex items-center justify-between text-[#181512] shadow-sm">
          <button
            onClick={() => { sound.playClick(); if (onBackToChronicle) onBackToChronicle(); }}
            className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="text-xl leading-none">‹</span>
          </button>
          
          <div className="flex items-center gap-1.5 font-bold text-base text-[#181512]">
            <span>Wars</span>
            <button 
              onClick={() => setShowInfoModal(true)}
              className="w-4 h-4 rounded-full bg-[#FAF7EB]/40 hover:bg-[#FAF7EB]/60 text-[10px] flex items-center justify-center font-bold cursor-pointer"
            >
              ?
            </button>
          </div>

          <button
            onClick={() => { sound.playClick(); if (onBackToChronicle) onBackToChronicle(); }}
            className="text-stone-800 hover:text-stone-950 text-sm font-black cursor-pointer px-1"
          >
            ✕
          </button>
        </div>

        {/* Wars List Items matching Screenshot 6 */}
        <div className="divide-y divide-stone-200/90">
          {activeWars.length > 0 ? (
            <>
              {/* Active War Logistics Summary Bar */}
              <div className="px-4 py-2 bg-[#EFEAD4] border-b border-stone-300 flex items-center justify-between text-xs font-bold text-stone-800">
                <div className="flex items-center gap-1.5">
                  <span>⚔️</span>
                  <span>Active Fronts: {activeWars.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-950">
                    🪙 Total Upkeep: -{activeWars.reduce((sum, w) => sum + Math.round(((w.yearlyTroops >= 1 ? w.yearlyTroops * 1000 : w.playerLevies) || 0) * 0.003), 0)} Gold/yr
                  </span>
                </div>
              </div>

              {activeWars.map((war) => {
                const warUpkeep = Math.round(((war.yearlyTroops >= 1 ? war.yearlyTroops * 1000 : war.playerLevies) || 0) * 0.003);
                const fatigueStage = war.warYear >= 6 ? 3 : war.warYear === 5 ? 2 : war.warYear === 4 ? 1 : 0;

                return (
                  <div
                    key={war.id}
                    onClick={() => {
                      sound.playClick();
                      onSelectWar(war.id);
                    }}
                    className="px-4 py-3.5 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Crossed swords icon */}
                      <div className="text-2xl shrink-0">
                        ⚔️
                      </div>

                      <div className="min-w-0">
                        <div className="font-extrabold text-sm sm:text-base text-stone-950 truncate flex items-center gap-2">
                          <span>{war.title}</span>
                          {fatigueStage > 0 && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 shrink-0">
                              ⚠️ Fatigue Stage {fatigueStage}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-800">
                              War Score:
                            </span>
                            {renderWarScoreBar(war.warScore)}
                            <span className={`font-mono font-bold ${
                              war.warScore > 0 ? 'text-emerald-700' : war.warScore < 0 ? 'text-red-700' : 'text-stone-700'
                            }`}>
                              {war.warScore > 0 ? `+${war.warScore}%` : `${war.warScore}%`}
                            </span>
                          </div>
                          <span className="text-stone-500 font-semibold">
                            • Year {war.warYear || 1} • Upkeep: -{warUpkeep} 🪙/yr
                          </span>
                          {war.commanders?.some(c => c.veteranTrait) && (
                            <span className="text-[10px] font-black text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300">
                              ⭐ {war.commanders.filter(c => c.veteranTrait).length} Veteran Officers
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-stone-400 font-bold text-xl group-hover:text-stone-700 transition-colors">
                      ›
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="p-8 text-center bg-[#FFFDF6]">
              <span className="text-4xl block mb-2">🕊️</span>
              <p className="font-bold text-sm text-stone-800 font-cinzel">The Realm is at Peace</p>
              <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                No active military campaigns or insurgent wars. You may mobilize royal levies to declare war on rival realms or recalcitrant provinces.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Banner to Declare New War */}
        <div className="p-4 bg-[#FAF7EB] border-t border-stone-300">
          <button
            onClick={() => {
              sound.playSword();
              onOpenDeclareWarMenu();
            }}
            className="w-full py-3 rounded-xl bg-[#D49B28] hover:bg-[#B78722] text-stone-950 font-black text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>⚔️</span>
            <span>Declare War on Realm or Province</span>
          </button>
        </div>

      </div>

      {/* Info Help Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-2xl max-w-md w-full p-5 text-stone-900 shadow-2xl">
            <h3 className="font-bold text-base mb-2 font-cinzel text-stone-950">Active Wars & Campaigns</h3>
            <p className="text-xs text-stone-700 mb-4 leading-relaxed">
              View all ongoing imperial campaigns, manage frontline battle commitments, and open the War Command Room to oversee your 5 Royal Commanders.
            </p>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
