import { GateDefinition, GateType, Puzzle, PuzzleStates, CircuitLayout, LayoutNode, LayoutEdge } from '../types';

export const GATES: GateType[] = ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'];

export const GATE_DEFINITIONS: Record<GateType, GateDefinition> = {
  AND: {
    type: 'AND',
    name: 'AND (論理積)',
    symbol: '&',
    mathSymbol: '∧',
    formula: 'A · B',
    description: 'Output is ON only if both inputs are ON.',
    descriptionJa: '両方の入力がONの時のみONを出力',
    truthTable: [
      { a: 0, b: 0, out: 0 },
      { a: 0, b: 1, out: 0 },
      { a: 1, b: 0, out: 0 },
      { a: 1, b: 1, out: 1 },
    ],
  },
  OR: {
    type: 'OR',
    name: 'OR (論理和)',
    symbol: '≥1',
    mathSymbol: '∨',
    formula: 'A + B',
    description: 'Output is ON if at least one input is ON.',
    descriptionJa: 'どちらか一方でもONならONを出力',
    truthTable: [
      { a: 0, b: 0, out: 0 },
      { a: 0, b: 1, out: 1 },
      { a: 1, b: 0, out: 1 },
      { a: 1, b: 1, out: 1 },
    ],
  },
  NAND: {
    type: 'NAND',
    name: 'NAND (否定論理積)',
    symbol: '⊼',
    mathSymbol: '⊼',
    formula: '¬(A · B)',
    description: 'Output is ON unless both inputs are ON.',
    descriptionJa: '両方ともONの場合のみOFF、それ以外はON',
    truthTable: [
      { a: 0, b: 0, out: 1 },
      { a: 0, b: 1, out: 1 },
      { a: 1, b: 0, out: 1 },
      { a: 1, b: 1, out: 0 },
    ],
  },
  NOR: {
    type: 'NOR',
    name: 'NOR (否定論理和)',
    symbol: '⊽',
    mathSymbol: '⊽',
    formula: '¬(A + B)',
    description: 'Output is ON only when both inputs are OFF.',
    descriptionJa: '両方ともOFFの時のみONを出力',
    truthTable: [
      { a: 0, b: 0, out: 1 },
      { a: 0, b: 1, out: 0 },
      { a: 1, b: 0, out: 0 },
      { a: 1, b: 1, out: 0 },
    ],
  },
  XOR: {
    type: 'XOR',
    name: 'XOR (排他的論理和)',
    symbol: '=1',
    mathSymbol: '⊕',
    formula: 'A ⊕ B',
    description: 'Output is ON when inputs are different.',
    descriptionJa: '2つの入力が互いに異なる時のみONを出力',
    truthTable: [
      { a: 0, b: 0, out: 0 },
      { a: 0, b: 1, out: 1 },
      { a: 1, b: 0, out: 1 },
      { a: 1, b: 1, out: 0 },
    ],
  },
  XNOR: {
    type: 'XNOR',
    name: 'XNOR (同値演算)',
    symbol: '⊙',
    mathSymbol: '⊙',
    formula: '¬(A ⊕ B)',
    description: 'Output is ON when both inputs are equal.',
    descriptionJa: '2つの入力が等しい時(両方ONまたは両方OFF)にONを出力',
    truthTable: [
      { a: 0, b: 0, out: 1 },
      { a: 0, b: 1, out: 0 },
      { a: 1, b: 0, out: 0 },
      { a: 1, b: 1, out: 1 },
    ],
  },
};

export function evalGate(t: GateType, a: boolean, b: boolean): boolean {
  switch (t) {
    case 'AND':
      return a && b;
    case 'OR':
      return a || b;
    case 'NAND':
      return !(a && b);
    case 'NOR':
      return !(a || b);
    case 'XOR':
      return a !== b;
    case 'XNOR':
      return a === b;
  }
}

export function randGate(): GateType {
  return GATES[Math.floor(Math.random() * GATES.length)];
}

export function nodeCountAt(layers: number, L: number): number {
  return Math.pow(2, layers - L);
}

export function computeStates(p: Puzzle): PuzzleStates {
  const states: PuzzleStates = { 1: [...p.leaves] };
  for (let L = 2; L <= p.layers; L++) {
    const prev = states[L - 1];
    const g = p.gates[L];
    const cnt = g.length;
    const cur = new Array(cnt);
    for (let i = 0; i < cnt; i++) {
      cur[i] = evalGate(g[i], prev[2 * i], prev[2 * i + 1]);
    }
    states[L] = cur;
  }
  return states;
}

/**
 * Check if a puzzle has at least one solution (satisfiable assignment).
 * For small stages (<=5), we test brute force or greedy search.
 */
function isSolvable(p: Puzzle): boolean {
  const leafCount = p.leafCount;
  if (leafCount > 16) {
    // For large stages, standard random circuits have astronomically high satisfiability probability
    return true;
  }
  const totalCombinations = 1 << leafCount;
  const testPuzzle: Puzzle = {
    ...p,
    leaves: new Array(leafCount).fill(false),
  };

  for (let mask = 0; mask < totalCombinations; mask++) {
    for (let bit = 0; bit < leafCount; bit++) {
      testPuzzle.leaves[bit] = ((mask >> bit) & 1) === 1;
    }
    const states = computeStates(testPuzzle);
    if (states[p.layers][0]) {
      return true;
    }
  }
  return false;
}

