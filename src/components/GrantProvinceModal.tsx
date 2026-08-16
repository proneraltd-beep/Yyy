import React, { useState } from 'react';
import { Character, FamilyMember, Province, Vassal } from '../types';
import { sound } from '../utils/audio';
import { Crown, UserCheck, Shield, Sparkles, Heart, ChevronRight, X } from 'lucide-react';

interface GrantProvinceModalProps {
  province: Province;
  character: Character;
  familyMembers: FamilyMember[];
  vassals: Vassal[];
  onClose: () => void;
  onGrantProvince: (provinceId: string, recipientType: 'family' | 'vassal' | 'new_noble', recipientId: string, recipientName: string) => void;
}

export const GrantProvinceModal: React.FC<GrantProvinceModalProps> = ({
  province,
  character,
  familyMembers,
  vassals,
  onClose,
  onGrantProvince
}) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [recipientType, setRecipientType] = useState<'family' | 'vassal' | 'new_noble'>('family');
  const [newNobleName, setNewNobleName] = useState<string>('Sir Valerius the Bold');

  const livingFamily = familyMembers.filter(m => m.alive && m.id !== character.id);

  const handleConfirmGrant = () => {
    if (recipientType === 'new_noble') {
      sound.playFanfare();
      onGrantProvince(province.id, 'new_noble', `noble_${Date.now()}`, newNobleName);
      return;
    }

    if (!selectedRecipientId) return;

    if (recipientType === 'family') {
      const member = livingFamily.find(m => m.id === selectedRecipientId);
      if (member) {
        sound.playFanfare();
        onGrantProvince(province.id, 'family', member.id, member.name);
      }
    } else {
      const vassal = vassals.find(v => v.id === selectedRecipientId);
      if (vassal) {
        sound.playFanfare();
        onGrantProvince(province.id, 'vassal', vassal.id, vassal.name);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl max-w-lg w-full border border-stone-400/80 shadow-2xl overflow-hidden">
        
        {/* Header matching gold style */}
        <div className="bg-[#D49B28] px-5 py-3.5 border-b border-[#B78722] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-stone-950" />
            <h3 className="text-base font-bold text-stone-950 font-cinzel">
              Bestow Fief & Title
            </h3>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="text-stone-900 hover:text-black text-lg font-black cursor-pointer leading-none px-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="bg-[#EDE5CE] p-3.5 rounded-xl border border-stone-300">
            <div className="text-xs text-stone-600 font-semibold">Selected Province</div>
            <div className="text-base font-extrabold text-stone-950 font-cinzel">{province.name}</div>
            <div className="text-xs text-stone-700 mt-1">
              Current Administration: <span className="font-bold">{province.governorName || 'Direct Crown Demesne'}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-stone-800">
              <span>🧈 {province.income} gold/yr</span>
              <span>⚔️ {province.troops} garrison</span>
              <span>📈 {province.prosperity}% prosperity</span>
            </div>
          </div>

          {/* Recipient Type Tabs */}
          <div className="flex rounded-xl bg-stone-200/80 p-1 border border-stone-300 text-xs font-bold">
            <button
              onClick={() => { sound.playClick(); setRecipientType('family'); setSelectedRecipientId(livingFamily[0]?.id || null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                recipientType === 'family' ? 'bg-[#D49B28] text-stone-950 shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Royal Dynasty ({livingFamily.length})</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setRecipientType('vassal'); setSelectedRecipientId(vassals[0]?.id || null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                recipientType === 'vassal' ? 'bg-[#D49B28] text-stone-950 shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Vassals & Lords ({vassals.length})</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setRecipientType('new_noble'); setSelectedRecipientId(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                recipientType === 'new_noble' ? 'bg-[#D49B28] text-stone-950 shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ennoble Knight</span>
            </button>
          </div>

          {/* List of candidates */}
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {recipientType === 'family' && (
              livingFamily.length > 0 ? (
                livingFamily.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedRecipientId(member.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedRecipientId === member.id
                        ? 'bg-amber-100 border-[#D49B28] shadow-xs'
                        : 'bg-white/80 border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{member.portrait}</span>
                      <div>
                        <div className="text-xs font-bold text-stone-950 font-cinzel">
                          {member.name} {member.isHeir && <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-sans font-bold">HEIR</span>}
                        </div>
                        <div className="text-[11px] text-stone-600">
                          {member.relation} • Age {member.age} • Opinion: +{member.opinion}
                        </div>
                      </div>
                    </div>
                    {selectedRecipientId === member.id && (
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-stone-500">
                  No other living adult family members available.
                </div>
              )
            )}

            {recipientType === 'vassal' && (
              vassals.length > 0 ? (
                vassals.map(vassal => (
                  <div
                    key={vassal.id}
                    onClick={() => setSelectedRecipientId(vassal.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedRecipientId === vassal.id
                        ? 'bg-amber-100 border-[#D49B28] shadow-xs'
                        : 'bg-white/80 border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{vassal.portrait}</span>
                      <div>
                        <div className="text-xs font-bold text-stone-950 font-cinzel">{vassal.name}</div>
                        <div className="text-[11px] text-stone-600">
                          {vassal.title} • Loyalty: {vassal.loyalty}% • Opinion: +{vassal.opinion}
                        </div>
                      </div>
                    </div>
                    {selectedRecipientId === vassal.id && (
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-stone-500">
                  No active vassals found.
                </div>
              )
            )}

            {recipientType === 'new_noble' && (
              <div className="space-y-3 p-3 bg-white/90 rounded-xl border border-stone-300">
                <div className="text-xs text-stone-700">
                  Raise an honorable knight to the nobility and enfeoff them with this county as your loyal vassal.
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-800 mb-1">New Lord's Name & Title</label>
                  <input
                    type="text"
                    value={newNobleName}
                    onChange={(e) => setNewNobleName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:border-[#D49B28]"
                  />
                </div>
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  ✓ Creates a new 100% loyal landed vassal sworn directly to your throne.
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-stone-800">
            <span className="font-bold">Effects of Granting:</span> Bestowing this county grants <strong>+50 Opinion</strong> with the recipient and entrusts local administration to their house.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300">
            <button
              onClick={() => { sound.playClick(); onClose(); }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmGrant}
              disabled={recipientType !== 'new_noble' && !selectedRecipientId}
              className="px-5 py-2 rounded-xl bg-[#D49B28] hover:bg-[#b78722] text-stone-950 text-xs font-extrabold font-cinzel transition-all shadow-md cursor-pointer disabled:opacity-40"
            >
              Bestow County & Seal Decree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
