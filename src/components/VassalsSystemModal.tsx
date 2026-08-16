import React, { useState } from 'react';
import { Character, Vassal, Province, Realm, FamilyMember } from '../types';
import { sound } from '../utils/audio';
import { 
  ChevronLeft, 
  HelpCircle, 
  X, 
  ChevronRight, 
  MoreHorizontal,
  Star,
  Flag,
  BookOpen,
  BarChart2,
  Dna,
  Edit3,
  MessageCircle,
  Coins,
  Smile,
  Angry,
  Castle,
  Heart,
  Users,
  Lock,
  Search,
  Briefcase,
  Crown,
  MapPin,
  Shield,
  Swords,
  Cross,
  Check,
  Award,
  AlertTriangle,
  Gift,
  Zap,
  Sliders
} from 'lucide-react';

interface VassalsSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerCharacter: Character;
  vassals: Vassal[];
  provinces: Province[];
  realms: Realm[];
  family: FamilyMember[];
  onUpdateVassals: (vassals: Vassal[]) => void;
  onUpdateCharacter: (updater: (prev: Character) => Character) => void;
  onAddChronicleEntry: (title: string, desc: string, isImportant?: boolean) => void;
  onSelectProvince?: (provId: string) => void;
}

type ViewState = 'list' | 'vassal_detail' | 'character_detail';
type TabFilter = 'relations' | 'loyalty' | 'troops' | 'size';

// Loyalty color & threat level helper
export const getVassalLoyaltyStatus = (loyaltyVal?: number) => {
  const loyalty = typeof loyaltyVal === 'number' ? loyaltyVal : 70;
  if (loyalty >= 70) {
    return {
      status: 'loyal' as const,
      label: 'Loyal',
      color: '#16a34a',
      bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-500/60',
      pillClass: 'bg-emerald-600 text-white',
      borderClass: 'border-l-4 border-l-emerald-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-800 border-emerald-600/40',
      icon: '🟢',
      threatAssessment: 'Steadfast ally. Unlikely to join rebellious factions or treasonous plots.'
    };
  } else if (loyalty >= 40) {
    return {
      status: 'disgruntled' as const,
      label: 'Disgruntled',
      color: '#ca8a04',
      bgClass: 'bg-amber-100 text-amber-900 border-amber-500/60',
      pillClass: 'bg-amber-600 text-white',
      borderClass: 'border-l-4 border-l-amber-500',
      badgeBg: 'bg-amber-500/20 text-amber-900 border-amber-600/40',
      icon: '🟡',
      threatAssessment: 'Moderate risk. Discontented with crown policies; may join factions if provoked.'
    };
  } else {
    return {
      status: 'plotting' as const,
      label: 'Plotting Threat',
      color: '#dc2626',
      bgClass: 'bg-red-100 text-red-900 border-red-500/80',
      pillClass: 'bg-red-600 text-white animate-pulse',
      borderClass: 'border-l-4 border-l-red-600',
      badgeBg: 'bg-red-500/20 text-red-800 border-red-600/50',
      icon: '🔴',
      threatAssessment: 'CRITICAL THREAT! Actively scheming or preparing defiance against the Crown. Bestow gifts, titles, or imprison immediately!'
    };
  }
};

