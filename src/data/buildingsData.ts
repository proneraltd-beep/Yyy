import { ProvinceBuildings, Species } from '../types';

export interface BuildingConfig {
  key: keyof ProvinceBuildings;
  name: string;
  icon: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  effectsPerLevel: {
    incomeBonus?: number;
    troopsBonus?: number;
    unrestReduction?: number;
    prosperityBonus?: number;
    pietyOrManaBonus?: number;
    renownBonus?: number;
  };
  specialtySpeciesName?: Partial<Record<Species, string>>;
}

export const BUILDINGS_CONFIG: BuildingConfig[] = [
  {
    key: 'castle',
    name: 'Castle & Stronghold',
    icon: '🏰',
    description: 'Lordship fortress that secures rule, increases province defense, and suppresses civil unrest.',
    baseCost: 120,
    costMultiplier: 1.5,
    maxLevel: 5,
    effectsPerLevel: {
      unrestReduction: 6,
      renownBonus: 10,
      troopsBonus: 40,
      prosperityBonus: 3
    },
    specialtySpeciesName: {
      Vampire: 'Gargoyle Fortress',
      Werewolf: 'Great Den Bastion',
      Witch: 'Warded Spire Keep',
      HighElf: 'Citadel of Sunrays'
    }
  },
  {
    key: 'churchOrShrine',
    name: 'Church & Sanctum',
    icon: '⛪',
    description: 'Religious center for faith, prayer, blessings, and social stability among the populace.',
    baseCost: 80,
    costMultiplier: 1.4,
    maxLevel: 5,
    effectsPerLevel: {
      pietyOrManaBonus: 8,
      unrestReduction: 4,
      prosperityBonus: 4
    },
    specialtySpeciesName: {
      Vampire: 'Blood Altar of the Ancients',
      Werewolf: 'Sacred Moon Totem Shrine',
      Witch: 'Coven Moon Circle',
      HighElf: 'Temple of Solar Light'
    }
  },
  {
    key: 'market',
    name: 'Grand Market & Caravansary',
    icon: '🪙',
    description: 'Commercial hub that accelerates trading, generates heavy annual gold tax, and boosts wealth.',
    baseCost: 75,
    costMultiplier: 1.35,
    maxLevel: 5,
    effectsPerLevel: {
      incomeBonus: 22,
      prosperityBonus: 8
    },
    specialtySpeciesName: {
      Vampire: 'Shadow Bazaar',
      Werewolf: 'Pelts & Iron Exchange',
      Witch: 'Alchemical Apothecary Mart',
      HighElf: 'Silken Starlight Exchange'
    }
  },
  {
    key: 'barracks',
    name: 'Military Barracks & Armory',
    icon: '⚔️',
    description: 'Trains regiments, equips knights or species champions, and expands provincial levies.',
    baseCost: 90,
    costMultiplier: 1.4,
    maxLevel: 5,
    effectsPerLevel: {
      troopsBonus: 75,
      renownBonus: 5
    },
    specialtySpeciesName: {
      Vampire: 'Night Guard Catacombs',
      Werewolf: 'Howling Pack Training Grounds',
      Witch: 'Enchanted Familiar Garrison',
      HighElf: 'Arcane Starlight Marksmen Lodge'
    }
  },
  {
    key: 'academy',
    name: 'Academy of Arts & Warfare',
    icon: '📜',
    description: 'Scholarly institution for educating royal heirs, training strategists, and accelerating technology.',
    baseCost: 110,
    costMultiplier: 1.45,
    maxLevel: 5,
    effectsPerLevel: {
      prosperityBonus: 6,
      pietyOrManaBonus: 5,
      renownBonus: 8
    },
    specialtySpeciesName: {
      Vampire: 'Nocturnal Archival Athenaeum',
      Werewolf: 'Elder Ancestral Ring',
      Witch: 'High Arcana Sorcery School',
      HighElf: 'Celestial High Academy'
    }
  },
  {
    key: 'governorOffice',
    name: "Governor's Manor",
    icon: '⚖️',
    description: 'Seat of provincial magistrate to enforce royal edicts, optimize tax collection, and maintain order.',
    baseCost: 85,
    costMultiplier: 1.35,
    maxLevel: 5,
    effectsPerLevel: {
      incomeBonus: 14,
      unrestReduction: 5
    },
    specialtySpeciesName: {
      Vampire: 'Blood Governor Chamber',
      Werewolf: 'Alpha War Council Hall',
      Witch: 'Enchantress High Chamber',
      HighElf: 'Archon Magistrate Palace'
    }
  },
  {
    key: 'farms',
    name: 'Farms & Mill Estates',
    icon: '🌾',
    description: 'Expansive agricultural lands and vineyards supplying grain, food security, and steady revenue.',
    baseCost: 60,
    costMultiplier: 1.3,
    maxLevel: 5,
    effectsPerLevel: {
      incomeBonus: 16,
      prosperityBonus: 10
    },
    specialtySpeciesName: {
      Vampire: 'Blood Vineyards & Thrall Fields',
      Werewolf: 'Grand Hunting Groves',
      Witch: 'Botanical Herb Gardens',
      HighElf: 'Nectar Orchards'
    }
  },
  {
    key: 'realmSpecialStructure',
    name: 'Species Monument',
    icon: '✨',
    description: 'A miraculous monument channeling the core supernatural power and ultimate glory of your realm.',
    baseCost: 180,
    costMultiplier: 1.6,
    maxLevel: 5,
    effectsPerLevel: {
      renownBonus: 20,
      pietyOrManaBonus: 15,
      troopsBonus: 50,
      prosperityBonus: 10
    },
    specialtySpeciesName: {
      Human: 'Grand Imperial Cathedral',
      Vampire: 'Crimson Blood Crypt Monument',
      Werewolf: 'Great Full Moon Totem',
      Witch: 'Arcane Nexus Cauldron Spire',
      HighElf: 'Solar Prism of Eternity'
    }
  }
];
