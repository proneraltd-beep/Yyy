import React, { useState, useEffect, useRef } from 'react';
import { GameSaveState, SaveSlotMetadata, Character, Realm, Province, Vassal, FamilyMember, RealmLaw, ChronicleEntry, TradeCaravan, WarState, RealmNPC } from '../types';
import { 
  getSavedSlotsMetadata, 
  saveGameToSlot, 
  loadGameFromSlot, 
  deleteSaveSlot, 
  downloadSaveAsJson, 
  readUploadedSaveFile, 
  validateSavePayload,
  AUTOSAVE_SLOT_ID 
} from '../utils/saveManager';
import { sound } from '../utils/audio';
import { 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Trash2, 
  Clock, 
  Crown, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileJson, 
  HardDrive, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert, 
  Coins, 
  Castle, 
  FileCheck,
  Plus
} from 'lucide-react';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Current game state props for saving/exporting
  currentState: {
    character: Character;
    familyMembers: FamilyMember[];
    realms: Realm[];
    provinces: Province[];
    realmNPCs: RealmNPC[];
    vassals: Vassal[];
    realmLaws: RealmLaw[];
    chronicleEntries: ChronicleEntry[];
    tradeCaravans: TradeCaravan[];
    currentYear: number;
    reignYears: number;
    activeWars: WarState[];
  };
  // Callback when a save state is loaded/imported
  onLoadGameState: (state: GameSaveState) => void;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onLoadGameState
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'download' | 'upload'>('save');
  const [slots, setSlots] = useState<SaveSlotMetadata[]>([]);
  const [newSlotName, setNewSlotName] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Overwrite & Delete Confirmation IDs
  const [confirmOverwriteSlotId, setConfirmOverwriteSlotId] = useState<string | null>(null);
  const [confirmDeleteSlotId, setConfirmDeleteSlotId] = useState<string | null>(null);
  const [confirmLoadSlotId, setConfirmLoadSlotId] = useState<string | null>(null);

  // Upload file state
  const [uploadedPreview, setUploadedPreview] = useState<GameSaveState | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved slots on open
  useEffect(() => {
    if (isOpen) {
      const metas = getSavedSlotsMetadata();
      setSlots(metas);
      setNewSlotName(`Year ${currentState.currentYear} - Reign of ${currentState.character.name}`);
      setFeedbackMessage(null);
      setConfirmOverwriteSlotId(null);
      setConfirmDeleteSlotId(null);
      setConfirmLoadSlotId(null);
      setUploadedPreview(null);
      setUploadError(null);
    }
  }, [isOpen, currentState.currentYear, currentState.character.name]);

  if (!isOpen) return null;

  const showFeedback = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleSaveToNewSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newSlotName.trim() || `Year ${currentState.currentYear} - Auto Record`;
    const slotId = `slot_${Date.now()}`;

    try {
      sound.playGoldCoins();
      const updated = saveGameToSlot(slotId, title, currentState, false);
      setSlots(updated);
      showFeedback('success', `Saved successfully as "${title}"!`);
      setNewSlotName(`Year ${currentState.currentYear} - Reign of ${currentState.character.name}`);
    } catch (err: any) {
      sound.playError();
      showFeedback('error', err.message || 'Failed to save game.');
    }
  };

  const handleQuickSave = () => {
    try {
      sound.playGoldCoins();
      const title = `Quick Save (Year ${currentState.currentYear})`;
      const updated = saveGameToSlot('quicksave', title, currentState, false);
      setSlots(updated);
      showFeedback('success', 'Quick save complete!');
    } catch (err: any) {
      sound.playError();
      showFeedback('error', 'Failed to quick save.');
    }
  };

  const handleOverwriteSlot = (slot: SaveSlotMetadata) => {
    try {
      sound.playGoldCoins();
      const updated = saveGameToSlot(slot.id, slot.name, currentState, slot.isAutoSave);
      setSlots(updated);
      setConfirmOverwriteSlotId(null);
      showFeedback('success', `Overwrote "${slot.name}" with current state.`);
    } catch (err: any) {
      sound.playError();
      showFeedback('error', 'Failed to overwrite slot.');
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    sound.playClick();
    const updated = deleteSaveSlot(slotId);
    setSlots(updated);
    setConfirmDeleteSlotId(null);
    showFeedback('info', 'Save record deleted.');
  };

  const handleLoadSlot = (slotId: string) => {
    const loadedState = loadGameFromSlot(slotId);
    if (!loadedState) {
      sound.playError();
      showFeedback('error', 'Failed to load save state: file corrupted or not found.');
      return;
    }
    sound.playFanfare();
    onLoadGameState(loadedState);
    showFeedback('success', `Loaded "${loadedState.slotName || 'Save'}" successfully!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDownloadActiveGame = () => {
    sound.playClick();
    const fullState: GameSaveState = {
      ...currentState,
      version: '2.5.0',
      savedAt: new Date().toISOString(),
      slotName: `Year ${currentState.currentYear} - ${currentState.character.name}`
    };
    downloadSaveAsJson(fullState);
    showFeedback('success', 'Download initiated! Check your downloads folder.');
  };

  const handleDownloadSlot = (slotId: string) => {
    sound.playClick();
    const loaded = loadGameFromSlot(slotId);
    if (loaded) {
      downloadSaveAsJson(loaded);
      showFeedback('success', `Exported "${loaded.slotName || 'Save'}" to JSON file.`);
    } else {
      sound.playError();
      showFeedback('error', 'Could not export: Save data missing.');
    }
  };

  // Upload handler
  const processUploadedFile = async (file: File) => {
    sound.playClick();
    setUploadError(null);
    setUploadedPreview(null);

    const res = await readUploadedSaveFile(file);
    if (!res.valid || !res.state) {
      sound.playError();
      setUploadError(res.error || 'Invalid save file format.');
      return;
    }

    sound.playFanfare();
    setUploadedPreview(res.state);
    showFeedback('info', 'Save file validated! You can now load it or save it to a slot.');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleApplyUploadedSave = () => {
    if (!uploadedPreview) return;
    sound.playFanfare();
    onLoadGameState(uploadedPreview);
    showFeedback('success', `Applied uploaded save for ${uploadedPreview.character.name}!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleSaveUploadedToSlot = () => {
    if (!uploadedPreview) return;
    const slotId = `slot_import_${Date.now()}`;
    const slotName = uploadedPreview.slotName || `Imported: ${uploadedPreview.character.name} (${uploadedPreview.currentYear})`;
    try {
      sound.playGoldCoins();
      const updated = saveGameToSlot(slotId, slotName, uploadedPreview, false);
      setSlots(updated);
      showFeedback('success', `Uploaded save stored as "${slotName}".`);
      setUploadedPreview(null);
      setActiveTab('load');
    } catch (err: any) {
      sound.playError();
      showFeedback('error', 'Failed to store imported save in storage.');
    }
  };

  const currentRealm = currentState.realms.find(r => r.id === currentState.character.realmId) || currentState.realms[0];
  const playerProvincesCount = currentState.provinces.filter(p => p.isPlayerControlled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto">
      <div className="bg-[#FAF7EB] text-[#181512] rounded-2xl max-w-3xl w-full border border-stone-400/80 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Ribbon */}
        <div className="bg-[#D49B28] px-4 sm:px-6 py-3.5 border-b border-[#B78722] text-[#181512] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-stone-950/20 border border-stone-950/30 flex items-center justify-center text-xl shadow-xs">
              <HardDrive className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-stone-950 font-cinzel leading-tight">
                Imperial Archives & Save Management
              </h2>
              <p className="text-xs text-stone-900/90 font-medium">
                Save, load, download & upload kingdom chronicles
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="w-8 h-8 rounded-full bg-stone-950/10 hover:bg-stone-950/20 flex items-center justify-center text-stone-900 font-bold transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-200/90 px-3 sm:px-6 py-2 border-b border-stone-300 flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => { sound.playClick(); setActiveTab('save'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'save'
                ? 'bg-[#D49B28] text-stone-950 shadow-xs border border-amber-600'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Dynasty</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('load'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'load'
                ? 'bg-[#D49B28] text-stone-950 shadow-xs border border-amber-600'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Load Chronicles ({slots.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('download'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'download'
                ? 'bg-[#D49B28] text-stone-950 shadow-xs border border-amber-600'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Save</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('upload'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-[#D49B28] text-stone-950 shadow-xs border border-amber-600'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Save</span>
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b animate-fade-in ${
            feedbackMessage.type === 'success' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
            feedbackMessage.type === 'error' ? 'bg-red-100 text-red-900 border-red-300' :
            'bg-amber-100 text-amber-900 border-amber-300'
          }`}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> :
             feedbackMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-600 shrink-0" /> :
             <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: SAVE GAME */}
          {activeTab === 'save' && (
            <div className="space-y-4">
              
              {/* Active Realm Current State Summary Card */}
              <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl border border-stone-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-800 border border-amber-500/40 flex items-center justify-center text-3xl shadow-xs">
                      {currentState.character.portrait || '👑'}
                    </div>
                    <div>
                      <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">Current Active Session</div>
                      <div className="text-base font-extrabold text-stone-100 font-cinzel">
                        {currentState.character.rank} {currentState.character.name} {currentState.character.dynastyName}
                      </div>
                      <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                        <span>{currentRealm.crestIcon} {currentRealm.name}</span>
                        <span>•</span>
                        <span>Year {currentState.currentYear} AD</span>
                        <span>•</span>
                        <span>Age {currentState.character.age}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleQuickSave}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Quick Save</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-800/80 text-xs">
                  <div className="bg-stone-950/60 p-2 rounded-lg">
                    <span className="text-stone-400 text-[10px] block">Treasury Gold</span>
                    <span className="font-bold text-amber-300 font-mono">🪙 {currentState.character.stats.gold}</span>
                  </div>
                  <div className="bg-stone-950/60 p-2 rounded-lg">
                    <span className="text-stone-400 text-[10px] block">Controlled Provinces</span>
                    <span className="font-bold text-stone-200 font-mono">🏰 {playerProvincesCount} Counties</span>
                  </div>
                  <div className="bg-stone-950/60 p-2 rounded-lg">
                    <span className="text-stone-400 text-[10px] block">Vassals Sworn</span>
                    <span className="font-bold text-stone-200 font-mono">👥 {currentState.vassals.length} Lords</span>
                  </div>
                  <div className="bg-stone-950/60 p-2 rounded-lg">
                    <span className="text-stone-400 text-[10px] block">Active Wars</span>
                    <span className={`font-bold font-mono ${currentState.activeWars.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      ⚔️ {currentState.activeWars.length} War{currentState.activeWars.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form: Create New Save Slot */}
              <form onSubmit={handleSaveToNewSlot} className="bg-white p-4 rounded-xl border border-stone-300 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>Create New Save Record</span>
                </h3>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newSlotName}
                    onChange={(e) => setNewSlotName(e.target.value)}
                    placeholder="Enter Save Name (e.g. Conquest of Northumbria)..."
                    className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#D49B28] hover:bg-amber-500 text-stone-950 font-black text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Slot</span>
                  </button>
                </div>
              </form>

              {/* Existing Save Slots for Overwrite */}
              {slots.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5 px-1">
                    <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                    <span>Or Overwrite Existing Save Slot ({slots.length})</span>
                  </h3>

                  <div className="space-y-2">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="bg-white p-3 rounded-xl border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-xl shrink-0">
                            {slot.portrait}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-stone-950 font-cinzel truncate">
                                {slot.name}
                              </span>
                              {slot.isAutoSave && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                                  AUTO
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-600 truncate mt-0.5">
                              {slot.rulerName} • {slot.realmName} • Year {slot.year} AD
                            </div>
                            <div className="text-[10px] text-stone-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(slot.savedAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {confirmOverwriteSlotId === slot.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-red-700">Overwrite?</span>
                              <button
                                onClick={() => handleOverwriteSlot(slot)}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmOverwriteSlotId(null)}
                                className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmOverwriteSlotId(slot.id)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 text-xs font-bold rounded-lg border border-stone-300 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>Overwrite</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LOAD GAME */}
          {activeTab === 'load' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-amber-600" />
                  <span>Saved Chronicles ({slots.length})</span>
                </h3>
                <span className="text-[11px] text-stone-500 font-medium">
                  Select a record to resume your dynasty
                </span>
              </div>

              {slots.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-stone-300 text-center space-y-3">
                  <HardDrive className="w-12 h-12 text-stone-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-sm text-stone-800">No Saved Chronicles Found</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      You have not created any save records yet. Use the "Save Dynasty" tab to preserve your progress!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('save')}
                    className="px-4 py-2 bg-[#D49B28] text-stone-950 text-xs font-black rounded-xl shadow-xs cursor-pointer"
                  >
                    Go to Save Tab
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-white p-4 rounded-xl border border-stone-300 hover:border-amber-500 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                          {slot.portrait}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-stone-950 font-cinzel truncate">
                              {slot.name}
                            </h4>
                            {slot.isAutoSave && (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                                AUTOSAVE
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-700 font-semibold mt-0.5 truncate">
                            {slot.rank} {slot.rulerName} {slot.dynastyName} • {slot.realmCrest} {slot.realmName}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1 flex-wrap font-mono">
                            <span>Year {slot.year} AD</span>
                            <span>•</span>
                            <span>🪙 {slot.gold} Gold</span>
                            <span>•</span>
                            <span>🏰 {slot.provincesControlled} Counties</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-sans text-stone-400">
                              <Clock className="w-3 h-3" />
                              {new Date(slot.savedAt).toLocaleDateString()} {new Date(slot.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {confirmLoadSlotId === slot.id ? (
                          <div className="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-xl border border-amber-300">
                            <span className="text-[11px] font-bold text-amber-900">Load & Replace?</span>
                            <button
                              onClick={() => handleLoadSlot(slot.id)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-lg shadow-xs cursor-pointer"
                            >
                              Yes, Load
                            </button>
                            <button
                              onClick={() => setConfirmLoadSlotId(null)}
                              className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmLoadSlotId(slot.id)}
                            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>Load</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDownloadSlot(slot.id)}
                          title="Download as JSON"
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-300 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {confirmDeleteSlotId === slot.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSlotId(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 text-[11px] font-bold rounded-lg cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteSlotId(slot.id)}
                            title="Delete Save"
                            className="p-1.5 bg-stone-100 hover:bg-red-100 hover:text-red-700 text-stone-400 rounded-xl border border-stone-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOWNLOAD / EXPORT */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-300 shadow-sm space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    <FileJson className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-stone-950 font-cinzel">
                      Export Sovereign Save File (.json)
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Download a complete, offline snapshot of your active realm, dynasty members, vassals, provincial improvements, laws, and chronicles.
                    </p>
                  </div>
                </div>

                {/* File Details Preview */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-stone-500 font-medium">Export Filename:</span>
                    <span className="font-mono font-bold text-stone-900 text-[11px] truncate max-w-[280px]">
                      valoria_save_year{currentState.currentYear}_{currentState.character.name.replace(/\s+/g, '_')}.json
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div>
                      <span className="text-stone-400 text-[10px] block">Ruler</span>
                      <span className="font-bold text-stone-900">{currentState.character.name}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Dynasty</span>
                      <span className="font-bold text-stone-900">{currentState.character.dynastyName}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Current Year</span>
                      <span className="font-bold text-stone-900 font-mono">{currentState.currentYear} AD</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Demesne</span>
                      <span className="font-bold text-stone-900 font-mono">{playerProvincesCount} Counties</span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownloadActiveGame}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black text-sm font-cinzel shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Active Save File (.json)</span>
                </button>
              </div>

              {/* Note on Compatibility */}
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Cross-Device & Backup Safe</span>
                  <p className="text-[11px] text-amber-900/80">
                    Your downloaded save file can be backed up, shared, or imported onto any browser or device via the <strong>Upload Save</strong> tab.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD / IMPORT */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              
              {/* Drag & Drop File Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging 
                    ? 'border-amber-600 bg-amber-100/60 scale-[1.01]' 
                    : 'border-stone-300 bg-white hover:border-amber-500 hover:bg-amber-50/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".json,application/json"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shadow-xs">
                  <Upload className="w-7 h-7 text-amber-800" />
                </div>

                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-stone-950 font-cinzel">
                    Choose a Save File (.json) or Drag & Drop Here
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Select a previously downloaded Valoria save file to inspect its contents and resume the campaign.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileJson className="w-3.5 h-3.5 text-amber-400" />
                  <span>Browse File on Device</span>
                </button>
              </div>

              {/* Upload Error Display */}
              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Invalid Save File</span>
                    <span className="text-[11px]">{uploadError}</span>
                  </div>
                </div>
              )}

              {/* Uploaded Save Preview Card */}
              {uploadedPreview && (
                <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500 shadow-md space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 font-cinzel">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Save File Successfully Validated!</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500">
                      Version: {uploadedPreview.version || '2.0'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-3xl shrink-0">
                      {uploadedPreview.character.portrait || '👑'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-950 font-cinzel truncate">
                        {uploadedPreview.character.rank} {uploadedPreview.character.name} {uploadedPreview.character.dynastyName}
                      </h4>
                      <div className="text-xs text-stone-600 mt-0.5 truncate">
                        {uploadedPreview.realms.find(r => r.id === uploadedPreview.character.realmId)?.name || 'Valoria'} • Year {uploadedPreview.currentYear} AD • Age {uploadedPreview.character.age}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-400 text-[10px] block">Treasury</span>
                      <span className="font-bold text-stone-900 font-mono">🪙 {uploadedPreview.character.stats.gold}</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-400 text-[10px] block">Provinces</span>
                      <span className="font-bold text-stone-900 font-mono">🏰 {uploadedPreview.provinces.filter(p => p.isPlayerControlled).length}</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-400 text-[10px] block">Family Members</span>
                      <span className="font-bold text-stone-900 font-mono">👥 {uploadedPreview.familyMembers.length}</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-400 text-[10px] block">Wars Active</span>
                      <span className="font-bold text-stone-900 font-mono">⚔️ {uploadedPreview.activeWars.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stone-200">
                    <button
                      onClick={handleApplyUploadedSave}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black text-xs font-cinzel shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Load & Play This Save Now</span>
                    </button>
                    <button
                      onClick={handleSaveUploadedToSlot}
                      className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save to Storage Slot</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-4 sm:px-6 py-3 border-t border-stone-300 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Auto-Save active every in-game year</span>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-4 py-1.5 bg-stone-300 hover:bg-stone-400 text-stone-900 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
