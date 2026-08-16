import React, { useState } from 'react';
import { Character, Province, Realm, Vassal } from '../../types';
import { sound } from '../../utils/audio';
import { DeclareWarModal } from './DeclareWarModal';

export interface TargetEntity {
  id: string;
  name: string; // e.g. "The Duchy of Albany" or "The County of Caithness"
  type: 'realm' | 'province' | 'vassal';
  species?: string;
  troops: number; // e.g. 4200
  maxTroops?: number; // e.g. 12000
  leaderName: string; // e.g. "Duke Lawrence Wasa" or "Count Richard Fitzrobert"
  leaderAge: number; // e.g. 33 or 78
  leaderTitle: string; // e.g. "Duke of Albany" or "Count of Caithness"
  leaderPortrait: string; // avatar
  relationship: number; // -100 to 100
  relationshipIcon?: string; // e.g. "🦶" or "🩸" or "⭐"
  controlTitle?: string; // e.g. "Albany (Duchy) Control" or "Moray (Duchy) Control"
  controlPercent?: number; // 0 to 100
  claims?: string[];
  alliancePactActive?: boolean;
}

interface RealmProvinceDetailScreenProps {
  character: Character;
  target: TargetEntity;
  totalImperialTroops?: number;
  onBack: () => void;
  onDeclareWarSuccess: (target: TargetEntity, claim: string, yearlyTroops: number, commandDirectly: boolean) => void;
  onInspectLeader?: (leaderName: string) => void;
  onOpenMap?: () => void;
  onMakeClaim?: (targetId: string, claimType: string) => void;
  onMakeAlliance?: (targetId: string) => void;
}

