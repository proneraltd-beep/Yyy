import { WarState, Character, WarCommander } from '../types';
import { WAR_TACTICS, ENEMY_TACTICS_POOL } from '../data/warTacticsData';

export interface CommanderFateEvent {
  commanderId: string;
  commanderName: string;
  role: string;
  fate: 'wounded' | 'captured' | 'killed' | 'heroic';
  description: string;
}

export interface BattleClashResult {
  won: boolean;
  scoreDelta: number;
  playerCasualties: number;
  enemyCasualties: number;
  title: string;
  description: string;
  tacticalAnalysis: string;
  tacticalNarrative: string;
  nextEnemyTactics: string;
  updatedCommanders: WarCommander[];
  commanderEvents: CommanderFateEvent[];
  playerPersonalFate?: {
    wounded: boolean;
    healthLost: number;
    description: string;
  };
  infrastructureDevastation: {
    prosperityLoss: number;
    unrestSpike: number;
    damagedHoldingsDescription: string;
  };
  warFatigue: {
    fatigueLevel: number; // 0 to 3
    fatigueText: string;
    prosperityPenalty: number;
    unrestPenalty: number;
    recruitmentPenalty: number;
  };
}

/**
 * Returns dynamic narrative descriptions for specific tactic-vs-tactic clashes.
 */
function getTacticalMatchupNarrative(
  playerTactic: string,
  enemyTactic: string,
  won: boolean,
  playerCasualties: number,
  enemyCasualties: number
): string {
  const p = playerTactic;
  const e = enemyTactic;

  if (p === 'Frontline Shock Charge' && e === 'Fortified Shieldwall & Defilade') {
    return won
      ? `Your heavy cavalry and armored shock-infantry smashed with overwhelming momentum into their defensive shieldwall, shattering their pavise line after a bloody frontal melee. Despite their prepared stakes, the sheer weight of your vanguard fractured their center.`
      : `Your vanguard spearhead charged directly into their fortified defilade and barbed ditch line. Interlocking heavy shields and volleying archers blunted the momentum of your knights, repelling your assault with punishing losses.`;
  }

  if (p === 'Frontline Shock Charge' && e === 'Tactical Outflanking & Pincer') {
    return won
      ? `Your armored spearhead punched cleanly through their over-extended center before their outflanking cavalry wings could encircle your baggage train, throwing their divided forces into total disarray.`
      : `While your vanguard pressed the center, the enemy's agile outflanking wings swept around your rear, cutting off reserves and turning your shock charge into a chaotic encirclement.`;
  }

  if (p === 'Tactical Outflanking & Pincer' && e === 'Frontline Shock Charge') {
    return won
      ? `Anticipating a brutal frontal assault, your center yielded ground in good order while your dual cavalry wings closed around the enemy flanks like an iron vise, rolling up their vanguard in a classic double-envelopment.`
      : `The enemy's ferocious shock charge crashed through your thinning center too rapidly for your flanking wings to close the trap, forcing your cavalry into a disheveled rear-guard retreat.`;
  }

  if (p === 'Fortified Shieldwall & Defilade' && e === 'Frontline Shock Charge') {
    return won
      ? `Your iron shieldwall held unbreakable against their thunderous charge. Pike hedges and defensive barricades impaled their charging knights, turning their offensive impetus into a catastrophic slaughter.`
      : `Under relentless waves of heavy shock assault, your barricades were gradually breached. A brutal hand-to-hand trench fight ended with your frontline falling back to secondary redoubts.`;
  }

  if (p === 'Guerilla Hill Ambush & Harassment' && e === 'Arcane & Primal Siege Magic') {
    return won
      ? `Dispersed skirmishers and forest ambushers harassed the enemy spellcasters and ritualists before they could complete their devastating siege invocations, cutting their supply carts and sowing panic.`
      : `Dense arcane barrages scorched the woodlands before your ambushers could close the distance, denying cover and forcing your irregulars into open killing zones.`;
  }

  if (p === 'Arcane & Primal Siege Magic' && e === 'Fortified Shieldwall & Defilade') {
    return won
      ? `Enchanted artillery and elemental spells rained fire directly over their static shieldwall, bypassing pavises and reducing their fortified ramparts to smoldering rubble.`
      : `Enemy warding runes and fortified defilades absorbed the arcane volleys, while counter-battery fire disrupted your sorcerers' incantations.`;
  }

  if (p === 'Grand Encirclement & Siege' && e === 'Cautious Probe & Skirmish') {
    return won
      ? `Your legions steadily contracted an unbreakable perimeter around their fortifications, isolating their scouting parties and starving their isolated garrisons into unconditional capitulation.`
      : `Enemy skirmishers launched daring nighttime sally-ports, cutting down siege sappers and burning wooden siege towers before lines of circumvallation could be completed.`;
  }

  if (p === 'Intelligence Infiltration & Sabotage' && e === 'Grand Encirclement & Siege') {
    return won
      ? `Covert operatives poisoned the besiegers' water supplies and set fire to their grain stores, triggering typhus and mutiny along the enemy's sprawling siege lines.`
      : `Enemy inquisitors and vigilant patrols caught your saboteurs at the palisades, extracting confessions that exposed your infiltration network.`;
  }

  // Balanced/Default Dynamic Fallback
  return won
    ? `A fierce tactical engagement between your ${p} and their ${e}. Your disciplined legions seized the initiative on the flanks, breaking the enemy lines and pursuing their broken cohorts for miles.`
    : `Both armies clashed violently in a prolonged engagement of ${p} against ${e}. The enemy maintained cohesion under fire and counter-attacked your vanguard, forcing an orderly withdrawal to fortified positions.`;
}

