export type GateType = 'AND' | 'OR' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

export interface GateDefinition {
  type: GateType;
  name: string;
  symbol: string;
  mathSymbol: string;
  formula: string;
  description: string;
  descriptionJa: string;
  truthTable: Array<{ a: 0 | 1; b: 0 | 1; out: 0 | 1 }>;
}

export interface Puzzle {
  stage: number;
  layers: number;
  leafCount: number;
  gates: Record<number, GateType[]>; // Layer 2..layers
  leaves: boolean[]; // Layer 1 states
}

export type PuzzleStates = Record<number, boolean[]>;

export interface LayoutNode {
  id: string;
  layer: number;
  index: number;
  x: number;
  y: number;
  isLeaf: boolean;
  isRoot: boolean;
  gateType?: GateType;
  active: boolean;
}

export interface LayoutEdge {
  id: string;
  fromLayer: number;
  fromIndex: number;
  toLayer: number;
  toIndex: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
}

export interface CircuitLayout {
  stage: number;
  layers: number;
  leafCount: number;
  width: number;
  height: number;
  nodeR: number;
  leafSize: number;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
}

export type ColorTheme = 'amber' | 'cyan' | 'emerald' | 'paper';

export interface StageRecord {
  bestTimeMs?: number;
  bestMoves?: number;
  clearDate?: string;
}

export type BestRecords = Record<number, StageRecord>;
