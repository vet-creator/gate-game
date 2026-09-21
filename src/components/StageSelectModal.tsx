import React from 'react';
import { X, Lock, CheckCircle2, Trophy, Clock } from 'lucide-react';
import { ThemeColors } from '../lib/theme';
import { BestRecords } from '../types';
import { formatTime } from '../lib/logicEngine';

interface StageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage: number;
  maxUnlocked: number;
  bestRecords: BestRecords;
  onSelectStage: (stage: number) => void;
  theme: ThemeColors;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  onClose,
  currentStage,
  maxUnlocked,
  bestRecords,
  onSelectStage,
  theme,
}) => {
  if (!isOpen) return null;

  // Render stages up to max(maxUnlocked, 8)
  const totalDisplayStages = Math.max(maxUnlocked + 2, 8);
  const stages = Array.from({ length: totalDisplayStages }, (_, i) => i + 1);

  return (
    <div
      id="stage-select-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="stage-select-card"
        className="w-full max-w-lg rounded-2xl border p-5 md:p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: theme.panel,
          borderColor: theme.panelBorder,
          color: theme.text,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: `${theme.accent}25`, color: theme.accent }}
            >
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">ステージ選択 (Stage Select)</h2>
              <p className="text-[11px] font-mono" style={{ color: theme.textMuted }}>
                到達レベル: Stage {maxUnlocked}
              </p>
            </div>
          </div>
          <button
            id="close-stage-select-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: theme.textMuted }}
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stage Grid */}
        <div className="grid grid-cols-4 gap-2.5 my-5 max-h-[60vh] overflow-y-auto p-1">
          {stages.map((stg) => {
            const isUnlocked = stg <= maxUnlocked;
            const isCurrent = stg === currentStage;
            const record = bestRecords[stg];
            const isCleared = record && record.bestTimeMs !== undefined;
            const inputCount = Math.pow(2, stg);

            return (
              <button
                key={stg}
                id={`stage-card-${stg}`}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectStage(stg);
                    onClose();
                  }
                }}
                className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isUnlocked ? 'cursor-pointer hover:scale-[1.03] active:scale-95' : 'opacity-35 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: isCurrent
                    ? `${theme.accent}20`
                    : isUnlocked
                    ? 'rgba(0,0,0,0.25)'
                    : 'rgba(0,0,0,0.15)',
                  borderColor: isCurrent ? theme.accent : isUnlocked ? theme.panelBorder : 'rgba(255,255,255,0.06)',
                  boxShadow: isCurrent ? `0 0 16px ${theme.nodeOnGlow}` : undefined,
                }}
              >
                {/* Stage Number */}
                <div className="flex items-center gap-1">
                  <span
                    className={`font-mono text-base font-bold ${isCurrent ? 'text-white' : ''}`}
                    style={{ color: isCurrent ? theme.accent : theme.text }}
                  >
                    {stg}
                  </span>
                  {isCleared && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  )}
                  {!isUnlocked && (
                    <Lock className="w-3 h-3" style={{ color: theme.textMuted }} />
                  )}
                </div>

                {/* Sub info */}
                <div className="text-[10px] font-mono" style={{ color: theme.textMuted }}>
                  {inputCount} 入力
                </div>

                {/* Record if cleared */}
                {record?.bestTimeMs !== undefined ? (
                  <div
                    className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded mt-0.5"
                    style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTime(record.bestTimeMs)}</span>
                  </div>
                ) : (
                  <div className="text-[9px] font-mono opacity-40 mt-0.5">未クリア</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono" style={{ color: theme.textMuted }}>
          <span>クリアで次ステージが開放されます</span>
          <button
            id="close-stage-select-btn2"
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-white/15 hover:bg-white/10 transition-colors text-xs"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};