/**
 * Simulates a strictly annual battlefield clash between player and enemy forces
 * with realistic casualty scaling, commander mortality/wounds/captures, infrastructure damage, and war fatigue.
 */
export function simulateAnnualBattleClash(
  war: WarState,
  character: Character,
  simYear: number
): BattleClashResult {
  const playerTacticObj = WAR_TACTICS.find(t => t.name === war.playerTactics) || WAR_TACTICS[0];
  const enemyTacticName = war.enemyTactics || 'Fortified Shieldwall & Defilade';
  const enemyTacticObj = WAR_TACTICS.find(t => t.name === enemyTacticName);

  // 1. Tactical Advantage Calculation
  let tacticalAdvantage = 1.0;
  let tacticalExplanation = '';

  if (playerTacticObj.strengthsAgainst.includes(enemyTacticName)) {
    tacticalAdvantage = 1.35; // +35% advantage
    tacticalExplanation = `Your tactic "${playerTacticObj.name}" directly countered enemy "${enemyTacticName}", exploiting their fatal operational blind spots!`;
  } else if (playerTacticObj.weaknessesAgainst.includes(enemyTacticName)) {
    tacticalAdvantage = 0.75; // -25% disadvantage
    tacticalExplanation = `Enemy "${enemyTacticName}" effectively countered your "${playerTacticObj.name}", bogging down your assault columns.`;
  } else {
    tacticalAdvantage = 1.0;
    tacticalExplanation = `Both armies met in a fierce, balanced clash of doctrines (${playerTacticObj.name} vs ${enemyTacticName}).`;
  }

  // 2. Military Power Factor (Troop ratio)
  const playerTroops = Math.max(100, war.playerLevies);
  const enemyTroops = Math.max(100, war.enemyLevies);
  const totalTroopsInTheater = playerTroops + enemyTroops;
  const militaryRatio = playerTroops / enemyTroops;
  const militaryPowerScore = Math.min(3.0, Math.max(0.3, militaryRatio));

  // 3. Commander Quality and Health Status with Veteran Traits
  const activeCommanders = war.commanders.filter(c => c.status !== 'Killed' && c.status !== 'Captured');
  let commanderMartialSum = 0;
  let veteranMoraleBonus = 0;
  activeCommanders.forEach(c => {
    // Wounded commanders fight at reduced martial
    let effMartial = c.status === 'Wounded' ? Math.round(c.martial * 0.55) : c.martial;
    
    // Veteran traits enhance commander martial efficiency
    if (c.veteranTrait === 'War Veteran') {
      effMartial += 10;
      veteranMoraleBonus += 0.04;
    } else if (c.veteranTrait === 'Heroic Commander') {
      effMartial += 22;
      veteranMoraleBonus += 0.08;
    } else if (c.veteranTrait === 'Legendary Warmaster') {
      effMartial += 35;
      veteranMoraleBonus += 0.14;
    }
    
    commanderMartialSum += effMartial;
  });
  const commanderMartialAvg = activeCommanders.length > 0 ? commanderMartialSum / activeCommanders.length : 15;
  const commanderBonus = (1 + (commanderMartialAvg - 20) * 0.012) * (1 + veteranMoraleBonus);

  // 4. Martial & Intelligence Factor
  const martialEfficiency = 1 + (character.stats.martial - 50) * 0.008;
  const intellectForesight = 1 + (character.stats.intellect - 50) * 0.008;
  const personalCommandBonus = war.isPlayerCommanding ? 1.15 : 1.0;

  // 5. War Fatigue Degradation on Combat Power (Fatigue begins after Year 3)
  const currentWarYear = war.warYear || 1;
  let warFatigueLevel = 0;
  let fatigueCombatMod = 1.0;
  let warFatigueText = 'Fresh Morale (Year 1-3): Army is fully motivated.';
  let prosperityPenalty = 0;
  let unrestPenalty = 0;
  let recruitmentPenalty = 0;

  if (currentWarYear >= 6) {
    warFatigueLevel = 3;
    fatigueCombatMod = 0.82; // -18% combat efficiency
    warFatigueText = 'Devastating War Fatigue (Year 6+): Despair, food shortages, and mutinous rumblings plague the ranks.';
    prosperityPenalty = 10;
    unrestPenalty = 12;
    recruitmentPenalty = 0.35;
  } else if (currentWarYear === 5) {
    warFatigueLevel = 2;
    fatigueCombatMod = 0.90; // -10% combat efficiency
    warFatigueText = 'Heavy War Fatigue (Year 5): Supply lines strained, levies yearn for their home hearths.';
    prosperityPenalty = 6;
    unrestPenalty = 8;
    recruitmentPenalty = 0.20;
  } else if (currentWarYear === 4) {
    warFatigueLevel = 1;
    fatigueCombatMod = 0.95; // -5% combat efficiency
    warFatigueText = 'Growing War Weariness (Year 4): Peasant grumbling and merchant losses mount.';
    prosperityPenalty = 3;
    unrestPenalty = 5;
    recruitmentPenalty = 0.10;
  }

  // Combined combat strength
  const playerBattlePower = playerTroops * tacticalAdvantage * martialEfficiency * intellectForesight * commanderBonus * personalCommandBonus * fatigueCombatMod;
  const enemyBattlePower = enemyTroops * (enemyTacticObj?.statScaling ? 1.08 : 1.0) * (0.88 + Math.random() * 0.26);

  const victoryRatio = playerBattlePower / (playerBattlePower + enemyBattlePower);
  const won = victoryRatio >= 0.47;

  // 6. Realistic Casualties Calculation based on Force Sizes and Opposition
  let scoreDelta = 0;
  let playerCasualties = 0;
  let enemyCasualties = 0;

  // Ratio of opposing strength: larger opposing force creates heavier bloodletting
  const oppositionIntensity = Math.min(1.8, Math.max(0.6, enemyTroops / (playerTroops || 1)));

  if (won) {
    // Victory calculation
    const baseWinScore = playerTacticObj.bonusScoreOnWin || 20;
    scoreDelta = Math.round(baseWinScore * (victoryRatio * 1.25) * (militaryPowerScore > 1 ? 1.15 : 0.9));
    scoreDelta = Math.max(10, Math.min(45, scoreDelta));

    // Even in victories, fighting a large opposition causes real casualties
    const basePlayerLossRate = Math.max(
      0.05,
      (0.12 * oppositionIntensity) - (character.stats.intellect / 900) - (playerTacticObj.casualtyReductionRate * 0.06)
    );
    playerCasualties = Math.min(playerTroops, Math.round(playerTroops * Math.min(0.25, basePlayerLossRate)));

    // Enemy takes heavy retreat & rout casualties
    const baseEnemyLossRate = Math.max(
      0.18,
      (0.24 + (character.stats.martial / 320) + (playerTacticObj.enemyCasualtyMultiplier - 1) * 0.15)
    );
    enemyCasualties = Math.min(enemyTroops, Math.round(enemyTroops * Math.min(0.55, baseEnemyLossRate)));
  } else {
    // Defeat calculation
    scoreDelta = -Math.round(16 * (1.25 - victoryRatio));
    scoreDelta = Math.min(-8, Math.max(-38, scoreDelta));

    // Heavy player casualties on defeat
    const basePlayerLossRate = Math.max(
      0.18,
      (0.28 * oppositionIntensity) - (character.stats.intellect / 700)
    );
    playerCasualties = Math.min(playerTroops, Math.round(playerTroops * Math.min(0.48, basePlayerLossRate)));

    // Enemy still suffers attrition
    const baseEnemyLossRate = Math.max(0.06, 0.10 + (character.stats.martial / 650));
    enemyCasualties = Math.min(enemyTroops, Math.round(enemyTroops * Math.min(0.22, baseEnemyLossRate)));
  }

  // 7. Commander Mortality, Wounds, and Captures
  const commanderEvents: CommanderFateEvent[] = [];
  const updatedCommanders: WarCommander[] = war.commanders.map(cmd => {
    // If already dead or captured, keep status
    if (cmd.status === 'Killed') return cmd;
    if (cmd.status === 'Captured') return cmd;

    // Handle existing wounded convalescence
    if (cmd.status === 'Wounded') {
      const remainingYears = (cmd.woundYearsRemaining || 2) - 1;
      if (remainingYears <= 0) {
        commanderEvents.push({
          commanderId: cmd.id,
          commanderName: cmd.name,
          role: cmd.role,
          fate: 'heroic',
          description: `${cmd.role} ${cmd.name} has fully recovered from previous battlefield injuries and returned to duty!`
        });
        return {
          ...cmd,
          status: 'Ready',
          woundYearsRemaining: 0,
          woundDescription: undefined
        };
      } else {
        return {
          ...cmd,
          woundYearsRemaining: remainingYears
        };
      }
    }

    // Role danger modifier
    const isVanguard = cmd.role === 'Vanguard Commander' || cmd.role === 'Grand Marshal';
    const dangerMod = isVanguard ? 1.5 : 1.0;
    const defeatMod = won ? 0.6 : 1.8;

    // Prowess protection
    const martialProtection = Math.max(0.5, 1 - (cmd.martial / 120));

    const fatalRoll = Math.random() * dangerMod * defeatMod * martialProtection;

    // 1. Killed in Action check (2-6% base)
    if (fatalRoll > 0.94) {
      commanderEvents.push({
        commanderId: cmd.id,
        commanderName: cmd.name,
        role: cmd.role,
        fate: 'killed',
        description: `💀 ${cmd.role} ${cmd.name} was slain in the heat of battle while defending the royal standard!`
      });
      return {
        ...cmd,
        status: 'Killed',
        assignedTroops: 0
      };
    }

    // 2. Captured by Enemy check (4-10% base)
    if (fatalRoll > 0.85) {
      commanderEvents.push({
        commanderId: cmd.id,
        commanderName: cmd.name,
        role: cmd.role,
        fate: 'captured',
        description: `⛓️ ${cmd.role} ${cmd.name} was encircled and taken captive by ${war.targetRealmName} forces!`
      });
      return {
        ...cmd,
        status: 'Captured',
        assignedTroops: 0
      };
    }

    // 3. Wounded in Action check (10-20% base)
    if (fatalRoll > 0.68) {
      const woundTypes = [
        'suffered a severe crossbow wound to the shoulder',
        'took a heavy mace blow shattering their shield-arm',
        'was gashed across the chest by enemy polearms',
        'took a poisoned arrow during the retreat'
      ];
      const woundText = woundTypes[Math.floor(Math.random() * woundTypes.length)];
      commanderEvents.push({
        commanderId: cmd.id,
        commanderName: cmd.name,
        role: cmd.role,
        fate: 'wounded',
        description: `🩸 ${cmd.role} ${cmd.name} ${woundText} and requires convalescence!`
      });
      return {
        ...cmd,
        status: 'Wounded',
        woundDescription: woundText,
        woundYearsRemaining: 2
      };
    }

    // 4. Veteran Progression & Trait Ascension for surviving commanders
    const newBattlesSurvived = (cmd.battlesSurvived || 0) + 1;
    const newVictories = (cmd.victoriesCount || 0) + (won ? 1 : 0);
    const totalWarScoreAfterClash = war.warScore + scoreDelta;

    let newVeteranTrait = cmd.veteranTrait;
    let newMartial = cmd.martial;
    const earnedTraitsList = [...(cmd.earnedTraits || [])];

    // Check Tier 3: Legendary Warmaster (survived 4+ clashes, 3+ victories, high war score)
    if (newVeteranTrait !== 'Legendary Warmaster') {
      if (newBattlesSurvived >= 4 && newVictories >= 3 && totalWarScoreAfterClash >= 35) {
        newVeteranTrait = 'Legendary Warmaster';
        newMartial = Math.min(100, newMartial + 15);
        if (!earnedTraitsList.includes('Legendary Warmaster')) {
          earnedTraitsList.push('Legendary Warmaster');
        }
        commanderEvents.push({
          commanderId: cmd.id,
          commanderName: cmd.name,
          role: cmd.role,
          fate: 'heroic',
          description: `⚔️ Legendary Warmaster: ${cmd.role} ${cmd.name} has survived ${newBattlesSurvived} ferocious campaigns with high war score! Gained the prestigious 'Legendary Warmaster' trait (+15 Martial, +35% Combat Power)!`
        });
      }
      // Check Tier 2: Heroic Commander (survived 3+ clashes, 2+ victories or war score >= 20)
      else if (newVeteranTrait !== 'Heroic Commander' && newBattlesSurvived >= 3 && (newVictories >= 2 || totalWarScoreAfterClash >= 20)) {
        newVeteranTrait = 'Heroic Commander';
        newMartial = Math.min(100, newMartial + 12);
        if (!earnedTraitsList.includes('Heroic Commander')) {
          earnedTraitsList.push('Heroic Commander');
        }
        commanderEvents.push({
          commanderId: cmd.id,
          commanderName: cmd.name,
          role: cmd.role,
          fate: 'heroic',
          description: `🏆 Heroic Commander: ${cmd.role} ${cmd.name} achieved decisive battlefield triumph! Gained the 'Heroic Commander' trait (+12 Martial, +22% Combat Power)!`
        });
      }
      // Check Tier 1: War Veteran (survived 2+ clashes or 1 victory with war score >= 10)
      else if (!newVeteranTrait && (newBattlesSurvived >= 2 || (won && totalWarScoreAfterClash >= 10))) {
        newVeteranTrait = 'War Veteran';
        newMartial = Math.min(100, newMartial + 8);
        if (!earnedTraitsList.includes('War Veteran')) {
          earnedTraitsList.push('War Veteran');
        }
        commanderEvents.push({
          commanderId: cmd.id,
          commanderName: cmd.name,
          role: cmd.role,
          fate: 'heroic',
          description: `⭐ War Veteran: ${cmd.role} ${cmd.name} has forged veteran battle instincts across campaigns! Gained the 'War Veteran' trait (+8 Martial, +10% Combat Power)!`
        });
      }
    }

    // Normal active status with updated battle achievements
    return {
      ...cmd,
      status: won ? 'Victorious' : 'Engaged',
      battlesSurvived: newBattlesSurvived,
      victoriesCount: newVictories,
      veteranTrait: newVeteranTrait,
      martial: newMartial,
      earnedTraits: earnedTraitsList
    };
  });

  // 8. Player Personal Command Risk & Glory
  let playerPersonalFate: BattleClashResult['playerPersonalFate'] = undefined;
  if (war.isPlayerCommanding) {
    if (won) {
      if (Math.random() < 0.12) {
        // Minor battle wound or scar
        playerPersonalFate = {
          wounded: true,
          healthLost: 10,
          description: `You led from the vanguard with conspicuous bravery, taking a slashing wound (-10 Health) but inspiring your soldiers to victory!`
        };
      }
    } else {
      if (Math.random() < 0.35) {
        // Severe battlefield trauma
        playerPersonalFate = {
          wounded: true,
          healthLost: 22,
          description: `During the chaotic frontline collapse, you barely escaped capture after being thrown from your warhorse (-22 Health)!`
        };
      }
    }
  }

  // 9. Infrastructure and Provincial Devastation
  const devastationBase = (totalTroopsInTheater > 30000 ? 1.4 : 1.0);
  const prosperityLoss = Math.round((won ? 4 : 8) * devastationBase);
  const unrestSpike = Math.round((won ? 5 : 12) * devastationBase);
  
  const damagedHoldingsPhrases = [
    'Outer ramparts breached and frontier watchtowers leveled',
    'Grain stores pillaged, farmsteads torched by raiding cavalry',
    'Bridgeheads broken and provincial blacksmith mills looted',
    'Siege trenches dug across agricultural hamlets and vineyards'
  ];
  const damagedHoldingsDescription = damagedHoldingsPhrases[Math.floor(Math.random() * damagedHoldingsPhrases.length)];

  // 10. Matchup Narrative & Reports
  const tacticalNarrative = getTacticalMatchupNarrative(
    playerTacticObj.name,
    enemyTacticName,
    won,
    playerCasualties,
    enemyCasualties
  );

  // 11. Next Enemy Tactic
  const filteredEnemyPool = ENEMY_TACTICS_POOL.filter(t => t !== enemyTacticName);
  const nextEnemyTactics = filteredEnemyPool[Math.floor(Math.random() * filteredEnemyPool.length)];

  // Titles and descriptions
  const title = won
    ? `Year ${simYear} Campaign Victory: ${playerTacticObj.name}`
    : `Year ${simYear} Frontline Repulse: Defense of the Realm`;

  const description = `${tacticalExplanation} ${tacticalNarrative} Inflicted ${enemyCasualties.toLocaleString()} enemy casualties while sustaining ${playerCasualties.toLocaleString()} fallen soldiers. (War Score ${scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}).`;

  const tacticalAnalysis = `Doctrine Matchup: [${playerTacticObj.name}] vs [${enemyTacticName}] • Opposing Forces: ${playerTroops.toLocaleString()} vs ${enemyTroops.toLocaleString()} • Casualties: ${playerCasualties.toLocaleString()} vs ${enemyCasualties.toLocaleString()} • Tactical Mod: ${(tacticalAdvantage * 100).toFixed(0)}% • Martial Mod: +${Math.floor((character.stats.martial - 50) * 0.8)}%`;

  return {
    won,
    scoreDelta,
    playerCasualties,
    enemyCasualties,
    title,
    description,
    tacticalAnalysis,
    tacticalNarrative,
    nextEnemyTactics,
    updatedCommanders,
    commanderEvents,
    playerPersonalFate,
    infrastructureDevastation: {
      prosperityLoss,
      unrestSpike,
      damagedHoldingsDescription
    },
    warFatigue: {
      fatigueLevel: warFatigueLevel,
      fatigueText: warFatigueText,
      prosperityPenalty,
      unrestPenalty,
      recruitmentPenalty
    }
  };
}
