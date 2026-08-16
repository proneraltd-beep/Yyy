import { RealmLaw, SpeciesAbility, Species } from '../types';

export const INITIAL_REALM_LAWS: RealmLaw[] = [
  {
    id: 'gender_succession',
    categoryKey: 'gender_succession',
    category: 'Succession',
    title: 'Gender Succession',
    icon: '⚥',
    currentOptionId: 'male_preference',
    options: [
      {
        id: 'male_preference',
        name: 'Male Preference',
        icon: '👨‍👦',
        description: 'Sons inherit before daughters, but daughters may inherit if no sons exist.',
        effects: '+5 Dynasty Prestige, traditional patriarchal succession balance.',
        unrestImpact: 0,
        prestigeCost: 50
      },
      {
        id: 'men_only',
        name: 'Men Only',
        icon: '♂️',
        description: 'Only male dynasts can inherit titles and lands. Women are completely excluded from the line of succession.',
        effects: '+10 Traditionalist Vassal Opinion, -15 Matrilineal flexibility.',
        unrestImpact: 5,
        prestigeCost: 100
      },
      {
        id: 'equal',
        name: 'Equal',
        icon: '⚖️',
        description: 'Children inherit purely based on birth order regardless of gender. Full gender equality in the imperial realm.',
        effects: '+15 General Dynastic Renown, broadens pool of capable heirs.',
        unrestImpact: -5,
        prestigeCost: 150
      },
      {
        id: 'female_preference',
        name: 'Female Preference',
        icon: '👩‍👧',
        description: 'Daughters inherit before sons, but sons may inherit if no daughters exist.',
        effects: '+10 Matriarchal Prestige, empowers high-born ladies and priestesses.',
        unrestImpact: 0,
        prestigeCost: 100
      },
      {
        id: 'women_only',
        name: 'Women Only',
        icon: '♀️',
        description: 'Only female dynasts can inherit crowns, duchies, and titles. Absolute matriarchal rule.',
        effects: '+20 Coven & Matriarch Loyalty, excludes male heirs.',
        unrestImpact: 5,
        prestigeCost: 200
      }
    ]
  },
  {
    id: 'imperial_succession',
    categoryKey: 'imperial_succession',
    category: 'Succession',
    title: 'Imperial Succession',
    icon: '👑',
    currentOptionId: 'not_active',
    options: [
      {
        id: 'not_active',
        name: 'Not Active',
        icon: '❌',
        description: 'Imperial Elective diet is suspended. The crown passes strictly by hereditary bloodline law.',
        effects: 'Standard hereditary inheritance. Imperial Diet holds no veto power.',
        unrestImpact: 0,
        prestigeCost: 0
      },
      {
        id: 'imperial_elective',
        name: 'Imperial Elective',
        icon: '📜',
        description: 'The High Senate, Grand Marshals, and Elector Counts cast ballots to choose the most worthy sovereign upon death.',
        effects: '+25 Vassal Loyalty, allows non-firstborn military geniuses to ascend.',
        unrestImpact: -10,
        prestigeCost: 250
      }
    ]
  },
  {
    id: 'marriage_laws',
    categoryKey: 'marriage_laws',
    category: 'Succession',
    title: 'Marriage Laws',
    icon: '💍',
    currentOptionId: 'familial_ban',
    options: [
      {
        id: 'familial_ban',
        name: 'Familial Marriage Ban',
        icon: '👩‍❤️‍💋‍👨',
        description: 'Close-kin marriages are strictly forbidden by sacred religious canon.',
        effects: '+10 Faith & Piety, prevents inbred negative hereditary traits.',
        unrestImpact: -5,
        pietyCost: 50
      },
      {
        id: 'unrestricted',
        name: 'Unrestricted Marriages',
        icon: '👨‍👩‍👧',
        description: 'Divine Bloodline Preservation: allows marriage between any blood relatives to concentrate legendary supernatural traits.',
        effects: '+25 Species Bloodline Purity, +20 Renown, allows pureblood incestuous rites.',
        unrestImpact: 10,
        pietyCost: 200
      }
    ]
  },
  {
    id: 'polygamy',
    categoryKey: 'polygamy',
    category: 'Succession',
    title: 'Polygamy',
    icon: '👰',
    currentOptionId: 'allowed',
    options: [
      {
        id: 'allowed',
        name: 'Allowed',
        icon: '✅',
        description: 'Rulers and nobles may take up to 4 spouses or concubines to forge extensive alliances and ensure many heirs.',
        effects: '+3 Max Spouses, +25 Alliance Capacity, increases child birth rate.',
        unrestImpact: 0,
        prestigeCost: 100
      },
      {
        id: 'disallowed',
        name: 'Disallowed',
        icon: '❌',
        description: 'Monogamous holy matrimony only, strictly enforced across all castles and estates.',
        effects: '+15 Clergy Opinion, -10 Risk of succession disputes.',
        unrestImpact: -5,
        pietyCost: 50
      }
    ]
  },
  {
    id: 'province_seizure',
    categoryKey: 'province_seizure',
    category: 'Succession',
    title: 'Province Seizure',
    icon: '🏰',
    currentOptionId: 'allowed',
    options: [
      {
        id: 'allowed',
        name: 'Allowed',
        icon: '🏰',
        description: 'The Crown holds the absolute divine right to revoke vassal titles and seize frontier provinces for the imperial demesne.',
        effects: 'Unlocks direct Title Revocation & Province Seizure, -15 Vassal Trust.',
        unrestImpact: 15,
        prestigeCost: 150
      },
      {
        id: 'disallowed',
        name: 'Disallowed',
        icon: '🛡️',
        description: 'Vassal lands are inviolable by imperial charter. Provinces cannot be seized without open high treason.',
        effects: '+20 Vassal Loyalty & Stability, protects feudal rights.',
        unrestImpact: -10,
        prestigeCost: 50
      }
    ]
  },
  {
    id: 'realm_succession',
    categoryKey: 'realm_succession',
    category: 'Succession',
    title: 'Realm Succession',
    icon: '👨‍👩‍👦',
    currentOptionId: 'elective',
    options: [
      {
        id: 'elective',
        name: 'Elective',
        icon: '📜',
        description: 'Provincial lords and barons vote to elect the most capable dynast upon the sovereign\'s death.',
        effects: '+15 Vassal Loyalty, allows choosing any gifted family candidate.',
        unrestImpact: -5,
        prestigeCost: 100
      },
      {
        id: 'primogeniture',
        name: 'Primogeniture',
        icon: '👴',
        description: 'The eldest living legitimate child inherits all realm titles, treasury, and lands without division.',
        effects: '+20 Realm Stability, completely avoids realm partition on death.',
        unrestImpact: -10,
        prestigeCost: 300
      },
      {
        id: 'ultimogeniture',
        name: 'Ultimogeniture',
        icon: '👶',
        description: 'The youngest living child inherits all titles, guaranteeing a long reign and youthful vitality.',
        effects: '+15 Reign Longevity, prevents elderly heirs from immediate infirmity.',
        unrestImpact: -5,
        prestigeCost: 200
      },
      {
        id: 'gavelkind',
        name: 'Gavelkind',
        icon: '👨‍👩‍👧‍👦',
        description: 'Titles and provinces are partitioned equally among all eligible children upon ruler demise.',
        effects: '+20% Demesne Levy Size during lifetime, divides lands upon death.',
        unrestImpact: 5,
        prestigeCost: 50
      }
    ]
  },
  {
    id: 'taxation',
    categoryKey: 'taxation',
    category: 'Taxation',
    title: 'Imperial Taxation',
    icon: '🪙',
    currentOptionId: 'balanced_taxes',
    options: [
      {
        id: 'low_taxes',
        name: 'Light Feudal Dues',
        icon: '🌾',
        description: 'Keep taxes low to encourage trade flourishing and win the hearts of subjects.',
        effects: '+15 Subject Happiness, +10 Province Prosperity, -25% Tax Gold Revenue.',
        unrestImpact: -15,
        goldImpact: -20,
        prestigeCost: 50
      },
      {
        id: 'balanced_taxes',
        name: 'Standard Royal Tithes',
        icon: '⚖️',
        description: 'A fair balance of merchant fees, estate taxes, and harvest tithes.',
        effects: 'Balanced gold income and stable popular satisfaction.',
        unrestImpact: 0,
        goldImpact: 0,
        prestigeCost: 0
      },
      {
        id: 'heavy_taxes',
        name: 'Extravagant War Levies',
        icon: '💰',
        description: 'Maximize state coffers to fund monumental construction and standing legions.',
        effects: '+40% Gold Tax Revenue, -15 Subject Happiness, risk of peasant unrest.',
        unrestImpact: 15,
        goldImpact: 35,
        prestigeCost: 100
      }
    ]
  },
  {
    id: 'military',
    categoryKey: 'military',
    category: 'Military',
    title: 'Military Doctrine',
    icon: '⚔️',
    currentOptionId: 'feudal_levies',
    options: [
      {
        id: 'feudal_levies',
        name: 'Noble Levies & Militia',
        icon: '🛡️',
        description: 'Rely on feudal oaths from vassals to supply peasant footmen and armed retainers.',
        effects: 'Low maintenance cost, levy size tied directly to vassal loyalty.',
        unrestImpact: 0,
        prestigeCost: 0
      },
      {
        id: 'professional_guard',
        name: 'Standing Imperial Guard',
        icon: '⚔️',
        description: 'Maintain a salaried, disciplined force equipped with forged steel and plate armor.',
        effects: '+25% Army Combat Effectiveness, higher gold upkeep, fast deployment.',
        unrestImpact: -5,
        goldImpact: -15,
        prestigeCost: 150
      },
      {
        id: 'supernatural_vanguard',
        name: 'Species Shock Vanguard',
        icon: '⚡',
        description: 'Deploy terrifying elite units: Nightstalkers, Werewolf Berserkers, Coven Sorceresses, or Paladins.',
        effects: '+40% Siege & Battle Power, demoralizes enemy troops during warfare.',
        unrestImpact: 5,
        prestigeCost: 200
      }
    ]
  }
];

