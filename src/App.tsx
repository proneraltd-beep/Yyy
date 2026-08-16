import React, { useState, useEffect } from 'react';
import { 
  Character, 
  FamilyMember, 
  Province, 
  Realm, 
  Vassal, 
  RealmLaw, 
  ChronicleEntry, 
  GameEvent, 
  WarState, 
  TradeCaravan, 
  Species, 
  TreatyType,
  CouncilRole,
  RealmNPC,
  ConditionalPeaceTerms,
  CoronationStyle
} from './types';
import { 
  INITIAL_REALMS, 
  INITIAL_PROVINCES, 
  INITIAL_VASSALS, 
  PRESET_DYNASTIES 
} from './data/initialWorld';
import { INITIAL_REALM_NPCS } from './data/realmNPCsData';
import { INITIAL_REALM_LAWS, SPECIES_ABILITIES } from './data/lawsData';
import { BUILDINGS_CONFIG } from './data/buildingsData';
import { EVENTS_POOL } from './data/eventsPool';
import { SPECIES_DATA, CROSS_MARRIAGE_OUTCOMES } from './data/speciesData';
import { sound } from './utils/audio';

import { TopHeader } from './components/TopHeader';
import { BottomNavigation, ActiveTab } from './components/BottomNavigation';
import { ChronicleTab } from './components/ChronicleTab';
import { RealmMapTab } from './components/RealmMapTab';
import { DynastyFamilyTab } from './components/DynastyFamilyTab';
import { WarDiplomacyTab } from './components/WarDiplomacyTab';
import { LawsPowersTab } from './components/LawsPowersTab';
import { CourtActivitiesTab } from './components/CourtActivitiesTab';
import { EventModal } from './components/EventModal';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { DeathHeirModal } from './components/DeathHeirModal';
import { GuideModal } from './components/GuideModal';
import { VassalsSystemModal } from './components/VassalsSystemModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { InGameEditorModal } from './components/InGameEditorModal';
import { TravelEncounterModal, TravelOutcome, ActivityType } from './components/TravelEncounterModal';
import { TargetEntity } from './components/war/RealmProvinceDetailScreen';
import { GameSaveState } from './types';
import { simulateAnnualBattleClash } from './utils/warCombat';

const SAVE_STORAGE_KEY = 'medieval_realms_save_v2';

export const getFeudalTierFromProvinces = (
  countyCount: number, 
  dynastyName: string
): { rank: 'Count' | 'Duke' | 'King' | 'Emperor'; title: string } => {
  if (countyCount >= 6) {
    return { rank: 'Emperor', title: `Emperor of ${dynastyName}` };
  } else if (countyCount >= 4) {
    return { rank: 'King', title: `King of ${dynastyName}` };
  } else if (countyCount >= 2) {
    return { rank: 'Duke', title: `Duke of ${dynastyName}` };
  } else {
    return { rank: 'Count', title: `Count of ${dynastyName}` };
  }
};

