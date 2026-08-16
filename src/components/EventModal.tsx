import React from 'react';
import { GameEvent, Character } from '../types';
import { Sparkles, ArrowRight, ShieldAlert, Coins, Heart, Crown } from 'lucide-react';
import { sound } from '../utils/audio';

interface EventModalProps {
  event: GameEvent;
  character: Character;
  onSelectChoice: (choiceId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  character,
  onSelectChoice
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-500/70 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-4">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Category & Speaker Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-700/60">
            📜 {event.category}
          </span>
          <span className="text-xs text-stone-400 font-mono">
            Age {character.age}
          </span>
        </div>

        {/* Speaker or Event Emblem */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-900 border-2 border-amber-500/60 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-lg">
            {event.speaker?.portrait || event.imagePromptIcon || '📜'}
          </div>

          <div>
            {event.speaker && (
              <div className="mb-0.5">
                <span className="font-bold text-xs text-amber-300">{event.speaker.name}</span>
                <span className="text-[11px] text-stone-400"> ({event.speaker.title})</span>
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-black text-amber-100 font-cinzel leading-snug">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800 text-stone-200 text-xs sm:text-sm leading-relaxed max-h-56 overflow-y-auto">
          {event.description}
        </div>

        {/* Choices List */}
        <div className="space-y-2 pt-1">
          {event.choices.map((choice) => {
            const meetsRequirements = 
              (!choice.requirements?.gold || character.stats.gold >= choice.requirements.gold) &&
              (!choice.requirements?.martial || character.stats.martial >= choice.requirements.martial) &&
              (!choice.requirements?.intrigue || character.stats.intrigue >= choice.requirements.intrigue) &&
              (!choice.requirements?.diplomacy || character.stats.diplomacy >= choice.requirements.diplomacy) &&
              (!choice.requirements?.intellect || character.stats.intellect >= choice.requirements.intellect);

            return (
              <button
                key={choice.id}
                disabled={!meetsRequirements}
                onClick={() => {
                  sound.playCoin();
                  onSelectChoice(choice.id);
                }}
                className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 border ${
                  meetsRequirements
                    ? 'bg-stone-900/90 hover:bg-stone-800 border-stone-700/80 hover:border-amber-500 text-stone-100 shadow-md active:scale-[0.99] cursor-pointer'
                    : 'bg-stone-950/60 border-stone-900 text-stone-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold leading-snug">
                    {choice.text}
                  </div>
                  {!meetsRequirements && (
                    <div className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-mono">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Requirements not met</span>
                    </div>
                  )}
                </div>

                <div className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-600/50 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
