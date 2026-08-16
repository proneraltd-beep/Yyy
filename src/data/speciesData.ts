import { Species } from '../types';

export interface SpeciesInfo {
  name: Species;
  title: string;
  badge: string;
  icon: string;
  primaryColor: string;
  accentColor: string;
  borderColor: string;
  specialResourceName: string;
  specialResourceIcon: string;
  description: string;
  lore: string;
  racialTraits: string[];
  startingBonuses: {
    martial?: number;
    intrigue?: number;
    diplomacy?: number;
    intellect?: number;
    pietyOrMana?: number;
    gold?: number;
    health?: number;
  };
}

export const SPECIES_DATA: Record<Species, SpeciesInfo> = {
  Human: {
    name: 'Human',
    title: 'The Sovereign Kingdoms',
    badge: '👑 Human Dynasty',
    icon: '🏰',
    primaryColor: 'amber-600',
    accentColor: 'amber-500',
    borderColor: 'border-amber-500/40',
    specialResourceName: 'Chivalric Faith',
    specialResourceIcon: '✨',
    description: 'Masters of diplomacy, commerce, heavy cavalry, and holy devotion.',
    lore: 'Humans balance strong administrative feudal laws with powerful trade guilds and holy crusades. Adaptable and ambitious, their noble houses build grand castles and deep alliances.',
    racialTraits: ['Adaptable', 'Chivalric Code', 'Grand Builders', 'Holy Devotion'],
    startingBonuses: {
      diplomacy: 15,
      gold: 50,
      pietyOrMana: 10
    }
  },
  Vampire: {
    name: 'Vampire',
    title: 'The Sangreal Bloodlines',
    badge: '🦇 Vampire Aristocracy',
    icon: '🩸',
    primaryColor: 'rose-600',
    accentColor: 'rose-500',
    borderColor: 'border-rose-500/40',
    specialResourceName: 'Blood Essence',
    specialResourceIcon: '🩸',
    description: 'Immortal shadow lords commanding hypnotic charm, dark rites, and thralls.',
    lore: 'Centuries of accumulated wealth and dark secrets make vampire nobles deadly politicians. They don’t easily succumb to mortal illnesses and feast on the essence of captives or willing thralls.',
    racialTraits: ['Immortal Lifespan', 'Blood Feast', 'Night Prowler', 'Mesmeric Gaze'],
    startingBonuses: {
      intrigue: 20,
      martial: 10,
      gold: 80
    }
  },
  Werewolf: {
    name: 'Werewolf',
    title: 'The Silverfang Packs',
    badge: '🐺 Werewolf Clan',
    icon: '🌕',
    primaryColor: 'emerald-600',
    accentColor: 'emerald-500',
    borderColor: 'border-emerald-500/40',
    specialResourceName: 'Primal Rage',
    specialResourceIcon: '⚡',
    description: 'Fierce warriors bound by pack loyalty, full moon fury, and rapid regeneration.',
    lore: 'Governed by the law of the pack and ancient totems. Werewolf chieftains rule through physical might, unbreakable honor, and devastating shock infantry that rip through enemy lines.',
    racialTraits: ['Primal Regeneration', 'Pack Solidarity', 'Full Moon Fury', 'Apex Predator'],
    startingBonuses: {
      martial: 25,
      health: 15,
      intrigue: -5
    }
  },
  Witch: {
    name: 'Witch',
    title: 'The Eldermist Covens',
    badge: '🔮 Witch Coven',
    icon: '✨',
    primaryColor: 'purple-600',
    accentColor: 'purple-500',
    borderColor: 'border-purple-500/40',
    specialResourceName: 'Coven Resonance',
    specialResourceIcon: '🔮',
    description: 'Masters of alchemy, curses, weather rituals, and mystical prophecies.',
    lore: 'Hidden in enchanted forests and arcane sanctuaries, the covens wield immense magical secrets. They brew potent elixirs, peer into the future, and strike down enemies with debilitating hexes.',
    racialTraits: ['Arcane Alchemy', 'Future Sight', 'Coven Hexes', 'Mystic Longevity'],
    startingBonuses: {
      intellect: 25,
      pietyOrMana: 25,
      intrigue: 10
    }
  },
  HighElf: {
    name: 'HighElf',
    title: 'The Sylvanna Sun Courts',
    badge: '🧝 High Elf Dominion',
    icon: '☀️',
    primaryColor: 'cyan-600',
    accentColor: 'cyan-500',
    borderColor: 'border-cyan-500/40',
    specialResourceName: 'Starlight Grace',
    specialResourceIcon: '🌟',
    description: 'Ancient elegance, master archers, refined statecraft, and timeless wisdom.',
    lore: 'High Elves dwell in shining spires and ancient elderwoods. With life spans measuring centuries, their court diplomacy is subtle, majestic, and patient.',
    racialTraits: ['Centuries of Wisdom', 'Starlight Archery', 'Refined Statecraft', 'Arcane Affinity'],
    startingBonuses: {
      diplomacy: 20,
      intellect: 15,
      martial: 10
    }
  }
};

