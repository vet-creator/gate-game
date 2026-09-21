import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { CircuitBoard, GateDisplayMode } from './components/CircuitBoard';
import { ControlsFooter } from './components/ControlsFooter';
import { StageClearModal } from './components/StageClearModal';
import { StageSelectModal } from './components/StageSelectModal';
import { GateGuideModal } from './components/GateGuideModal';
import { generatePuzzle, computeStates, computeCircuitLayout, formatTime } from './lib/logicEngine';
import { sound } from './lib/sound';
import { THEMES } from './lib/theme';
import { Puzzle, PuzzleStates, ColorTheme, BestRecords, CircuitLayout } from './types';

export default function App() {
  // --- Local Storage Hydration ---
  const [maxUnlocked, setMaxUnlocked] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('lumen_maxUnlocked');
      const n = parseInt(saved || '1', 10);
      return n > 0 ? n : 1;
    } catch {
      return 1;
    }
  });

  const [bestRecords, setBestRecords] = useState<BestRecords>(() => {
    try {
      const raw = localStorage.getItem('lumen_bests');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      // Compatibility with old format { stageNum: elapsedMs } or new format { stageNum: StageRecord }
      const migrated: BestRecords = {};
      Object.keys(parsed).forEach((k) => {
        const val = parsed[k];
        if (typeof val === 'number') {
          migrated[Number(k)] = { bestTimeMs: val };
        } else if (val && typeof val === 'object') {
          migrated[Number(k)] = val;
        }
      });
      return migrated;
    } catch {
      return {};
    }
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('lumen_theme') as ColorTheme;
      return saved && THEMES[saved] ? saved : 'amber';
    } catch {
      return 'amber';
    }
  });

  const [gateDisplayMode, setGateDisplayMode] = useState<GateDisplayMode>(() => {
    try {
      const saved = localStorage.getItem('lumen_gate_mode') as GateDisplayMode;
      return saved || 'symbol';
    } catch {
      return 'symbol';
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);

  // --- Game State ---
  const [stage, setStage] = useState<number>(() => maxUnlocked);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle(maxUnlocked));
  const [states, setStates] = useState<PuzzleStates>(() => computeStates(puzzle));
  const [moves, setMoves] = useState<number>(0);
  const [cleared, setCleared] = useState<boolean>(false);

  // --- Timing State ---
  const [timeText, setTimeText] = useState<string>('0:00.0');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const startTimeRef = useRef<number>(performance.now());
  const timerIdRef = useRef<number | null>(null);

  // --- Board Dimensions ---
  const boardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 480,
  });

  // --- Modals State ---
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [isStageSelectOpen, setIsStageSelectOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [clearData, setClearData] = useState<{
    elapsedMs: number;
    bestTimeMs: number;
    isNewRecord: boolean;
    activeSwitches: number;
    totalSwitches: number;
    moves: number;
  }>({
    elapsedMs: 0,
    bestTimeMs: 0,
    isNewRecord: false,
    activeSwitches: 0,
    totalSwitches: 2,
    moves: 0,
  });

  const theme = THEMES[colorTheme] || THEMES.amber;

  // --- Layout Calculation ---
  const layout: CircuitLayout = useMemo(() => {
    return computeCircuitLayout(puzzle, states, dimensions.width, dimensions.height);
  }, [puzzle, states, dimensions.width, dimensions.height]);

  // --- Timer Controls ---
  const stopTimer = useCallback(() => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = performance.now();
    setTimeText('0:00.0');
    setElapsedMs(0);

    timerIdRef.current = window.setInterval(() => {
      const ms = performance.now() - startTimeRef.current;
      setElapsedMs(ms);
      setTimeText(formatTime(ms));
    }, 100);
  }, [stopTimer]);

  // --- Resize Observer ---
  useEffect(() => {
    if (!boardRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  // --- Stage Initialization ---
  const startStage = useCallback((stg: number) => {
    setStage(stg);
    const newPuzzle = generatePuzzle(stg);
    setPuzzle(newPuzzle);
    const newStates = computeStates(newPuzzle);
    setStates(newStates);
    setMoves(0);
    setCleared(false);
    setIsClearModalOpen(false);
    startTimer();
  }, [startTimer]);

  // Initial load
  useEffect(() => {
    startStage(stage);
    return () => stopTimer();
  }, []);

  // --- Switch Toggle Logic ---
  const toggleLeaf = useCallback((idx: number) => {
    if (cleared) return;

    setPuzzle((prevPuzzle) => {
      const newLeaves = [...prevPuzzle.leaves];
      newLeaves[idx] = !newLeaves[idx];
      const updatedPuzzle = { ...prevPuzzle, leaves: newLeaves };
      const updatedStates = computeStates(updatedPuzzle);
      setStates(updatedStates);

      // Sound feedback
      sound.playSwitchClick(newLeaves[idx]);

      // Check if root became active
      const rootActive = updatedStates[updatedPuzzle.layers][0];
      if (rootActive) {
        sound.playApexReady();
      }

      return updatedPuzzle;
    });

    setMoves((m) => m + 1);
  }, [cleared]);

  // --- Stage Clear Trigger ---
  const triggerClear = useCallback(() => {
    if (cleared) return;

    const rootActive = states[puzzle.layers]?.[0];
    if (!rootActive) return;

    setCleared(true);
    stopTimer();

    const finalElapsed = performance.now() - startTimeRef.current;
    setElapsedMs(finalElapsed);
    setTimeText(formatTime(finalElapsed));

    sound.playStageClear();

    // Active switches count
    const activeCount = puzzle.leaves.reduce((acc, curr) => acc + (curr ? 1 : 0), 0);

    // Save unlock progress
    let newMaxUnlocked = maxUnlocked;
    if (stage + 1 > maxUnlocked) {
      newMaxUnlocked = stage + 1;
      setMaxUnlocked(newMaxUnlocked);
      try {
        localStorage.setItem('lumen_maxUnlocked', String(newMaxUnlocked));
      } catch {}
    }

    // Check & Save Record
    const currentRecord = bestRecords[stage];
    const prevBestMs = currentRecord?.bestTimeMs;
    const isNew = prevBestMs === undefined || finalElapsed < prevBestMs;
    const finalBest = isNew ? finalElapsed : prevBestMs;

    const updatedRecords: BestRecords = {
      ...bestRecords,
      [stage]: {
        bestTimeMs: finalBest,
        bestMoves: moves + 1,
        clearDate: new Date().toISOString(),
      },
    };
    setBestRecords(updatedRecords);
    try {
      localStorage.setItem('lumen_bests', JSON.stringify(updatedRecords));
    } catch {}

    setClearData({
      elapsedMs: finalElapsed,
      bestTimeMs: finalBest,
      isNewRecord: isNew,
      activeSwitches: activeCount,
      totalSwitches: puzzle.leafCount,
      moves: moves + 1,
    });

    setIsClearModalOpen(true);
  }, [cleared, states, puzzle, maxUnlocked, stage, bestRecords, moves, stopTimer]);

  // --- Batch Controls ---
  const handleInvertAll = useCallback(() => {
    if (cleared) return;
    setPuzzle((prev) => {
      const newLeaves = prev.leaves.map((v) => !v);
      const updated = { ...prev, leaves: newLeaves };
      const newStates = computeStates(updated);
      setStates(newStates);
      sound.playSwitchClick(true);
      if (newStates[updated.layers][0]) sound.playApexReady();
      return updated;
    });
    setMoves((m) => m + 1);
  }, [cleared]);

  const handleResetAll = useCallback(() => {
    if (cleared) return;
    setPuzzle((prev) => {
      const newLeaves = new Array(prev.leafCount).fill(false);
      const updated = { ...prev, leaves: newLeaves };
      const newStates = computeStates(updated);
      setStates(newStates);
      sound.playSwitchClick(false);
      if (newStates[updated.layers][0]) sound.playApexReady();
      return updated;
    });
    setMoves((m) => m + 1);
  }, [cleared]);

  const handleSetAllOn = useCallback(() => {
    if (cleared) return;
    setPuzzle((prev) => {
      const newLeaves = new Array(prev.leafCount).fill(true);
      const updated = { ...prev, leaves: newLeaves };
      const newStates = computeStates(updated);
      setStates(newStates);
      sound.playSwitchClick(true);
      if (newStates[updated.layers][0]) sound.playApexReady();
      return updated;
    });
    setMoves((m) => m + 1);
  }, [cleared]);

  const handleRandomize = useCallback(() => {
    if (cleared) return;
    setPuzzle((prev) => {
      const newLeaves = prev.leaves.map(() => Math.random() > 0.5);
      const updated = { ...prev, leaves: newLeaves };
      const newStates = computeStates(updated);
      setStates(newStates);
      sound.playSwitchClick(true);
      if (newStates[updated.layers][0]) sound.playApexReady();
      return updated;
    });
    setMoves((m) => m + 1);
  }, [cleared]);

  // --- Preferences Toggles ---
  const handleToggleSound = useCallback(() => {
    const next = sound.toggle();
    setSoundEnabled(next);
  }, []);

  const handleSelectTheme = useCallback((t: ColorTheme) => {
    setColorTheme(t);
    try {
      localStorage.setItem('lumen_theme', t);
    } catch {}
  }, []);

  const handleCycleGateMode = useCallback(() => {
    setGateDisplayMode((curr) => {
      const next = curr === 'symbol' ? 'name' : curr === 'name' ? 'hidden' : 'symbol';
      try {
        localStorage.setItem('lumen_gate_mode', next);
      } catch {}
      return next;
    });
  }, []);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is open, Escape closes it
      if (e.key === 'Escape') {
        setIsClearModalOpen(false);
        setIsStageSelectOpen(false);
        setIsGuideOpen(false);
        return;
      }

      // If typing in input, ignore
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Number keys 1-9 toggle switch 0-8
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        const switchIdx = num - 1;
        if (switchIdx < puzzle.leafCount) {
          e.preventDefault();
          toggleLeaf(switchIdx);
        }
        return;
      }

      // 'R' / 'r' -> Retry
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        startStage(stage);
        return;
      }

      // 'Space' -> Ignite if root is lit
      if (e.code === 'Space') {
        e.preventDefault();
        if (states[puzzle.layers]?.[0]) {
          triggerClear();
        }
        return;
      }

      // '?' -> Open guide
      if (e.key === '?') {
        e.preventDefault();
        setIsGuideOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [puzzle.leafCount, puzzle.layers, states, stage, toggleLeaf, startStage, triggerClear]);

  const activeSwitchesCount = puzzle.leaves.reduce((acc, curr) => acc + (curr ? 1 : 0), 0);

  return (
    <div
      id="app-root"
      className={`h-[100dvh] w-screen flex flex-col transition-colors duration-300 ${theme.dotGridClass}`}
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      {/* 1. TOP HEADER */}
      <Header
        stage={stage}
        maxUnlocked={maxUnlocked}
        timeText={timeText}
        activeSwitches={activeSwitchesCount}
        totalSwitches={puzzle.leafCount}
        moves={moves}
        soundEnabled={soundEnabled}
        theme={theme}
        gateDisplayMode={gateDisplayMode}
        onOpenStageSelect={() => setIsStageSelectOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleSound={handleToggleSound}
        onCycleGateMode={handleCycleGateMode}
        onSelectTheme={handleSelectTheme}
        onRetry={() => startStage(stage)}
      />

      {/* 2. MAIN CIRCUIT BOARD CONTAINER */}
      <main
        ref={boardRef}
        id="main-circuit-viewport"
        className="flex-1 min-h-0 w-full relative flex items-center justify-center overflow-hidden"
      >
        <CircuitBoard
          layout={layout}
          gateDisplayMode={gateDisplayMode}
          theme={theme}
          isCleared={cleared}
          onToggleLeaf={toggleLeaf}
          onTriggerClear={triggerClear}
        />
      </main>

      {/* 3. BOTTOM TACTICAL CONTROLS FOOTER */}
      <ControlsFooter
        onInvertAll={handleInvertAll}
        onResetAll={handleResetAll}
        onSetAllOn={handleSetAllOn}
        onRandomize={handleRandomize}
        theme={theme}
      />

      {/* 4. MODALS */}
      <StageClearModal
        isOpen={isClearModalOpen}
        stage={stage}
        elapsedMs={clearData.elapsedMs}
        bestTimeMs={clearData.bestTimeMs}
        isNewRecord={clearData.isNewRecord}
        activeSwitches={clearData.activeSwitches}
        totalSwitches={clearData.totalSwitches}
        moves={clearData.moves}
        onRetry={() => {
          setIsClearModalOpen(false);
          startStage(stage);
        }}
        onNextStage={() => {
          setIsClearModalOpen(false);
          startStage(stage + 1);
        }}
        theme={theme}
      />

      <StageSelectModal
        isOpen={isStageSelectOpen}
        onClose={() => setIsStageSelectOpen(false)}
        currentStage={stage}
        maxUnlocked={maxUnlocked}
        bestRecords={bestRecords}
        onSelectStage={(s) => startStage(s)}
        theme={theme}
      />

      <GateGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        theme={theme}
      />
    </div>
  );
}
