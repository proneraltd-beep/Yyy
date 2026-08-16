import React, { useState } from 'react';
import { Character, FamilyMember, Province, Realm, TreatyType, WarState, ConditionalPeaceTerms, Species, Gender } from '../../types';
import { sound } from '../../utils/audio';
import { 
  Coins, 
  MapPin, 
  Heart, 
  Scroll, 
  Check, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  UserPlus, 
  ArrowRightLeft,
  ChevronRight,
  Landmark
} from 'lucide-react';

interface ConditionalPeaceModalProps {
  character: Character;
  war: WarState;
  enemyRealm?: Realm;
  enemyProvinces: Province[];
  playerProvinces: Province[];
  familyMembers: FamilyMember[];
  currentYear?: number;
  onConfirmPeace: (terms: ConditionalPeaceTerms) => void;
  onClose: () => void;
}

type TabType = 'gold' | 'provinces' | 'marriage' | 'treaties' | 'scroll';

export const ConditionalPeaceModal: React.FC<ConditionalPeaceModalProps> = ({
  character,
  war,
  enemyRealm,
  enemyProvinces,
  playerProvinces,
  familyMembers,
  currentYear = 1066,
  onConfirmPeace,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('gold');

  // Gold state: positive = player demands gold; negative = player offers tribute
  const [goldMode, setGoldMode] = useState<'demand' | 'offer' | 'none'>('demand');
  const [goldDemandAmount, setGoldDemandAmount] = useState<number>(75);
  const [goldOfferAmount, setGoldOfferAmount] = useState<number>(50);

  // Provinces state
  const [demandedProvinceIds, setDemandedProvinceIds] = useState<string[]>([]);
  const [cededProvinceIds, setCededProvinceIds] = useState<string[]>([]);

  // Marriage state
  const [includeMarriage, setIncludeMarriage] = useState<boolean>(false);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>(
    !character.spouseId ? 'self' : familyMembers.find(m => m.relation === 'Child' && !m.spouseId)?.id || 'self'
  );

  // Treaties state
  const [signNonAggression, setSignNonAggression] = useState<boolean>(true);
  const [signTradeAgreement, setSignTradeAgreement] = useState<boolean>(false);
  const [liberatePrisoners, setLiberatePrisoners] = useState<boolean>(true);

  // Persuasion attempt state for borderline negotiations
  const [isAttemptingPersuasion, setIsAttemptingPersuasion] = useState<boolean>(false);
  const [persuasionResult, setPersuasionResult] = useState<{ success: boolean; message: string } | null>(null);

  // Eligible marriage candidates from player side
  const eligibleMembers: { id: string; name: string; role: string; gender: Gender; age: number; portrait: string }[] = [];
  if (!character.spouseId) {
    eligibleMembers.push({
      id: 'self',
      name: `${character.name} (Yourself)`,
      role: `Sovereign ${character.rank}`,
      gender: character.gender,
      age: character.age,
      portrait: character.portrait
    });
  }
  familyMembers.filter(m => (m.relation === 'Child' || m.relation === 'Sibling') && m.alive && !m.spouseId).forEach(m => {
    eligibleMembers.push({
      id: m.id,
      name: m.name,
      role: `${m.relation} of the Crown`,
      gender: m.gender,
      age: m.age,
      portrait: m.portrait
    });
  });

  // Selected candidate object
  const selectedCandidate = eligibleMembers.find(m => m.id === selectedFamilyMemberId) || eligibleMembers[0];

  // Enemy dynasty match generation
  const enemySpecies: Species = enemyRealm?.species || 'Human';
  const enemySpouseGender: Gender = selectedCandidate ? (selectedCandidate.gender === 'Male' ? 'Female' : 'Male') : 'Female';
  const enemySpouseName = enemySpouseGender === 'Female' 
    ? (enemySpecies === 'Vampire' ? 'Lady Carmilla of House Sang' : enemySpecies === 'HighElf' ? 'Lady Aurelia of the Silver Glade' : enemySpecies === 'Witch' ? 'Circe of the Obsidian Coven' : 'Princess Evelyn of the Crown')
    : (enemySpecies === 'Vampire' ? 'Lord Corvin of House Sang' : enemySpecies === 'HighElf' ? 'Lord Feanor of the Silver Glade' : enemySpecies === 'Werewolf' ? 'Alpha Lyall of the Moonclaw' : 'Prince Henry of the Crown');

  // Actual gold value based on mode
  const effectiveGoldAmount = goldMode === 'demand' ? goldDemandAmount : goldMode === 'offer' ? -goldOfferAmount : 0;

  // --- ACCEPTANCE ENGINE ---
  // 1. Base Score from War Score (+1.0x)
  const warScoreFactor = Math.round(war.warScore * 1.0);

  // 2. Diplomacy Stat factor (+0.4 per point above 50)
  const diplomacyFactor = Math.round(((character.stats?.diplomacy || 50) - 50) * 0.4);

  // 3. Gold impact
  let goldFactor = 0;
  if (goldMode === 'demand') {
    goldFactor = -Math.round((goldDemandAmount / 100) * 25);
  } else if (goldMode === 'offer') {
    goldFactor = Math.round((goldOfferAmount / 100) * 35);
  }

  // 4. Territory impact: demanding enemy land is heavy (-45 each), giving land is huge (+55 each)
  const demandedTerritoryFactor = -(demandedProvinceIds.length * 45);
  const cededTerritoryFactor = +(cededProvinceIds.length * 55);

  // 5. Marriage alliance (+30 points: highly valued dynastic pact)
  const marriageFactor = includeMarriage ? 30 : 0;

  // 6. Treaties (+15 for Non-Aggression, +10 for Trade)
  const treatiesFactor = (signNonAggression ? 15 : 0) + (signTradeAgreement ? 10 : 0);

  // Total Acceptance Score
  const rawAcceptanceScore = warScoreFactor + diplomacyFactor + goldFactor + demandedTerritoryFactor + cededTerritoryFactor + marriageFactor + treatiesFactor;
  const totalAcceptanceScore = Math.min(100, Math.max(-100, rawAcceptanceScore));

  // Determine acceptance category
  let acceptanceTier: 'guaranteed' | 'borderline' | 'rejected' = 'rejected';
  if (totalAcceptanceScore >= 0) {
    acceptanceTier = 'guaranteed';
  } else if (totalAcceptanceScore >= -20) {
    acceptanceTier = 'borderline';
  } else {
    acceptanceTier = 'rejected';
  }

  // Handle province selection toggles
  const handleToggleDemandProvince = (pId: string) => {
    sound.playClick();
    setDemandedProvinceIds(prev => 
      prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
    );
  };

  const handleToggleCedeProvince = (pId: string) => {
    sound.playClick();
    setCededProvinceIds(prev => 
      prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
    );
  };

  // Construct final terms object
  const buildTerms = (): ConditionalPeaceTerms => {
    const treatyList: TreatyType[] = [];
    if (signNonAggression) treatyList.push('Non-Aggression Pact');
    if (signTradeAgreement) treatyList.push('Trade Agreement');

    let summaryParts: string[] = ['Cessation of all armed hostilities'];
    if (effectiveGoldAmount > 0) summaryParts.push(`Reparations of ${effectiveGoldAmount} 🪙 paid to our Crown`);
    if (effectiveGoldAmount < 0) summaryParts.push(`War tribute of ${Math.abs(effectiveGoldAmount)} 🪙 paid to enemy`);
    if (demandedProvinceIds.length > 0) {
      const names = enemyProvinces.filter(p => demandedProvinceIds.includes(p.id)).map(p => p.name).join(', ');
      summaryParts.push(`Cession of ${demandedProvinceIds.length} county lands (${names})`);
    }
    if (cededProvinceIds.length > 0) {
      const names = playerProvinces.filter(p => cededProvinceIds.includes(p.id)).map(p => p.name).join(', ');
      summaryParts.push(`Relinquishing sovereignty of ${cededProvinceIds.length} county lands (${names})`);
    }
    if (includeMarriage && selectedCandidate) {
      summaryParts.push(`Dynastic marriage alliance uniting ${selectedCandidate.name} with ${enemySpouseName}`);
    }
    if (treatyList.length > 0) {
      summaryParts.push(`Accords ratified: ${treatyList.join(', ')}`);
    }
    if (liberatePrisoners) {
      summaryParts.push(`Full liberation of all captured commanders and prisoners of war`);
    }

    return {
      warId: war.id,
      goldAmount: effectiveGoldAmount,
      demandedProvinceIds,
      cededProvinceIds,
      marriageAlliance: includeMarriage && selectedCandidate ? {
        memberType: selectedCandidate.id === 'self' ? 'self' : 'family',
        memberId: selectedCandidate.id !== 'self' ? selectedCandidate.id : undefined,
        memberName: selectedCandidate.name,
        memberRole: selectedCandidate.role,
        targetDynastyMemberName: enemySpouseName,
        targetDynastyTitle: `${enemySpecies} Royal Scion`,
        targetSpecies: enemySpecies,
        dowry: selectedCandidate.id === 'self' ? 50 : 30
      } : undefined,
      treaties: treatyList,
      liberatePrisoners,
      opinionBonus: Math.max(10, 30 + (includeMarriage ? 25 : 0) + (effectiveGoldAmount < 0 ? 20 : 0)),
      summaryText: summaryParts.join(' • ')
    };
  };

  // Submit Handler
  const handleProposeTreaty = () => {
    if (acceptanceTier === 'rejected') {
      sound.playFail();
      return;
    }

    if (acceptanceTier === 'borderline') {
      setIsAttemptingPersuasion(true);
      // Diplomatic skill check
      const diplomacyStat = character.stats?.diplomacy || 50;
      const roll = Math.floor(Math.random() * 100) + 1;
      const threshold = 60 - Math.round(diplomacyStat * 0.3); // High diplomacy makes it easier

      setTimeout(() => {
        if (roll >= threshold) {
          sound.playFanfare();
          setPersuasionResult({
            success: true,
            message: `Persuasion Succeeded! (Roll ${roll} vs Required ${threshold}). Your envoys swayed the enemy council!`
          });
          setTimeout(() => {
            onConfirmPeace(buildTerms());
          }, 1200);
        } else {
          sound.playFail();
          setPersuasionResult({
            success: false,
            message: `Diplomatic Envoy Rebuffed! (Roll ${roll} vs Required ${threshold}). The enemy sovereign dismissed the proposal.`
          });
          setIsAttemptingPersuasion(false);
        }
      }, 700);
      return;
    }

    // Guaranteed acceptance
    sound.playFanfare();
    onConfirmPeace(buildTerms());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#FAF7EB] border-2 border-[#D49B28] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col text-stone-900 shadow-2xl overflow-hidden animate-fade-in font-sans">
        
        {/* HEADER */}
        <div className="bg-[#5B1010] text-[#FFFDF6] p-4 sm:p-5 flex items-center justify-between border-b border-[#3D0A0A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner">
              {war.targetLeaderPortrait || '👑'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  Peace Envoy • Year {currentYear}
                </span>
                <span className="text-xs font-bold text-amber-200/80">
                  {war.targetRealmName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                <span>Negotiate Conditional Peace</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ENEMY ACCEPTANCE METER BAR */}
        <div className="bg-[#EFE9CF] px-4 py-3 border-b border-[#D8D1B3] shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-800" />
              <span className="text-xs font-extrabold text-stone-900">
                Enemy Council Willingness to Ratify:
              </span>
            </div>

            {/* Status Badge */}
            {acceptanceTier === 'guaranteed' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs flex items-center gap-1 shadow-xs animate-pulse">
                <Check className="w-3.5 h-3.5" /> High Willingness (+{totalAcceptanceScore})
              </span>
            )}
            {acceptanceTier === 'borderline' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs flex items-center gap-1 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5" /> Reluctant / Persuasion Needed ({totalAcceptanceScore})
              </span>
            )}
            {acceptanceTier === 'rejected' && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-black text-xs flex items-center gap-1 shadow-xs">
                <X className="w-3.5 h-3.5" /> Flat Rejection ({totalAcceptanceScore})
              </span>
            )}
          </div>

          {/* Meter Bar */}
          <div className="w-full h-3 bg-stone-300 rounded-full overflow-hidden flex border border-stone-400/60 relative">
            <div className="w-1/2 h-full bg-rose-200 flex justify-end">
              {totalAcceptanceScore < 0 && (
                <div 
                  className="h-full bg-rose-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.abs(totalAcceptanceScore) * 2)}%` }}
                />
              )}
            </div>
            <div className="w-0.5 h-full bg-stone-800 z-10" />
            <div className="w-1/2 h-full bg-emerald-100 flex justify-start">
              {totalAcceptanceScore > 0 && (
                <div 
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, totalAcceptanceScore * 2)}%` }}
                />
              )}
            </div>
          </div>

          {/* Itemized calculation breakdown */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-stone-700 font-bold">
            <span>War Score ({war.warScore > 0 ? `+${war.warScore}` : war.warScore})</span>
            <span>• Diplomacy ({diplomacyFactor >= 0 ? `+${diplomacyFactor}` : diplomacyFactor})</span>
            {goldFactor !== 0 && <span>• Gold ({goldFactor >= 0 ? `+${goldFactor}` : goldFactor})</span>}
            {demandedTerritoryFactor !== 0 && <span className="text-rose-800">• Demanded Land ({demandedTerritoryFactor})</span>}
            {cededTerritoryFactor !== 0 && <span className="text-emerald-800">• Ceded Land (+{cededTerritoryFactor})</span>}
            {marriageFactor !== 0 && <span className="text-purple-800">• Royal Marriage (+{marriageFactor})</span>}
            {treatiesFactor !== 0 && <span className="text-blue-800">• Treaties (+{treatiesFactor})</span>}
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-stone-300 bg-[#E6DFBF] text-xs font-black overflow-x-auto shrink-0 divide-x divide-stone-300">
          <button
            onClick={() => { sound.playClick(); setActiveTab('gold'); }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'gold' 
                ? 'bg-[#FAF7EB] text-stone-950 border-b-2 border-[#D49B28]' 
                : 'text-stone-700 hover:bg-[#DDD5B0]'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-600" />
            <span>Treasury & Gold</span>
            {effectiveGoldAmount !== 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${effectiveGoldAmount > 0 ? 'bg-amber-200 text-amber-900' : 'bg-rose-200 text-rose-900'}`}>
                {effectiveGoldAmount > 0 ? `+${effectiveGoldAmount}` : effectiveGoldAmount}🪙
              </span>
            )}
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('provinces'); }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'provinces' 
                ? 'bg-[#FAF7EB] text-stone-950 border-b-2 border-[#D49B28]' 
                : 'text-stone-700 hover:bg-[#DDD5B0]'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Territory & Provinces</span>
            {(demandedProvinceIds.length > 0 || cededProvinceIds.length > 0) && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-200 text-emerald-900">
                {demandedProvinceIds.length + cededProvinceIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('marriage'); }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'marriage' 
                ? 'bg-[#FAF7EB] text-stone-950 border-b-2 border-[#D49B28]' 
                : 'text-stone-700 hover:bg-[#DDD5B0]'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-600" />
            <span>Dynastic Marriage</span>
            {includeMarriage && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-rose-200 text-rose-900">
                Active
              </span>
            )}
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('treaties'); }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'treaties' 
                ? 'bg-[#FAF7EB] text-stone-950 border-b-2 border-[#D49B28]' 
                : 'text-stone-700 hover:bg-[#DDD5B0]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Pacts & Treaties</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('scroll'); }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'scroll' 
                ? 'bg-[#FAF7EB] text-stone-950 border-b-2 border-[#D49B28]' 
                : 'text-stone-700 hover:bg-[#DDD5B0]'
            }`}
          >
            <Scroll className="w-4 h-4 text-stone-800" />
            <span>Treaty Scroll</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: GOLD & TREASURY */}
          {activeTab === 'gold' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900 mb-1">
                  Financial Terms & Indemnities
                </h3>
                <p className="text-xs text-stone-600">
                  Select whether you are extracting reparations from the defeated enemy, or offering financial tribute to buy an immediate truce.
                </p>
              </div>

              {/* Mode Selection */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { sound.playClick(); setGoldMode('demand'); }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    goldMode === 'demand'
                      ? 'bg-amber-100/80 border-amber-500 ring-2 ring-amber-400/40 text-amber-950 font-black shadow-xs'
                      : 'bg-[#F2ECD8] border-stone-300 text-stone-700 hover:bg-[#EAE2C8] font-bold'
                  }`}
                >
                  <div className="text-xl mb-1">🪙 ⚔️</div>
                  <div className="text-xs">Demand Reparations</div>
                  <div className="text-[10px] text-stone-600 mt-0.5">Enemy pays our Crown</div>
                </button>

                <button
                  onClick={() => { sound.playClick(); setGoldMode('none'); }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    goldMode === 'none'
                      ? 'bg-stone-200 border-stone-500 ring-2 ring-stone-400/40 text-stone-950 font-black shadow-xs'
                      : 'bg-[#F2ECD8] border-stone-300 text-stone-700 hover:bg-[#EAE2C8] font-bold'
                  }`}
                >
                  <div className="text-xl mb-1">🤝</div>
                  <div className="text-xs">No Gold Exchange</div>
                  <div className="text-[10px] text-stone-600 mt-0.5">Status quo treasury</div>
                </button>

                <button
                  onClick={() => { sound.playClick(); setGoldMode('offer'); }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    goldMode === 'offer'
                      ? 'bg-rose-100/80 border-rose-500 ring-2 ring-rose-400/40 text-rose-950 font-black shadow-xs'
                      : 'bg-[#F2ECD8] border-stone-300 text-stone-700 hover:bg-[#EAE2C8] font-bold'
                  }`}
                >
                  <div className="text-xl mb-1">🪙 🕊️</div>
                  <div className="text-xs">Offer War Tribute</div>
                  <div className="text-[10px] text-stone-600 mt-0.5">We pay to secure peace</div>
                </button>
              </div>

              {/* Amount Configuration */}
              {goldMode === 'demand' && (
                <div className="bg-[#EFEAD4] p-4 rounded-2xl border border-stone-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-stone-900">Demanded Indemnity:</span>
                    <span className="font-mono font-black text-lg text-amber-900">+{goldDemandAmount} 🪙</span>
                  </div>

                  <input
                    type="range"
                    min="25"
                    max="300"
                    step="25"
                    value={goldDemandAmount}
                    onChange={(e) => setGoldDemandAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-[#D49B28]"
                  />

                  <div className="flex gap-2">
                    {[50, 100, 150, 250].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { sound.playClick(); setGoldDemandAmount(amt); }}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          goldDemandAmount === amt ? 'bg-[#D49B28] text-stone-950 font-black shadow-xs' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                        }`}
                      >
                        {amt} 🪙
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-600 italic">
                    Demanding higher reparations lowers enemy willingness by {Math.round((goldDemandAmount / 100) * 25)} points.
                  </p>
                </div>
              )}

              {goldMode === 'offer' && (
                <div className="bg-[#EFEAD4] p-4 rounded-2xl border border-stone-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-stone-900">Offered Tribute:</span>
                    <span className="font-mono font-black text-lg text-rose-900">-{goldOfferAmount} 🪙</span>
                  </div>

                  <input
                    type="range"
                    min="25"
                    max={Math.max(50, Math.min(300, character.stats.gold))}
                    step="25"
                    value={goldOfferAmount}
                    onChange={(e) => setGoldOfferAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />

                  <div className="flex gap-2">
                    {[25, 50, 100, 150].map((amt) => (
                      <button
                        key={amt}
                        disabled={character.stats.gold < amt}
                        onClick={() => { sound.playClick(); setGoldOfferAmount(amt); }}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          character.stats.gold < amt
                            ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-400'
                            : goldOfferAmount === amt
                            ? 'bg-rose-600 text-white font-black shadow-xs'
                            : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                        }`}
                      >
                        {amt} 🪙
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-600 italic">
                    Current treasury: {character.stats.gold} 🪙. Paying tribute increases enemy willingness by +{Math.round((goldOfferAmount / 100) * 35)} points.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROVINCES & TERRITORY */}
          {activeTab === 'provinces' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900 mb-1">
                  Territorial Demands & Cessions
                </h3>
                <p className="text-xs text-stone-600">
                  Select specific counties to demand from the enemy or offer to cede. Demanding land requires substantial war leverage (-45 acceptance each).
                </p>
              </div>

              {/* DEMAND ENEMY PROVINCES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <span>⚔️ Demand Enemy Counties ({demandedProvinceIds.length} Selected)</span>
                  </span>
                  <span className="text-[11px] font-bold text-stone-500">
                    {enemyProvinces.length} Available in Realm
                  </span>
                </div>

                {enemyProvinces.length === 0 ? (
                  <div className="p-3 bg-stone-200 rounded-xl text-center text-xs text-stone-600">
                    No individual enemy provinces recorded. Target is a single feudal entity.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {enemyProvinces.map((prov) => {
                      const isSelected = demandedProvinceIds.includes(prov.id);
                      return (
                        <div
                          key={prov.id}
                          onClick={() => handleToggleDemandProvince(prov.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-400/40 shadow-xs'
                              : 'bg-[#F5EFE0] border-stone-300 hover:bg-[#ECE4CE]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">🏰</span>
                              <span className="font-black text-xs text-stone-900">{prov.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-600 font-bold">
                              <span>🪙 +{prov.income || 25}/yr</span>
                              <span>• 🛡️ {prov.troops || 600} Levies</span>
                              <span>• {prov.specialty || 'Farmland'}</span>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#D49B28] border-amber-600 text-stone-950' : 'border-stone-400 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CEDE PLAYER PROVINCES (IF ANY) */}
              <div className="space-y-2 pt-2 border-t border-stone-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                    <span>🕊️ Cede Your Counties to Enemy ({cededProvinceIds.length} Selected)</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold">
                    +55 Willingness per county
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {playerProvinces.slice(0, 4).map((prov) => {
                    const isCeded = cededProvinceIds.includes(prov.id);
                    return (
                      <div
                        key={prov.id}
                        onClick={() => handleToggleCedeProvince(prov.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          isCeded
                            ? 'bg-rose-100/90 border-rose-500 ring-2 ring-rose-400/40 shadow-xs'
                            : 'bg-[#F5EFE0] border-stone-300 hover:bg-[#ECE4CE]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🛡️</span>
                            <span className="font-black text-xs text-stone-900">{prov.name}</span>
                          </div>
                          <div className="text-[10px] text-stone-600 mt-1">
                            Your Crown Territory
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          isCeded ? 'bg-rose-600 border-rose-700 text-white' : 'border-stone-400 bg-white'
                        }`}>
                          {isCeded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNASTIC MARRIAGE ALLIANCE */}
          {activeTab === 'marriage' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900 mb-1">
                  Royal Dynastic Marriage Alliance
                </h3>
                <p className="text-xs text-stone-600">
                  Unite your dynasty with the ruling house of {war.targetRealmName} in holy matrimony. A marriage alliance creates an unbreakable non-aggression bond and grants +30 negotiation willingness.
                </p>
              </div>

              {/* Toggle Marriage Accord */}
              <div 
                onClick={() => { sound.playClick(); setIncludeMarriage(!includeMarriage); }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  includeMarriage
                    ? 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-400/30 shadow-xs'
                    : 'bg-[#F2ECD8] border-stone-300 hover:bg-[#EAE2C8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-200 border border-rose-300 flex items-center justify-center text-xl shadow-inner">
                    💍
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-stone-900">
                      Include Dynastic Marriage Alliance
                    </div>
                    <div className="text-[11px] text-stone-600">
                      Offers +30 Acceptance Points & +40 Diplomatic Opinion
                    </div>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                  includeMarriage ? 'bg-rose-600 border-rose-700 text-white' : 'border-stone-400 bg-white'
                }`}>
                  {includeMarriage && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* Marriage Details Card */}
              {includeMarriage && (
                <div className="bg-[#EFE9CF] p-4 rounded-2xl border border-stone-300 space-y-4 animate-fade-in">
                  
                  {/* Select candidate from player house */}
                  <div>
                    <label className="block text-xs font-black text-stone-900 mb-1.5">
                      Select Member of Your House:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {eligibleMembers.map((cand) => {
                        const isChosen = cand.id === selectedFamilyMemberId;
                        return (
                          <div
                            key={cand.id}
                            onClick={() => { sound.playClick(); setSelectedFamilyMemberId(cand.id); }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                              isChosen
                                ? 'bg-[#FFFDF6] border-[#D49B28] ring-2 ring-amber-400/50 shadow-xs font-black'
                                : 'bg-[#FAF7EB] border-stone-300 hover:bg-white text-stone-800'
                            }`}
                          >
                            <span className="text-2xl">{cand.portrait}</span>
                            <div>
                              <div className="text-xs font-black text-stone-900">{cand.name}</div>
                              <div className="text-[10px] text-stone-600">{cand.role} • Age {cand.age}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Betrothed partner from target realm */}
                  <div className="p-3.5 bg-[#FFFDF6] rounded-xl border border-amber-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {enemySpecies === 'Vampire' ? '🥀' : enemySpecies === 'HighElf' ? '🧝' : enemySpecies === 'Werewolf' ? '🐺' : enemySpecies === 'Witch' ? '🔮' : '👑'}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-amber-800 font-bold">
                          {war.targetRealmName} Betrothed Noble
                        </div>
                        <div className="text-xs sm:text-sm font-black text-stone-900">
                          {enemySpouseName}
                        </div>
                        <div className="text-[11px] text-stone-600">
                          {enemySpecies} Royal House • Dowry +{selectedCandidate?.id === 'self' ? 50 : 30} 🪙
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold px-2 py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">
                      Alliance Pact
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PACTS & TREATIES */}
          {activeTab === 'treaties' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900 mb-1">
                  Diplomatic Accords & Guarantees
                </h3>
                <p className="text-xs text-stone-600">
                  Complement territorial and monetary agreements with bilateral diplomatic covenants to secure lasting peace.
                </p>
              </div>

              {/* Non-Aggression Pact */}
              <div 
                onClick={() => { sound.playClick(); setSignNonAggression(!signNonAggression); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  signNonAggression
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
                    : 'bg-[#F2ECD8] border-stone-300 hover:bg-[#EAE2C8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-200 border border-blue-300 flex items-center justify-center text-xl shadow-inner">
                    🛡️
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-stone-900">
                      5-Year Non-Aggression Pact
                    </div>
                    <div className="text-[11px] text-stone-600">
                      Guarantees no hostilities can be declared for 5 years (+15 Acceptance)
                    </div>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                  signNonAggression ? 'bg-blue-600 border-blue-700 text-white' : 'border-stone-400 bg-white'
                }`}>
                  {signNonAggression && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* Cross-Realm Trade Agreement */}
              <div 
                onClick={() => { sound.playClick(); setSignTradeAgreement(!signTradeAgreement); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  signTradeAgreement
                    ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/30 shadow-xs'
                    : 'bg-[#F2ECD8] border-stone-300 hover:bg-[#EAE2C8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 border border-amber-300 flex items-center justify-center text-xl shadow-inner">
                    📜
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-stone-900">
                      Cross-Realm Trade Agreement
                    </div>
                    <div className="text-[11px] text-stone-600">
                      Opens merchant corridors yielding annual gold profit (+10 Acceptance)
                    </div>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                  signTradeAgreement ? 'bg-[#D49B28] border-amber-700 text-stone-950' : 'border-stone-400 bg-white'
                }`}>
                  {signTradeAgreement && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* Liberate Captured Commanders & Prisoners */}
              <div 
                onClick={() => { sound.playClick(); setLiberatePrisoners(!liberatePrisoners); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  liberatePrisoners
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/30 shadow-xs'
                    : 'bg-[#F2ECD8] border-stone-300 hover:bg-[#EAE2C8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-200 border border-emerald-300 flex items-center justify-center text-xl shadow-inner">
                    ⛓️
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-stone-900">
                      Prisoner & Commander Liberation
                    </div>
                    <div className="text-[11px] text-stone-600">
                      Instantly frees and repatriates all captured commanders and prisoners of war
                    </div>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                  liberatePrisoners ? 'bg-emerald-600 border-emerald-700 text-white' : 'border-stone-400 bg-white'
                }`}>
                  {liberatePrisoners && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TREATY SCROLL PREVIEW */}
          {activeTab === 'scroll' && (
            <div className="animate-fade-in space-y-3">
              <div className="bg-[#FFFDF6] p-5 sm:p-6 rounded-2xl border-2 border-[#D49B28] shadow-md space-y-4 font-serif relative">
                <div className="absolute top-3 right-3 text-2xl opacity-60">⚜️</div>
                <div className="text-center border-b border-amber-900/20 pb-3">
                  <span className="text-[10px] uppercase tracking-widest text-amber-800 font-sans font-bold">
                    Treaty of Year {currentYear}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-stone-950 mt-0.5">
                    The Concordat of {war.targetRealmName}
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-stone-800 leading-relaxed font-sans">
                  <div className="flex items-start gap-2">
                    <span className="font-black text-amber-900 shrink-0">I. Truce:</span>
                    <span>All armed hostilities between the Sovereign of {character.dynastyName} and {war.targetRealmName} shall immediately cease.</span>
                  </div>

                  {effectiveGoldAmount !== 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-black text-amber-900 shrink-0">II. Financial:</span>
                      <span>
                        {effectiveGoldAmount > 0 
                          ? `The High Treasury of ${war.targetRealmName} shall transfer ${effectiveGoldAmount} 🪙 in war indemnities to our Crown.`
                          : `Our Realm shall deliver ${Math.abs(effectiveGoldAmount)} 🪙 in peace tribute to ${war.targetRealmName}.`
                        }
                      </span>
                    </div>
                  )}

                  {demandedProvinceIds.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-black text-amber-900 shrink-0">III. Territorial Cession:</span>
                      <span>
                        Sovereignty of {demandedProvinceIds.length} counties ({enemyProvinces.filter(p => demandedProvinceIds.includes(p.id)).map(p => p.name).join(', ')}) is permanently annexed into our royal demesne.
                      </span>
                    </div>
                  )}

                  {cededProvinceIds.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-black text-amber-900 shrink-0">IV. Relinquished Lands:</span>
                      <span>
                        Sovereignty over {cededProvinceIds.length} counties ({playerProvinces.filter(p => cededProvinceIds.includes(p.id)).map(p => p.name).join(', ')}) is granted to {war.targetRealmName}.
                      </span>
                    </div>
                  )}

                  {includeMarriage && selectedCandidate && (
                    <div className="flex items-start gap-2">
                      <span className="font-black text-amber-900 shrink-0">V. Holy Matrimony:</span>
                      <span>
                        A perpetual dynastic bond is sanctified between {selectedCandidate.name} ({selectedCandidate.role}) and {enemySpouseName}.
                      </span>
                    </div>
                  )}

                  {(signNonAggression || signTradeAgreement) && (
                    <div className="flex items-start gap-2">
                      <span className="font-black text-amber-900 shrink-0">VI. Covenants:</span>
                      <span>
                        Both realms ratify {signNonAggression && 'a 5-Year Non-Aggression Pact'}{signNonAggression && signTradeAgreement && ' and '}{signTradeAgreement && 'a Cross-Realm Trade Agreement'}.
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-amber-900/20 flex items-center justify-between text-[11px] text-stone-600 font-sans">
                  <span>Seal of {character.dynastyName} 👑</span>
                  <span>Seal of {war.targetRealmName} 🦅</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* PERSUASION RESULT TOAST / BANNER */}
        {persuasionResult && (
          <div className={`px-4 py-2 text-xs font-black text-center ${
            persuasionResult.success ? 'bg-emerald-100 text-emerald-950 border-t border-emerald-300' : 'bg-rose-100 text-rose-950 border-t border-rose-300'
          }`}>
            {persuasionResult.message}
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-[#EFEAD4] border-t border-stone-300 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-300 hover:bg-stone-400 font-bold text-stone-800 text-xs transition-colors cursor-pointer"
          >
            Cancel Negotiations
          </button>

          <button
            onClick={handleProposeTreaty}
            disabled={acceptanceTier === 'rejected' || isAttemptingPersuasion}
            className={`py-2.5 px-5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer ${
              acceptanceTier === 'guaranteed'
                ? 'bg-[#D49B28] hover:bg-[#B78722] text-stone-950 active:scale-95'
                : acceptanceTier === 'borderline'
                ? 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
            }`}
          >
            {isAttemptingPersuasion ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Envoys in Discussion...</span>
              </>
            ) : acceptanceTier === 'guaranteed' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Ratify & Enforce Treaty</span>
              </>
            ) : acceptanceTier === 'borderline' ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Propose via Diplomatic Envoy (Persuasion)</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                <span>Terms Unacceptable to Enemy</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
