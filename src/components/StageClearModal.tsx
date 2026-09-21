import React from 'react';
import { RotateCcw, ArrowRight, Trophy, Clock, Zap, Sparkles, Check } from 'lucide-react';
import { ThemeColors } from '../lib/theme';
import { formatTime } from '../lib/logicEngine';

interface StageClearModalProps {
  isOpen: boolean;
  stage: number;
  elapsedMs: number;
  bestTimeMs: number;
  isNewRecord: boolean;
  activeSwitches: number;
  totalSwitches: number;
  moves: number;
  onRetry: () => void;
  onNextStage: () => void;
  theme: ThemeColors;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  isOpen,
  stage,
  elapsedMs,
  bestTimeMs,
  isNewRecord,
  activeSwitches,
  totalSwitches,
  moves,
  onRetry,
  onNextStage,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="stage-clear-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
    >
      <div
        id="stage-clear-card"
        className="w-full max-w-sm rounded-3xl border p-6 text-center shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: theme.panel,
          borderColor: theme.panelBorder,
          color: theme.text,
        }}
      >
        {/* Glow ambient background inside modal */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-30"
          style={{ backgroundColor: theme.accent }}
        />

        {/* Stage Badge & Crown */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg mb-3"
            style={{
              backgroundColor: `${theme.accent}20`,
              borderColor: theme.accent,
              color: theme.accent,
              boxShadow: `0 0 24px ${theme.nodeOnGlow}`,
            }}
          >
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="text-xs font-mono tracking-widest uppercase" style={{ color: theme.textMuted }}>
            CIRCUIT SYNCHRONIZED
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-tight mt-0.5" style={{ color: theme.text }}>
            STAGE {stage} COMPLETE
          </h2>

          {isNewRecord && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold mt-2 shadow-sm animate-bounce"
              style={{
                backgroundColor: theme.accent,
                color: '#000',
              }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>NEW RECORD!</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5 my-6 p-3 rounded-2xl bg-black/30 border border-white/5">
          {/* Time Stat */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
            <div className="flex items-center gap-1 text-[11px] font-mono" style={{ color: theme.textMuted }}>
              <Clock className="w-3 h-3" />
              <span>TIME</span>
            </div>
            <div className="text-xl font-mono font-bold mt-0.5" style={{ color: theme.accent }}>
              {formatTime(elapsedMs)}
            </div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: theme.textMuted }}>
              BEST: {formatTime(bestTimeMs)}
            </div>
          </div>

          {/* Moves / Active Inputs */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
            <div className="flex items-center gap-1 text-[11px] font-mono" style={{ color: theme.textMuted }}>
              <Zap className="w-3 h-3" />
              <span>INPUTS ON</span>
            </div>
            <div className="text-xl font-mono font-bold mt-0.5" style={{ color: theme.text }}>
              {activeSwitches} <span className="text-xs font-normal opacity-50">/ {totalSwitches}</span>
            </div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: theme.textMuted }}>
              MOVES: {moves}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative z-10 flex items-center gap-3">
          <button
            id="clear-retry-btn"
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all hover:bg-white/10 active:scale-95"
            style={{
              borderColor: 'rgba(255,255,255,0.15)',
              color: theme.text,
            }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY</span>
          </button>

          <button
            id="clear-next-btn"
            onClick={onNextStage}
            className="flex-2 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
            style={{
              backgroundColor: theme.accent,
              color: '#000000',
              boxShadow: `0 4px 20px ${theme.nodeOnGlow}`,
            }}
          >
            <span>NEXT STAGE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
