import React from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Palette,
  ChevronDown,
  Layers,
  Clock,
  Zap,
} from 'lucide-react';
import { ColorTheme } from '../types';
import { THEMES, ThemeColors } from '../lib/theme';
import { GateDisplayMode } from './CircuitBoard';

interface HeaderProps {
  stage: number;
  maxUnlocked: number;
  timeText: string;
  activeSwitches: number;
  totalSwitches: number;
  moves: number;
  soundEnabled: boolean;
  theme: ThemeColors;
  gateDisplayMode: GateDisplayMode;
  onOpenStageSelect: () => void;
  onOpenGuide: () => void;
  onToggleSound: () => void;
  onCycleGateMode: () => void;
  onSelectTheme: (t: ColorTheme) => void;
  onRetry: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stage,
  maxUnlocked,
  timeText,
  activeSwitches,
  totalSwitches,
  moves,
  soundEnabled,
  theme,
  gateDisplayMode,
  onOpenStageSelect,
  onOpenGuide,
  onToggleSound,
  onCycleGateMode,
  onSelectTheme,
  onRetry,
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = React.useState(false);

  return (
    <header
      id="main-app-header"
      className="shrink-0 flex items-center justify-between px-3.5 py-2.5 md:px-6 md:py-3 border-b backdrop-blur-md z-40 transition-colors"
      style={{
        backgroundColor: `${theme.panel}e6`,
        borderColor: theme.panelBorder,
        color: theme.text,
      }}
    >
      {/* LEFT: Branding & Stage Pill */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: theme.accent }}
          />
          <span className="font-mono font-extrabold tracking-widest text-sm md:text-base" style={{ color: theme.text }}>
            LUMEN
          </span>
        </div>

        {/* Stage Selector Pill */}
        <button
          id="stage-select-pill-btn"
          onClick={onOpenStageSelect}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: `${theme.accent}18`,
            borderColor: theme.accent,
            color: theme.accent,
          }}
          title="ステージ一覧を開く"
        >
          <span>STAGE {stage}</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>
      </div>

      {/* CENTER: HUD Stats (Time, Inputs, Moves) */}
      <div className="flex items-center gap-2 md:gap-3 font-mono text-xs">
        {/* Timer */}
        <div
          id="hud-timer-chip"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-black/20"
          style={{ borderColor: theme.panelBorder }}
          title="経過時間"
        >
          <Clock className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
          <span className="font-semibold tabular-nums">{timeText}</span>
        </div>

        {/* Active Switches */}
        <div
          id="hud-switches-chip"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-black/20"
          style={{ borderColor: theme.panelBorder }}
          title="ONの入力スイッチ"
        >
          <Zap className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          <span className="tabular-nums">
            {activeSwitches} <span className="opacity-40">/ {totalSwitches}</span>
          </span>
        </div>

        {/* Move Counter */}
        <div
          id="hud-moves-chip"
          className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full border bg-black/20 text-[11px]"
          style={{ borderColor: theme.panelBorder, color: theme.textMuted }}
          title="操作回数"
        >
          <span>MOVES:</span>
          <span className="font-bold tabular-nums text-white">{moves}</span>
        </div>
      </div>

      {/* RIGHT: Action Controls */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Gate Mode Toggle */}
        <button
          id="gate-mode-toggle-btn"
          onClick={onCycleGateMode}
          className="h-8 px-2.5 rounded-full border flex items-center gap-1 text-[11px] font-mono transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
          style={{ borderColor: theme.panelBorder, color: theme.text }}
          title="ゲート表示切替: 記号 / 名称 / 非表示"
        >
          <Layers className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          <span className="hidden sm:inline uppercase">{gateDisplayMode}</span>
        </button>

        {/* Gate Guide Modal Button */}
        <button
          id="guide-toggle-btn"
          onClick={onOpenGuide}
          className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
          style={{ borderColor: theme.panelBorder, color: theme.text }}
          title="論理ゲート説明・真理値表"
        >
          <BookOpen className="w-3.5 h-3.5" />
        </button>

        {/* Theme Dropdown Toggle */}
        <div className="relative">
          <button
            id="theme-dropdown-btn"
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
            style={{ borderColor: theme.panelBorder, color: theme.text }}
            title="テーマカラー変更"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {themeMenuOpen && (
            <div
              id="theme-menu-popover"
              className="absolute right-0 top-10 w-44 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: theme.panel,
                borderColor: theme.panelBorder,
                color: theme.text,
              }}
            >
              <div className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 opacity-60">
                COLOR THEME
              </div>
              <div className="space-y-1 mt-1">
                {(Object.keys(THEMES) as ColorTheme[]).map((tId) => {
                  const t = THEMES[tId];
                  const isSel = t.id === theme.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTheme(t.id);
                        setThemeMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-mono text-left transition-colors hover:bg-white/10"
                      style={{
                        backgroundColor: isSel ? `${theme.accent}20` : 'transparent',
                        color: isSel ? theme.accent : theme.text,
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full border shrink-0"
                        style={{ backgroundColor: t.accent, borderColor: 'rgba(255,255,255,0.2)' }}
                      />
                      <span className="truncate">{t.nameJa}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          id="sound-toggle-btn"
          onClick={onToggleSound}
          className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
          style={{
            borderColor: theme.panelBorder,
            color: soundEnabled ? theme.accent : theme.textMuted,
          }}
          title={soundEnabled ? 'サウンド: ON' : 'サウンド: OFF'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Retry Current Stage */}
        <button
          id="header-retry-btn"
          onClick={onRetry}
          className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
          style={{ borderColor: theme.panelBorder, color: theme.text }}
          title="ステージをリトライ"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
