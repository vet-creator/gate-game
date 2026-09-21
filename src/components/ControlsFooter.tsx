import React from 'react';
import { FlipHorizontal, RefreshCw, Sparkles, Shuffle, Keyboard } from 'lucide-react';
import { ThemeColors } from '../lib/theme';

interface ControlsFooterProps {
  onInvertAll: () => void;
  onResetAll: () => void;
  onSetAllOn: () => void;
  onRandomize: () => void;
  theme: ThemeColors;
}

export const ControlsFooter: React.FC<ControlsFooterProps> = ({
  onInvertAll,
  onResetAll,
  onSetAllOn,
  onRandomize,
  theme,
}) => {
  return (
    <footer
      id="quick-controls-footer"
      className="shrink-0 flex items-center justify-between px-4 py-2 md:px-6 md:py-2.5 border-t text-xs font-mono transition-colors"
      style={{
        backgroundColor: `${theme.panel}cc`,
        borderColor: theme.panelBorder,
        color: theme.textMuted,
      }}
    >
      {/* Quick Switch Helpers */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <span className="text-[10px] tracking-wider uppercase opacity-50 mr-1 hidden sm:inline">
          一括操作:
        </span>

        <button
          id="invert-all-btn"
          onClick={onInvertAll}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-[11px]"
          title="すべてのスイッチを反転"
        >
          <FlipHorizontal className="w-3 h-3" />
          <span>反転</span>
        </button>

        <button
          id="reset-all-btn"
          onClick={onResetAll}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-[11px]"
          title="すべてのスイッチをOFF(0)にする"
        >
          <RefreshCw className="w-3 h-3" />
          <span>全OFF</span>
        </button>

        <button
          id="set-all-on-btn"
          onClick={onSetAllOn}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-[11px]"
          title="すべてのスイッチをON(1)にする"
        >
          <Sparkles className="w-3 h-3" />
          <span>全ON</span>
        </button>

        <button
          id="randomize-btn"
          onClick={onRandomize}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-[11px]"
          title="スイッチをランダム設定"
        >
          <Shuffle className="w-3 h-3" />
          <span>ランダム</span>
        </button>
      </div>

      {/* Keyboard Short-cuts / Helper Tip */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] opacity-70">
        <Keyboard className="w-3.5 h-3.5" />
        <span>[1〜9]: スイッチ切替</span>
        <span>•</span>
        <span>[R]: リトライ</span>
        <span>•</span>
        <span>[Space]: クリア点火</span>
      </div>
    </footer>
  );
};
