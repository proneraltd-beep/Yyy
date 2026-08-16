import React, { useState } from 'react';
import { Realm, Province, Character } from '../types';
import { SPECIES_DATA } from '../data/speciesData';
import { MapPin, Crown, Shield, Castle, Users, Info, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface RealmContinentMiniMapProps {
  realms: Realm[];
  provinces: Province[];
  character: Character;
  selectedProvinceId?: string;
  onSelectProvince?: (provinceId: string) => void;
  onSelectRealm?: (realm: Realm) => void;
}

// Realm geographic zones on our 800x480 map canvas
interface RealmRegionDef {
  realmId: string;
  name: string;
  color: string;
  darkColor: string;
  borderColor: string;
  path: string; // SVG path data
  center: { x: number; y: number };
  crest: string;
}

const REALM_MAP_REGIONS: RealmRegionDef[] = [
  {
    realmId: 'realm_human',
    name: 'Kingdom of Valoria',
    color: '#d97706', // Amber
    darkColor: '#451a03',
    borderColor: '#f59e0b',
    path: 'M 140,110 Q 220,90 310,120 Q 360,160 370,220 Q 350,290 290,320 Q 190,340 130,280 Q 90,200 140,110 Z',
    center: { x: 240, y: 210 },
    crest: '🏰'
  },
  {
    realmId: 'realm_empire',
    name: 'Holy Roman Empire',
    color: '#b45309', // Bronze/Gold
    darkColor: '#3f1902',
    borderColor: '#d97706',
    path: 'M 310,120 Q 430,70 550,110 Q 580,180 540,240 Q 470,270 370,220 Q 360,160 310,120 Z',
    center: { x: 440, y: 160 },
    crest: '🦅'
  },
  {
    realmId: 'realm_vampire',
    name: 'Sangreal Imperium',
    color: '#e11d48', // Crimson Blood
    darkColor: '#4c0519',
    borderColor: '#fb7185',
    path: 'M 370,220 Q 470,270 540,240 Q 600,310 560,390 Q 480,430 380,410 Q 340,350 290,320 Q 350,290 370,220 Z',
    center: { x: 440, y: 330 },
    crest: '🩸'
  },
  {
    realmId: 'realm_werewolf',
    name: 'Silverfang Confederation',
    color: '#059669', // Emerald Alpine
    darkColor: '#022c22',
    borderColor: '#34d399',
    path: 'M 200,40 Q 340,30 430,70 Q 310,120 220,90 Q 140,110 160,50 Z',
    center: { x: 290, y: 70 },
    crest: '🐺'
  },
  {
    realmId: 'realm_witch',
    name: 'Eldermist Coven Enclave',
    color: '#9333ea', // Arcane Purple
    darkColor: '#3b0764',
    borderColor: '#c084fc',
    path: 'M 550,110 Q 690,130 730,230 Q 690,310 600,310 Q 540,240 580,180 Z',
    center: { x: 640, y: 210 },
    crest: '✨'
  },
  {
    realmId: 'realm_elf',
    name: 'Sylvanna Sun Courts',
    color: '#0891b2', // Sunlit Cyan / Sea
    darkColor: '#083344',
    borderColor: '#38bdf8',
    path: 'M 80,260 Q 130,280 190,340 Q 180,430 100,440 Q 40,380 50,310 Z',
    center: { x: 120, y: 360 },
    crest: '☀️'
  }
];

export const RealmContinentMiniMap: React.FC<RealmContinentMiniMapProps> = ({
  realms,
  provinces,
  character,
  selectedProvinceId,
  onSelectProvince,
  onSelectRealm
}) => {
  const [hoveredRealmId, setHoveredRealmId] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null);
  const [mapMode, setMapMode] = useState<'realms' | 'demesne' | 'unrest'>('realms');

  const playerProvinces = provinces.filter(p => p.isPlayerControlled);

  // Position provinces dynamically relative to realm centers with circular offsets
  const getProvinceCoord = (prov: Province, idxInRealm: number, totalInRealm: number) => {
    const region = REALM_MAP_REGIONS.find(r => r.realmId === prov.realmId) || REALM_MAP_REGIONS[0];
    if (totalInRealm <= 1) return { x: region.center.x, y: region.center.y };
    
    const angle = (idxInRealm / totalInRealm) * 2 * Math.PI - Math.PI / 2;
    const radius = 32 + (idxInRealm % 2) * 14;
    return {
      x: region.center.x + Math.cos(angle) * radius,
      y: region.center.y + Math.sin(angle) * (radius * 0.75)
    };
  };

  // Group provinces by realm for clean rendering
  const provincesByRealm: Record<string, Province[]> = {};
  provinces.forEach(p => {
    if (!provincesByRealm[p.realmId]) provincesByRealm[p.realmId] = [];
    provincesByRealm[p.realmId].push(p);
  });

  return (
    <div className="bg-stone-950/95 rounded-2xl border border-amber-900/50 p-3 sm:p-4 shadow-2xl relative overflow-hidden font-sans">
      
      {/* Mini-map Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 border-b border-stone-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-300">
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-amber-200 font-cinzel flex items-center gap-1.5">
              <span>Cartographic Continent Mini-Map</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 border border-stone-700">
                Valoria & Neighbors
              </span>
            </h3>
            <p className="text-[11px] text-stone-400">
              Interactive strategic visualization: color-coded by sovereign realm & demesne
            </p>
          </div>
        </div>

        {/* Map View Toggle Buttons */}
        <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800 self-start sm:self-auto">
          <button
            onClick={() => { setMapMode('realms'); sound.playClick(); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mapMode === 'realms'
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Realms
          </button>
          <button
            onClick={() => { setMapMode('demesne'); sound.playClick(); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              mapMode === 'demesne'
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Crown className="w-3 h-3" />
            <span>Crown Demesne ({playerProvinces.length})</span>
          </button>
          <button
            onClick={() => { setMapMode('unrest'); sound.playClick(); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mapMode === 'unrest'
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Unrest / Order
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] max-h-[360px] bg-[#0c1017] rounded-xl border border-stone-800/80 overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* Parchment Grid Background */}
        <svg 
          viewBox="0 0 800 480" 
          className="w-full h-full select-none"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
        >
          <defs>
            {/* Ambient Water Texture Pattern */}
            <radialGradient id="waterGrad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#080c14" />
            </radialGradient>

            {/* Glowing filter for player provinces */}
            <filter id="glowPlayer" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Individual Realm Gradients */}
            {REALM_MAP_REGIONS.map(reg => (
              <linearGradient key={reg.realmId} id={`grad_${reg.realmId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={reg.color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={reg.darkColor} stopOpacity="0.95" />
              </linearGradient>
            ))}
          </defs>

          {/* Ocean Water Background */}
          <rect width="800" height="480" fill="url(#waterGrad)" />

          {/* Decorative Sea Waves Lines */}
          <path d="M 40,80 Q 90,70 140,80 M 680,80 Q 730,90 780,80 M 40,420 Q 90,430 140,420 M 660,420 Q 710,410 760,420" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M 30,240 Q 50,230 70,240 M 720,240 Q 740,250 760,240" stroke="#1e293b" strokeWidth="1" fill="none" opacity="0.3" />

          {/* Realm Territorial Polygons / SVG Shapes */}
          {REALM_MAP_REGIONS.map((region) => {
            const realm = realms.find(r => r.id === region.realmId);
            const isHome = region.realmId === character.realmId;
            const isHovered = hoveredRealmId === region.realmId;
            const rProvs = provinces.filter(p => p.realmId === region.realmId);
            const playerCont = rProvs.filter(p => p.isPlayerControlled).length;

            return (
              <g 
                key={region.realmId}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredRealmId(region.realmId)}
                onMouseLeave={() => setHoveredRealmId(null)}
                onClick={() => {
                  if (realm && onSelectRealm) {
                    sound.playClick();
                    onSelectRealm(realm);
                  }
                }}
              >
                {/* Realm Landmass Territory */}
                <path
                  d={region.path}
                  fill={`url(#grad_${region.realmId})`}
                  stroke={isHovered ? '#fde047' : isHome ? '#fbbf24' : region.borderColor}
                  strokeWidth={isHovered ? 3.5 : isHome ? 2.5 : 1.5}
                  strokeDasharray={isHome ? 'none' : 'none'}
                  opacity={
                    mapMode === 'demesne'
                      ? playerCont > 0 ? 0.95 : 0.4
                      : isHovered ? 1 : 0.85
                  }
                  className="transition-all duration-200 hover:brightness-110"
                />

                {/* Realm Crest & Title Label */}
                <text
                  x={region.center.x}
                  y={region.center.y - 20}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="900"
                  fontFamily="sans-serif"
                  style={{ textShadow: '0 2px 4px #000000, 0 0 8px #000000' }}
                  pointerEvents="none"
                >
                  {region.crest} {realm?.name || region.name}
                </text>

                {/* Subtitle: Ownership stats */}
                <text
                  x={region.center.x}
                  y={region.center.y - 6}
                  textAnchor="middle"
                  fill={isHome ? '#fde047' : '#cbd5e1'}
                  fontSize="9.5"
                  fontWeight="700"
                  style={{ textShadow: '0 1px 3px #000000' }}
                  pointerEvents="none"
                >
                  {playerCont > 0 ? `👑 ${playerCont}/${rProvs.length} Fiefs Controlled` : `${rProvs.length} Counties`}
                </text>
              </g>
            );
          })}

          {/* Individual Province Node Pins across all realms */}
          {REALM_MAP_REGIONS.map((region) => {
            const realmProvs = provincesByRealm[region.realmId] || [];
            return (
              <g key={`pins_${region.realmId}`}>
                {realmProvs.map((prov, pIdx) => {
                  const coord = getProvinceCoord(prov, pIdx, realmProvs.length);
                  const isSelected = selectedProvinceId === prov.id;
                  const isPlayer = prov.isPlayerControlled;
                  const isHighUnrest = prov.unrest > 40;

                  // Node Color according to map mode
                  let pinFill = region.color;
                  if (mapMode === 'demesne') {
                    pinFill = isPlayer ? '#fbbf24' : '#475569';
                  } else if (mapMode === 'unrest') {
                    pinFill = isHighUnrest ? '#ef4444' : prov.unrest > 20 ? '#eab308' : '#22c55e';
                  } else {
                    pinFill = isPlayer ? '#fef08a' : '#ffffff';
                  }

                  return (
                    <g
                      key={prov.id}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredProvince(prov)}
                      onMouseLeave={() => setHoveredProvince(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        if (onSelectProvince) onSelectProvince(prov.id);
                      }}
                    >
                      {/* Pulse Ring for player controlled provinces */}
                      {isPlayer && (
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={isSelected ? 10 : 7}
                          fill="none"
                          stroke="#eab308"
                          strokeWidth="1.5"
                          opacity="0.8"
                          className="animate-pulse"
                        />
                      )}

                      {/* Province Center Pin Circle */}
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={isSelected ? 6.5 : isPlayer ? 5 : 4}
                        fill={pinFill}
                        stroke={isSelected ? '#ffffff' : isPlayer ? '#b45309' : '#0f172a'}
                        strokeWidth={isSelected ? 2 : 1.2}
                        className="transition-transform duration-150 hover:scale-125"
                      />

                      {/* Small text label for province if player controlled or selected */}
                      {(isSelected || isPlayer) && (
                        <text
                          x={coord.x}
                          y={coord.y + 11}
                          textAnchor="middle"
                          fill={isPlayer ? '#fef08a' : '#ffffff'}
                          fontSize="8"
                          fontWeight="bold"
                          style={{ textShadow: '0 1px 3px #000000' }}
                          pointerEvents="none"
                        >
                          {prov.name.replace(/^The\s+/, '')}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Hovered Province Tooltip Box in Mini-map */}
        {hoveredProvince && (
          <div className="absolute bottom-2 left-2 z-20 bg-stone-950/95 text-stone-100 border border-amber-500/70 p-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs pointer-events-none max-w-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Castle className="w-3.5 h-3.5 text-amber-400" />
              <span>{hoveredProvince.name}</span>
              {hoveredProvince.isPlayerControlled && (
                <span className="text-[9px] bg-amber-500 text-stone-950 px-1 py-0.2 rounded font-black">
                  CROWN FIEF
                </span>
              )}
            </div>
            <div className="text-[11px] text-stone-300 mt-1 flex items-center justify-between gap-3">
              <span>Prosperity: <strong className="text-emerald-400">{hoveredProvince.prosperity}%</strong></span>
              <span>Unrest: <strong className={hoveredProvince.unrest > 30 ? 'text-red-400' : 'text-stone-300'}>{hoveredProvince.unrest}%</strong></span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              Governor: {hoveredProvince.governorName || 'Direct Crown Bailiff'} • Income: +{hoveredProvince.income} 🪙
            </div>
          </div>
        )}
      </div>

      {/* Mini-Map Color Legend Footer */}
      <div className="mt-2.5 pt-2 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
        {REALM_MAP_REGIONS.map((reg) => {
          const rProvs = provinces.filter(p => p.realmId === reg.realmId);
          const pCount = rProvs.filter(p => p.isPlayerControlled).length;
          const isHome = reg.realmId === character.realmId;

          return (
            <div
              key={reg.realmId}
              onClick={() => {
                const realm = realms.find(r => r.id === reg.realmId);
                if (realm && onSelectRealm) {
                  sound.playClick();
                  onSelectRealm(realm);
                }
              }}
              className="flex items-center gap-1.5 p-1.5 rounded-lg bg-stone-900/60 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 cursor-pointer transition-colors"
            >
              <div 
                className="w-3 h-3 rounded-full shrink-0 border border-black/50 shadow-xs" 
                style={{ backgroundColor: reg.color }} 
              />
              <div className="min-w-0 truncate">
                <span className="font-semibold text-stone-200 truncate block">
                  {reg.crest} {reg.name.replace(/^The\s+/, '')}
                </span>
                <span className="text-[9.5px] text-stone-400">
                  {pCount > 0 ? `${pCount}/${rProvs.length} Fiefs` : `${rProvs.length} Counties`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