export default function App() {
  // Initialize from preset or saved data
  const defaultPreset = PRESET_DYNASTIES[0];

  const createInitialState = () => {
    const initialChar: Character = {
      id: 'char_player_1',
      name: defaultPreset.name,
      dynastyName: defaultPreset.dynastyName,
      gender: defaultPreset.gender,
      species: defaultPreset.species,
      age: 24,
      portrait: defaultPreset.portrait,
      rank: defaultPreset.rank,
      stats: {
        health: 95,
        happiness: 85,
        renown: 120,
        pietyOrMana: 60,
        gold: 220,
        martial: 65,
        intellect: 70,
        intrigue: 55,
        diplomacy: 75,
        specialResource: 80
      },
      traits: defaultPreset.traits,
      alive: true,
      yearBorn: 1042,
      childrenIds: defaultPreset.initialChildren ? defaultPreset.initialChildren.map((_, i) => `child_${i}`) : [],
      parentsIds: ['parent_father', 'parent_mother'],
      realmId: defaultPreset.realmId,
      isHeir: false,
      titlesHeld: [defaultPreset.title || 'Count of Brecknock']
    };

    const initialFamily: FamilyMember[] = [
      {
        id: 'parent_father',
        name: 'King Roderick I',
        species: 'Human',
        gender: 'Male',
        relation: 'Father',
        age: 62,
        alive: false,
        health: 0,
        opinion: 90,
        childrenIds: [initialChar.id],
        realmId: 'realm_human',
        title: 'Late High King',
        isHeir: false,
        traits: ['Grand Conqueror', 'Legendary Ruler'],
        causeOfDeath: 'Old Age',
        portrait: '👑'
      },
      {
        id: 'parent_mother',
        name: 'Queen Yvaine',
        species: 'Human',
        gender: 'Female',
        relation: 'Mother',
        age: 58,
        alive: false,
        health: 0,
        opinion: 95,
        childrenIds: [initialChar.id],
        realmId: 'realm_human',
        title: 'Late Queen Mother',
        isHeir: false,
        traits: ['Beloved', 'Devout'],
        causeOfDeath: 'Winter Fever',
        portrait: '👸'
      }
    ];

    if (defaultPreset.initialSpouse) {
      initialFamily.push({
        id: 'spouse_1',
        name: defaultPreset.initialSpouse.name,
        species: defaultPreset.initialSpouse.species,
        gender: 'Female',
        relation: 'Spouse',
        age: 22,
        alive: true,
        health: 90,
        opinion: 85,
        childrenIds: [],
        realmId: 'realm_human',
        title: defaultPreset.initialSpouse.title,
        isHeir: false,
        traits: defaultPreset.initialSpouse.traits,
        portrait: defaultPreset.initialSpouse.portrait
      });
    }

    if (defaultPreset.initialChildren) {
      defaultPreset.initialChildren.forEach((child, idx) => {
        initialFamily.push({
          id: `child_${idx}`,
          name: child.name,
          species: child.species,
          gender: child.gender,
          relation: 'Child',
          age: child.age,
          alive: true,
          health: 95,
          opinion: 90,
          childrenIds: [],
          realmId: 'realm_human',
          title: child.title,
          countyName: idx === 0 ? 'The County of Brecknock' : undefined,
          isHeir: idx === 0,
          isBloodRelation: true,
          traits: child.traits,
          portrait: child.portrait,
          educationTrack: 'Martial & Knightly Chivalry'
        });
      });
    }

    // Additional dynasty branches matching authentic court relations
    initialFamily.push(
      {
        id: 'child_extra_1',
        name: 'Prince Cuthbert Calvin',
        species: 'Human',
        gender: 'Male',
        relation: 'Child',
        age: 35,
        alive: true,
        health: 88,
        opinion: 78,
        childrenIds: ['grandchild_1', 'grandchild_2'],
        realmId: 'realm_human',
        title: 'Prince of the Blood',
        countyName: 'The County of Powys',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Knight Commander', 'Brave'],
        portrait: '🤴'
      },
      {
        id: 'child_extra_2',
        name: 'Princess Constance Calvin',
        species: 'Human',
        gender: 'Female',
        relation: 'Child',
        age: 28,
        alive: true,
        health: 94,
        opinion: 85,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Royal Princess',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Charismatic', 'Poetic Grace'],
        portrait: '👸'
      },
      {
        id: 'grandchild_1',
        name: 'Eugenia Calvin',
        species: 'Human',
        gender: 'Female',
        relation: 'Grandchild',
        age: 2,
        alive: true,
        health: 98,
        opinion: 80,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Lady of the Cradle',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Sweet-Hearted'],
        portrait: '👧'
      },
      {
        id: 'grandchild_2',
        name: 'Lord Benjamin Calvin',
        species: 'Human',
        gender: 'Male',
        relation: 'Grandchild',
        age: 1,
        alive: true,
        health: 99,
        opinion: 85,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Heir of the West March',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Vigorous'],
        portrait: '👶'
      },
      {
        id: 'sibling_1',
        name: 'Countess Susanna I Calvin',
        species: 'Human',
        gender: 'Female',
        relation: 'Sibling',
        age: 56,
        alive: true,
        health: 82,
        opinion: 76,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Countess of Gwent & Court Chancellor',
        countyName: 'The County of Gwent',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Diplomat', 'Devout'],
        portrait: '👩'
      },
      {
        id: 'sibling_2',
        name: 'Bartholomew Calvin',
        species: 'Human',
        gender: 'Male',
        relation: 'Sibling',
        age: 58,
        alive: true,
        health: 79,
        opinion: 72,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Grand Constable',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Stalwart', 'Disciplined'],
        portrait: '👨'
      },
      {
        id: 'cousin_1',
        name: 'Owen Calvin',
        species: 'Human',
        gender: 'Male',
        relation: 'Cousin',
        age: 61,
        alive: true,
        health: 80,
        opinion: 68,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Baron of Silverstream',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Sage Lore', 'Astute'],
        portrait: '👨‍🦳'
      },
      {
        id: 'enemy_1',
        name: 'Empress Consort Matilda Verney',
        species: 'Human',
        gender: 'Female',
        relation: 'Enemy',
        age: 44,
        alive: true,
        health: 85,
        opinion: -42,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Pretender to the Western Marches',
        countyName: 'The County of Verney',
        isHeir: false,
        isBloodRelation: false,
        traits: ['Ambitious', 'Schemer', 'Proud'],
        portrait: '🥀'
      },
      {
        id: 'advisor_1',
        name: 'Countess Serena I Plantagenet',
        species: 'Human',
        gender: 'Female',
        relation: 'Advisor',
        age: 40,
        alive: true,
        health: 90,
        opinion: 84,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Grand Treasurer & Warden of the Mint',
        isHeir: false,
        isBloodRelation: false,
        traits: ['Master of Coin', 'Diligent'],
        portrait: '👩🏼'
      },
      {
        id: 'advisor_2',
        name: 'Count Benjamin I Walpole',
        species: 'Human',
        gender: 'Male',
        relation: 'Advisor',
        age: 29,
        alive: true,
        health: 92,
        opinion: 80,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Marshal of the Royal Vanguard',
        isHeir: false,
        isBloodRelation: false,
        traits: ['Iron Will', 'Tactician'],
        portrait: '👨🏽'
      }
    );

    const initialChronicle: ChronicleEntry[] = [
      {
        id: 'chron_1',
        year: 1066,
        age: 24,
        title: 'Coronation at the Grand Cathedral',
        description: `Ascended the throne of ${defaultPreset.dynastyName} amidst grand celebrations and sounding trumpets across the realm.`,
        type: 'birth',
        isImportant: true
      }
    ];

    const initialCaravans: TradeCaravan[] = [
      {
        id: 'caravan_1',
        targetRealmId: 'realm_elf',
        targetRealmName: 'Sylvanna Sun Courts',
        exportGood: 'Valorian Plate Armor',
        importGood: 'Celestial Silk & Glass',
        investment: 50,
        annualProfit: 25,
        risk: 'Low',
        activeYears: 3
      }
    ];

    const initialWars: WarState[] = [];

    return {
      character: initialChar,
      familyMembers: initialFamily,
      realms: INITIAL_REALMS,
      provinces: INITIAL_PROVINCES,
      vassals: INITIAL_VASSALS,
      realmLaws: INITIAL_REALM_LAWS,
      chronicleEntries: initialChronicle,
      tradeCaravans: initialCaravans,
      currentYear: 1066,
      reignYears: 1,
      activeWars: initialWars,
      activeEvent: null as GameEvent | null
    };
  };

  // State initialization
  const [character, setCharacter] = useState<Character>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).character;
    } catch {}
    return createInitialState().character;
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).familyMembers;
    } catch {}
    return createInitialState().familyMembers;
  });

  const [realms, setRealms] = useState<Realm[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).realms;
    } catch {}
    return createInitialState().realms;
  });

  const [provinces, setProvinces] = useState<Province[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved).provinces;
        // Verify we have all 72 provinces (12 per realm across 6 realms)
        if (Array.isArray(parsed) && parsed.length >= 60) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_PROVINCES;
  });

  const [realmNPCs, setRealmNPCs] = useState<RealmNPC[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && JSON.parse(saved).realmNPCs) {
        const parsedNPCs = JSON.parse(saved).realmNPCs;
        if (Array.isArray(parsedNPCs) && parsedNPCs.length >= 20) {
          return parsedNPCs;
        }
      }
    } catch {}
    return INITIAL_REALM_NPCS;
  });

  const [vassals, setVassals] = useState<Vassal[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).vassals;
    } catch {}
    return createInitialState().vassals;
  });

  const [realmLaws, setRealmLaws] = useState<RealmLaw[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).realmLaws;
    } catch {}
    return createInitialState().realmLaws;
  });

  const [chronicleEntries, setChronicleEntries] = useState<ChronicleEntry[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).chronicleEntries;
    } catch {}
    return createInitialState().chronicleEntries;
  });

  const [tradeCaravans, setTradeCaravans] = useState<TradeCaravan[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).tradeCaravans;
    } catch {}
    return createInitialState().tradeCaravans;
  });

  const [currentYear, setCurrentYear] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).currentYear;
    } catch {}
    return 1066;
  });

  const [reignYears, setReignYears] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).reignYears;
    } catch {}
    return 1;
  });

  const [activeWars, setActiveWars] = useState<WarState[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && JSON.parse(saved).activeWars) return JSON.parse(saved).activeWars;
    } catch {}
    return createInitialState().activeWars;
  });
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chronicle');
  const [showCreator, setShowCreator] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showVassalsModal, setShowVassalsModal] = useState<boolean>(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState<boolean>(false);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [travelModalState, setTravelModalState] = useState<{
    isOpen: boolean;
    activity: ActivityType;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        character,
        familyMembers,
        realms,
        provinces,
        realmNPCs,
        vassals,
        realmLaws,
        chronicleEntries,
        tradeCaravans,
        currentYear,
        reignYears,
        activeWars
      };
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {}
  }, [character, familyMembers, realms, provinces, realmNPCs, vassals, realmLaws, chronicleEntries, tradeCaravans, currentYear, reignYears, activeWars]);

  // Derived Values
  const currentRealm = realms.find(r => r.id === character.realmId) || realms[0];
  const playerProvinces = provinces.filter(p => p.isPlayerControlled);
  const totalArmyPower = playerProvinces.reduce((sum, p) => sum + p.troops, 0) + vassals.reduce((sum, v) => sum + v.levyContribution, 0);

  // Restart / New Game handler
  const handleStartCustomGame = (config: {
    name: string;
    dynastyName: string;
    gender: 'Male' | 'Female';
    species: Species;
    rank: string;
    portrait: string;
    traits: string[];
    motto: string;
  }) => {
    const realmMatch = realms.find(r => r.species === config.species) || realms[0];

    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: config.name,
      dynastyName: config.dynastyName,
      gender: config.gender,
      species: config.species,
      age: 22,
      portrait: config.portrait,
      rank: config.rank,
      stats: {
        health: 95,
        happiness: 85,
        renown: 100,
        pietyOrMana: 60,
        gold: 200,
        martial: 60,
        intellect: 65,
        intrigue: 55,
        diplomacy: 65,
        specialResource: 80
      },
      traits: config.traits,
      alive: true,
      yearBorn: currentYear - 22,
      childrenIds: [],
      parentsIds: [],
      realmId: realmMatch.id,
      isHeir: false,
      titlesHeld: [`${config.rank} of ${realmMatch.name}`]
    };

    const newProvinces = provinces.map(p => ({
      ...p,
      isPlayerControlled: p.realmId === realmMatch.id
    }));

    const newChronicle: ChronicleEntry[] = [
      {
        id: `chron_${Date.now()}`,
        year: currentYear,
        age: 22,
        title: `Dynasty of ${config.dynastyName} Founded`,
        description: `${config.name} ascended the throne of ${realmMatch.name}. Motto: "${config.motto}".`,
        type: 'birth',
        isImportant: true
      }
    ];

    setCharacter(newChar);
    setFamilyMembers([]);
    setProvinces(newProvinces);
    setChronicleEntries(newChronicle);
    setReignYears(1);
    setActiveWars([]);
    setActiveEvent(null);
  };

  // Full Load Game State handler (from Save slots, files, or autosaves)
  const handleLoadGameState = (loaded: GameSaveState) => {
    if (loaded.character) setCharacter(loaded.character);
    if (Array.isArray(loaded.familyMembers)) setFamilyMembers(loaded.familyMembers);
    if (Array.isArray(loaded.realms)) setRealms(loaded.realms);
    if (Array.isArray(loaded.provinces)) setProvinces(loaded.provinces);
    if (Array.isArray(loaded.realmNPCs)) setRealmNPCs(loaded.realmNPCs);
    if (Array.isArray(loaded.vassals)) setVassals(loaded.vassals);
    if (Array.isArray(loaded.realmLaws)) setRealmLaws(loaded.realmLaws);
    if (Array.isArray(loaded.chronicleEntries)) setChronicleEntries(loaded.chronicleEntries);
    if (Array.isArray(loaded.tradeCaravans)) setTradeCaravans(loaded.tradeCaravans);
    if (typeof loaded.currentYear === 'number') setCurrentYear(loaded.currentYear);
    if (typeof loaded.reignYears === 'number') setReignYears(loaded.reignYears);
    if (Array.isArray(loaded.activeWars)) setActiveWars(loaded.activeWars);
    setActiveEvent(null);
  };

  // Primary Age-Up / Turn Progression Routine
  const handleAgeUp = () => {
    sound.playAgeUp();

    const newYear = currentYear + 1;
    const newAge = character.age + 1;
    const newReign = reignYears + 1;

    // 1. Calculate Province Incomes & Vassal Taxes & Check Trade Caravans
    const baseProvinceTax = playerProvinces.reduce((sum, p) => sum + p.income, 0);
    const vassalTaxes = vassals.reduce((sum, v) => sum + v.taxContribution, 0);
    
    // Trade Caravans Interception & Risk Check against Active War Realms
    const survivingCaravans: TradeCaravan[] = [];
    const interceptedCaravanChronicles: typeof chronicleEntries = [];
    let caravanProfits = 0;

    tradeCaravans.forEach(caravan => {
      const isTargetAtWar = activeWars.some(w => 
        w.targetRealmId === caravan.targetRealmId || 
        w.targetRealmName.toLowerCase() === caravan.targetRealmName.toLowerCase()
      );

      if (isTargetAtWar) {
        interceptedCaravanChronicles.push({
          id: `caravan_intercept_${Date.now()}_${caravan.id}`,
          year: newYear,
          age: newAge,
          title: `🏴‍☠️ Trade Caravan Intercepted by ${caravan.targetRealmName}!`,
          description: `Hostile privateers blockaded and confiscated your trade caravan carrying ${caravan.exportGood}. The entire ${caravan.investment} 🪙 initial investment was lost to enemy prize courts.`,
          type: 'war',
          isImportant: true
        });
      } else {
        caravanProfits += caravan.annualProfit;
        survivingCaravans.push({
          ...caravan,
          activeYears: caravan.activeYears + 1
        });
      }
    });
    setTradeCaravans(survivingCaravans);

    const totalYearlyGrossGold = baseProvinceTax + vassalTaxes + caravanProfits;

    // 1b. Calculate Active War Levies Upkeep (Paid annually from Treasury)
    const totalWarLevies = activeWars.reduce((sum, w) => {
      const troops = (w.yearlyTroops >= 1 ? w.yearlyTroops * 1000 : w.playerLevies) || 0;
      return sum + troops;
    }, 0);
    const totalWarUpkeep = Math.round(totalWarLevies * 0.003); // e.g. 15,000 levies = 45 gold
    const hasUpkeepDeficit = (character.stats.gold + totalYearlyGrossGold) < totalWarUpkeep;
    const netYearlyGold = totalYearlyGrossGold - totalWarUpkeep;
    const newGold = Math.max(0, character.stats.gold + netYearlyGold);

    // 1c. Calculate War Fatigue Level (Prolonged wars > 3 years)
    const maxWarFatigue = activeWars.length > 0
      ? Math.max(0, ...activeWars.map(w => w.warYear >= 6 ? 3 : w.warYear === 5 ? 2 : w.warYear === 4 ? 1 : 0))
      : 0;
    const fatigueRecruitmentPenalty = maxWarFatigue === 3 ? 0.35 : maxWarFatigue === 2 ? 0.20 : maxWarFatigue === 1 ? 0.10 : 0;
    const fatigueProsperityDrain = maxWarFatigue === 3 ? 6 : maxWarFatigue === 2 ? 4 : maxWarFatigue === 1 ? 2 : 0;
    const fatigueUnrestSpike = maxWarFatigue === 3 ? 8 : maxWarFatigue === 2 ? 5 : maxWarFatigue === 1 ? 3 : 0;
    const fatigueHappinessPenalty = maxWarFatigue === 3 ? 8 : maxWarFatigue === 2 ? 5 : maxWarFatigue === 1 ? 2 : 0;

    // 1d. Annual Troop Growth from Province Infrastructure (subject to War Fatigue)
    let totalNewRecruits = 0;
    const baseUpdatedProvinces = provinces.map(p => {
      if (!p.isPlayerControlled) return p;
      const b = p.buildings || {};
      const barracksGrowth = (b.barracks || 0) * 35;
      const castleGrowth = (b.castle || 0) * 15;
      const monumentGrowth = (b.realmSpecialStructure || 0) * 20;
      const prosperityGrowth = Math.floor(p.prosperity / 8);
      const martialBonus = Math.floor(character.stats.martial / 4);
      
      const rawNewTroops = Math.max(10, barracksGrowth + castleGrowth + monumentGrowth + prosperityGrowth + martialBonus);
      const annualNewTroops = Math.max(5, Math.round(rawNewTroops * (1 - fatigueRecruitmentPenalty)));
      totalNewRecruits += annualNewTroops;
      
      const newTroopCount = (p.troops || 450) + annualNewTroops;
      const newProsperity = Math.max(5, Math.min(100, (p.prosperity || 50) - fatigueProsperityDrain));
      const newUnrest = Math.min(100, Math.max(0, (p.unrest || 0) + fatigueUnrestSpike));

      return {
        ...p,
        prosperity: newProsperity,
        unrest: newUnrest,
        troops: newTroopCount,
        armyStrength: newTroopCount
      };
    });

    // 2. Resource generation
    const specialGain = character.species === 'Vampire' ? 10 : character.species === 'Werewolf' ? 12 : 8;
    const newSpecialResource = Math.min(100, character.stats.specialResource + specialGain);

    // 3. Health & Mortality Check
    let healthDelta = 0;
    if (newAge > 65) healthDelta -= Math.floor((newAge - 65) / 2);
    let newHealth = Math.max(0, character.stats.health + healthDelta);

    // 4. Age family members & check for children milestones
    const updatedFamily = familyMembers.map(m => {
      if (!m.alive) return m;
      const mNewAge = m.age + 1;
      return {
        ...m,
        age: mNewAge
      };
    });

    // 5. Random childbirth chance if married
    const spouse = updatedFamily.find(m => m.relation === 'Spouse' && m.alive);
    if (spouse && character.childrenIds.length < 5 && character.age < 50 && Math.random() < 0.25) {
      const childGender: 'Male' | 'Female' = Math.random() > 0.5 ? 'Male' : 'Female';
      const childNamesMale = ['Edmund', 'Gawain', 'Lucien', 'Fenris', 'Rowan', 'Valen'];
      const childNamesFemale = ['Rosalind', 'Morgana', 'Astrid', 'Lilith', 'Sylvia', 'Freya'];
      const childName = childGender === 'Male' 
        ? childNamesMale[Math.floor(Math.random() * childNamesMale.length)] 
        : childNamesFemale[Math.floor(Math.random() * childNamesFemale.length)];

      const isHybrid = spouse.species !== character.species;
      const hybridPair = `${character.species}+${spouse.species}`;
      const hybridTrait = isHybrid && CROSS_MARRIAGE_OUTCOMES[hybridPair] ? CROSS_MARRIAGE_OUTCOMES[hybridPair].hybridName : undefined;

      const newChildId = `child_${Date.now()}`;
      const newChild: FamilyMember = {
        id: newChildId,
        name: `${childName}`,
        species: Math.random() > 0.5 ? character.species : spouse.species,
        gender: childGender,
        relation: 'Child',
        age: 0,
        alive: true,
        health: 100,
        opinion: 95,
        childrenIds: [],
        realmId: character.realmId,
        title: childGender === 'Male' ? 'Royal Prince' : 'Royal Princess',
        isHeir: character.childrenIds.length === 0,
        traits: hybridTrait ? [hybridTrait] : ['Royal Blood'],
        portrait: childGender === 'Male' ? '👶' : '👧',
        educationTrack: 'Martial & Knightly Chivalry'
      };

      updatedFamily.push(newChild);
      character.childrenIds.push(newChildId);

      setChronicleEntries(prev => [
        {
          id: `chron_birth_${Date.now()}`,
          year: newYear,
          age: newAge,
          title: `Birth of ${newChild.title} ${newChild.name}`,
          description: `Queen Consort ${spouse.name} gave birth to a healthy ${childGender.toLowerCase()} infant! The kingdom rejoices.`,
          type: 'family',
          isImportant: true
        },
        ...prev
      ]);
    }

    // 6. Check Active Wars progress (Strictly Annual War Clash with Casualties, Commander Fates & Devastation)
    let totalAnnualPlayerCasualties = 0;
    let totalAnnualEnemyCasualties = 0;
    const warBattleChronicles: typeof chronicleEntries = [];

    if (activeWars.length > 0) {
      setActiveWars(prev => prev.map(w => {
        const clash = simulateAnnualBattleClash(w, character, newYear);
        const newScore = Math.min(100, Math.max(-100, w.warScore + clash.scoreDelta));
        const updatedPlayerLevies = Math.max(0, w.playerLevies - clash.playerCasualties);
        const updatedEnemyLevies = Math.max(0, w.enemyLevies - clash.enemyCasualties);

        totalAnnualPlayerCasualties += clash.playerCasualties;
        totalAnnualEnemyCasualties += clash.enemyCasualties;

        // Player personal command wounds
        if (clash.playerPersonalFate && clash.playerPersonalFate.wounded) {
          newHealth = Math.max(5, newHealth - clash.playerPersonalFate.healthLost);
          warBattleChronicles.push({
            id: `char_wound_${Date.now()}_${w.id}`,
            year: newYear,
            age: newAge,
            title: `🩸 Battlefield Wound Sustained in Campaign`,
            description: clash.playerPersonalFate.description,
            type: 'war',
            isImportant: true
          });
        }

        // Commander fates and trait ascension chronicle logs
        clash.commanderEvents.forEach((ev, idx) => {
          let eventTitle = '🎖️ Royal Commander Triumph';
          let isImportant = false;

          if (ev.fate === 'killed') {
            eventTitle = '💀 Commander Slain in Action';
            isImportant = true;
          } else if (ev.fate === 'captured') {
            eventTitle = '⛓️ Commander Captured in Action';
            isImportant = true;
          } else if (ev.fate === 'wounded') {
            eventTitle = '🩸 Commander Wounded in Action';
          } else if (ev.description.includes('Legendary Warmaster')) {
            eventTitle = '⚔️ Legendary Warmaster Anointed';
            isImportant = true;
          } else if (ev.description.includes('Heroic Commander')) {
            eventTitle = '🏆 Heroic Commander Ascended';
            isImportant = true;
          } else if (ev.description.includes('War Veteran')) {
            eventTitle = '⭐ War Veteran Trait Earned';
            isImportant = true;
          } else if (ev.description.includes('recovered')) {
            eventTitle = '🛡️ Commander Recovered & Returned to Duty';
          }

          warBattleChronicles.push({
            id: `cmd_event_${Date.now()}_${w.id}_${idx}`,
            year: newYear,
            age: newAge,
            title: eventTitle,
            description: ev.description,
            type: 'war',
            isImportant
          });
        });

        const warUpkeep = Math.round((w.yearlyTroops >= 1 ? w.yearlyTroops * 1000 : w.playerLevies) * 0.003);

        return {
          ...w,
          warScore: newScore,
          warYear: w.warYear + 1,
          warFatigueLevel: clash.warFatigue.fatigueLevel,
          annualUpkeepCost: warUpkeep,
          playerLevies: updatedPlayerLevies,
          enemyLevies: updatedEnemyLevies,
          enemyTactics: clash.nextEnemyTactics,
          commanders: clash.updatedCommanders,
          lastBattleReport: {
            year: newYear,
            title: clash.title,
            description: clash.description,
            won: clash.won,
            casualtiesPlayer: clash.playerCasualties,
            casualtiesEnemy: clash.enemyCasualties,
            scoreDelta: clash.scoreDelta,
            tacticalMatchup: clash.tacticalNarrative,
            commanderEvents: clash.commanderEvents.map(e => e.description),
            infrastructureDamageText: clash.infrastructureDevastation.damagedHoldingsDescription
          },
          battleLog: [
            {
              year: newYear,
              title: clash.title,
              description: clash.description,
              won: clash.won,
              casualtiesPlayer: clash.playerCasualties,
              casualtiesEnemy: clash.enemyCasualties,
              tacticalMatchup: clash.tacticalNarrative,
              commanderEvents: clash.commanderEvents.map(e => e.description),
              infrastructureDamageText: clash.infrastructureDevastation.damagedHoldingsDescription
            },
            ...w.battleLog
          ]
        };
      }));
    }

    // 7. Deduct Real Battle Casualties from Controlled Provinces & Apply Theater Devastation
    let remainingLossesToDeduct = totalAnnualPlayerCasualties;
    const playerProvincesCount = baseUpdatedProvinces.filter(p => p.isPlayerControlled).length;
    
    const updatedProvinces = baseUpdatedProvinces.map(p => {
      if (!p.isPlayerControlled) return p;
      if (remainingLossesToDeduct <= 0) return p;

      const provinceLossShare = Math.min(p.troops - 50, Math.ceil(totalAnnualPlayerCasualties / Math.max(1, playerProvincesCount)));
      const actualLosses = Math.max(0, provinceLossShare);
      remainingLossesToDeduct -= actualLosses;

      // Devastation in provinces if there are active wars
      const devastationProsperity = activeWars.length > 0 ? 3 : 0;
      const devastationUnrest = activeWars.length > 0 ? 4 : 0;

      return {
        ...p,
        troops: Math.max(50, p.troops - actualLosses),
        armyStrength: Math.max(50, p.troops - actualLosses),
        prosperity: Math.max(5, p.prosperity - devastationProsperity),
        unrest: Math.min(100, p.unrest + devastationUnrest)
      };
    });

    const newTotalArmyPower = updatedProvinces
      .filter(p => p.isPlayerControlled)
      .reduce((sum, p) => sum + p.troops, 0) + vassals.reduce((sum, v) => sum + v.levyContribution, 0);

    // 7b. Opportunistic AI Invasions (Hostile realms attack if player is fatigued or army is depleted)
    let opportunisticWar: WarState | null = null;
    const isPlayerVulnerable = (maxWarFatigue >= 2 || (character.stats.health < 40 && activeWars.length > 0) || (character.stats.gold < 30 && activeWars.length > 0));
    
    if (isPlayerVulnerable && activeWars.length <= 1 && Math.random() < 0.35) {
      const hostileRealm = realms.find(r => 
        r.opinion < 15 && 
        !activeWars.some(w => w.targetRealmId === r.id || w.targetRealmName.toLowerCase() === r.name.toLowerCase()) &&
        !r.isAtWarWithPlayer
      );

      if (hostileRealm) {
        const oppWarId = `war_opp_${Date.now()}`;
        opportunisticWar = {
          id: oppWarId,
          title: `Invasion by ${hostileRealm.name}`,
          targetType: 'realm',
          targetRealmId: hostileRealm.id,
          targetRealmName: hostileRealm.name,
          targetProvinceName: hostileRealm.capitalName,
          targetLeaderName: hostileRealm.leaderName,
          targetLeaderPortrait: hostileRealm.leaderPortrait,
          targetLeaderTitle: hostileRealm.leaderTitle,
          targetLeaderAge: hostileRealm.leaderProfile?.age || 45,
          targetLeaderOpinion: hostileRealm.opinion,
          warGoal: `Opportunistic Border Invasion against ${character.dynastyName}`,
          claimUsed: 'Imperial Hegemony & Exploitation of Weakness',
          yearlyTroops: Math.min(20, Math.max(5, (hostileRealm.armyStrength || 6000) / 1000)),
          maxYearlyTroops: 50,
          isPlayerCommanding: false,
          playerLevies: Math.max(1000, Math.round(newTotalArmyPower * 0.4)),
          enemyLevies: hostileRealm.armyStrength || 8500,
          enemyMaxLevies: (hostileRealm.armyStrength || 8500) * 1.4,
          warScore: -15, // Enemy has initial offensive momentum
          warYear: 1,
          lastTacticsChangeYear: newYear,
          playerTactics: 'Highland Defense & Fortress Siege',
          enemyTactics: 'Frontline Shock Charge',
          plunderCount: 0,
          commanders: [
            {
              id: `cmd_opp_1_${oppWarId}`,
              name: 'Border March Warden',
              role: 'Grand Marshal',
              portrait: '🛡️',
              martial: 25,
              trait: 'Frontline Bastion',
              assignedTroops: Math.round(newTotalArmyPower * 0.25),
              status: 'Ready'
            },
            {
              id: `cmd_opp_2_${oppWarId}`,
              name: 'Vanguard Knight Commander',
              role: 'Vanguard Commander',
              portrait: '🤴',
              martial: 27,
              trait: 'Disciplined Heavy Vanguard',
              assignedTroops: Math.round(newTotalArmyPower * 0.15),
              status: 'Ready'
            }
          ],
          battleLog: [
            {
              year: newYear,
              title: `Opportunistic War Declared by ${hostileRealm.name}`,
              description: `${hostileRealm.leaderName} of ${hostileRealm.name} perceived our prolonged campaigns and launched an opportunistic invasion across the border!`,
              won: false,
              casualtiesPlayer: 0,
              casualtiesEnemy: 0
            }
          ]
        };

        warBattleChronicles.push({
          id: `chron_opp_war_${Date.now()}`,
          year: newYear,
          age: newAge,
          title: `⚔️ OPPORTUNISTIC INVASION: ${hostileRealm.name} Attacks!`,
          description: `${hostileRealm.leaderName} has declared war against us, seeking to capitalize on our imperial exhaustion and war fatigue! Royal banners must rally for homeland defense.`,
          type: 'war',
          isImportant: true
        });

        // Set realm as at war
        setRealms(prev => prev.map(r => r.id === hostileRealm.id ? { ...r, isAtWarWithPlayer: true, opinion: -80 } : r));
        setActiveWars(prev => [opportunisticWar!, ...prev]);
      }
    }

    // 8. Dynamic Feudal Tier Evaluation (Count -> Duke -> King -> Emperor)
    const controlledCount = updatedProvinces.filter(p => p.isPlayerControlled).length;
    const tier = getFeudalTierFromProvinces(controlledCount, character.dynastyName);
    let rankElevationChronicle: ChronicleEntry | null = null;
    let newRank = character.rank;
    let newTitle = character.title || tier.title;

    if (tier.rank !== character.rank) {
      newRank = tier.rank;
      newTitle = tier.title;
      rankElevationChronicle = {
        id: `chron_elevation_${Date.now()}`,
        year: newYear,
        age: newAge,
        title: `👑 Dynastic Elevation: Ascended to ${tier.rank}!`,
        description: `With ${controlledCount} consolidated provincial counties under sovereign domain, your realm has risen from ${character.rank} to ${tier.rank} of ${character.dynastyName}!`,
        type: 'realm',
        isImportant: true
      };
    }

    // 8b. Update Character State
    const updatedHappiness = Math.max(0, Math.min(100, character.stats.happiness - fatigueHappinessPenalty));
    const updatedStats = {
      ...character.stats,
      gold: newGold,
      health: newHealth,
      happiness: updatedHappiness,
      specialResource: newSpecialResource
    };

    const updatedChar: Character = {
      ...character,
      rank: newRank,
      title: newTitle,
      titlesHeld: Array.from(new Set([newTitle, ...character.titlesHeld])),
      age: newAge,
      stats: updatedStats,
      alive: newHealth > 0,
      causeOfDeath: newHealth === 0 ? 'Severe Illness & Battlefield Injuries' : undefined
    };

    setCharacter(updatedChar);
    setFamilyMembers(updatedFamily);
    setProvinces(updatedProvinces);
    setCurrentYear(newYear);
    setReignYears(newReign);

    // 9. Add Annual Chronicle Reports with War Upkeep, Casualties & Fatigue Breakdown
    const upkeepText = totalWarUpkeep > 0 ? ` Paid -${totalWarUpkeep} 🪙 in active military levy upkeep.` : '';
    const casualtyText = totalAnnualPlayerCasualties > 0 
      ? ` Frontline clashes resulted in ${totalAnnualPlayerCasualties.toLocaleString()} imperial casualties and ${totalAnnualEnemyCasualties.toLocaleString()} enemy casualties.` 
      : '';
    const fatigueNotice = maxWarFatigue > 0 
      ? ` ⚠️ War Fatigue Stage ${maxWarFatigue} is impacting provinces (-${fatigueProsperityDrain}% Prosperity, +${fatigueUnrestSpike}% Unrest, -${(fatigueRecruitmentPenalty * 100).toFixed(0)}% Levy Growth).`
      : '';
    const deficitNotice = hasUpkeepDeficit ? ' ⚠️ TREASURY DEFICIT: Insufficient funds for military upkeep! Desertions and unrest reported.' : '';

    setChronicleEntries(prev => [
      ...(rankElevationChronicle ? [rankElevationChronicle] : []),
      ...interceptedCaravanChronicles,
      ...warBattleChronicles,
      {
        id: `chron_${newYear}_${Date.now()}`,
        year: newYear,
        age: newAge,
        title: `Year ${newYear} AD — Annual State Report`,
        description: `Collected ${totalYearlyGrossGold} 🪙 in gross taxes, tribute, and trade.${upkeepText}${casualtyText}${fatigueNotice}${deficitNotice} Raised +${totalNewRecruits} new recruits. Standing forces: ${newTotalArmyPower.toLocaleString()} total soldiers.`,
        type: 'realm'
      },
      ...prev
    ]);

    // 10. Trigger Random Event Dilemma
    if (newHealth > 0) {
      const randomEvent = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
      setActiveEvent(randomEvent);
    }
  };

  // Event Choice Resolver
  const handleSelectEventChoice = (choiceId: string) => {
    if (!activeEvent) return;
    const choice = activeEvent.choices.find(c => c.id === choiceId);
    if (!choice) return;

    const outcome = choice.outcome;

    // Apply stat changes
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold + (outcome.gold || 0),
        renown: prev.stats.renown + (outcome.renown || 0),
        happiness: Math.min(100, Math.max(0, prev.stats.happiness + (outcome.happiness || 0))),
        health: Math.min(100, Math.max(0, prev.stats.health + (outcome.health || 0))),
        pietyOrMana: Math.min(100, Math.max(0, prev.stats.pietyOrMana + (outcome.pietyOrMana || 0))),
        martial: Math.min(100, Math.max(0, prev.stats.martial + (outcome.martial || 0))),
        intrigue: Math.min(100, Math.max(0, prev.stats.intrigue + (outcome.intrigue || 0))),
        diplomacy: Math.min(100, Math.max(0, prev.stats.diplomacy + (outcome.diplomacy || 0))),
        intellect: Math.min(100, Math.max(0, prev.stats.intellect + (outcome.intellect || 0))),
        specialResource: Math.min(100, Math.max(0, prev.stats.specialResource + (outcome.specialResource || 0)))
      },
      traits: outcome.newTrait && !prev.traits.includes(outcome.newTrait) 
        ? [...prev.traits, outcome.newTrait] 
        : prev.traits
    }));

    // Opinion shift with target realm
    if (outcome.targetRealmId && outcome.opinionChange) {
      setRealms(prev => prev.map(r => 
        r.id === outcome.targetRealmId 
          ? { ...r, opinion: Math.min(100, Math.max(-100, r.opinion + (outcome.opinionChange || 0))) }
          : r
      ));
    }

    // Marriage trigger from event
    if (outcome.triggerMarriage) {
      const newSpouse: FamilyMember = {
        id: `spouse_${Date.now()}`,
        name: outcome.triggerMarriage.partnerName,
        species: outcome.triggerMarriage.partnerSpecies,
        gender: 'Female',
        relation: 'Spouse',
        age: 20,
        alive: true,
        health: 95,
        opinion: 90,
        childrenIds: [],
        realmId: outcome.targetRealmId || 'realm_vampire',
        title: 'Royal Consort',
        isHeir: false,
        traits: ['Royal Blood', 'High Noble'],
        portrait: outcome.triggerMarriage.partnerSpecies === 'Vampire' ? '🥀' : outcome.triggerMarriage.partnerSpecies === 'Witch' ? '🔮' : '👸'
      };
      setFamilyMembers(prev => [...prev.filter(m => m.relation !== 'Spouse'), newSpouse]);
    }

    // Add chronicle entry
    setChronicleEntries(prev => [
      {
        id: `event_chron_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: activeEvent.title,
        description: outcome.text,
        type: 'court',
        isImportant: true
      },
      ...prev
    ]);

    setActiveEvent(null);
  };

  // Building Construction
  const handleUpgradeBuilding = (provinceId: string, buildingKey: keyof Province['buildings'], cost: number) => {
    if (character.stats.gold < cost) return;

    const bConfig = BUILDINGS_CONFIG.find(b => b.key === buildingKey);
    const effects = bConfig?.effectsPerLevel || {};

    const renownGain = effects.renownBonus || 5;
    const pietyGain = effects.pietyOrManaBonus || 0;

    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost,
        renown: prev.stats.renown + renownGain,
        pietyOrMana: Math.min(100, prev.stats.pietyOrMana + pietyGain)
      }
    }));

    let upgradedProvinceName = '';
    let newTroopsAdded = 0;

    setProvinces(prev => prev.map(p => {
      if (p.id !== provinceId) return p;
      upgradedProvinceName = p.name;
      const currentLevel = p.buildings[buildingKey] || 0;
      const troopBonus = effects.troopsBonus || 0;
      const incomeBonus = effects.incomeBonus || 0;
      const unrestRed = effects.unrestReduction || 0;
      const prospBonus = effects.prosperityBonus || 0;

      newTroopsAdded = troopBonus;
      const updatedTroopCount = (p.troops || 450) + troopBonus;

      return {
        ...p,
        income: p.income + incomeBonus,
        troops: updatedTroopCount,
        armyStrength: updatedTroopCount,
        prosperity: Math.min(100, p.prosperity + prospBonus),
        unrest: Math.max(0, p.unrest - unrestRed),
        buildings: {
          ...p.buildings,
          [buildingKey]: currentLevel + 1
        }
      };
    }));

    setChronicleEntries(prev => [
      {
        id: `build_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Upgraded ${bConfig?.name || String(buildingKey)} in ${upgradedProvinceName || 'County'}`,
        description: `Constructed tier ${((provinces.find(p => p.id === provinceId)?.buildings[buildingKey] || 0) + 1)} of ${bConfig?.name || String(buildingKey)}. Gained ${effects.incomeBonus ? `+${effects.incomeBonus} 🪙 tax, ` : ''}${newTroopsAdded ? `+${newTroopsAdded} ⚔️ levies, ` : ''}${effects.prosperityBonus ? `+${effects.prosperityBonus} ✨ prosperity.` : 'defense and fortification.'}`,
        type: 'building'
      },
      ...prev
    ]);
  };

  // Province Relief Investments
  const handleInvestProvince = (provinceId: string, cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost } }));
    setProvinces(prev => prev.map(p => p.id === provinceId ? { ...p, prosperity: Math.min(100, p.prosperity + 12), income: p.income + 10 } : p));
  };

  const handleHoldProvinceFestival = (provinceId: string, cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost, happiness: Math.min(100, prev.stats.happiness + 8) } }));
    setProvinces(prev => prev.map(p => p.id === provinceId ? { ...p, unrest: Math.max(0, p.unrest - 20) } : p));
  };

  // Grant / Bestow Province to Family Member, Vassal, or New Noble
  const handleGrantProvince = (
    provinceId: string, 
    recipientType: 'family' | 'vassal' | 'new_noble', 
    recipientId: string, 
    recipientName: string
  ) => {
    const targetProv = provinces.find(p => p.id === provinceId);
    if (!targetProv) return;

    // Update province governor
    setProvinces(prev => prev.map(p => {
      if (p.id !== provinceId) return p;
      return {
        ...p,
        governorName: recipientName,
        governorId: recipientId
      };
    }));

    if (recipientType === 'family') {
      setFamilyMembers(prev => prev.map(m => m.id === recipientId ? { ...m, opinion: Math.min(100, m.opinion + 50) } : m));
    } else if (recipientType === 'vassal') {
      setVassals(prev => prev.map(v => v.id === recipientId ? { ...v, loyalty: Math.min(100, v.loyalty + 25), opinion: Math.min(100, v.opinion + 50) } : v));
    } else if (recipientType === 'new_noble') {
      const newVassal: Vassal = {
        id: recipientId,
        name: recipientName,
        species: character.species,
        gender: 'Male',
        age: 30,
        title: `Lord of ${targetProv.name.replace(/^The\s+/, '')}`,
        houseName: recipientName.split(' ').pop() || 'Valoria',
        countyName: targetProv.name,
        duchyName: 'Ducal March',
        duchyControl: 80,
        kingdomName: realms.find(r => r.id === targetProv.realmId)?.name || 'Valoria',
        kingdomControl: 50,
        empireName: 'Grand Empire',
        empireControl: 25,
        culture: 'Imperial',
        troops: targetProv.troops * 2,
        maxTroops: targetProv.troops * 3,
        holdingsCount: 1,
        provinceId: targetProv.id,
        provinceName: targetProv.name,
        councilRole: undefined,
        loyalty: 100,
        opinion: 95,
        taxContribution: Math.round(targetProv.income * 0.4),
        levyContribution: Math.round(targetProv.troops * 0.5),
        taxRate: 'Normal',
        levyObligation: 'Standard',
        faction: 'Loyalist',
        traits: ['Ennobled Knight', 'Fiercely Loyal'],
        portrait: '🛡️',
        stats: {
          martial: 75,
          diplomacy: 60,
          intrigue: 50,
          intellect: 65,
          prowess: 80,
          stewardship: 70
        }
      };
      setVassals(prev => [newVassal, ...prev]);
    }

    setChronicleEntries(prev => [
      {
        id: `fief_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Royal Enfeoffment: ${targetProv.name}`,
        description: `Bestowed the lordship and governance of ${targetProv.name} upon ${recipientName}. Sealed with the sovereign signet ring.`,
        type: 'realm',
        isImportant: true
      },
      ...prev
    ]);
  };

  // Claim Title of Emperor (When controlling >= 50% of a realm)
  const handleClaimEmperorTitle = (realmId: string, realmName: string) => {
    const imperialTitle = `Emperor of ${realmName}`;
    setCharacter(prev => ({
      ...prev,
      rank: 'Emperor',
      title: imperialTitle,
      titlesHeld: Array.from(new Set([imperialTitle, ...prev.titlesHeld])),
      stats: {
        ...prev.stats,
        renown: prev.stats.renown + 500,
        pietyOrMana: prev.stats.pietyOrMana + 100,
        happiness: Math.min(100, prev.stats.happiness + 50)
      }
    }));

    setChronicleEntries(prev => [
      {
        id: `coronation_emp_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `👑 Imperial Coronation: Emperor of ${realmName}!`,
        description: `Having conquered and consolidated sovereignty over more than 50% of ${realmName}, you were crowned Emperor under the highest divine rites! All neighboring realms bow before your hegemony.`,
        type: 'birth',
        isImportant: true
      },
      ...prev
    ]);
  };

  // Heir & Family Management
  const handleDesignateHeir = (memberId: string) => {
    setFamilyMembers(prev => prev.map(m => ({
      ...m,
      isHeir: m.id === memberId
    })));
  };

  const handleSetEducationTrack = (memberId: string, track: string) => {
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, educationTrack: track } : m));
  };

  const handleStudyHarder = (memberId: string, cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost } }));
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, opinion: Math.min(100, m.opinion + 10) } : m));
  };

  const handleGiftFamily = (memberId: string, cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost } }));
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, opinion: Math.min(100, m.opinion + 20) } : m));
  };

  const handleSpendTimeWithMember = (memberId: string) => {
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, happiness: Math.min(100, prev.stats.happiness + 10) } }));
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, opinion: Math.min(100, m.opinion + 15) } : m));
  };

  // Cross-Realm Royal Marriage
  const handleProposeCrossMarriage = (targetRealmId: string, partnerSpecies: Species, partnerName: string, dowry: number) => {
    const newSpouse: FamilyMember = {
      id: `spouse_${Date.now()}`,
      name: partnerName,
      species: partnerSpecies,
      gender: 'Female',
      relation: 'Spouse',
      age: 21,
      alive: true,
      health: 100,
      opinion: 85,
      childrenIds: [],
      realmId: targetRealmId,
      title: 'Royal Consort',
      isHeir: false,
      traits: ['Noble Bloodline', 'Allied House'],
      portrait: partnerSpecies === 'Vampire' ? '🥀' : partnerSpecies === 'Witch' ? '🔮' : partnerSpecies === 'Werewolf' ? '🐺' : '🧝'
    };

    setFamilyMembers(prev => [...prev.filter(m => m.relation !== 'Spouse'), newSpouse]);
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold + dowry,
        renown: prev.stats.renown + 30
      }
    }));

    setRealms(prev => prev.map(r => r.id === targetRealmId ? { ...r, opinion: Math.min(100, r.opinion + 40) } : r));

    setChronicleEntries(prev => [
      {
        id: `wedding_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Royal Inter-Species Wedding: ${partnerName}`,
        description: `Forged a grand cross-realm marriage alliance with ${partnerSpecies} nobility of ${realms.find(r => r.id === targetRealmId)?.name}. Dowry: +${dowry} 🪙.`,
        type: 'diplomacy',
        isImportant: true
      },
      ...prev
    ]);
  };

  // Diplomacy & Treaties
  const handleSendGift = (targetRealmId: string, goldAmount: number) => {
    if (character.stats.gold < goldAmount) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - goldAmount } }));
    setRealms(prev => prev.map(r => r.id === targetRealmId ? { ...r, opinion: Math.min(100, r.opinion + 25) } : r));
  };

  const handleSignTreaty = (targetRealmId: string, treaty: TreatyType) => {
    setRealms(prev => prev.map(r => {
      if (r.id !== targetRealmId) return r;
      if (r.treaties.includes(treaty)) return r;
      return {
        ...r,
        opinion: Math.min(100, r.opinion + 20),
        treaties: [...r.treaties, treaty]
      };
    }));

    setChronicleEntries(prev => [
      {
        id: `treaty_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Treaty Ratified: ${treaty}`,
        description: `Signed a diplomatic ${treaty} with ${realms.find(r => r.id === targetRealmId)?.name}.`,
        type: 'diplomacy'
      },
      ...prev
    ]);
  };

  // Interactive Realm NPC handlers
  const handleUpdateNPC = (updated: RealmNPC) => {
    setRealmNPCs(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const handleEmployNPCAsVassal = (npc: RealmNPC) => {
    const roleForVassal: CouncilRole = npc.role === 'Grand Marshal' ? 'Marshal' 
      : npc.role === 'Master of Whispers' ? 'Spymaster' 
      : (npc.role === 'High Inquisitor' || npc.role === 'High Priestess') ? 'HighPriest' 
      : npc.role === 'Lord Chancellor' ? 'Chancellor' 
      : 'GrandTreasurer';

    const newVassal: Vassal = {
      id: `vassal_recruited_${npc.id}`,
      name: npc.name,
      species: npc.species,
      gender: npc.gender,
      age: npc.age,
      title: `${npc.title} (Royal Court)`,
      houseName: npc.houseName,
      countyName: 'Royal Court Seat',
      duchyName: 'Imperial Crown Domain',
      duchyControl: 90,
      kingdomName: 'Crown Realm',
      kingdomControl: 85,
      empireName: 'Grand Empire',
      empireControl: 80,
      culture: npc.species,
      troops: 150,
      maxTroops: 300,
      holdingsCount: 1,
      provinceId: provinces.find(p => p.isPlayerControlled)?.id || 'prov_brecknock',
      provinceName: 'Crown Demesne',
      councilRole: roleForVassal,
      loyalty: 88,
      opinion: Math.max(75, npc.opinion),
      taxContribution: 25,
      levyContribution: 150,
      taxRate: 'Normal',
      levyObligation: 'Standard',
      faction: 'Loyalist',
      traits: npc.traits,
      portrait: npc.portrait,
      stats: {
        martial: npc.stats.martial,
        diplomacy: npc.stats.diplomacy,
        intrigue: npc.stats.intrigue,
        intellect: npc.stats.intellect,
        prowess: npc.stats.prowess,
        stewardship: npc.stats.stewardship
      },
      family: {
        childrenCount: 0
      }
    };

    setVassals(prev => {
      if (prev.some(v => v.id === newVassal.id)) return prev;
      return [...prev, newVassal];
    });

    setRealmNPCs(prev => prev.map(n => n.id === npc.id ? { ...n, isRecruitedToPlayerCourt: true, relationshipStatus: 'Sworn Vassal' } : n));
  };

  // Warfare & Conquest (Dedicated War & Realm/Province System)
  const handleDeclareWarOnTarget = (target: TargetEntity, claim: string, yearlyTroops: number, commandDirectly: boolean) => {
    const rawTroops = Math.round(yearlyTroops * 1000);
    const newWarId = `war_${Date.now()}`;

    const newWar: WarState = {
      id: newWarId,
      title: `${target.name.replace(/^The\s+/, '')} Campaign`,
      targetType: target.type,
      targetRealmId: target.id,
      targetRealmName: target.name,
      targetProvinceName: target.name,
      targetLeaderName: target.leaderName,
      targetLeaderPortrait: target.leaderPortrait,
      targetLeaderTitle: target.leaderTitle,
      targetLeaderAge: target.leaderAge,
      targetLeaderOpinion: target.relationship,
      warGoal: `${claim} against ${target.name}`,
      claimUsed: claim,
      yearlyTroops: yearlyTroops,
      maxYearlyTroops: totalArmyPower >= 1000 ? totalArmyPower / 1000 : 51.3,
      isPlayerCommanding: commandDirectly,
      playerLevies: rawTroops,
      enemyLevies: target.troops || 3500,
      enemyMaxLevies: target.maxTroops || 15000,
      warScore: commandDirectly ? 10 : 0,
      warYear: 1,
      lastTacticsChangeYear: currentYear,
      playerTactics: 'Frontline Shock Charge',
      enemyTactics: 'Highland Defense & Fortress Siege',
      plunderCount: 0,
      commanders: [
        {
          id: `cmd_1_${newWarId}`,
          name: 'Count Benjamin I Walpole',
          role: 'Grand Marshal',
          portrait: '👨🏽',
          martial: 26,
          trait: 'Master Tactician & Iron Will',
          assignedTroops: Math.round(rawTroops * 0.35),
          status: 'Engaged'
        },
        {
          id: `cmd_2_${newWarId}`,
          name: 'Prince Cuthbert Calvin',
          role: 'Vanguard Commander',
          portrait: '🤴',
          martial: 28,
          trait: 'Knight Commander & Fearless Charge',
          assignedTroops: Math.round(rawTroops * 0.25),
          status: 'Ready'
        },
        {
          id: `cmd_3_${newWarId}`,
          name: 'Bartholomew Calvin',
          role: 'Left Flank',
          portrait: '👨',
          martial: 23,
          trait: 'Disciplined Shieldwall Expert',
          assignedTroops: Math.round(rawTroops * 0.15),
          status: 'Ready'
        },
        {
          id: `cmd_4_${newWarId}`,
          name: 'Countess Susanna I Calvin',
          role: 'Right Flank',
          portrait: '👩',
          martial: 22,
          trait: 'Outflanking & Light Cavalry',
          assignedTroops: Math.round(rawTroops * 0.15),
          status: 'Ready'
        },
        {
          id: `cmd_5_${newWarId}`,
          name: 'Grand Inquisitor Aldous',
          role: 'Reserve & Magic',
          portrait: '🔮',
          martial: 25,
          trait: 'Arcane Siege & War Spells',
          assignedTroops: Math.round(rawTroops * 0.10),
          status: 'Ready'
        }
      ],
      battleLog: [
        {
          year: currentYear,
          title: 'War Declaration',
          description: `Royal banners mobilized against ${target.name} using claim "${claim}". ${commandDirectly ? 'His Imperial Majesty leads from the front!' : 'Royal Marshals dispatched.'}`,
          won: true,
          casualtiesPlayer: 0,
          casualtiesEnemy: 0
        }
      ]
    };

    setActiveWars(prev => [newWar, ...prev]);

    // Update opinion if realm
    setRealms(prev => prev.map(r => r.id === target.id || r.name.toLowerCase() === target.name.toLowerCase() ? { ...r, opinion: -80, isAtWarWithPlayer: true } : r));

    // Chronicle Entry
    setChronicleEntries(prev => [
      {
        id: `war_decl_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Declared War against ${target.name}`,
        description: `Pressed the sovereign claim for ${claim}. Committed ${yearlyTroops.toFixed(1)}k yearly troops under our 5 Royal Commanders.`,
        type: 'war',
        isImportant: true
      },
      ...prev
    ]);
  };

  const handleUpdateWar = (updatedWar: WarState) => {
    setActiveWars(prev => prev.map(w => w.id === updatedWar.id ? updatedWar : w));
  };

  const handleEndWar = (warId: string, outcome: 'enforce_demands' | 'white_peace' | 'surrender') => {
    const warToEnd = activeWars.find(w => w.id === warId);
    if (!warToEnd) return;

    if (outcome === 'enforce_demands') {
      // Victory rewards
      setCharacter(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          gold: prev.stats.gold + 180,
          renown: prev.stats.renown + 75,
          happiness: Math.min(100, prev.stats.happiness + 20)
        }
      }));

      // Total Realm & County Annexation
      // Identify target realm to conquer all of its constituent counties
      const targetRealm = realms.find(r => r.id === warToEnd.targetRealmId || r.name.toLowerCase() === warToEnd.targetRealmName.toLowerCase());
      const targetRealmId = targetRealm ? targetRealm.id : warToEnd.targetRealmId;

      const conqueredCounties: string[] = [];
      setProvinces(prev => {
        const updated = prev.map(p => {
          const isTargetProvince = p.id === warToEnd.targetRealmId || p.name.toLowerCase() === warToEnd.targetProvinceName?.toLowerCase();
          const isTargetRealmProvince = targetRealmId ? p.realmId === targetRealmId : false;

          if (isTargetProvince || isTargetRealmProvince || p.realmId === warToEnd.targetRealmId) {
            conqueredCounties.push(p.name);
            return {
              ...p,
              isPlayerControlled: true,
              unrest: Math.min(25, (p.unrest || 0) + 12)
            };
          }
          return p;
        });

        // Dynamic Rank Progression check using Feudal Tier helper
        const totalControlled = updated.filter(p => p.isPlayerControlled).length;
        const tier = getFeudalTierFromProvinces(totalControlled, character.dynastyName);
        if (tier.rank !== character.rank) {
          setCharacter(c => ({
            ...c,
            rank: tier.rank,
            title: tier.title,
            titlesHeld: Array.from(new Set([tier.title, ...c.titlesHeld]))
          }));
        }

        return updated;
      });

      // Liberate captured commanders upon victory
      setActiveWars(prev => prev.map(w => ({
        ...w,
        commanders: (w.commanders || []).map(c => c.status === 'Captured' ? { ...c, status: 'Ready' as const } : c)
      })));

      // Update realm state upon total victory
      if (targetRealmId) {
        setRealms(prev => prev.map(r => r.id === targetRealmId ? { ...r, isAtWarWithPlayer: false, opinion: 35 } : r));
      }

      setChronicleEntries(prev => [
        {
          id: `victory_${Date.now()}`,
          year: currentYear,
          age: character.age,
          title: `👑 Triumphant Conquest of ${warToEnd.targetRealmName}!`,
          description: `Enforced absolute imperial demands! All counties (${conqueredCounties.length} total) were successfully annexed under our realm crown. Extracted 180 🪙 in war reparations!`,
          type: 'war',
          isImportant: true
        },
        ...prev
      ]);
    } else if (outcome === 'white_peace') {
      const targetRealm = realms.find(r => r.id === warToEnd.targetRealmId || r.name.toLowerCase() === warToEnd.targetRealmName.toLowerCase());
      if (targetRealm) {
        setRealms(prev => prev.map(r => r.id === targetRealm.id ? { ...r, isAtWarWithPlayer: false, opinion: 0 } : r));
      }

      setChronicleEntries(prev => [
        {
          id: `white_peace_${Date.now()}`,
          year: currentYear,
          age: character.age,
          title: `White Peace with ${warToEnd.targetRealmName}`,
          description: `Both sides agreed to a status quo ceasefire with honor intact.`,
          type: 'diplomacy'
        },
        ...prev
      ]);
    } else {
      // Surrender penalty
      const targetRealm = realms.find(r => r.id === warToEnd.targetRealmId || r.name.toLowerCase() === warToEnd.targetRealmName.toLowerCase());
      if (targetRealm) {
        setRealms(prev => prev.map(r => r.id === targetRealm.id ? { ...r, isAtWarWithPlayer: false, opinion: 20 } : r));
      }

      setCharacter(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          gold: Math.max(0, prev.stats.gold - 80),
          renown: Math.max(0, prev.stats.renown - 30)
        }
      }));

      setChronicleEntries(prev => [
        {
          id: `surrender_${Date.now()}`,
          year: currentYear,
          age: character.age,
          title: `Conceded Defeat to ${warToEnd.targetRealmName}`,
          description: `Signed humiliating surrender accords and paid 80 🪙 in war indemnities.`,
          type: 'war',
          isImportant: true
        },
        ...prev
      ]);
    }

    // Remove from active wars list
    setActiveWars(prev => prev.filter(w => w.id !== warId));
  };

  // Conditional Peace Negotiations (Gold, Specific Provinces, Marriage Alliances)
  const handleProposeConditionalPeace = (terms: ConditionalPeaceTerms) => {
    const warToEnd = activeWars.find(w => w.id === terms.warId);
    if (!warToEnd) return;

    const targetRealm = realms.find(r => r.id === warToEnd.targetRealmId || r.name.toLowerCase() === warToEnd.targetRealmName.toLowerCase());
    const targetRealmId = targetRealm ? targetRealm.id : warToEnd.targetRealmId;

    // 1. Gold adjustments
    if (terms.goldAmount !== 0) {
      setCharacter(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          gold: Math.max(0, prev.stats.gold + terms.goldAmount),
          renown: prev.stats.renown + (terms.goldAmount > 0 ? 25 : 10)
        }
      }));
    }

    // 2. Province Cessions & Demands
    const gainedCounties: string[] = [];
    const cededCounties: string[] = [];

    setProvinces(prev => {
      const updated = prev.map(p => {
        // Demanded by player -> becomes player controlled
        if (terms.demandedProvinceIds.includes(p.id)) {
          gainedCounties.push(p.name);
          return {
            ...p,
            isPlayerControlled: true,
            unrest: Math.min(20, (p.unrest || 0) + 10)
          };
        }
        // Ceded by player -> becomes enemy realm controlled
        if (terms.cededProvinceIds.includes(p.id)) {
          cededCounties.push(p.name);
          return {
            ...p,
            isPlayerControlled: false,
            realmId: targetRealmId
          };
        }
        return p;
      });

      // Dynamic Rank Progression check using Feudal Tier helper
      const totalControlled = updated.filter(p => p.isPlayerControlled).length;
      const tier = getFeudalTierFromProvinces(totalControlled, character.dynastyName);
      if (tier.rank !== character.rank) {
        setCharacter(c => ({
          ...c,
          rank: tier.rank,
          title: tier.title,
          titlesHeld: Array.from(new Set([tier.title, ...c.titlesHeld]))
        }));
      }

      return updated;
    });

    // Liberate captured commanders if terms specify prisoner release
    if (terms.liberatePrisoners !== false) {
      setActiveWars(prev => prev.map(w => ({
        ...w,
        commanders: (w.commanders || []).map(c => c.status === 'Captured' ? { ...c, status: 'Ready' as const } : c)
      })));
    }

    // 3. Marriage Alliance
    if (terms.marriageAlliance) {
      const ma = terms.marriageAlliance;
      if (ma.memberType === 'self') {
        const newSpouse: FamilyMember = {
          id: `spouse_treaty_${Date.now()}`,
          name: ma.targetDynastyMemberName,
          species: ma.targetSpecies,
          gender: character.gender === 'Male' ? 'Female' : 'Male',
          relation: 'Spouse',
          age: 20,
          alive: true,
          health: 100,
          opinion: 85,
          childrenIds: [],
          realmId: targetRealmId,
          title: 'Royal Consort',
          isHeir: false,
          traits: ['Treaty Alliance Spouse', 'Noble Bloodline'],
          portrait: ma.targetSpecies === 'Vampire' ? '🥀' : ma.targetSpecies === 'HighElf' ? '🧝' : ma.targetSpecies === 'Werewolf' ? '🐺' : ma.targetSpecies === 'Witch' ? '🔮' : '👑'
        };
        setFamilyMembers(prev => [...prev.filter(m => m.relation !== 'Spouse'), newSpouse]);
        setCharacter(prev => ({
          ...prev,
          spouseName: ma.targetDynastyMemberName,
          spouseSpecies: ma.targetSpecies,
          stats: {
            ...prev.stats,
            gold: prev.stats.gold + ma.dowry,
            renown: prev.stats.renown + 35,
            happiness: Math.min(100, prev.stats.happiness + 15)
          }
        }));
      } else if (ma.memberId) {
        setFamilyMembers(prev => prev.map(m => {
          if (m.id === ma.memberId) {
            return {
              ...m,
              spouseName: ma.targetDynastyMemberName,
              title: `${m.title || 'Noble'} (Allied to ${warToEnd.targetRealmName})`,
              opinion: Math.min(100, m.opinion + 25)
            };
          }
          return m;
        }));
        setCharacter(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            gold: prev.stats.gold + ma.dowry,
            renown: prev.stats.renown + 25
          }
        }));
      }
    }

    // 4. Update Realm State (Treaties, Opinion, War Status)
    if (targetRealmId) {
      setRealms(prev => prev.map(r => {
        if (r.id === targetRealmId) {
          const combinedTreaties = Array.from(new Set([...(r.treaties || []), ...terms.treaties]));
          return {
            ...r,
            isAtWarWithPlayer: false,
            opinion: Math.min(100, Math.max(-20, r.opinion + terms.opinionBonus)),
            treaties: combinedTreaties
          };
        }
        return r;
      }));
    }

    // 5. Chronicle Entry
    setChronicleEntries(prev => [
      {
        id: `conditional_peace_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `🕊️ Peace Treaty Ratified with ${warToEnd.targetRealmName}`,
        description: `Concluded a conditional peace treaty! ${terms.summaryText}`,
        type: 'diplomacy',
        isImportant: true
      },
      ...prev
    ]);

    // 6. Remove from active wars list
    setActiveWars(prev => prev.filter(w => w.id !== terms.warId));
  };

  // Trade Caravans
  const handleDispatchCaravan = (targetRealmId: string, exportGood: string, importGood: string, investment: number) => {
    if (character.stats.gold < investment) return;
    const targetRealm = realms.find(r => r.id === targetRealmId);
    if (!targetRealm) return;

    const newCaravan: TradeCaravan = {
      id: `caravan_${Date.now()}`,
      targetRealmId,
      targetRealmName: targetRealm.name,
      exportGood,
      importGood,
      investment,
      annualProfit: Math.round(investment * 0.4),
      risk: 'Medium',
      activeYears: 0
    };

    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - investment } }));
    setTradeCaravans(prev => [...prev, newCaravan]);
  };

  // Vassals
  const handleBribeVassal = (vassalId: string, goldAmount: number) => {
    if (character.stats.gold < goldAmount) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - goldAmount } }));
    setVassals(prev => prev.map(v => v.id === vassalId ? { ...v, loyalty: Math.min(100, v.loyalty + 25) } : v));
  };

  const handleAppeaseFaction = (vassalId: string) => {
    setVassals(prev => prev.map(v => v.id === vassalId ? { ...v, faction: 'Loyalist', loyalty: Math.min(100, v.loyalty + 15) } : v));
  };

  // Laws & Abilities
  const handleEnactLaw = (lawId: string, optionId: string) => {
    const targetLaw = realmLaws.find(l => l.id === lawId);
    const chosenOption = targetLaw?.options.find(o => o.id === optionId);

    setRealmLaws(prev => prev.map(l => l.id === lawId ? { ...l, currentOptionId: optionId } : l));

    if (targetLaw && chosenOption) {
      setChronicleEntries(prev => [
        {
          id: `law_enact_${Date.now()}`,
          year: currentYear,
          age: character.age,
          title: `Imperial Law Enacted: ${chosenOption.name}`,
          description: `Decreed the new statute for ${targetLaw.title}. ${chosenOption.effects}`,
          type: 'realm',
          isImportant: true
        },
        ...prev
      ]);
    }
  };

  const handleUseSpeciesAbility = (abilityId: string) => {
    const ability = SPECIES_ABILITIES[character.species]?.find(a => a.id === abilityId);
    if (!ability) return;

    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - (ability.cost.gold || 0),
        specialResource: prev.stats.specialResource - (ability.cost.specialResource || 0),
        pietyOrMana: prev.stats.pietyOrMana - (ability.cost.pietyOrMana || 0),
        health: Math.min(100, prev.stats.health - (ability.cost.health || 0) + (ability.id.includes('heal') || ability.id.includes('feast') || ability.id.includes('elixir') ? 35 : 0)),
        renown: prev.stats.renown + 20
      }
    }));

    setChronicleEntries(prev => [
      {
        id: `ability_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Species Power Invoked: ${ability.name}`,
        description: ability.effectSummary,
        type: 'supernatural',
        isImportant: true
      },
      ...prev
    ]);
  };

  const handleAssignCouncil = (vassalId: string, role: CouncilRole) => {
    setVassals(prev => prev.map(v => ({
      ...v,
      councilRole: v.id === vassalId ? role : (v.councilRole === role ? undefined : v.councilRole)
    })));
  };

  // Court Activities
  const handleHostFeast = (cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost,
        happiness: Math.min(100, prev.stats.happiness + 20),
        renown: prev.stats.renown + 15
      }
    }));
    setVassals(prev => prev.map(v => ({ ...v, loyalty: Math.min(100, v.loyalty + 15), opinion: Math.min(100, v.opinion + 15) })));
  };

  const handleGoHunting = (cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost
      }
    }));
    setTravelModalState({
      isOpen: true,
      activity: 'hunt'
    });
  };

  const handleGoPilgrimage = (cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost
      }
    }));
    setTravelModalState({
      isOpen: true,
      activity: 'pilgrimage'
    });
  };

  const handleResolveTravelOutcome = (outcome: TravelOutcome) => {
    setCharacter(prev => {
      const updatedStats = { ...prev.stats };
      if (outcome.gold) updatedStats.gold = Math.max(0, updatedStats.gold + outcome.gold);
      if (outcome.health) updatedStats.health = Math.min(100, Math.max(5, updatedStats.health + outcome.health));
      if (outcome.martial) updatedStats.martial = Math.min(100, updatedStats.martial + outcome.martial);
      if (outcome.intellect) updatedStats.intellect = Math.min(100, updatedStats.intellect + outcome.intellect);
      if (outcome.pietyOrMana) updatedStats.pietyOrMana = Math.min(100, updatedStats.pietyOrMana + outcome.pietyOrMana);
      if (outcome.renown) updatedStats.renown = Math.max(0, updatedStats.renown + outcome.renown);
      if (outcome.happiness) updatedStats.happiness = Math.min(100, Math.max(0, updatedStats.happiness + outcome.happiness));

      let updatedTraits = [...prev.traits];
      if (outcome.addTrait && !updatedTraits.includes(outcome.addTrait)) {
        updatedTraits.push(outcome.addTrait);
      }
      if (outcome.removeTrait) {
        updatedTraits = updatedTraits.filter(t => t !== outcome.removeTrait);
      }

      return {
        ...prev,
        stats: updatedStats,
        traits: updatedTraits
      };
    });

    if (outcome.chronicleTitle) {
      const newEntry: ChronicleEntry = {
        id: `travel_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: outcome.chronicleTitle,
        description: outcome.chronicleDescription,
        isImportant: true,
        type: 'supernatural'
      };
      setChronicleEntries(prev => [newEntry, ...prev]);
    }

    setTravelModalState(null);
  };

  const handleHostTournament = (cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost,
        renown: prev.stats.renown + 35,
        happiness: Math.min(100, prev.stats.happiness + 15)
      }
    }));
  };

  const handleAdministerJustice = (decisionId: string, outcome: { gold?: number; happiness?: number; renown?: number; unrest?: number }) => {
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold + (outcome.gold || 0),
        happiness: Math.min(100, Math.max(0, prev.stats.happiness + (outcome.happiness || 0))),
        renown: prev.stats.renown + (outcome.renown || 0)
      }
    }));
  };

  // Heir Succession & Imperial Coronation Routine
  const handleContinueAsHeir = (heirMember: FamilyMember, coronationStyle: CoronationStyle = 'sacred_rites') => {
    let inheritedGold = Math.round(character.stats.gold * 0.8);
    let bonusPiety = 0;
    let bonusMartial = 0;
    let bonusRenown = 0;
    let bonusHappiness = 0;
    let coronationTitle = `👑 Imperial Coronation: ${heirMember.name}`;
    let coronationDesc = `Ascended the throne of ${character.dynastyName}.`;

    if (coronationStyle === 'sacred_rites') {
      inheritedGold = Math.max(0, inheritedGold - 35);
      bonusPiety = 40;
      setVassals(prev => prev.map(v => ({ ...v, loyalty: Math.min(100, v.loyalty + 30) })));
      coronationTitle = `✨ Holy Coronation: ${heirMember.name}`;
      coronationDesc = `Anointed with sacred oil, divine holy rites, and ancient blessings. Vassals swore eternal fealty (+40 Piety/Mana, +30 Vassal Loyalty).`;
    } else if (coronationStyle === 'martial_triumph') {
      inheritedGold = Math.max(0, inheritedGold - 40);
      bonusMartial = 40;
      bonusRenown = 30;
      setProvinces(prev => prev.map((p, idx) => idx === 0 ? { ...p, troops: (p.troops || 450) + 250 } : p));
      coronationTitle = `⚔️ Martial Triumph: ${heirMember.name}`;
      coronationDesc = `Ascended amid thunderous parades of armored knights, veteran paladins, and heavy legions (+40 Martial, +250 Capital Levies, +30 Prestige).`;
    } else if (coronationStyle === 'lavish_feast') {
      inheritedGold = Math.max(0, inheritedGold - 50);
      bonusHappiness = 35;
      setVassals(prev => prev.map(v => ({ ...v, opinion: Math.min(100, v.opinion + 35) })));
      setProvinces(prev => prev.map(p => ({ ...p, unrest: Math.max(0, (p.unrest || 0) - 15) })));
      coronationTitle = `🍷 Grand Jubilee & Feast: ${heirMember.name}`;
      coronationDesc = `Hosted a lavish imperial festival with royal tournaments and feasts for all social estates (+35 Happiness, +35 Vassal Opinion, -15 Unrest).`;
    } else {
      coronationTitle = `📜 Pragmatic Succession: ${heirMember.name}`;
      coronationDesc = `Enacted a modest coronation in the high council chambers to conserve royal treasury funds (0 🪙 coronation cost).`;
    }

    const controlledCount = provinces.filter(p => p.isPlayerControlled).length;
    const tier = getFeudalTierFromProvinces(controlledCount, character.dynastyName);

    const newRulerChar: Character = {
      id: `char_${heirMember.id}`,
      name: heirMember.name,
      dynastyName: character.dynastyName,
      gender: heirMember.gender,
      species: heirMember.species,
      age: Math.max(18, heirMember.age),
      portrait: heirMember.portrait,
      rank: tier.rank,
      title: tier.title,
      stats: {
        health: 95,
        happiness: Math.min(100, 80 + bonusHappiness),
        renown: Math.round(character.stats.renown * 0.6) + 40 + bonusRenown,
        pietyOrMana: 60 + bonusPiety,
        gold: inheritedGold,
        martial: 65 + bonusMartial,
        intellect: 70,
        intrigue: 60,
        diplomacy: 70,
        specialResource: 75
      },
      traits: heirMember.traits,
      alive: true,
      yearBorn: currentYear - heirMember.age,
      childrenIds: [],
      parentsIds: [character.id],
      realmId: character.realmId,
      isHeir: false,
      titlesHeld: Array.from(new Set([tier.title, ...character.titlesHeld]))
    };

    // Add deceased predecessor to family history
    const updatedFamily = familyMembers
      .filter(m => m.id !== heirMember.id)
      .map(m => m.id === character.id ? { ...m, alive: false, title: 'Predecessor Sovereign' } : m);

    setCharacter(newRulerChar);
    setFamilyMembers(updatedFamily);
    setReignYears(1);

    setChronicleEntries(prev => [
      {
        id: `coronation_${Date.now()}`,
        year: currentYear,
        age: newRulerChar.age,
        title: coronationTitle,
        description: `${coronationDesc} Long live the new ${newRulerChar.rank}!`,
        type: 'birth',
        isImportant: true
      },
      ...prev
    ]);
  };

  const livingHeirs = familyMembers.filter(m => m.relation === 'Child' && m.alive);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-700 selection:text-white">
      
      {/* Top Header */}
      <TopHeader
        character={character}
        currentYear={currentYear}
        currentRealm={currentRealm}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(sound.toggleSound())}
        onOpenNewGame={() => setShowCreator(true)}
        onOpenGuide={() => setShowGuide(true)}
        onOpenSaveLoad={() => setShowSaveLoadModal(true)}
        onOpenEditor={() => setShowEditorModal(true)}
        totalArmyPower={totalArmyPower}
      />

      {/* Main Tab Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        {activeTab === 'chronicle' && (
          <ChronicleTab
            character={character}
            currentYear={currentYear}
            currentRealm={currentRealm}
            chronicleEntries={chronicleEntries}
            vassals={vassals}
            onAgeUp={handleAgeUp}
            onOpenActivities={() => setActiveTab('court')}
            onOpenProvinces={() => setActiveTab('provinces')}
            onOpenDynasty={() => setActiveTab('dynasty')}
            onOpenVassals={() => setShowVassalsModal(true)}
            onOpenSaveLoad={() => setShowSaveLoadModal(true)}
          />
        )}

        {activeTab === 'provinces' && (
          <RealmMapTab
            character={character}
            provinces={provinces}
            realms={realms}
            vassals={vassals}
            familyMembers={familyMembers}
            realmNPCs={realmNPCs}
            onUpgradeBuilding={handleUpgradeBuilding}
            onInvestProvince={handleInvestProvince}
            onHoldProvinceFestival={handleHoldProvinceFestival}
            onAssignGovernor={(provId, vasId) => {}}
            onGrantProvince={handleGrantProvince}
            onClaimEmperorTitle={handleClaimEmperorTitle}
            onSelectTargetForWar={(target) => {
              setActiveTab('diplomacy');
            }}
            onDeclareWarOnTarget={handleDeclareWarOnTarget}
            onUpdateNPC={handleUpdateNPC}
            onUpdateCharacter={(updates) => setCharacter(prev => ({ ...prev, ...updates }))}
            onAddChronicle={(entry) => setChronicleEntries(prev => [
              {
                id: `chron_${Date.now()}`,
                year: currentYear,
                age: character.age,
                title: entry.title,
                description: entry.description,
                type: entry.type
              },
              ...prev
            ])}
            onEmployNPCAsVassal={handleEmployNPCAsVassal}
          />
        )}

        {activeTab === 'dynasty' && (
          <DynastyFamilyTab
            character={character}
            familyMembers={familyMembers}
            realms={realms}
            provinces={provinces}
            totalArmyPower={totalArmyPower}
            onDesignateHeir={handleDesignateHeir}
            onSetEducationTrack={handleSetEducationTrack}
            onStudyHarder={handleStudyHarder}
            onGiftFamilyMember={handleGiftFamily}
            onSpendTimeWithMember={handleSpendTimeWithMember}
            onProposeCrossMarriage={handleProposeCrossMarriage}
            onUpdateFamilyMember={(updated) => setFamilyMembers(prev => prev.map(m => m.id === updated.id ? updated : m))}
            onUpdateFamilyMembers={(members) => setFamilyMembers(members)}
            onUpdatePlayerGold={(newGold) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: newGold } }))}
            onBackToChronicle={() => setActiveTab('chronicle')}
          />
        )}

        {activeTab === 'diplomacy' && (
          <WarDiplomacyTab
            character={character}
            realms={realms}
            vassals={vassals}
            provinces={provinces}
            familyMembers={familyMembers}
            activeWars={activeWars}
            tradeCaravans={tradeCaravans}
            totalArmyPower={totalArmyPower}
            currentYear={currentYear}
            onSendGift={handleSendGift}
            onSignTreaty={handleSignTreaty}
            onDeclareWarOnTarget={handleDeclareWarOnTarget}
            onUpdateWar={handleUpdateWar}
            onEndWar={handleEndWar}
            onProposeConditionalPeace={handleProposeConditionalPeace}
            onDispatchCaravan={handleDispatchCaravan}
            onBribeVassal={handleBribeVassal}
            onAppeaseFaction={handleAppeaseFaction}
            onUpdatePlayerGold={(newGold) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: newGold } }))}
            onUpdatePlayerPrestige={(newPrestige) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, renown: newPrestige } }))}
            onBackToChronicle={() => setActiveTab('chronicle')}
          />
        )}

        {activeTab === 'laws' && (
          <LawsPowersTab
            character={character}
            realmLaws={realmLaws}
            vassals={vassals}
            totalArmyPower={totalArmyPower}
            onEnactLaw={handleEnactLaw}
            onUseSpeciesAbility={handleUseSpeciesAbility}
            onAssignCouncil={handleAssignCouncil}
            onUpdatePlayerPrestige={(newPrestige) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, renown: newPrestige } }))}
            onUpdatePlayerPiety={(newPiety) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, pietyOrMana: newPiety } }))}
            onBackToChronicle={() => setActiveTab('chronicle')}
          />
        )}

        {activeTab === 'court' && (
          <CourtActivitiesTab
            character={character}
            vassals={vassals}
            onHostFeast={handleHostFeast}
            onGoHunting={handleGoHunting}
            onGoPilgrimage={handleGoPilgrimage}
            onHostTournament={handleHostTournament}
            onConductSpeciesCeremony={handleUseSpeciesAbility}
            onAdministerJustice={handleAdministerJustice}
          />
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingEventsCount={activeEvent ? 1 : 0}
        hasActiveWar={activeWars.length > 0}
        unassignedCouncilCount={vassals.filter(v => !v.councilRole).length > 0 ? 1 : 0}
      />

      {/* Modals */}
      {activeEvent && (
        <EventModal
          event={activeEvent}
          character={character}
          onSelectChoice={handleSelectEventChoice}
        />
      )}

      {!character.alive && (
        <DeathHeirModal
          deceasedCharacter={character}
          heirs={livingHeirs}
          reignYears={reignYears}
          onContinueAsHeir={handleContinueAsHeir}
          onStartNewDynasty={() => setShowCreator(true)}
        />
      )}

      <CharacterCreatorModal
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onStartGame={handleStartCustomGame}
      />

      <GuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />

      <VassalsSystemModal
        isOpen={showVassalsModal}
        onClose={() => setShowVassalsModal(false)}
        vassals={vassals}
        provinces={provinces}
        playerCharacter={character}
        familyMembers={familyMembers}
        onUpdateVassals={(updater) => setVassals(updater)}
        onUpdateCharacter={(updater) => setCharacter(updater)}
        onAddChronicleEntry={(entry) => setChronicleEntries(prev => [entry, ...prev])}
      />

      <SaveLoadModal
        isOpen={showSaveLoadModal}
        onClose={() => setShowSaveLoadModal(false)}
        currentState={{
          character,
          familyMembers,
          realms,
          provinces,
          realmNPCs,
          vassals,
          realmLaws,
          chronicleEntries,
          tradeCaravans,
          currentYear,
          reignYears,
          activeWars
        }}
        onLoadGameState={handleLoadGameState}
      />

      <InGameEditorModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        character={character}
        setCharacter={setCharacter}
        familyMembers={familyMembers}
        setFamilyMembers={setFamilyMembers}
        realms={realms}
        setRealms={setRealms}
        provinces={provinces}
        setProvinces={setProvinces}
        vassals={vassals}
        setVassals={setVassals}
        realmLaws={realmLaws}
        setRealmLaws={setRealmLaws}
        chronicleEntries={chronicleEntries}
        setChronicleEntries={setChronicleEntries}
        currentYear={currentYear}
        setCurrentYear={setCurrentYear}
        reignYears={reignYears}
        setReignYears={setReignYears}
        activeWars={activeWars}
        setActiveWars={setActiveWars}
        onTriggerEvent={(ev) => setActiveEvent(ev)}
      />

      {travelModalState?.isOpen && (
        <TravelEncounterModal
          isOpen={travelModalState.isOpen}
          activity={travelModalState.activity}
          character={character}
          onResolve={handleResolveTravelOutcome}
          onClose={() => setTravelModalState(null)}
        />
      )}
    </div>
  );
}
