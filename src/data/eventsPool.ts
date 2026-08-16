import { GameEvent, Species } from '../types';

export const EVENTS_POOL: GameEvent[] = [
  // 1. Cross-Realm Royal Suitor Proposal
  {
    id: 'event_cross_suitor_vampire',
    title: 'A Nocturnal Royal Suitor',
    category: 'Cross-Realm Marriage',
    description: 'An ornate black-and-crimson carriage arrives under the shroud of twilight. Emissaries from the Sangreal Imperium present a formal marriage proposal on behalf of Lady Vivienne, a noble Vampire Countess possessing vast silver mines and centuries of political influence.',
    imagePromptIcon: '🥀',
    speaker: {
      name: 'Envoy Malakar',
      title: 'Blood Ambassador of Sangreal',
      species: 'Vampire',
      portrait: '🦇'
    },
    choices: [
      {
        id: 'c1',
        text: 'Accept the royal match with gratitude and formal fanfare (+200 Gold, Military Pact)',
        requirements: { diplomacy: 20 },
        outcome: {
          text: 'The grand royal wedding binds your house with the ancient vampire bloodline! The alliance secures northern borders and floods your treasury with a lavish dowry.',
          gold: 200,
          renown: 40,
          opinionChange: 35,
          targetRealmId: 'realm_vampire',
          triggerMarriage: { partnerName: 'Lady Vivienne of Sangreal', partnerSpecies: 'Vampire' }
        }
      },
      {
        id: 'c2',
        text: 'Negotiate a non-matrimonial trade agreement instead (+100 Gold, Trade Treaty)',
        requirements: { diplomacy: 35 },
        outcome: {
          text: 'With eloquent diplomacy, you politely decline the marriage while securing an exclusive trade treaty on obsidian and aged bloodwine.',
          gold: 100,
          renown: 15,
          opinionChange: 15,
          targetRealmId: 'realm_vampire'
        }
      },
      {
        id: 'c3',
        text: 'Reject the proposal haughtily; our lineage mingles not with bloodsuckers (-30 Vampire Opinion)',
        outcome: {
          text: 'Envoy Malakar bows coldly with glowing crimson eyes. "May your mortal blood protect your borders when dark clouds gather." Relations deteriorate.',
          renown: 10,
          pietyOrMana: 15,
          opinionChange: -30,
          targetRealmId: 'realm_vampire'
        }
      }
    ]
  },

  // 2. Werewolf Pack Border Dispute
  {
    id: 'event_werewolf_border_hunt',
    title: 'The Howling Hunt of the Frontier',
    category: 'Border Crisis',
    description: 'A pack of young werewolf hunters crossed the border into your forest estates pursuing a sacred white stag. Local villagers panicked and barricaded their homes, while your border garrison captured three young pack members.',
    imagePromptIcon: '🐺',
    speaker: {
      name: 'Warlord Gorm',
      title: 'Pack Envoy of Silverfang',
      species: 'Werewolf',
      portrait: '🐺'
    },
    choices: [
      {
        id: 'c1',
        text: 'Release the hunters with honors and share the stag meat as a feast of friendship',
        outcome: {
          text: 'The Alpha respects your honorable gesture! The werewolves gift your realm tempered ironwood weapons and praise your wisdom.',
          happiness: 15,
          renown: 20,
          opinionChange: 25,
          targetRealmId: 'realm_werewolf'
        }
      },
      {
        id: 'c2',
        text: 'Demand a hefty gold ransom for their safe return to the pack',
        requirements: { martial: 30 },
        outcome: {
          text: 'The Silverfang Clan grudgingly pays the gold ransom to secure their kin, though the young warriors harbor a lingering grudge.',
          gold: 150,
          renown: 10,
          opinionChange: -15,
          targetRealmId: 'realm_werewolf'
        }
      },
      {
        id: 'c3',
        text: 'Execute them as poachers and display their pelts to assert border dominance',
        outcome: {
          text: 'The execution sparks outraged fury across the Silverfang Clan! Werewolf packs raid your frontier estates in retaliation.',
          health: -10,
          renown: 5,
          opinionChange: -50,
          targetRealmId: 'realm_werewolf'
        }
      }
    ]
  },

  // 3. Witch Coven Alchemical Miracle or Curse
  {
    id: 'event_witch_coven_plague_cure',
    title: 'The Eldermist Alchemists Offer Aid',
    category: 'Occult & Medicine',
    description: 'A mysterious fever has struck several villages in your outer province. An envoy from the Eldermist Coven offers to distribute an enchanted botanical draught made from moonflowers and mandrake root to immediately purge the epidemic.',
    imagePromptIcon: '🧪',
    speaker: {
      name: 'Sorceress Lyanna',
      title: 'Apothecary Mistress of the Coven',
      species: 'Witch',
      portrait: '🔮'
    },
    choices: [
      {
        id: 'c1',
        text: 'Accept the Coven elixir and grant them land for a botanical conservatory (-40 Gold, +Village Prosperity)',
        requirements: { gold: 40 },
        outcome: {
          text: 'The elixir cures the plague within three days! The thankful villagers celebrate, and your relationship with the Witch Coven deepens.',
          gold: -40,
          happiness: 25,
          health: 15,
          opinionChange: 25,
          targetRealmId: 'realm_witch'
        }
      },
      {
        id: 'c2',
        text: 'Use traditional church prayers and quarantine isolation instead',
        outcome: {
          text: 'The quarantine slows the spread, but several weeks of trade and productivity are lost to sickness.',
          happiness: -10,
          pietyOrMana: 15,
          health: -5
        }
      },
      {
        id: 'c3',
        text: 'Accuse the witches of manufacturing the disease and banish them from court',
        requirements: { intrigue: 25 },
        outcome: {
          text: 'The witches vanish into thick mist with chilling laughter. Minor bad luck and crop blight strike your palace gardens for the season.',
          pietyOrMana: 10,
          happiness: -15,
          opinionChange: -35,
          targetRealmId: 'realm_witch'
        }
      }
    ]
  },

  // 4. Heir Education Milestone
  {
    id: 'event_heir_education_crossroad',
    title: 'The Path of the Heir',
    category: 'Dynasty & Education',
    description: 'Your child and potential successor has reached the age of rigorous tutelage. Your council requests your decree on which discipline their education should emphasize to prepare them for the throne.',
    imagePromptIcon: '📜',
    choices: [
      {
        id: 'c1',
        text: 'The Way of the Blade & Warfare (Assign the High Marshal as mentor)',
        outcome: {
          text: 'Your heir spends long days drilling in plate armor, studying siegecraft, and sparring with veterans. Their martial prowess rises sharply!',
          martial: 15,
          renown: 15,
          newTrait: 'Martial Prodigy'
        }
      },
      {
        id: 'c2',
        text: 'Statecraft, Law & Diplomacy (Assign the Grand Chancellor)',
        outcome: {
          text: 'Your heir masters four languages, rhetoric, legal codes, and the subtleties of royal diplomacy.',
          diplomacy: 15,
          intellect: 10,
          newTrait: 'Silver-Tongued'
        }
      },
      {
        id: 'c3',
        text: 'Esoteric Lore & Arcana (Send to the Academy / Coven Mentors)',
        outcome: {
          text: 'Your heir unlocks deep understanding of ancient histories, occult mysteries, and arcane formulas.',
          intellect: 15,
          pietyOrMana: 15,
          newTrait: 'Arcane Scholar'
        }
      },
      {
        id: 'c4',
        text: 'Intrigue & Shadow Warfare (Assign the Spymaster in secret)',
        requirements: { intrigue: 20 },
        outcome: {
          text: 'Your heir learns cipher codes, poison antidotes, and the art of seeing through court deceptions.',
          intrigue: 20,
          newTrait: 'Master of Whispers'
        }
      }
    ]
  },

  // 5. Vassal Faction Demands
  {
    id: 'event_vassal_tax_protest',
    title: 'A Murmur of Discontent at Court',
    category: 'Court Intrigue',
    description: 'Several regional counts and barons have banded together into a political caucus. They petition the throne to grant them greater regional tax autonomy and reduce imperial levy requirements during peacetime.',
    imagePromptIcon: '⚖️',
    speaker: {
      name: 'Baron Geoffrey',
      title: 'Speaker for the Outer Lords',
      species: 'Human',
      portrait: '👑'
    },
    choices: [
      {
        id: 'c1',
        text: 'Concede modest tax reliefs to ensure steadfast vassal loyalty and peace (-30 Gold, +Vassal Loyalty)',
        outcome: {
          text: 'The nobles cheer your benevolent wisdom. The faction dissolves in contentment, and provincial unrest subsides.',
          gold: -30,
          happiness: 15,
          renown: 10
        }
      },
      {
        id: 'c2',
        text: 'Intimidate the ringleaders with a grand military parade and royal decree',
        requirements: { martial: 40 },
        outcome: {
          text: 'Seeing your fearsome legions and resolute gaze, the petitioning lords withdraw their demands in shame and swear renewal of fealty.',
          renown: 25,
          martial: 5
        }
      },
      {
        id: 'c3',
        text: 'Expose corrupt embezzlement by Baron Geoffrey using Spymaster evidence',
        requirements: { intrigue: 30 },
        outcome: {
          text: 'You produce ledger books revealing Geoffrey stole from provincial treasuries. He is stripped of his title, and his forfeited estate yields +120 Gold!',
          gold: 120,
          renown: 30,
          intrigue: 5
        }
      }
    ]
  },

  // 6. Tournament & Jousting Championship
  {
    id: 'event_grand_tournament_duel',
    title: 'The Champion’s Final Joust',
    category: 'Chivalric Glory',
    description: 'During the Grand Royal Tournament, a mysterious knight clad in darkened steel armor and wielding an ebony lance has defeated seven of your best champions. They now challenge the Crown directly to enter the lists!',
    imagePromptIcon: '🛡️',
    choices: [
      {
        id: 'c1',
        text: 'Don your own ancestral armor and ride into the lists personally!',
        requirements: { martial: 35 },
        outcome: {
          text: 'With supreme equestrian skill and a thunderous clash of lances, you unhorse the challenger to wild roars from thousands of subjects! Your fame echoes across all realms.',
          renown: 50,
          happiness: 25,
          martial: 10,
          newTrait: 'Grand Jousting Champion'
        }
      },
      {
        id: 'c2',
        text: 'Appoint your elite Court Champion / Marshal to champion the realm',
        outcome: {
          text: 'Your Marshal fights valiantly and claims victory on the third pass. The realm’s honor is preserved.',
          renown: 20,
          happiness: 10
        }
      },
      {
        id: 'c3',
        text: 'Offer the mysterious knight a lucrative position in your elite Royal Guard (+Knighthood, -50 Gold)',
        requirements: { gold: 50 },
        outcome: {
          text: 'The knight unmasks to reveal an exiled swordmaster from a distant realm. Pledged to your banner, they bolster your military power.',
          gold: -50,
          renown: 15,
          troopsChange: 150
        }
      }
    ]
  },

  // 7. Holy / Arcane Pilgrimage Revelation
  {
    id: 'event_sacred_pilgrimage_sanctuary',
    title: 'The Shrine of the Ancient Kings',
    category: 'Faith & Piety',
    description: 'You travel on a solemn pilgrimage to the ancient mountain shrine where the first dynasty was consecrated. High atop the mist-veiled crags, a divine luminescence illuminates the sacred altar.',
    imagePromptIcon: '✨',
    choices: [
      {
        id: 'c1',
        text: 'Offer a generous donation of gold and pray for divine prosperity and peace (-60 Gold)',
        requirements: { gold: 60 },
        outcome: {
          text: 'A profound serenity settles over your spirit. The clergy declares your reign blessed by heaven, sparking widespread devotion.',
          gold: -60,
          pietyOrMana: 40,
          happiness: 20,
          health: 15,
          newTrait: 'Heaven-Blessed'
        }
      },
      {
        id: 'c2',
        text: 'Meditate in solitary contemplation to unlock inner supernatural focus',
        outcome: {
          text: 'Hours of silent communion awaken latent mental clarity and resolve within you.',
          pietyOrMana: 25,
          intellect: 10,
          happiness: 15
        }
      },
      {
        id: 'c3',
        text: 'Seek an ancient relic buried beneath the shrine’s crypts',
        requirements: { intrigue: 25 },
        outcome: {
          text: 'You discover the "Amulet of the First Dynasty", an artifact amplifying your authority and magical resonance.',
          renown: 35,
          pietyOrMana: 20,
          newTrait: 'Relic Bearer'
        }
      }
    ]
  },

  // 8. Vampire Blood Siphon Intrigue
  {
    id: 'event_vampire_intrigue_plot',
    title: 'Whispers in the Dark Corridor',
    category: 'Vampire Plot',
    description: 'Late at night, your guards apprehend an undercover vampire agent sneaking out of a councilor’s bedchamber. The captive claims to possess evidence that one of your dukes is secretly plotting with foreign rivals.',
    imagePromptIcon: '👁️',
    choices: [
      {
        id: 'c1',
        text: 'Interrogate the infiltrator with magic and truth potions to reveal the plot',
        requirements: { intellect: 25 },
        outcome: {
          text: 'The agent confesses everything. You preemptively arrest the conspirators, seizing their illicit wealth!',
          gold: 110,
          renown: 20,
          intrigue: 10
        }
      },
      {
        id: 'c2',
        text: 'Execute the spy immediately to send a warning to nocturnal trespassers',
        outcome: {
          text: 'The execution warns enemies against careless infiltration, though the underlying conspiracy remains shrouded.',
          renown: 15,
          martial: 5,
          opinionChange: -15,
          targetRealmId: 'realm_vampire'
        }
      },
      {
        id: 'c3',
        text: 'Turn the spy into a double agent with promised immunity (+Intrigue Network)',
        requirements: { intrigue: 35 },
        outcome: {
          text: 'The agent now reports directly to you. Your court intelligence network becomes nearly impenetrable.',
          intrigue: 25,
          renown: 10,
          newTrait: 'Master Intriguer'
        }
      }
    ]
  },

  // 9. Inter-Realm Trade Fair Caravan
  {
    id: 'event_great_inter_trade_fair',
    title: 'The Great Five-Realms Trade Fair',
    category: 'Commerce & Economy',
    description: 'Merchant guilds from all five realms request royal permission to establish a seasonal trade fair in your capital. Human metalworkers, elven silk weavers, witch botanists, vampire jewelers, and werewolf pelt merchants gather in thousands.',
    imagePromptIcon: '🪙',
    choices: [
      {
        id: 'c1',
        text: 'Sponsor the Grand Fair and build new stone stalls (-50 Gold, +Massive Prosperity)',
        requirements: { gold: 50 },
        outcome: {
          text: 'The fair becomes a legendary success! Merchants generate immense tariff revenues, and your capital becomes the commercial capital of the world.',
          gold: 180,
          happiness: 30,
          renown: 35
        }
      },
      {
        id: 'c2',
        text: 'Charge heavy market stall fees and security taxes to all foreign merchants',
        outcome: {
          text: 'The state treasury reaps quick gold, though some foreign merchants grumble about excessive taxation.',
          gold: 120,
          happiness: -5
        }
      },
      {
        id: 'c3',
        text: 'Permit only internal merchants to trade, protecting local guilds',
        outcome: {
          text: 'Local guildmasters are pleased, but your realm misses out on exotic foreign goods and technology.',
          happiness: 5,
          gold: 30
        }
      }
    ]
  },

  // 10. Witch Love Potion or Royal Romance
  {
    id: 'event_witch_love_potion_scandal',
    title: 'An Enamored Suitor & A Suspicious Phial',
    category: 'Romance & Court',
    description: 'A dashing foreign noble has showered you with passionate declarations and expensive jewels. Your Court Alchemist discovers a traces of an "Aphrodite Moon Draught" in the spiced wine they gifted you.',
    imagePromptIcon: '🍷',
    choices: [
      {
        id: 'c1',
        text: 'Confront them with charm and turn the tables in your favor',
        requirements: { intrigue: 30, diplomacy: 20 },
        outcome: {
          text: 'Flustered and deeply remorseful, the noble confesses their genuine feelings and offers a massive estate in tribute to atone.',
          gold: 140,
          renown: 25,
          happiness: 15
        }
      },
      {
        id: 'c2',
        text: 'Drink the wine with an antidote in secret and play along to spy on them',
        requirements: { intellect: 30 },
        outcome: {
          text: 'You effortlessly outmaneuver them, uncovering secrets about their home kingdom while enjoying lavish gifts.',
          intrigue: 20,
          renown: 15
        }
      },
      {
        id: 'c3',
        text: 'Banish the suitor from your court for attempting magical manipulation',
        outcome: {
          text: 'The disgraced noble is escorted to the border. The court admires your moral vigilance.',
          pietyOrMana: 15,
          renown: 10
        }
      }
    ]
  },

  // 11. Cross-Realm War Declaration Ultimatum
  {
    id: 'event_war_ultimatum_crisis',
    title: 'A Hostile Herald at the Gates',
    category: 'War & Peace',
    description: 'A warlike herald from a neighboring realm rides into your throne room, thrusting a blood-stained banner onto the marble floor. They demand cession of your border province or face an immediate invasion.',
    imagePromptIcon: '⚔️',
    choices: [
      {
        id: 'c1',
        text: 'Draw your royal sword and declare: "We yield not one inch of our sacred soil! Rally the levies!"',
        outcome: {
          text: 'Your kingdom roars in patriotic defiance! Thousands of volunteers rush to join the army, and war is engaged with high morale.',
          renown: 40,
          martial: 15,
          happiness: 15,
          troopsChange: 350
        }
      },
      {
        id: 'c2',
        text: 'Pay a diplomatic tribute in gold to secure a 5-year truce (-120 Gold)',
        requirements: { gold: 120 },
        outcome: {
          text: 'The rival realm accepts the tribute and stands down. Your lands are spared the horrors of invasion.',
          gold: -120,
          happiness: -5,
          renown: -10
        }
      },
      {
        id: 'c3',
        text: 'Summon your cross-realm allies to encircle and crush the arrogant invaders!',
        requirements: { diplomacy: 40 },
        outcome: {
          text: 'Your allied realms honor their pacts! Overwhelming allied forces flank the enemy, forcing them into a humiliating retreat.',
          renown: 50,
          happiness: 25,
          gold: 80
        }
      }
    ]
  }
];
