import React, { useState } from 'react';
import { X, HelpCircle, ArrowRight } from 'lucide-react';
import { GATE_DEFINITIONS, GATES, evalGate } from '../lib/logicEngine';
import { GateType } from '../types';
import { ThemeColors } from '../lib/theme';

interface GateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
}

export const GateGuideModal: React.FC<GateGuideModalProps> = ({ isOpen, onClose, theme }) => {
  const [selectedGate, setSelectedGate] = useState<GateType>('AND');
  const [testA, setTestA] = useState<boolean>(false);
  const [testB, setTestB] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeDef = GATE_DEFINITIONS[selectedGate];
  const testResult = evalGate(selectedGate, testA, testB);

  return (
    <div
      id="guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="guide-modal-card"
        className="w-full max-w-xl rounded-2xl border p-5 md:p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: theme.panel,
          borderColor: theme.panelBorder,
          color: theme.text,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">論理回路ガイド (Logic Gates)</h2>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                各ゲートの動作仕様と真理値表 (Truth Table)
              </p>
            </div>
          </div>
          <button
            id="close-guide-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: theme.textMuted }}
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gate Selector Tabs */}
        <div className="grid grid-cols-6 gap-1.5 my-4 p-1 rounded-xl bg-black/20 border border-white/5">
          {GATES.map((g) => {
            const isSel = selectedGate === g;
            return (
              <button
                key={g}
                id={`gate-tab-${g}`}
                onClick={() => setSelectedGate(g)}
                className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all text-center ${
                  isSel ? 'shadow-sm ring-1 ring-white/20' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isSel ? theme.accent : 'transparent',
                  color: isSel ? '#000000' : theme.text,
                }}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Gate Detail & Interactive Playground */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-black/25 border border-white/5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-white">{activeDef.name}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded font-mono font-bold"
                  style={{ backgroundColor: `${theme.accent}30`, color: theme.accent }}
                >
                  {activeDef.formula}
                </span>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: theme.textMuted }}>
                {activeDef.descriptionJa}
              </p>
            </div>
            <div
              className="text-2xl font-mono font-black w-10 h-10 rounded-lg flex items-center justify-center border shrink-0"
              style={{ borderColor: theme.panelBorder, color: theme.accent, backgroundColor: `${theme.accent}12` }}
            >
              {activeDef.symbol}
            </div>
          </div>

          {/* Interactive Tester */}
          <div className="p-3.5 rounded-xl bg-black/20 border border-white/5">
            <div className="text-[11px] font-mono tracking-wider uppercase mb-2.5" style={{ color: theme.textMuted }}>
              インタラクティブ検証 (Interactive Test)
            </div>
            <div className="flex items-center justify-between gap-3 text-sm font-mono">
              <div className="flex items-center gap-2">
                <button
                  id="test-input-a"
                  onClick={() => setTestA(!testA)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    testA ? 'ring-1' : 'opacity-80'
                  }`}
                  style={{
                    backgroundColor: testA ? theme.accent : '#00000030',
                    borderColor: testA ? theme.accent : 'rgba(255,255,255,0.1)',
                    color: testA ? '#000' : theme.text,
                  }}
                >
                  A: {testA ? '1 (ON)' : '0 (OFF)'}
                </button>
                <span style={{ color: theme.textMuted }}>+</span>
                <button
                  id="test-input-b"
                  onClick={() => setTestB(!testB)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    testB ? 'ring-1' : 'opacity-80'
                  }`}
                  style={{
                    backgroundColor: testB ? theme.accent : '#00000030',
                    borderColor: testB ? theme.accent : 'rgba(255,255,255,0.1)',
                    color: testB ? '#000' : theme.text,
                  }}
                >
                  B: {testB ? '1 (ON)' : '0 (OFF)'}
                </button>
              </div>

              <ArrowRight className="w-4 h-4 shrink-0" style={{ color: theme.textMuted }} />

              <div
                className="px-3.5 py-1.5 rounded-lg border text-xs font-bold font-mono flex items-center gap-1.5"
                style={{
                  backgroundColor: testResult ? `${theme.accent}25` : 'rgba(0,0,0,0.3)',
                  borderColor: testResult ? theme.accent : 'rgba(255,255,255,0.1)',
                  color: testResult ? theme.accent : theme.textMuted,
                }}
              >
                OUT: {testResult ? '1 (ON)' : '0 (OFF)'}
              </div>
            </div>
          </div>

          {/* Truth Table */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/25">
            <table className="w-full text-xs font-mono text-center">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-[11px]">
                  <th className="py-2 px-3">入力 A</th>
                  <th className="py-2 px-3">入力 B</th>
                  <th className="py-2 px-3 text-right pr-6">出力 (OUT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeDef.truthTable.map((row, idx) => {
                  const isCurrent = (testA ? 1 : 0) === row.a && (testB ? 1 : 0) === row.b;
                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${isCurrent ? 'bg-white/10 font-bold' : ''}`}
                      style={{ color: isCurrent ? theme.accent : theme.text }}
                    >
                      <td className="py-1.5 px-3">{row.a}</td>
                      <td className="py-1.5 px-3">{row.b}</td>
                      <td className="py-1.5 px-3 text-right pr-6">
                        <span
                          className={`inline-block w-6 text-center rounded py-0.5 ${
                            row.out ? 'font-bold' : 'opacity-50'
                          }`}
                          style={{
                            backgroundColor: row.out ? `${theme.accent}25` : 'transparent',
                            color: row.out ? theme.accent : 'inherit',
                          }}
                        >
                          {row.out}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono" style={{ color: theme.textMuted }}>
          <span>目的: 最上段コア (LUMEN) を 1 に点灯させる</span>
          <button
            id="close-guide-done-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-transform active:scale-95"
            style={{ backgroundColor: theme.accent, color: '#000' }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