export const RealmProvinceDetailScreen: React.FC<RealmProvinceDetailScreenProps> = ({
  character,
  target,
  totalImperialTroops = 450,
  onBack,
  onDeclareWarSuccess,
  onInspectLeader,
  onOpenMap,
  onMakeClaim,
  onMakeAlliance
}) => {
  const [showDeclareWarModal, setShowDeclareWarModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showClaimsModal, setShowClaimsModal] = useState<boolean>(false);
  const [showAllianceModal, setShowAllianceModal] = useState<boolean>(false);
  const [showMakeClaimModal, setShowMakeClaimModal] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [showControlModal, setShowControlModal] = useState<boolean>(false);

  const [activeClaims, setActiveClaims] = useState<string[]>(
    target.claims && target.claims.length > 0
      ? target.claims
      : ['Forced Vassalization', 'Highland Marches Claim', 'Valorian Imperial Reclamation']
  );
  const [allianceSigned, setAllianceSigned] = useState<boolean>(target.alliancePactActive || false);

  // Format army troops number (e.g. 51.3k or 450)
  const formattedImperialArmy = totalImperialTroops >= 1000 
    ? `${(totalImperialTroops / 1000).toFixed(1)}k` 
    : `${totalImperialTroops}`;

  // Troop percentage bar calculation for target realm/province
  const maxBar = target.maxTroops || 15000;
  const troopPercent = Math.min(100, Math.max(8, (target.troops / maxBar) * 100));

  // Relationship bar calculation
  const isPositiveRel = target.relationship >= 0;
  const relPercent = Math.min(100, Math.max(0, Math.abs(target.relationship)));

  // Control percent
  const controlValue = target.controlPercent ?? 45;

  const handleDeclareWarSubmit = (claim: string, yearlyTroops: number, commandDirectly: boolean) => {
    setShowDeclareWarModal(false);
    onDeclareWarSuccess(target, claim, yearlyTroops, commandDirectly);
  };

  const handleFabricateNewClaim = (claimName: string) => {
    sound.playScroll();
    if (!activeClaims.includes(claimName)) {
      setActiveClaims(prev => [...prev, claimName]);
    }
    if (onMakeClaim) onMakeClaim(target.id, claimName);
    setShowMakeClaimModal(false);
  };

  const handleSignAlliance = () => {
    sound.playFanfare();
    setAllianceSigned(true);
    if (onMakeAlliance) onMakeAlliance(target.id);
    setShowAllianceModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 font-sans">
      
      {/* Container with rounded top and border matching screenshots */}
      <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl border border-stone-400/60 shadow-2xl overflow-hidden">
        
        {/* Top Gold Header Card (#D49B28) matching Screenshot 1 & 2 */}
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

        {/* Sub-Header Bar: `‹ Realm ? ✕` */}
        <div className="bg-[#D49B28] px-4 py-2.5 border-t border-b border-[#B78722] flex items-center justify-between text-[#181512] shadow-sm">
          <button
            onClick={() => { sound.playClick(); onBack(); }}
            className="flex items-center gap-1 font-bold text-sm text-[#181512] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="text-xl leading-none">‹</span>
          </button>
          
          <div className="flex items-center gap-1.5 font-bold text-base text-[#181512]">
            <span>{target.type === 'province' ? 'Province' : 'Realm'}</span>
            <button 
              onClick={() => setShowInfoModal(true)}
              className="w-4 h-4 rounded-full bg-[#FAF7EB]/40 hover:bg-[#FAF7EB]/60 text-[10px] flex items-center justify-center font-bold cursor-pointer"
            >
              ?
            </button>
          </div>

          <button
            onClick={() => { sound.playClick(); onBack(); }}
            className="text-stone-800 hover:text-stone-950 text-sm font-black cursor-pointer px-1"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Realm / Province Banner & Troop Gauge (Matching Screenshots 1 & 2) */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-b border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              {target.type === 'province' ? 'Province' : 'Realm'}
            </span>
          </div>

          <div className="px-4 py-3 bg-[#FFFDF6] border-b border-stone-200 flex items-center gap-3">
            {/* Navy Flag Icon */}
            <div className="text-2xl text-slate-800 shrink-0">
              🚩
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-black text-sm sm:text-base text-stone-900 truncate">
                {target.name}
              </div>
              
              <div className="mt-1">
                <div className="text-[11px] font-bold text-stone-700 mb-0.5">
                  Troops:
                </div>
                {/* Red Troop Bar matching screenshots */}
                <div className="w-full max-w-xs h-2.5 bg-stone-300 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8B1E1E] transition-all"
                    style={{ width: `${troopPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Leader (Matching Screenshots 1 & 2) */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              Leader
            </span>
          </div>

          <div 
            onClick={() => {
              sound.playClick();
              if (onInspectLeader) onInspectLeader(target.leaderName);
            }}
            className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors border-b border-stone-200 flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-3xl shrink-0 shadow-xs">
                {target.leaderPortrait}
              </div>

              <div className="min-w-0">
                <div className="font-black text-sm text-stone-950 truncate">
                  {target.leaderName} ({target.leaderAge})
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-stone-800">
                    Relationship:
                  </span>
                  {/* Optional indicator (footprint or blood icon as in screenshot) */}
                  {target.relationshipIcon && (
                    <span className="text-xs">{target.relationshipIcon}</span>
                  )}
                  {/* Two-tone relationship bar */}
                  <div className="w-32 sm:w-44 h-2 bg-stone-300 rounded-full overflow-hidden flex">
                    {isPositiveRel ? (
                      <>
                        <div className="h-full bg-stone-300" style={{ width: `${100 - relPercent}%` }} />
                        <div className="h-full bg-emerald-700" style={{ width: `${relPercent}%` }} />
                      </>
                    ) : (
                      <>
                        <div className="h-full bg-stone-300" style={{ width: `${100 - relPercent}%` }} />
                        <div className="h-full bg-[#8B1E1E]" style={{ width: `${relPercent}%` }} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-stone-400 font-bold text-xl group-hover:text-stone-700">
              ›
            </div>
          </div>
        </div>

        {/* Section 3: Actions (Matching Screenshots 1 & 2) */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              Actions
            </span>
          </div>

          <div className="divide-y divide-stone-200/90">
            
            {/* Show Map */}
            <div 
              onClick={() => {
                sound.playClick();
                if (onOpenMap) onOpenMap();
                else setShowMapModal(true);
              }}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🗺️</span>
                <span className="font-extrabold text-sm text-stone-900">Show Map</span>
              </div>
              <span className="text-stone-500 font-extrabold text-xs tracking-widest group-hover:text-stone-800">
                •••
              </span>
            </div>

            {/* Declare War */}
            <div 
              onClick={() => {
                sound.playSword();
                setShowDeclareWarModal(true);
              }}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-rose-50 transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚔️</span>
                <span className="font-extrabold text-sm text-stone-900 group-hover:text-rose-900">
                  Declare War
                </span>
              </div>
              <span className="text-stone-500 font-extrabold text-xs tracking-widest group-hover:text-rose-800">
                •••
              </span>
            </div>

            {/* Make Alliance */}
            <div 
              onClick={() => {
                sound.playClick();
                setShowAllianceModal(true);
              }}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <span className="font-extrabold text-sm text-stone-900">
                  {allianceSigned ? 'Alliance Sealed (Active)' : 'Make Alliance'}
                </span>
              </div>
              <span className="text-stone-500 font-extrabold text-xs tracking-widest group-hover:text-stone-800">
                •••
              </span>
            </div>

            {/* Make Claim */}
            <div 
              onClick={() => {
                sound.playScroll();
                setShowMakeClaimModal(true);
              }}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <span className="font-extrabold text-sm text-stone-900">Make Claim</span>
              </div>
              <span className="text-stone-500 font-extrabold text-xs tracking-widest group-hover:text-stone-800">
                •••
              </span>
            </div>

            {/* Claims (Inspect active claims) */}
            <div 
              onClick={() => {
                sound.playClick();
                setShowClaimsModal(true);
              }}
              className="px-4 py-3 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <span className="font-extrabold text-sm text-stone-900">
                  Claims ({activeClaims.length})
                </span>
              </div>
              <span className="text-stone-400 font-bold text-xl group-hover:text-stone-700">
                ›
              </span>
            </div>

          </div>
        </div>

        {/* Section 4: Control (Matching Screenshots 1 & 2) */}
        <div>
          <div className="bg-[#E5EBC6] px-4 py-2 border-y border-[#D1D8AC] text-center shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-wide">
              Control
            </span>
          </div>

          <div 
            onClick={() => {
              sound.playClick();
              setShowControlModal(true);
            }}
            className="px-4 py-3.5 bg-[#FFFDF6] hover:bg-[#F3EED8] transition-colors border-b border-stone-200 flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl">👑</span>
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-stone-900 truncate">
                  {target.controlTitle || `${target.name} Control`}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-stone-700">Control:</span>
                  <div className="w-28 sm:w-40 h-2 bg-stone-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${controlValue}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-stone-800">
                    {controlValue}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-stone-400 font-bold text-xl group-hover:text-stone-700">
              ›
            </div>
          </div>
        </div>

      </div>

      {/* Declare War Modal (Screenshots 3, 4, 5) */}
      {showDeclareWarModal && (
        <DeclareWarModal
          targetName={target.name}
          targetType={target.type}
          totalImperialTroops={totalImperialTroops}
          onConfirmDeclaration={handleDeclareWarSubmit}
          onClose={() => setShowDeclareWarModal(false)}
        />
      )}

      {/* Info Help Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-2xl max-w-md w-full p-5 text-stone-900 shadow-2xl">
            <h3 className="font-bold text-base mb-2 font-cinzel text-stone-950">Realm & Domain Intelligence</h3>
            <p className="text-xs text-stone-700 mb-4 leading-relaxed">
              Use this screen to inspect sovereign realms and provincial domains, assess military levies, fabricate royal claims, sign non-aggression treaties, or mobilize imperial armies for war.
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

      {/* Claims Inspector Modal */}
      {showClaimsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-2xl max-w-md w-full p-5 text-stone-900 shadow-2xl">
            <h3 className="font-black text-base mb-2 font-cinzel text-stone-950 flex items-center gap-2">
              <span>📜</span>
              <span>Active Claims on {target.name}</span>
            </h3>
            <div className="space-y-2 mb-4">
              {activeClaims.map((cl, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-white border border-stone-300 text-xs flex items-center justify-between">
                  <span className="font-bold text-stone-900">{cl}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">Casus Belli</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowClaimsModal(false)}
              className="w-full py-2 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Make Claim Modal */}
      {showMakeClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-2xl max-w-md w-full p-5 text-stone-900 shadow-2xl">
            <h3 className="font-black text-base mb-2 font-cinzel text-stone-950 flex items-center gap-2">
              <span>📜</span>
              <span>Fabricate Sovereign Claim</span>
            </h3>
            <p className="text-xs text-stone-700 mb-3">
              Dispatch court scribes and your Spymaster to discover ancient parchments and forge legitimate claims. Cost: 50 Gold 🪙.
            </p>
            <div className="space-y-2 mb-4">
              {['De Jure Sovereign Right', 'High Crown Fealty Violation', 'Border Trade Marches Claim'].map((cType) => (
                <button
                  key={cType}
                  onClick={() => handleFabricateNewClaim(cType)}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-amber-100 border border-stone-300 text-xs font-bold text-stone-900 transition-colors"
                >
                  + Fabricate {cType}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMakeClaimModal(false)}
              className="w-full py-2 bg-stone-300 font-bold text-xs text-stone-800 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Make Alliance Modal */}
      {showAllianceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-2xl max-w-md w-full p-5 text-stone-900 shadow-2xl">
            <h3 className="font-black text-base mb-2 font-cinzel text-stone-950 flex items-center gap-2">
              <span>🛡️</span>
              <span>Sign Military Non-Aggression Pact</span>
            </h3>
            <p className="text-xs text-stone-700 mb-4 leading-relaxed">
              Negotiate an honorable mutual defense treaty with {target.leaderName}. Both realms agree not to wage war and to provide military assistance if invaded.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAllianceModal(false)}
                className="flex-1 py-2 bg-stone-300 font-bold text-xs text-stone-800 rounded-xl"
              >
                Decline
              </button>
              <button
                onClick={handleSignAlliance}
                className="flex-1 py-2 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl shadow-md"
              >
                Seal Alliance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-2xl max-w-md w-full p-5 text-stone-900 shadow-2xl">
            <h3 className="font-black text-base mb-2 font-cinzel text-stone-950 flex items-center gap-2">
              <span>🗺️</span>
              <span>Territory Topography: {target.name}</span>
            </h3>
            <div className="h-40 bg-stone-200 rounded-xl border border-stone-400 flex flex-col items-center justify-center p-4 text-center text-xs text-stone-700 mb-4">
              <span className="text-3xl mb-1">🏰 ⛰️ 🌲</span>
              <p className="font-bold">{target.name} Marches</p>
              <p className="text-[11px] text-stone-600">Terrain: Highlands & River Valleys • Fortification: Heavy Stone Keep</p>
            </div>
            <button
              onClick={() => setShowMapModal(false)}
              className="w-full py-2 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl"
            >
              Return
            </button>
          </div>
        </div>
      )}

      {/* Control Info Modal */}
      {showControlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-2xl max-w-md w-full p-5 text-stone-900 shadow-2xl">
            <h3 className="font-black text-base mb-2 font-cinzel text-stone-950 flex items-center gap-2">
              <span>👑</span>
              <span>Imperial County Control</span>
            </h3>
            <p className="text-xs text-stone-700 mb-4 leading-relaxed">
              County control represents local administrative obedience and tax compliance. High control maximizes levy conscription and diminishes rebellious unrest. Current: {controlValue}%.
            </p>
            <button
              onClick={() => setShowControlModal(false)}
              className="w-full py-2 bg-[#D49B28] font-bold text-xs text-stone-950 rounded-xl"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
