import { ColorTheme } from '../types';

export interface ThemeColors {
  id: ColorTheme;
  name: string;
  nameJa: string;
  bg: string;
  panel: string;
  panelBorder: string;
  text: string;
  textMuted: string;
  edgeOff: string;
  edgeOn: string;
  nodeOff: string;
  nodeOn: string;
  nodeOnGlow: string;
  nodeBorder: string;
  leafOff: string;
  leafOn: string;
  accent: string;
  dotGridClass: string;
}

export const THEMES: Record<ColorTheme, ThemeColors> = {
  amber: {
    id: 'amber',
    name: 'Obsidian Amber',
    nameJa: '琥珀 (アンバー)',
    bg: '#14110e',
    panel: '#1f1a14',
    panelBorder: 'rgba(245, 158, 11, 0.18)',
    text: '#f5eee6',
    textMuted: '#9e8f7e',
    edgeOff: '#2b231b',
    edgeOn: '#f59e0b',
    nodeOff: '#262018',
    nodeOn: '#f59e0b',
    nodeOnGlow: 'rgba(245, 158, 11, 0.5)',
    nodeBorder: 'rgba(245, 158, 11, 0.3)',
    leafOff: '#2e251a',
    leafOn: '#d97706',
    accent: '#f59e0b',
    dotGridClass: 'bg-grid-dots',
  },
  cyan: {
    id: 'cyan',
    name: 'Midnight Cyan',
    nameJa: '青藍 (シアン)',
    bg: '#0a1017',
    panel: '#111b24',
    panelBorder: 'rgba(6, 182, 212, 0.2)',
    text: '#e2f1f8',
    textMuted: '#7895a7',
    edgeOff: '#192836',
    edgeOn: '#06b6d4',
    nodeOff: '#14222f',
    nodeOn: '#06b6d4',
    nodeOnGlow: 'rgba(6, 182, 212, 0.55)',
    nodeBorder: 'rgba(6, 182, 212, 0.35)',
    leafOff: '#182b3a',
    leafOn: '#0891b2',
    accent: '#06b6d4',
    dotGridClass: 'bg-grid-dots',
  },
  emerald: {
    id: 'emerald',
    name: 'Phosphor Green',
    nameJa: '翠嵐 (エメラルド)',
    bg: '#0a130f',
    panel: '#122019',
    panelBorder: 'rgba(16, 185, 129, 0.2)',
    text: '#e3f7ed',
    textMuted: '#78a28c',
    edgeOff: '#182d23',
    edgeOn: '#10b981',
    nodeOff: '#13261d',
    nodeOn: '#10b981',
    nodeOnGlow: 'rgba(16, 185, 129, 0.55)',
    nodeBorder: 'rgba(16, 185, 129, 0.35)',
    leafOff: '#173425',
    leafOn: '#059669',
    accent: '#10b981',
    dotGridClass: 'bg-grid-dots',
  },
  paper: {
    id: 'paper',
    name: 'Washi Vermilion',
    nameJa: '和紙 (朱)',
    bg: '#f3ede1',
    panel: '#e7decb',
    panelBorder: 'rgba(0, 0, 0, 0.12)',
    text: '#2d261d',
    textMuted: '#7d7263',
    edgeOff: '#d5cab3',
    edgeOn: '#d94e28',
    nodeOff: '#c2b59b',
    nodeOn: '#d94e28',
    nodeOnGlow: 'rgba(217, 78, 40, 0.45)',
    nodeBorder: 'rgba(0, 0, 0, 0.15)',
    leafOff: '#b8a98c',
    leafOn: '#c23b16',
    accent: '#d94e28',
    dotGridClass: 'bg-grid-dots-light',
  },
};