export const VassalsSystemModal: React.FC<VassalsSystemModalProps> = ({
  isOpen,
  onClose,
  playerCharacter,
  vassals,
  provinces,
  realms,
  family,
  onUpdateVassals,
  onUpdateCharacter,
  onAddChronicleEntry,
  onSelectProvince
}) => {
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedVassalId, setSelectedVassalId] = useState<string>(vassals[0]?.id || 'vassal_penllyn');
  const [tabFilter, setTabFilter] = useState<TabFilter>('relations');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-action Modals
  const [activeActionModal, setActiveActionModal] = useState<string | null>(null);

  // Edit character form state
  const [editName, setEditName] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');

  // Talk dialogue choices
  const [talkOutcome, setTalkOutcome] = useState<string | null>(null);

  // Scheme choice
  const [selectedScheme, setSelectedScheme] = useState<string>('Sway');

  // Item choice
  const [selectedItem, setSelectedItem] = useState<string>('Jeweled Golden Goblet');

  if (!isOpen) return null;

  const currentVassal = vassals.find(v => v.id === selectedVassalId) || vassals[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectVassal = (vassalId: string) => {
    setSelectedVassalId(vassalId);
    setCurrentView('vassal_detail');
    sound.playClick();
  };

  const handleOpenCharacter = (vassalId: string) => {
    setSelectedVassalId(vassalId);
    setCurrentView('character_detail');
    sound.playClick();
  };

  const handleBack = () => {
    sound.playClick();
    if (currentView === 'character_detail') {
      setCurrentView('vassal_detail');
    } else if (currentView === 'vassal_detail') {
      setCurrentView('list');
    } else {
      onClose();
    }
  };

  // Helper to format troops (e.g. 51.3k)
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return num.toString();
  };

  // Calculate total military power
  const totalTroops = vassals.reduce((sum, v) => sum + (v.troops || (v.levyContribution * 10)), 51300);

  // Relationship bar color & width calculation
  const getRelationshipColor = (opinion: number) => {
    if (opinion >= 60) return '#058226'; // Deep green
    if (opinion >= 20) return '#16A34A'; // Medium green
    if (opinion >= -20) return '#CA8A04'; // Amber
    return '#DC2626'; // Red
  };

  const getRelationshipFill = (opinion: number) => {
    // Maps -100..100 to 0..100%
    const pct = Math.max(0, Math.min(100, (opinion + 100) / 2));
    return `${pct}%`;
  };

  // Political action handlers
  const handleToggleFavorite = () => {
    if (!currentVassal) return;
    const isFav = !currentVassal.isFavorite;
    const updated = vassals.map(v => v.id === currentVassal.id ? { ...v, isFavorite: isFav } : v);
    onUpdateVassals(updated);
    sound.playClick();
    triggerToast(isFav ? `⭐ Added ${currentVassal.name} to Favorites!` : `Removed ${currentVassal.name} from Favorites.`);
  };

  const handleSendGift = (goldAmount: number) => {
    if (!currentVassal) return;
    if (playerCharacter.stats.gold < goldAmount) {
      triggerToast('⚠️ Not enough gold in the royal treasury!');
      sound.playWarHorns();
      return;
    }
    onUpdateCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, gold: prev.stats.gold - goldAmount }
    }));
    const boost = goldAmount === 100 ? 50 : 25;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      opinion: Math.min(100, v.opinion + boost),
      loyalty: Math.min(100, v.loyalty + 15)
    } : v);
    onUpdateVassals(updated);
    sound.playCoin();
    onAddChronicleEntry('Sent Royal Gift to Vassal', `Bestowed a gift of ${goldAmount} gold upon ${currentVassal.name}, raising their opinion to ${Math.min(100, currentVassal.opinion + boost)}.`);
    triggerToast(`🪙 Bestowed ${goldAmount} gold to ${currentVassal.name} (+${boost} Relationship)!`);
    setActiveActionModal(null);
  };

  const handleCompliment = () => {
    if (!currentVassal) return;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      opinion: Math.min(100, v.opinion + 15),
      loyalty: Math.min(100, v.loyalty + 5)
    } : v);
    onUpdateVassals(updated);
    sound.playFanfare();
    onAddChronicleEntry('Royal Court Praise', `Publicly complimented ${currentVassal.name} at court for their loyal governance.`);
    triggerToast(`🥰 Bestowed high royal praise upon ${currentVassal.name} (+15 Relationship)!`);
  };

  const handleInsult = () => {
    if (!currentVassal) return;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      opinion: Math.max(-100, v.opinion - 25),
      loyalty: Math.max(0, v.loyalty - 20)
    } : v);
    onUpdateVassals(updated);
    onUpdateCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, renown: prev.stats.renown + 15 }
    }));
    sound.playSwordClash();
    onAddChronicleEntry('Royal Reprimand', `Insulted and scolded ${currentVassal.name} before the High Council.`);
    triggerToast(`😡 Scolded ${currentVassal.name}! (-25 Relationship, +15 Crown Renown)`);
  };

  const handleImprison = () => {
    if (!currentVassal) return;
    const isImp = !currentVassal.isImprisoned;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      isImprisoned: isImp,
      opinion: isImp ? Math.max(-100, v.opinion - 50) : v.opinion + 20,
      loyalty: isImp ? 20 : 60
    } : v);
    onUpdateVassals(updated);
    sound.playSwordClash();
    onAddChronicleEntry(
      isImp ? 'Vassal Imprisoned' : 'Vassal Released from Dungeon',
      isImp ? `Cast ${currentVassal.name} into the dungeon cells for realm scrutiny.` : `Released ${currentVassal.name} from imprisonment.`
    );
    triggerToast(isImp ? `⛓️ Imprisoned ${currentVassal.name} in the royal dungeon!` : `🔓 Released ${currentVassal.name} from prison.`);
    setActiveActionModal(null);
  };

  const handleSaveEditCharacter = () => {
    if (!currentVassal) return;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      name: editName.trim() || v.name,
      title: editTitle.trim() || v.title
    } : v);
    onUpdateVassals(updated);
    sound.playClick();
    triggerToast(`✏️ Updated character details for ${editName || currentVassal.name}!`);
    setActiveActionModal(null);
  };

  const handleTalkChoice = (choice: string) => {
    if (!currentVassal) return;
    sound.playClick();
    if (choice === 'realm') {
      setTalkOutcome(`"${playerCharacter.name}, our borders are secure, and our levies stand ready at your royal command." (+5 Opinion)`);
      const updated = vassals.map(v => v.id === currentVassal.id ? { ...v, opinion: Math.min(100, v.opinion + 5) } : v);
      onUpdateVassals(updated);
    } else if (choice === 'praise') {
      setTalkOutcome(`"Your grace honors my ancestral house. We shall never forget your generosity." (+12 Opinion)`);
      const updated = vassals.map(v => v.id === currentVassal.id ? { ...v, opinion: Math.min(100, v.opinion + 12) } : v);
      onUpdateVassals(updated);
    } else if (choice === 'secret') {
      setTalkOutcome(`*Whispering:* "Be wary of court whisperers in the eastern marches, my liege..." (Revealed intrigue intelligence)`);
    }
  };

  const handleGiveItem = () => {
    if (!currentVassal) return;
    const items = currentVassal.itemsGiven || [];
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      opinion: Math.min(100, v.opinion + 35),
      loyalty: Math.min(100, v.loyalty + 20),
      itemsGiven: [...items, selectedItem]
    } : v);
    onUpdateVassals(updated);
    sound.playFanfare();
    onAddChronicleEntry('Bestowed Royal Artifact', `Gifted the ${selectedItem} to ${currentVassal.name} to seal eternal allegiance.`);
    triggerToast(`🎒 Bestowed ${selectedItem} to ${currentVassal.name} (+35 Relationship)!`);
    setActiveActionModal(null);
  };

  const handleStartScheme = () => {
    if (!currentVassal) return;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      activeScheme: selectedScheme
    } : v);
    onUpdateVassals(updated);
    sound.playSwordClash();
    onAddChronicleEntry('Initiated Royal Scheme', `Commenced the "${selectedScheme}" scheme targeting ${currentVassal.name}.`);
    triggerToast(`🔍 Commenced "${selectedScheme}" scheme targeting ${currentVassal.name}!`);
    setActiveActionModal(null);
  };

  const handleProposeMarriage = (familyMemberId: string) => {
    if (!currentVassal) return;
    const member = family.find(f => f.id === familyMemberId);
    if (!member) return;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      opinion: Math.min(100, v.opinion + 45),
      loyalty: Math.min(100, v.loyalty + 30)
    } : v);
    onUpdateVassals(updated);
    sound.playFanfare();
    onAddChronicleEntry('Feudal Marriage Alliance', `Arranged a royal betrothal between ${member.name} and the House of ${currentVassal.houseName || currentVassal.name}.`);
    triggerToast(`💍 Royal Marriage arranged with ${currentVassal.name} (+45 Relationship)!`);
    setActiveActionModal(null);
  };

  const handleAssignWard = (wardName: string) => {
    if (!currentVassal) return;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      assignedWardId: wardName,
      opinion: Math.min(100, v.opinion + 25)
    } : v);
    onUpdateVassals(updated);
    sound.playClick();
    onAddChronicleEntry('Assigned Royal Ward', `Placed young ${wardName} under the tutelage and mentorship of ${currentVassal.name}.`);
    triggerToast(`📖 Assigned ${wardName} as ward to ${currentVassal.name} (+25 Relationship)!`);
    setActiveActionModal(null);
  };

  const handleManageTaxes = (rate: 'Low' | 'Normal' | 'High' | 'Exempt') => {
    if (!currentVassal) return;
    const taxMult = rate === 'High' ? 1.5 : rate === 'Low' ? 0.6 : rate === 'Exempt' ? 0 : 1;
    const opinionImpact = rate === 'High' ? -25 : rate === 'Low' ? +20 : rate === 'Exempt' ? +40 : 0;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      taxRate: rate,
      taxContribution: Math.round((v.taxContribution || 40) * taxMult),
      opinion: Math.max(-100, Math.min(100, v.opinion + opinionImpact))
    } : v);
    onUpdateVassals(updated);
    sound.playCoin();
    triggerToast(`🪙 Tax rate for ${currentVassal.countyName || currentVassal.name} set to ${rate}!`);
    setActiveActionModal(null);
  };

  const handleManageLevies = (obligation: 'Low' | 'Standard' | 'Extensive' | 'Exempt') => {
    if (!currentVassal) return;
    const mult = obligation === 'Extensive' ? 1.6 : obligation === 'Low' ? 0.6 : obligation === 'Exempt' ? 0 : 1;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      levyObligation: obligation,
      levyContribution: Math.round((v.levyContribution || 150) * mult),
      troops: Math.round((v.troops || 1400) * mult)
    } : v);
    onUpdateVassals(updated);
    sound.playFanfare();
    triggerToast(`⚔️ Troop levy obligation set to ${obligation}!`);
    setActiveActionModal(null);
  };

  const handleGrantTitle = (newTitle: string) => {
    if (!currentVassal) return;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      title: newTitle,
      opinion: Math.min(100, v.opinion + 40),
      loyalty: Math.min(100, v.loyalty + 25)
    } : v);
    onUpdateVassals(updated);
    sound.playFanfare();
    onAddChronicleEntry('Granted Noble Feudal Title', `Bestowed the title of ${newTitle} upon ${currentVassal.name}.`);
    triggerToast(`📜 Granted title of ${newTitle} to ${currentVassal.name} (+40 Relationship)!`);
    setActiveActionModal(null);
  };

  const handleGiveProvince = (provName: string) => {
    if (!currentVassal) return;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      holdingsCount: (v.holdingsCount || 3) + 1,
      troops: (v.troops || 1400) + 400,
      opinion: Math.min(100, v.opinion + 50),
      loyalty: Math.min(100, v.loyalty + 30)
    } : v);
    onUpdateVassals(updated);
    sound.playFanfare();
    onAddChronicleEntry('Granted County Province', `Granted the governance of ${provName} to ${currentVassal.name}.`);
    triggerToast(`🏰 Granted ${provName} to ${currentVassal.name} (+50 Relationship)!`);
    setActiveActionModal(null);
  };

  const handleTakeProvince = () => {
    if (!currentVassal) return;
    const updated = vassals.map(v => v.id === currentVassal.id ? {
      ...v,
      holdingsCount: Math.max(1, (v.holdingsCount || 3) - 1),
      troops: Math.max(400, (v.troops || 1400) - 400),
      opinion: Math.max(-100, v.opinion - 45),
      loyalty: Math.max(10, v.loyalty - 35)
    } : v);
    onUpdateVassals(updated);
    sound.playSwordClash();
    onAddChronicleEntry('Revoked Feudal Province', `Revoked provincial holding from ${currentVassal.name} into the direct Crown domain.`);
    triggerToast(`🏰 Revoked province from ${currentVassal.name} (-45 Relationship, territory added to Crown)!`);
    setActiveActionModal(null);
  };

  // Filtered and sorted vassals list
  const filteredVassals = [...vassals].sort((a, b) => {
    if (tabFilter === 'relations') {
      return b.opinion - a.opinion;
    } else if (tabFilter === 'loyalty') {
      return (a.loyalty ?? 70) - (b.loyalty ?? 70); // Show lowest loyalty / biggest threats first
    } else if (tabFilter === 'troops') {
      const troopsA = a.troops || a.levyContribution * 10;
      const troopsB = b.troops || b.levyContribution * 10;
      return troopsB - troopsA;
    } else {
      return (b.holdingsCount || 1) - (a.holdingsCount || 1);
    }
  });

  // Calculate counts for loyalty threat status
  const loyalCount = vassals.filter(v => (v.loyalty ?? 70) >= 70).length;
  const disgruntledCount = vassals.filter(v => (v.loyalty ?? 70) >= 40 && (v.loyalty ?? 70) < 70).length;
  const plottingCount = vassals.filter(v => (v.loyalty ?? 70) < 40).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden font-sans">
      
      {/* Toast feedback pill */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] bg-stone-900 text-amber-200 border border-amber-500/80 px-4 py-2 rounded-full shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container styled exactly as in the mobile screenshots */}
      <div 
        className="w-full max-w-md h-full sm:h-[92vh] max-h-[860px] bg-[#FEF9E7] text-[#1A1A1A] flex flex-col shadow-2xl rounded-none sm:rounded-2xl overflow-hidden border border-amber-900/30"
        style={{ backgroundColor: '#FEF9E7' }}
      >
        
        {/* ========================================================================= */}
        {/* TOP EMPEROR / RULER SUMMARY BANNER (Golden Bar #C9972E) */}
        {/* ========================================================================= */}
        <div 
          className="px-4 py-3 bg-[#C9972E] text-stone-950 flex items-center justify-between border-b border-amber-700/40 select-none shrink-0"
          style={{ backgroundColor: '#C9972E' }}
        >
          {/* Left: Emperor Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EAD48F] border-2 border-amber-900/30 flex items-center justify-center text-3xl shadow-sm shrink-0 overflow-hidden">
              {playerCharacter.portrait || '🧔🏼'}
            </div>
            <div>
              <div className="font-extrabold text-stone-950 text-base leading-tight">
                {playerCharacter.rank || 'Emperor'}
              </div>
              <div className="font-extrabold text-stone-900 text-base leading-tight">
                {playerCharacter.name} '{playerCharacter.dynastyName || 'The Wise'}'
              </div>
            </div>
          </div>

          {/* Right: 2x2 Stats Grid (Crown/Renown, Cross/Piety, Gold, Crossed Swords) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-extrabold text-stone-950">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-base">👑</span>
              <span>{playerCharacter.stats.renown || 3147}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-base text-purple-900">✝️</span>
              <span>{playerCharacter.stats.pietyOrMana || 727}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-base">🪙</span>
              <span>{playerCharacter.stats.gold || 3352}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-base">⚔️</span>
              <span>{formatNumber(totalTroops)}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NAVIGATION TITLE BAR: < Title ? ✕ */}
        {/* ========================================================================= */}
        <div className="px-4 py-2.5 bg-[#C9972E] text-stone-950 flex items-center justify-between border-b border-amber-800/30 shrink-0">
          <button 
            onClick={handleBack}
            className="p-1 hover:bg-amber-600/30 rounded-full transition-colors cursor-pointer text-stone-950"
            title="Go Back"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-1.5 text-xl font-extrabold text-stone-950">
            <span>
              {currentView === 'list' && 'Vassals'}
              {currentView === 'vassal_detail' && 'Vassal'}
              {currentView === 'character_detail' && 'Character'}
            </span>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-stone-800 hover:text-stone-950 cursor-pointer p-0.5"
              title="Vassal Guide"
            >
              <HelpCircle className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          <button 
            onClick={onClose}
            className="p-1 hover:bg-amber-600/30 rounded-full transition-colors cursor-pointer text-stone-950"
            title="Close"
          >
            <X className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SCREEN 1: VASSALS LIST SCREEN */}
        {/* ========================================================================= */}
        {currentView === 'list' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FEF9E7]">
            
            {/* Filter Toggle Bar: [Relations] [Loyalty] [Troops] [Size] */}
            <div className="p-3 bg-[#C9972E] pt-1 pb-2 flex flex-col items-center border-b border-amber-700/30 shrink-0 gap-2">
              <div className="w-full max-w-md bg-[#B78722] p-1 rounded-xl grid grid-cols-4 shadow-inner text-center">
                <button
                  onClick={() => { setTabFilter('relations'); sound.playClick(); }}
                  className={`py-1.5 text-center text-xs sm:text-sm font-extrabold rounded-lg transition-all cursor-pointer ${
                    tabFilter === 'relations' 
                      ? 'bg-[#FEF9E7] text-stone-950 shadow-sm' 
                      : 'text-amber-950 hover:text-stone-950'
                  }`}
                >
                  Relations
                </button>
                <button
                  onClick={() => { setTabFilter('loyalty'); sound.playClick(); }}
                  className={`py-1.5 text-center text-xs sm:text-sm font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    tabFilter === 'loyalty' 
                      ? 'bg-[#FEF9E7] text-stone-950 shadow-sm' 
                      : 'text-amber-950 hover:text-stone-950'
                  }`}
                >
                  <span>Loyalty</span>
                  {plottingCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
                  )}
                </button>
                <button
                  onClick={() => { setTabFilter('troops'); sound.playClick(); }}
                  className={`py-1.5 text-center text-xs sm:text-sm font-extrabold rounded-lg transition-all cursor-pointer ${
                    tabFilter === 'troops' 
                      ? 'bg-[#FEF9E7] text-stone-950 shadow-sm' 
                      : 'text-amber-950 hover:text-stone-950'
                  }`}
                >
                  Troops
                </button>
                <button
                  onClick={() => { setTabFilter('size'); sound.playClick(); }}
                  className={`py-1.5 text-center text-xs sm:text-sm font-extrabold rounded-lg transition-all cursor-pointer ${
                    tabFilter === 'size' 
                      ? 'bg-[#FEF9E7] text-stone-950 shadow-sm' 
                      : 'text-amber-950 hover:text-stone-950'
                  }`}
                >
                  Size
                </button>
              </div>

              {/* Loyalty Quick Assessment Strip */}
              <div className="w-full max-w-md flex items-center justify-between text-[11px] font-bold px-2 text-stone-900 bg-amber-200/60 py-1 rounded-lg border border-amber-800/20">
                <span className="flex items-center gap-1 text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  {loyalCount} Loyal
                </span>
                <span className="flex items-center gap-1 text-amber-900">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  {disgruntledCount} Disgruntled
                </span>
                <span className={`flex items-center gap-1 ${plottingCount > 0 ? 'text-red-700 font-black animate-pulse' : 'text-stone-700'}`}>
                  <span className={`w-2 h-2 rounded-full ${plottingCount > 0 ? 'bg-red-600' : 'bg-stone-400'} inline-block`}></span>
                  {plottingCount} Plotting {plottingCount > 0 && '⚠️'}
                </span>
              </div>
            </div>

            {/* Subheader: Counties (Count) */}
            <div className="py-2 px-4 bg-[#FEF9E7] flex items-center justify-between border-b border-amber-900/15 font-black text-stone-900 text-sm shrink-0 tracking-wide">
              <span>Counties ({filteredVassals.length})</span>
              <span className="text-xs font-normal text-stone-600">Color-coded by loyalty & threat level</span>
            </div>

            {/* Vassals / Counties List */}
            <div className="flex-1 overflow-y-auto divide-y divide-amber-900/10">
              {filteredVassals.map((vassal) => {
                const countyTitle = vassal.countyName || `The County of ${vassal.provinceName || vassal.name}`;
                const relationshipScore = vassal.opinion;
                const loyaltyScore = vassal.loyalty ?? 70;
                const loyaltyInfo = getVassalLoyaltyStatus(loyaltyScore);
                const troopsCount = vassal.troops || vassal.levyContribution * 10 || 1420;
                const holdingsCount = vassal.holdingsCount || 3;

                return (
                  <div
                    key={vassal.id}
                    onClick={() => handleSelectVassal(vassal.id)}
                    className={`p-3.5 px-4 hover:bg-amber-100/70 transition-colors flex items-center justify-between gap-3 cursor-pointer group active:bg-amber-200/60 ${loyaltyInfo.borderClass}`}
                  >
                    {/* Left Flag / Leader Portrait */}
                    <div className="w-10 h-10 rounded-full bg-[#EAD48F] border border-amber-900/20 flex items-center justify-center text-xl shrink-0 shadow-xs relative">
                      <span>{vassal.portrait || '🚩'}</span>
                      {/* Loyalty Dot indicator */}
                      <span 
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-stone-900 shadow-sm"
                        style={{ backgroundColor: loyaltyInfo.color }}
                        title={`Loyalty: ${loyaltyScore}% (${loyaltyInfo.label})`}
                      />
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-extrabold text-stone-950 text-base leading-tight truncate">
                          {countyTitle}
                        </div>
                        {/* Loyalty Status Badge */}
                        <span 
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 border ${loyaltyInfo.badgeBg}`}
                        >
                          {loyaltyInfo.icon} {loyaltyScore}% {loyaltyInfo.label}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-stone-700 mt-0.5 truncate">
                        {vassal.name} • {vassal.title || 'Vassal Lord'}
                      </div>

                      {/* Dynamic Subtitle based on tab */}
                      {tabFilter === 'loyalty' && (
                        <div className="mt-1.5">
                          <div className="text-xs font-black text-stone-900 mb-0.5 flex justify-between">
                            <span>Feudal Loyalty: {loyaltyScore}%</span>
                            <span className="text-[10px] font-bold" style={{ color: loyaltyInfo.color }}>
                              {loyaltyInfo.label}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                            <div 
                              className="h-full transition-all duration-300"
                              style={{ 
                                width: `${Math.max(5, loyaltyScore)}%`, 
                                backgroundColor: loyaltyInfo.color 
                              }} 
                            />
                          </div>
                        </div>
                      )}

                      {tabFilter === 'relations' && (
                        <div className="mt-1">
                          <div className="text-xs font-black text-stone-900 mb-0.5 flex justify-between">
                            <span>Relationship:</span>
                            <span className="text-[10px] font-bold text-stone-600">
                              Opinion {relationshipScore > 0 ? `+${relationshipScore}` : relationshipScore}
                            </span>
                          </div>
                          {/* Two-tone Progress Bar matching screenshot */}
                          <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                            <div 
                              className="h-full transition-all duration-300"
                              style={{ 
                                width: getRelationshipFill(relationshipScore), 
                                backgroundColor: getRelationshipColor(relationshipScore) 
                              }} 
                            />
                          </div>
                        </div>
                      )}

                      {tabFilter === 'troops' && (
                        <div className="mt-1">
                          <div className="text-xs font-black text-stone-900 mb-0.5 flex justify-between">
                            <span>Troops: {troopsCount.toLocaleString()} levies</span>
                          </div>
                          <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                            <div 
                              className="h-full bg-[#8B1E1E] transition-all duration-300"
                              style={{ width: `${Math.min(100, (troopsCount / 2500) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      )}

                      {tabFilter === 'size' && (
                        <div className="mt-1">
                          <div className="text-xs font-black text-stone-900 mb-0.5 flex justify-between">
                            <span>Size: {holdingsCount} Holdings / Baronies</span>
                          </div>
                          <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                            <div 
                              className="h-full bg-[#CA8A04] transition-all duration-300"
                              style={{ width: `${Math.min(100, (holdingsCount / 6) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Chevron */}
                    <ChevronRight className="w-6 h-6 text-stone-700 group-hover:text-stone-950 transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2 & 3: VASSAL DETAIL VIEW */}
        {/* ========================================================================= */}
        {currentView === 'vassal_detail' && currentVassal && (
          <div className="flex-1 overflow-y-auto bg-[#FEF9E7] divide-y divide-amber-900/10">
            
            {/* 1. Section Header: Realm */}
            <div className="py-2 px-4 bg-[#EFE2A7] text-center font-black text-stone-900 text-base tracking-wide border-b border-amber-900/10">
              Realm
            </div>

            {/* Realm Row: Flag, County Name, Troops bar, ... */}
            <div className="p-3.5 px-4 flex items-center justify-between gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-2xl text-slate-800 shrink-0">
                🚩
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-extrabold text-stone-950 text-base leading-tight truncate">
                  {currentVassal.countyName || `The County of ${currentVassal.provinceName || currentVassal.name}`}
                </div>
                <div className="mt-1">
                  <div className="text-xs font-black text-stone-900 mb-0.5">
                    Troops:
                  </div>
                  <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                    <div 
                      className="h-full bg-[#8B1E1E]"
                      style={{ width: `${Math.min(100, ((currentVassal.troops || 1420) / 2500) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveActionModal('realm_options')}
                className="p-1 text-stone-700 hover:text-stone-950 cursor-pointer"
                title="County Options"
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>

            {/* 2. Section Header: Leader */}
            <div className="py-2 px-4 bg-[#EFE2A7] text-center font-black text-stone-900 text-base tracking-wide border-b border-amber-900/10">
              Leader
            </div>

            {/* Leader Row: Avatar, Name (Age), Relationship bar, > */}
            <div 
              onClick={() => handleOpenCharacter(currentVassal.id)}
              className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-amber-100/70 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-[#EAD48F] border-2 border-amber-900/30 flex items-center justify-center text-3xl shadow-sm shrink-0 overflow-hidden">
                {currentVassal.portrait || '👩🏽'}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-extrabold text-stone-950 text-base leading-tight truncate">
                  {currentVassal.name} ({currentVassal.age || 34})
                </div>
                <div className="mt-1">
                  <div className="text-xs font-black text-stone-900 mb-0.5">
                    Relationship:
                  </div>
                  <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                    <div 
                      className="h-full"
                      style={{ 
                        width: getRelationshipFill(currentVassal.opinion), 
                        backgroundColor: getRelationshipColor(currentVassal.opinion) 
                      }} 
                    />
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-stone-700 group-hover:text-stone-950 transition-transform group-hover:translate-x-0.5 shrink-0" />
            </div>

            {/* Loyalty & Feudal Threat Level Indicator */}
            {(() => {
              const vLoyalty = currentVassal.loyalty ?? 70;
              const lInfo = getVassalLoyaltyStatus(vLoyalty);
              return (
                <div className={`p-3.5 px-4 bg-amber-50/80 border-b border-amber-900/10 ${lInfo.borderClass}`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{lInfo.icon}</span>
                      <span className="text-xs font-black text-stone-900 uppercase tracking-wide">
                        Feudal Allegiance & Threat:
                      </span>
                    </div>
                    <span 
                      className={`text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${lInfo.badgeBg}`}
                    >
                      {vLoyalty}% • {lInfo.label}
                    </span>
                  </div>

                  {/* Loyalty meter bar */}
                  <div className="w-full h-3 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner mb-1.5">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(5, vLoyalty)}%`, 
                        backgroundColor: lInfo.color 
                      }} 
                    />
                  </div>

                  {/* Threat assessment description */}
                  <p className="text-[11px] text-stone-700 leading-snug font-medium">
                    {lInfo.threatAssessment}
                  </p>
                </div>
              );
            })()}

            {/* 3. Section Header: Actions */}
            <div className="py-2 px-4 bg-[#EFE2A7] text-center font-black text-stone-900 text-base tracking-wide border-b border-amber-900/10">
              Actions
            </div>

            {/* Action Items matching screenshot */}
            <div className="divide-y divide-amber-900/10">
              
              {/* Show Map */}
              <div 
                onClick={() => {
                  if (onSelectProvince && currentVassal.provinceId) {
                    onSelectProvince(currentVassal.provinceId);
                    onClose();
                  } else {
                    setActiveActionModal('map_view');
                  }
                }}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🗺️</span>
                  <span className="font-extrabold text-stone-950 text-base">Show Map</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* Show Vassals' Provinces */}
              <div 
                onClick={() => setActiveActionModal('provinces_view')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🏰</span>
                  <span className="font-extrabold text-stone-950 text-base">Show Vassals' Provinces</span>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-700" />
              </div>

              {/* Grant Title */}
              <div 
                onClick={() => setActiveActionModal('grant_title')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">📜</span>
                  <span className="font-extrabold text-stone-950 text-base">Grant Title</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* Manage Taxes */}
              <div 
                onClick={() => setActiveActionModal('manage_taxes')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🪙</span>
                  <span className="font-extrabold text-stone-950 text-base">Manage Taxes</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* Troop Contribution */}
              <div 
                onClick={() => setActiveActionModal('manage_levies')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">⚔️</span>
                  <span className="font-extrabold text-stone-950 text-base">Troop Contribution</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>
            </div>

            {/* 4. Section Header: Control */}
            <div className="py-2 px-4 bg-[#EFE2A7] text-center font-black text-stone-900 text-base tracking-wide border-b border-amber-900/10">
              Control
            </div>

            {/* Control Rows: Duchy, Kingdom, Empire */}
            <div className="divide-y divide-amber-900/10">
              
              {/* Duchy Control */}
              <div 
                onClick={() => triggerToast(`Crown control over ${currentVassal.duchyName || 'Powys (Duchy)'}: ${currentVassal.duchyControl || 78}%`)}
                className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 flex items-center justify-center text-2xl shrink-0">
                  👑
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-extrabold text-stone-950 text-base leading-tight truncate">
                    {currentVassal.duchyName || 'Powys (Duchy)'}
                  </div>
                  <div className="mt-1">
                    <div className="text-xs font-black text-stone-900 mb-0.5">
                      Control:
                    </div>
                    <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                      <div 
                        className="h-full bg-[#058226]"
                        style={{ width: `${currentVassal.duchyControl || 78}%` }}
                      />
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-700 shrink-0" />
              </div>

              {/* Kingdom Control */}
              <div 
                onClick={() => triggerToast(`Crown control over ${currentVassal.kingdomName || 'Wales (Kingdom)'}: ${currentVassal.kingdomControl || 42}%`)}
                className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 flex items-center justify-center text-2xl shrink-0">
                  👑
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-extrabold text-stone-950 text-base leading-tight truncate">
                    {currentVassal.kingdomName || 'Wales (Kingdom)'}
                  </div>
                  <div className="mt-1">
                    <div className="text-xs font-black text-stone-900 mb-0.5">
                      Control:
                    </div>
                    <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                      <div 
                        className="h-full bg-[#058226]"
                        style={{ width: `${currentVassal.kingdomControl || 42}%` }}
                      />
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-700 shrink-0" />
              </div>

              {/* Empire Control */}
              <div 
                onClick={() => triggerToast(`Crown control over ${currentVassal.empireName || 'Britannia (Empire)'}: ${currentVassal.empireControl || 18}%`)}
                className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 flex items-center justify-center text-2xl shrink-0">
                  👑
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-extrabold text-stone-950 text-base leading-tight truncate">
                    {currentVassal.empireName || 'Britannia (Empire)'}
                  </div>
                  <div className="mt-1">
                    <div className="text-xs font-black text-stone-900 mb-0.5">
                      Control:
                    </div>
                    <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                      <div 
                        className="h-full bg-[#058226]"
                        style={{ width: `${currentVassal.empireControl || 18}%` }}
                      />
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-700 shrink-0" />
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 4 & 5: CHARACTER POLITICAL ACTIONS SHEET */}
        {/* ========================================================================= */}
        {currentView === 'character_detail' && currentVassal && (
          <div className="flex-1 overflow-y-auto bg-[#FEF9E7] divide-y divide-amber-900/10">
            
            {/* Top Character Profile Row */}
            <div className="p-3.5 px-4 flex items-center justify-between gap-3 bg-[#FEF9E7] border-b border-amber-900/15">
              <div className="w-12 h-12 rounded-full bg-[#EAD48F] border-2 border-amber-900/30 flex items-center justify-center text-3xl shadow-sm shrink-0 overflow-hidden">
                {currentVassal.portrait || '👩🏽'}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-extrabold text-stone-950 text-base leading-tight truncate">
                  {currentVassal.name} ({currentVassal.houseName || 'Percival'}) ({currentVassal.age || 34})
                </div>
                <div className="mt-1">
                  <div className="text-xs font-black text-stone-900 mb-0.5">
                    Relationship:
                  </div>
                  <div className="w-full h-2.5 bg-[#D3D3D3] rounded-sm overflow-hidden flex shadow-inner">
                    <div 
                      className="h-full"
                      style={{ 
                        width: getRelationshipFill(currentVassal.opinion), 
                        backgroundColor: getRelationshipColor(currentVassal.opinion) 
                      }} 
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveActionModal('char_options')}
                className="p-1 text-stone-700 hover:text-stone-950 cursor-pointer"
                title="Options"
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>

            {/* List of 18 Exact Political Actions & Details in Screenshot Sequence */}
            <div className="divide-y divide-amber-900/10">
              
              {/* 1. Favorite */}
              <div 
                onClick={handleToggleFavorite}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{currentVassal.isFavorite ? '⭐' : '☆'}</span>
                  <span className="font-extrabold text-stone-950 text-base">Favorite</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 2. Realm: The County of Penllyn */}
              <div 
                onClick={() => setCurrentView('vassal_detail')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <span className="text-2xl">🚩</span>
                  <span className="font-extrabold text-stone-950 text-base truncate">
                    Realm: {currentVassal.countyName || `The County of ${currentVassal.provinceName || currentVassal.name}`}
                  </span>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-700 shrink-0" />
              </div>

              {/* 3. Culture: Welsh */}
              <div 
                onClick={() => setActiveActionModal('culture_info')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <span className="text-2xl">📖</span>
                  <span className="font-extrabold text-stone-950 text-base truncate">
                    Culture: {currentVassal.culture || 'Welsh'}
                  </span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700 shrink-0" />
              </div>

              {/* 4. Stats */}
              <div 
                onClick={() => setActiveActionModal('stats_view')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">📊</span>
                  <span className="font-extrabold text-stone-950 text-base">Stats</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 5. Traits */}
              <div 
                onClick={() => setActiveActionModal('traits_view')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🧬</span>
                  <span className="font-extrabold text-stone-950 text-base">Traits</span>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-700" />
              </div>

              {/* 6. Edit Character */}
              <div 
                onClick={() => {
                  setEditName(currentVassal.name);
                  setEditTitle(currentVassal.title);
                  setActiveActionModal('edit_char');
                }}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">✏️</span>
                  <span className="font-extrabold text-stone-950 text-base">Edit Character</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 7. Talk */}
              <div 
                onClick={() => {
                  setTalkOutcome(null);
                  setActiveActionModal('talk_dialog');
                }}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">💬</span>
                  <span className="font-extrabold text-stone-950 text-base">Talk</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 8. Send gift */}
              <div 
                onClick={() => setActiveActionModal('send_gift')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🪙</span>
                  <span className="font-extrabold text-stone-950 text-base">Send gift</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 9. Compliment */}
              <div 
                onClick={handleCompliment}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🥰</span>
                  <span className="font-extrabold text-stone-950 text-base">Compliment</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 10. Insult */}
              <div 
                onClick={handleInsult}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">😡</span>
                  <span className="font-extrabold text-stone-950 text-base">Insult</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 11. Give Province */}
              <div 
                onClick={() => setActiveActionModal('give_province')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🏰</span>
                  <span className="font-extrabold text-stone-950 text-base">Give Province</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 12. Take Province */}
              <div 
                onClick={() => setActiveActionModal('take_province')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🏰</span>
                  <span className="font-extrabold text-stone-950 text-base">Take Province</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 13. Propose Marriage */}
              <div 
                onClick={() => setActiveActionModal('propose_marriage')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">💍</span>
                  <span className="font-extrabold text-stone-950 text-base">Propose Marriage</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 14. Family */}
              <div 
                onClick={() => setActiveActionModal('family_view')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">👨‍👩‍👧</span>
                  <span className="font-extrabold text-stone-950 text-base">Family</span>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-700" />
              </div>

              {/* 15. Imprison */}
              <div 
                onClick={() => setActiveActionModal('imprison_confirm')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🪟</span>
                  <span className="font-extrabold text-stone-950 text-base">
                    {currentVassal.isImprisoned ? 'Release from Prison' : 'Imprison'}
                  </span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

              {/* 16. Assign a Ward */}
              <div 
                onClick={() => setActiveActionModal('assign_ward')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">📖</span>
                  <span className="font-extrabold text-stone-950 text-base">Assign a Ward</span>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-700" />
              </div>

              {/* 17. Start Scheme */}
              <div 
                onClick={() => setActiveActionModal('start_scheme')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🔍</span>
                  <span className="font-extrabold text-stone-950 text-base">Start Scheme</span>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-700" />
              </div>

              {/* 18. Give Item */}
              <div 
                onClick={() => setActiveActionModal('give_item')}
                className="p-3.5 px-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🎒</span>
                  <span className="font-extrabold text-stone-950 text-base">Give Item</span>
                </div>
                <MoreHorizontal className="w-6 h-6 text-stone-700" />
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* SUB-MODAL OVERLAYS (FOR ACTIONS: STATS, CULTURE, TALK, GIFT, SCHEME, ETC.) */}
      {/* ========================================================================= */}

      {/* 1. Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-700" />
                Feudal Vassals & Counties Guide
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs space-y-2.5 text-stone-800 leading-relaxed font-medium">
              <p>
                <strong>• Counties & Levies:</strong> Each vassal manages their county holding and provides feudal tax income and army troop levies to the imperial crown.
              </p>
              <p>
                <strong>• Relations:</strong> High opinion (&gt;60) keeps vassals loyal, preventing faction rebellions and increasing troop reinforcement speed.
              </p>
              <p>
                <strong>• Political Actions:</strong> You can compliment, send gifts, bestow artifacts, negotiate marriage treaties, educate royal wards, or enforce crown authority through imprisonment and title grants.
              </p>
            </div>
            <button 
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl shadow cursor-pointer hover:bg-[#B78722]"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* 2. Stats Modal */}
      {activeActionModal === 'stats_view' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>📊</span> {currentVassal.name}'s Stats
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-stone-900">
              <div className="bg-amber-100/80 p-2.5 rounded-xl border border-amber-800/20">
                <div className="text-stone-600 uppercase text-[10px]">Martial</div>
                <div className="text-base font-black text-red-800">{currentVassal.stats?.martial || 75} / 100</div>
              </div>
              <div className="bg-amber-100/80 p-2.5 rounded-xl border border-amber-800/20">
                <div className="text-stone-600 uppercase text-[10px]">Diplomacy</div>
                <div className="text-base font-black text-blue-800">{currentVassal.stats?.diplomacy || 82} / 100</div>
              </div>
              <div className="bg-amber-100/80 p-2.5 rounded-xl border border-amber-800/20">
                <div className="text-stone-600 uppercase text-[10px]">Intrigue</div>
                <div className="text-base font-black text-purple-800">{currentVassal.stats?.intrigue || 68} / 100</div>
              </div>
              <div className="bg-amber-100/80 p-2.5 rounded-xl border border-amber-800/20">
                <div className="text-stone-600 uppercase text-[10px]">Intellect</div>
                <div className="text-base font-black text-amber-900">{currentVassal.stats?.intellect || 74} / 100</div>
              </div>
              <div className="bg-amber-100/80 p-2.5 rounded-xl border border-amber-800/20">
                <div className="text-stone-600 uppercase text-[10px]">Stewardship</div>
                <div className="text-base font-black text-emerald-800">{currentVassal.stats?.stewardship || 80} / 100</div>
              </div>
              <div className="bg-amber-100/80 p-2.5 rounded-xl border border-amber-800/20">
                <div className="text-stone-600 uppercase text-[10px]">Prowess</div>
                <div className="text-base font-black text-stone-900">{currentVassal.stats?.prowess || 65} / 100</div>
              </div>
            </div>
            <button 
              onClick={() => setActiveActionModal(null)}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl cursor-pointer hover:bg-[#B78722]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 3. Traits Modal */}
      {activeActionModal === 'traits_view' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🧬</span> Personality & Traits
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {currentVassal.traits.map((t, idx) => (
                <div key={idx} className="p-2.5 bg-amber-100/90 rounded-xl border border-amber-800/20 flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <div>
                    <div className="text-sm font-black text-stone-950">{t}</div>
                    <div className="text-[11px] text-stone-700">Influences statecraft decisions, battlefield bravery, and council loyalty.</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveActionModal(null)}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl cursor-pointer hover:bg-[#B78722]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 4. Culture Info Modal */}
      {activeActionModal === 'culture_info' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>📖</span> Culture: {currentVassal.culture || 'Welsh'}
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-stone-800 space-y-2 leading-relaxed">
              <p>
                <strong>Cultural Heritage:</strong> Known for fierce archery traditions, mountainous border fortresses, and lyrical bards.
              </p>
              <p>
                <strong>Realm Integration:</strong> Vassals of {currentVassal.culture || 'Welsh'} culture receive +10% levy defense when defending in rugged terrain.
              </p>
            </div>
            <button 
              onClick={() => setActiveActionModal(null)}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl cursor-pointer hover:bg-[#B78722]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 5. Talk Dialog */}
      {activeActionModal === 'talk_dialog' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>💬</span> Converse with {currentVassal.name}
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {talkOutcome ? (
              <div className="p-3 bg-amber-100 rounded-xl border border-amber-700/30 text-xs font-semibold text-stone-900 italic">
                {talkOutcome}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleTalkChoice('realm')}
                  className="w-full text-left p-2.5 bg-amber-100/90 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-bold text-stone-950"
                >
                  🏰 "How fare the counties under your stewardship?"
                </button>
                <button
                  onClick={() => handleTalkChoice('praise')}
                  className="w-full text-left p-2.5 bg-amber-100/90 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-bold text-stone-950"
                >
                  👑 "Your loyalty brings honor to the entire realm."
                </button>
                <button
                  onClick={() => handleTalkChoice('secret')}
                  className="w-full text-left p-2.5 bg-amber-100/90 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-bold text-stone-950"
                >
                  👁️ "Have you heard any whispered plots among the dukes?"
                </button>
              </div>
            )}

            <button 
              onClick={() => setActiveActionModal(null)}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl cursor-pointer hover:bg-[#B78722]"
            >
              End Conversation
            </button>
          </div>
        </div>
      )}

      {/* 6. Send Gift Modal */}
      {activeActionModal === 'send_gift' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🪙</span> Send Gold Gift
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-700">
              Send a diplomatic gift of gold from your imperial treasury ({playerCharacter.stats.gold} Gold available).
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleSendGift(50)}
                className="w-full py-2.5 px-3 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-extrabold text-stone-950 flex items-center justify-between cursor-pointer"
              >
                <span>🪙 Modest Purse (50 Gold)</span>
                <span className="text-emerald-800 font-black">+25 Relationship</span>
              </button>
              <button
                onClick={() => handleSendGift(100)}
                className="w-full py-2.5 px-3 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-extrabold text-stone-950 flex items-center justify-between cursor-pointer"
              >
                <span>🪙 Grand Royal Tribute (100 Gold)</span>
                <span className="text-emerald-800 font-black">+50 Relationship</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Start Scheme Modal */}
      {activeActionModal === 'start_scheme' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🔍</span> Plot Political Scheme
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {['Sway (Gradually Boost Opinion)', 'Befriend (Form Unbreakable Bond)', 'Fabricate Strong Hook', 'Blackmail Dark Secrets', 'Assassinate (Hostile Conspiracy)'].map((schemeName) => (
                <button
                  key={schemeName}
                  onClick={() => setSelectedScheme(schemeName)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-colors ${
                    selectedScheme === schemeName 
                      ? 'bg-[#C9972E] text-stone-950 border-amber-900' 
                      : 'bg-amber-100/90 text-stone-900 border-amber-800/20 hover:bg-amber-200'
                  }`}
                >
                  {schemeName}
                </button>
              ))}
            </div>
            <button 
              onClick={handleStartScheme}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl cursor-pointer hover:bg-[#B78722]"
            >
              Launch Scheme
            </button>
          </div>
        </div>
      )}

      {/* 8. Give Item Modal */}
      {activeActionModal === 'give_item' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🎒</span> Bestow Relic or Item
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {['Jeweled Golden Goblet', 'Ancestral Valorian Longsword', 'Moonstone Pendant of Protection', 'Imperial Tapestry of Valoria'].map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-colors ${
                    selectedItem === item 
                      ? 'bg-[#C9972E] text-stone-950 border-amber-900' 
                      : 'bg-amber-100/90 text-stone-900 border-amber-800/20 hover:bg-amber-200'
                  }`}
                >
                  ✨ {item}
                </button>
              ))}
            </div>
            <button 
              onClick={handleGiveItem}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl cursor-pointer hover:bg-[#B78722]"
            >
              Grant Item (+35 Relationship)
            </button>
          </div>
        </div>
      )}

      {/* 9. Edit Character Modal */}
      {activeActionModal === 'edit_char' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>✏️</span> Edit Character
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-extrabold text-stone-800 block mb-1">Character Name:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 bg-white rounded-xl border border-amber-900/30 text-sm font-bold text-stone-950"
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-stone-800 block mb-1">Noble Title:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 bg-white rounded-xl border border-amber-900/30 text-sm font-bold text-stone-950"
                />
              </div>
            </div>
            <button 
              onClick={handleSaveEditCharacter}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl cursor-pointer hover:bg-[#B78722]"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* 10. Manage Taxes Modal */}
      {activeActionModal === 'manage_taxes' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🪙</span> Manage Feudal Taxes
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-700">Adjust the crown tax assessment levied on this county:</p>
            <div className="space-y-2">
              {(['Low', 'Normal', 'High', 'Exempt'] as const).map(rate => (
                <button
                  key={rate}
                  onClick={() => handleManageTaxes(rate)}
                  className="w-full p-2.5 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-bold text-stone-950 flex items-center justify-between"
                >
                  <span>{rate} Taxes</span>
                  <span className="text-stone-600">{rate === 'High' ? '+50% Gold (-25 Opinion)' : rate === 'Low' ? '-40% Gold (+20 Opinion)' : rate === 'Exempt' ? '0 Gold (+40 Opinion)' : 'Standard Yield'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 11. Manage Levies Modal */}
      {activeActionModal === 'manage_levies' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>⚔️</span> Troop Contribution Obligations
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-700">Set the military levy requirement for this county holding:</p>
            <div className="space-y-2">
              {(['Low', 'Standard', 'Extensive', 'Exempt'] as const).map(ob => (
                <button
                  key={ob}
                  onClick={() => handleManageLevies(ob)}
                  className="w-full p-2.5 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-bold text-stone-950 flex items-center justify-between"
                >
                  <span>{ob} Military Obligation</span>
                  <span className="text-stone-600">{ob === 'Extensive' ? '+60% Troops' : ob === 'Low' ? '-40% Troops' : ob === 'Exempt' ? '0 Levies' : 'Standard Levies'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 12. Grant Title Modal */}
      {activeActionModal === 'grant_title' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>📜</span> Grant Noble Feudal Title
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {['Count of the Royal March', 'Duke of the Realm', 'Lord Paramount of the Western Reach', 'Grand Marshal of Britannia'].map(t => (
                <button
                  key={t}
                  onClick={() => handleGrantTitle(t)}
                  className="w-full text-left p-2.5 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-bold text-stone-950"
                >
                  👑 Bestow "{t}" (+40 Opinion)
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 13. Family View Modal */}
      {activeActionModal === 'family_view' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>👨‍👩‍👧</span> House of {currentVassal.houseName || 'Percival'} Lineage
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-stone-800">
              <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-800/20">
                <div className="text-[10px] text-stone-600 uppercase font-black">Spouse</div>
                <div className="text-sm font-black text-stone-950">{currentVassal.family?.spouseName || 'Lord Gwilym Percival'}</div>
              </div>
              <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-800/20">
                <div className="text-[10px] text-stone-600 uppercase font-black">Designated Heir</div>
                <div className="text-sm font-black text-stone-950">{currentVassal.family?.heirName || 'Maredudd Percival (Age 12)'}</div>
              </div>
              <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-800/20">
                <div className="text-[10px] text-stone-600 uppercase font-black">Children Count</div>
                <div className="text-sm font-black text-stone-950">{currentVassal.family?.childrenCount || 2} Legitimate Children</div>
              </div>
            </div>
            <button 
              onClick={() => setActiveActionModal(null)}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl cursor-pointer hover:bg-[#B78722]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 14. Propose Marriage Modal */}
      {activeActionModal === 'propose_marriage' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>💍</span> Propose Feudal Marriage
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-700">Select a member of the royal dynasty for betrothal:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {family.filter(f => f.alive).map(f => (
                <button
                  key={f.id}
                  onClick={() => handleProposeMarriage(f.id)}
                  className="w-full p-2.5 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-bold text-stone-950 flex items-center justify-between"
                >
                  <span>👑 {f.name} ({f.relation}, Age {f.age})</span>
                  <span className="text-emerald-800 font-black">+45 Opinion</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 15. Assign Ward Modal */}
      {activeActionModal === 'assign_ward' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>📖</span> Assign Royal Ward
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-700">Assign a child to study statecraft and chivalry under this vassal guardian:</p>
            <div className="space-y-2">
              {['Prince Bryan (Heir, Age 14)', 'Princess Elaine (Age 10)', 'Lady Valerie (Cousin, Age 12)'].map(w => (
                <button
                  key={w}
                  onClick={() => handleAssignWard(w)}
                  className="w-full p-2.5 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-bold text-stone-950 flex items-center justify-between"
                >
                  <span>🎓 {w}</span>
                  <span className="text-emerald-800 font-black">+25 Opinion</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 16. Imprison Confirmation Modal */}
      {activeActionModal === 'imprison_confirm' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🪟</span> {currentVassal.isImprisoned ? 'Release Vassal?' : 'Imprison Vassal?'}
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {currentVassal.isImprisoned 
                ? `Release ${currentVassal.name} from the dungeon cells and restore their noble freedom.`
                : `Ordering the imperial guards to arrest ${currentVassal.name} will prevent any rebel factions but will damage relations (-50 Relationship).`}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveActionModal(null)}
                className="flex-1 py-2 bg-stone-300 text-stone-900 font-black text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleImprison}
                className="flex-1 py-2 bg-[#8B1E1E] text-white font-black text-xs rounded-xl cursor-pointer"
              >
                {currentVassal.isImprisoned ? 'Release from Dungeon' : 'Execute Arrest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 17. Give / Take Province Modals */}
      {activeActionModal === 'give_province' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🏰</span> Grant County Province
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-700">Grant a crown territory to expand this vassal's holding:</p>
            <div className="space-y-2">
              {['The March of Ironwood', 'Suncoast Lowlands', 'Silvervale Valley'].map(p => (
                <button
                  key={p}
                  onClick={() => handleGiveProvince(p)}
                  className="w-full p-2.5 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-800/20 text-xs font-bold text-stone-950 flex items-center justify-between"
                >
                  <span>🏰 {p}</span>
                  <span className="text-emerald-800 font-black">+50 Opinion</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeActionModal === 'take_province' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🏰</span> Revoke County Holding
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Revoking a province from {currentVassal.name} brings the land directly into the Crown Domain, but will severely anger the vassal (-45 Relationship).
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveActionModal(null)}
                className="flex-1 py-2 bg-stone-300 text-stone-900 font-black text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleTakeProvince}
                className="flex-1 py-2 bg-[#8B1E1E] text-white font-black text-xs rounded-xl cursor-pointer"
              >
                Revoke Holding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 18. Show Vassals' Provinces View */}
      {activeActionModal === 'provinces_view' && currentVassal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#FEF9E7] rounded-2xl p-5 border-2 border-amber-800 shadow-2xl text-stone-950 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🏰</span> {currentVassal.countyName || currentVassal.name}'s Holdings
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 hover:bg-amber-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs font-bold text-stone-800">
              <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-800/20 flex justify-between">
                <span>🏰 Fortified Castle Keep:</span>
                <span className="font-black text-stone-950">Level 3 (Moat & Bastions)</span>
              </div>
              <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-800/20 flex justify-between">
                <span>🌾 Wheat Farms & Manors:</span>
                <span className="font-black text-stone-950">Yield: 45 Gold/yr</span>
              </div>
              <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-800/20 flex justify-between">
                <span>🛡️ Garrison & Barracks:</span>
                <span className="font-black text-stone-950">{currentVassal.troops || 1420} Levies Ready</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveActionModal(null)}
              className="w-full py-2 bg-[#C9972E] text-stone-950 font-black text-sm rounded-xl cursor-pointer hover:bg-[#B78722]"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