export function generatePuzzle(stage: number): Puzzle {
  const layers = stage + 1;
  const leafCount = Math.pow(2, stage);

  let attempt = 0;
  while (attempt < 20) {
    attempt++;
    const gates: Record<number, GateType[]> = {};
    for (let L = 2; L <= layers; L++) {
      const cnt = nodeCountAt(layers, L);
      const arr = new Array<GateType>(cnt);
      for (let i = 0; i < cnt; i++) {
        arr[i] = randGate();
      }
      gates[L] = arr;
    }

    const puzzle: Puzzle = {
      stage,
      layers,
      leafCount,
      gates,
      leaves: new Array(leafCount).fill(false),
    };

    // Calculate initial state (all false)
    const initialStates = computeStates(puzzle);
    const initialRoot = initialStates[layers][0];

    // If initial is already true, it would be instantly cleared without interaction!
    // So if initial is true, flip a gate or retry so the player gets to think.
    if (!initialRoot && isSolvable(puzzle)) {
      return puzzle;
    }

    // If initial is true, try to invert root gate or a child gate
    if (initialRoot) {
      // Invert root gate
      const rootType = puzzle.gates[layers][0];
      if (rootType === 'AND') puzzle.gates[layers][0] = 'NAND';
      else if (rootType === 'NAND') puzzle.gates[layers][0] = 'AND';
      else if (rootType === 'OR') puzzle.gates[layers][0] = 'NOR';
      else if (rootType === 'NOR') puzzle.gates[layers][0] = 'OR';
      else if (rootType === 'XOR') puzzle.gates[layers][0] = 'XNOR';
      else puzzle.gates[layers][0] = 'XOR';

      const postInvert = computeStates(puzzle);
      if (!postInvert[layers][0] && isSolvable(puzzle)) {
        return puzzle;
      }
    }
  }

  // Fallback default
  const fallbackGates: Record<number, GateType[]> = {};
  for (let L = 2; L <= layers; L++) {
    const cnt = nodeCountAt(layers, L);
    fallbackGates[L] = new Array(cnt).fill('AND');
  }
  return {
    stage,
    layers,
    leafCount,
    gates: fallbackGates,
    leaves: new Array(leafCount).fill(false),
  };
}

export function computeCircuitLayout(
  p: Puzzle,
  states: PuzzleStates,
  containerWidth: number,
  containerHeight: number
): CircuitLayout {
  const { layers, leafCount } = p;
  const availW = Math.max(containerWidth - 32, 280);
  const availH = Math.max(containerHeight - 20, 320);

  // Dynamic horizontal node spacing
  const minSpacing = 36;
  const maxSpacing = 84;
  let spacing = availW / (leafCount + 1);
  spacing = Math.max(minSpacing, Math.min(maxSpacing, spacing));

  const contentW = Math.max(availW, (leafCount + 0.5) * spacing);
  const topPad = 64;
  const bottomPad = 56;

  // Calculate layer gap so tree fits elegantly into available vertical height
  const layerCount = layers - 1;
  const preferredGap = (availH - topPad - bottomPad) / Math.max(1, layerCount);
  const layerGap = Math.max(72, Math.min(130, preferredGap));
  const contentH = topPad + layerCount * layerGap + bottomPad;

  const xs: Record<number, number[]> = {};
  const ys: Record<number, number> = {};

  // Leaves (Layer 1) positions at the bottom
  xs[1] = new Array(leafCount);
  const offset = (contentW - (leafCount - 1) * spacing) / 2;
  for (let i = 0; i < leafCount; i++) {
    xs[1][i] = offset + i * spacing;
  }

  // Intermediate layers & Root
  for (let L = 2; L <= layers; L++) {
    const cnt = nodeCountAt(layers, L);
    xs[L] = new Array(cnt);
    for (let j = 0; j < cnt; j++) {
      xs[L][j] = (xs[L - 1][2 * j] + xs[L - 1][2 * j + 1]) / 2;
    }
  }

  // Y coordinates: Root (layers) is at the top (topPad), Leaves (1) is at the bottom
  for (let L = 1; L <= layers; L++) {
    ys[L] = topPad + (layers - L) * layerGap;
  }

  // Node radii scaling with spacing
  const baseR = Math.max(14, Math.min(24, spacing * 0.28));
  const leafSize = Math.max(26, Math.min(46, spacing * 0.62));

  // Build node and edge arrays
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  // Edges: from L-1 to L
  for (let L = 2; L <= layers; L++) {
    const cnt = nodeCountAt(layers, L);
    for (let i = 0; i < cnt; i++) {
      for (let c = 2 * i; c <= 2 * i + 1; c++) {
        const active = !!states[L - 1]?.[c];
        edges.push({
          id: `edge-${L - 1}-${c}-to-${L}-${i}`,
          fromLayer: L - 1,
          fromIndex: c,
          toLayer: L,
          toIndex: i,
          x1: xs[L - 1][c],
          y1: ys[L - 1],
          x2: xs[L][i],
          y2: ys[L],
          active,
        });
      }
    }
  }

  // Nodes
  for (let L = 1; L <= layers; L++) {
    const cnt = nodeCountAt(layers, L);
    const isLeaf = L === 1;
    const isRoot = L === layers;

    for (let k = 0; k < cnt; k++) {
      const active = !!states[L]?.[k];
      const gateType = isLeaf ? undefined : p.gates[L]?.[k];

      nodes.push({
        id: `node-${L}-${k}`,
        layer: L,
        index: k,
        x: xs[L][k],
        y: ys[L],
        isLeaf,
        isRoot,
        gateType,
        active,
      });
    }
  }

  return {
    stage: p.stage,
    layers,
    leafCount,
    width: contentW,
    height: contentH,
    nodeR: baseR,
    leafSize,
    nodes,
    edges,
  };
}

export function formatTime(ms: number): string {
  const ds = Math.floor(ms / 100);
  const d = ds % 10;
  const totalSec = Math.floor(ds / 10);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60);
  return `${m}:${String(s).padStart(2, '0')}.${d}`;
}