export const CROSS_MARRIAGE_OUTCOMES: Record<string, { hybridName: string, perk: string }> = {
  'Human+Vampire': { hybridName: 'Dhampir Bloodline', perk: '+15 Intrigue & Sunlight Resistance' },
  'Vampire+Human': { hybridName: 'Dhampir Bloodline', perk: '+15 Intrigue & Sunlight Resistance' },
  'Human+Werewolf': { hybridName: 'Wolf-Heart Lineage', perk: '+15 Martial & Charismatic Howl' },
  'Werewolf+Human': { hybridName: 'Wolf-Heart Lineage', perk: '+15 Martial & Charismatic Howl' },
  'Human+Witch': { hybridName: 'Spell-Touched Noble', perk: '+15 Intellect & Fortune Protection' },
  'Witch+Human': { hybridName: 'Spell-Touched Noble', perk: '+15 Intellect & Fortune Protection' },
  'Vampire+Werewolf': { hybridName: 'Abyssal Chimeric Blood', perk: '+20 Martial & +20 Intrigue' },
  'Werewolf+Vampire': { hybridName: 'Abyssal Chimeric Blood', perk: '+20 Martial & +20 Intrigue' },
  'Vampire+Witch': { hybridName: 'Blood Mage Dynasty', perk: '+25 Mana & Vampiric Rites' },
  'Witch+Vampire': { hybridName: 'Blood Mage Dynasty', perk: '+25 Mana & Vampiric Rites' },
  'Werewolf+Witch': { hybridName: 'Shamanic Alpha Blood', perk: '+15 Martial & +15 Intellect' },
  'Witch+Werewolf': { hybridName: 'Shamanic Alpha Blood', perk: '+15 Martial & +15 Intellect' },
  'HighElf+Human': { hybridName: 'Half-Elf High Noble', perk: '+15 Diplomacy & Extended Lifespan' },
  'Human+HighElf': { hybridName: 'Half-Elf High Noble', perk: '+15 Diplomacy & Extended Lifespan' },
  'HighElf+Vampire': { hybridName: 'Solar-Eclipse Stalker', perk: '+20 Intellect & Immortal Aristocrat' },
  'Vampire+HighElf': { hybridName: 'Solar-Eclipse Stalker', perk: '+20 Intellect & Immortal Aristocrat' },
  'HighElf+Werewolf': { hybridName: 'Fae-Beast Warden', perk: '+15 Martial & Astral Speed' },
  'Werewolf+HighElf': { hybridName: 'Fae-Beast Warden', perk: '+15 Martial & Astral Speed' },
  'HighElf+Witch': { hybridName: 'Eldritch Starlight Mage', perk: '+25 Mana & Mystic Prophecy' },
  'Witch+HighElf': { hybridName: 'Eldritch Starlight Mage', perk: '+25 Mana & Mystic Prophecy' },
};
