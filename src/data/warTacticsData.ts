export interface WarTactic {
  id: string;
  name: string;
  icon: string;
  category: 'Offensive' | 'Tactical' | 'Defensive' | 'Arcane/Special' | 'Subterfuge';
  description: string;
  strengthsAgainst: string[];
  weaknessesAgainst: string[];
  statScaling: {
    stat: 'martial' | 'intellect' | 'intrigue' | 'prowess';
    label: string;
    bonusDescription: string;
  };
  bonusScoreOnWin: number;
  casualtyReductionRate: number; // e.g. 0.2 = 20% casualty reduction
  enemyCasualtyMultiplier: number; // e.g. 1.3 = 30% more enemy casualties
}

export const WAR_TACTICS: WarTactic[] = [
  {
    id: 'tactic_shock_charge',
    name: 'Frontline Shock Charge',
    icon: '⚔️',
    category: 'Offensive',
    description: 'Concentrate vanguard heavy infantry and armored knights into a devastating spearhead charge.',
    strengthsAgainst: ['Guerilla Hill Ambush & Harassment', 'Arcane Siege Bombardment', 'Cautious Probe & Skirmish'],
    weaknessesAgainst: ['Fortified Shieldwall & Defilade', 'Tactical Outflanking & Pincer'],
    statScaling: {
      stat: 'martial',
      label: 'Martial Prowess',
      bonusDescription: 'High Martial scales frontline impact and enemy rout rate.'
    },
    bonusScoreOnWin: 22,
    casualtyReductionRate: 0.05,
    enemyCasualtyMultiplier: 1.45
  },
  {
    id: 'tactic_outflanking_pincer',
    name: 'Tactical Outflanking & Pincer',
    icon: '🦅',
    category: 'Tactical',
    description: 'Use coordinated cavalry wings and fast light cohorts to envelop both enemy flanks simultaneously.',
    strengthsAgainst: ['Frontline Shock Charge', 'Grand Encirclement & Siege', 'Cautious Probe & Skirmish'],
    weaknessesAgainst: ['Guerilla Hill Ambush & Harassment', 'Intelligence Infiltration & Sabotage'],
    statScaling: {
      stat: 'intellect',
      label: 'Tactical Intelligence',
      bonusDescription: 'High Intellect optimizes maneuvering timing and flank encirclement.'
    },
    bonusScoreOnWin: 25,
    casualtyReductionRate: 0.15,
    enemyCasualtyMultiplier: 1.35
  },
  {
    id: 'tactic_shieldwall_defense',
    name: 'Fortified Shieldwall & Defilade',
    icon: '🛡️',
    category: 'Defensive',
    description: 'Lock heavy pavise shields in interlocking formation behind spikes and elevated terrain.',
    strengthsAgainst: ['Frontline Shock Charge', 'Guerilla Hill Ambush & Harassment'],
    weaknessesAgainst: ['Arcane Siege Bombardment', 'Grand Encirclement & Siege'],
    statScaling: {
      stat: 'martial',
      label: 'Martial Discipline',
      bonusDescription: 'High Martial maintains unbreakable discipline under heavy pressure.'
    },
    bonusScoreOnWin: 18,
    casualtyReductionRate: 0.35,
    enemyCasualtyMultiplier: 1.15
  },
  {
    id: 'tactic_intelligence_sabotage',
    name: 'Intelligence Infiltration & Sabotage',
    icon: '🕵️',
    category: 'Subterfuge',
    description: 'Deploy royal scouts and shadow agents to poison wells, burn siege trains, and misdirect enemy commanders.',
    strengthsAgainst: ['Fortified Shieldwall & Defilade', 'Grand Encirclement & Siege', 'Tactical Outflanking & Pincer'],
    weaknessesAgainst: ['Cautious Probe & Skirmish', 'Frontline Shock Charge'],
    statScaling: {
      stat: 'intellect',
      label: 'Strategic Intellect',
      bonusDescription: 'High Intellect uncovers key vulnerabilities in enemy supply chains.'
    },
    bonusScoreOnWin: 26,
    casualtyReductionRate: 0.25,
    enemyCasualtyMultiplier: 1.25
  },
  {
    id: 'tactic_arcane_bombardment',
    name: 'Arcane & Primal Siege Magic',
    icon: '🔮',
    category: 'Arcane/Special',
    description: 'Unleash devastating war spells, species abilities, and enchanted siege engines upon enemy strongpoints.',
    strengthsAgainst: ['Fortified Shieldwall & Defilade', 'Grand Encirclement & Siege'],
    weaknessesAgainst: ['Tactical Outflanking & Pincer', 'Guerilla Hill Ambush & Harassment'],
    statScaling: {
      stat: 'intellect',
      label: 'Arcane Intellect',
      bonusDescription: 'High Intellect amplifies siege spell radius and destructive focus.'
    },
    bonusScoreOnWin: 28,
    casualtyReductionRate: 0.10,
    enemyCasualtyMultiplier: 1.50
  },
  {
    id: 'tactic_guerilla_ambush',
    name: 'Guerilla Hill Ambush & Harassment',
    icon: '🏹',
    category: 'Subterfuge',
    description: 'Draw enemy forces into narrow gorges and forest passes, striking isolated detachments with ranged volleys.',
    strengthsAgainst: ['Tactical Outflanking & Pincer', 'Arcane & Primal Siege Magic'],
    weaknessesAgainst: ['Frontline Shock Charge', 'Fortified Shieldwall & Defilade'],
    statScaling: {
      stat: 'intrigue',
      label: 'Deception & Intrigue',
      bonusDescription: 'High Intrigue conceals ambush positions and triggers panic.'
    },
    bonusScoreOnWin: 20,
    casualtyReductionRate: 0.30,
    enemyCasualtyMultiplier: 1.20
  },
  {
    id: 'tactic_grand_encirclement',
    name: 'Grand Encirclement & Siege',
    icon: '🏰',
    category: 'Tactical',
    description: 'Systematically surround all provincial holds, severing reinforcements and starving out the garrison.',
    strengthsAgainst: ['Cautious Probe & Skirmish', 'Fortified Shieldwall & Defilade'],
    weaknessesAgainst: ['Tactical Outflanking & Pincer', 'Intelligence Infiltration & Sabotage'],
    statScaling: {
      stat: 'martial',
      label: 'Logistics & Martial',
      bonusDescription: 'Combined high Martial and Military Power forces swift surrender.'
    },
    bonusScoreOnWin: 30,
    casualtyReductionRate: 0.20,
    enemyCasualtyMultiplier: 1.30
  }
];

export const ENEMY_TACTICS_POOL = [
  'Frontline Shock Charge',
  'Fortified Shieldwall & Defilade',
  'Tactical Outflanking & Pincer',
  'Guerilla Hill Ambush & Harassment',
  'Grand Encirclement & Siege',
  'Arcane & Primal Siege Magic'
];