export const SPECIES_ABILITIES: Record<Species, SpeciesAbility[]> = {
  Human: [
    {
      id: 'divine_crusade',
      name: 'Holy Blessing & Crusade Call',
      description: 'Invoke the High Clergy to bestow divine grace upon your banner, rallying zealous knights.',
      speciesRequired: 'Human',
      cooldownTurns: 3,
      currentCooldown: 0,
      cost: { pietyOrMana: 30, gold: 40 },
      icon: '✨',
      effectSummary: '+350 Elite Crusade Troops, +15 Renown, +10 Subject Happiness.'
    },
    {
      id: 'royal_charter',
      name: 'Grand Guild Commercial Charter',
      description: 'Grant exclusive monopolies to merchant syndicates to flood the treasury with trade tariff gold.',
      speciesRequired: 'Human',
      cooldownTurns: 2,
      currentCooldown: 0,
      cost: { pietyOrMana: 10 },
      icon: '🪙',
      effectSummary: '+120 Gold immediately, +10% Province Prosperity for 3 turns.'
    },
    {
      id: 'chivalric_tournament',
      name: 'Grand Royal Tournament',
      description: 'Host jousts and melee competitions to elevate house renown and discover valorous champions.',
      speciesRequired: 'Human',
      cooldownTurns: 2,
      currentCooldown: 0,
      cost: { gold: 60 },
      icon: '🛡️',
      effectSummary: '+25 Renown, +10 Martial Skill to Ruler & Heirs, discovers a loyal knight.'
    }
  ],
  Vampire: [
    {
      id: 'blood_feast_siphon',
      name: 'Nocturnal Blood Feast',
      description: 'Siphon vital blood essence to instantly restore youth, vigor, and supreme hypnotic presence.',
      speciesRequired: 'Vampire',
      cooldownTurns: 2,
      currentCooldown: 0,
      cost: { gold: 20 },
      icon: '🩸',
      effectSummary: '+30 Health, +25 Blood Essence, +10 Intrigue, ruler remains perpetually youthful.'
    },
    {
      id: 'sire_noble_convert',
      name: 'The Dark Gift (Convert Vassal/Spouse)',
      description: 'Bestow vampiric immortality upon a mortal councilor, spouse, or vassal to ensure eternal loyalty.',
      speciesRequired: 'Vampire',
      cooldownTurns: 4,
      currentCooldown: 0,
      cost: { specialResource: 40, health: 10 },
      icon: '🦇',
      effectSummary: 'Converts target to Vampire, +40 Loyalty, grants target immortality.'
    },
    {
      id: 'shadow_mesmerism',
      name: 'Mesmeric Thrall Edict',
      description: 'Cast hypnotic enchantments across court nobles to quell brewing factions and rebellions.',
      speciesRequired: 'Vampire',
      cooldownTurns: 3,
      currentCooldown: 0,
      cost: { specialResource: 25 },
      icon: '👁️',
      effectSummary: 'Reduces all province unrest by 25, +20 Opinion from all Vassals.'
    }
  ],
  Werewolf: [
    {
      id: 'full_moon_call',
      name: 'Howl of the Full Moon',
      description: 'Summon the ancestral spirits of the pack, infusing your warriors with unbridled primal fury.',
      speciesRequired: 'Werewolf',
      cooldownTurns: 2,
      currentCooldown: 0,
      cost: { specialResource: 30 },
      icon: '🌕',
      effectSummary: '+400 Werewolf Berserker Levies, +15 Martial Skill, +20 Pack Loyalty.'
    },
    {
      id: 'alpha_trial_dominance',
      name: 'Alpha Combat Challenge',
      description: 'Assert your dominance through single combat in the sacred ring, silencing dissenters.',
      speciesRequired: 'Werewolf',
      cooldownTurns: 3,
      currentCooldown: 0,
      cost: { health: 15 },
      icon: '⚡',
      effectSummary: '+30 Renown, +100% Vassal Loyalty, breaks all anti-crown factions.'
    },
    {
      id: 'primal_regeneration_rite',
      name: 'Primal Blood Mend',
      description: 'Tap into lycanthropic vitality to heal battle scars, poisons, and ailments within days.',
      speciesRequired: 'Werewolf',
      cooldownTurns: 1,
      currentCooldown: 0,
      cost: { specialResource: 20 },
      icon: '🐾',
      effectSummary: '+40 Health immediately, cures temporary illness or wounds.'
    }
  ],
  Witch: [
    {
      id: 'coven_hex_storm',
      name: 'Grand Hex of Misfortune',
      description: 'Weave dark hexes over a rival realm or disloyal noble, afflicting their lands with blight.',
      speciesRequired: 'Witch',
      cooldownTurns: 3,
      currentCooldown: 0,
      cost: { pietyOrMana: 35, specialResource: 20 },
      icon: '🔮',
      effectSummary: 'Weakens enemy military by 30%, increases unrest in target realm, +15 Intrigue.'
    },
    {
      id: 'fortune_divination',
      name: 'Astral Eye Divination',
      description: 'Peer through the mystic cauldron to foresee future assassination plots, rebellions, and fortunes.',
      speciesRequired: 'Witch',
      cooldownTurns: 2,
      currentCooldown: 0,
      cost: { pietyOrMana: 25 },
      icon: '👁️‍🗨️',
      effectSummary: 'Reveals hidden vassal intrigues, grants +15 Intellect, prevents next assassination.'
    },
    {
      id: 'elixir_of_rejuvenation',
      name: 'Brew Elixir of Vitality',
      description: 'Concoct a legendary botanical draught from midnight root and dragon tears for yourself or your heir.',
      speciesRequired: 'Witch',
      cooldownTurns: 2,
      currentCooldown: 0,
      cost: { gold: 35, pietyOrMana: 20 },
      icon: '🧪',
      effectSummary: '+35 Health to chosen target, grants +10 Intellect and extended longevity.'
    }
  ],
  HighElf: [
    {
      id: 'solar_grace_blessing',
      name: 'Solar Grace of the Archons',
      description: 'Channel celestial luminescence to bless your subjects with bountiful harvests and peace.',
      speciesRequired: 'HighElf',
      cooldownTurns: 3,
      currentCooldown: 0,
      cost: { pietyOrMana: 30 },
      icon: '☀️',
      effectSummary: '+20 Prosperity to all provinces, +20 Happiness, +15 Renown.'
    },
    {
      id: 'starlight_marksmen_rally',
      name: 'Call of the Starlight Bows',
      description: 'Mobilize the ancient order of elven archers who never miss their mark.',
      speciesRequired: 'HighElf',
      cooldownTurns: 3,
      currentCooldown: 0,
      cost: { gold: 50, pietyOrMana: 20 },
      icon: '🏹',
      effectSummary: '+300 Elite Starlight Marksmen, +20 Martial Defense.'
    },
    {
      id: 'timeless_diplomacy',
      name: 'Timeless Diplomatic Envoys',
      description: 'Send high-born elven ambassadors with ancient treaties and exquisite gifts to foreign thrones.',
      speciesRequired: 'HighElf',
      cooldownTurns: 2,
      currentCooldown: 0,
      cost: { gold: 40 },
      icon: '🕊️',
      effectSummary: '+25 Opinion with all foreign realms, creates instant non-aggression pact.'
    }
  ]
};
