import React, { useState, useRef, useEffect } from 'react';
import { CircuitLayout, LayoutNode, LayoutEdge, GateType } from '../types';
import { ThemeColors } from '../lib/theme';
import { GATE_DEFINITIONS } from '../lib/logicEngine';
import { Sparkles, Info } from 'lucide-react';

export type GateDisplayMode = 'symbol' | 'name' | 'hidden';

interface CircuitBoardProps {
  layout: CircuitLayout;
  gateDisplayMode: GateDisplayMode;
  theme: ThemeColors;
  isCleared: boolean;
  onToggleLeaf: (index: number) => void;
  onTriggerClear: () => void;
}

export const CircuitBoard: React.FC<CircuitBoardProps> = ({
  layout,
  gateDisplayMode,
  theme,
  isCleared,
  onToggleLeaf,
  onTriggerClear,
}) => {
  const [hoveredNode, setHoveredNode] = useState<LayoutNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center on stage load
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      const scrollX = (el.scrollWidth - el.clientWidth) / 2;
      el.scrollLeft = Math.max(0, scrollX);
    }
  }, [layout.stage, layout.leafCount]);

  const rootNode = layout.nodes.find((n) => n.isRoot);
  const isApexReady = !!rootNode?.active;

  return (
    <div
      ref={containerRef}
      id="circuit-board-container"
      className="relative flex-1 w-full h-full overflow-auto flex items-center justify-center p-4 select-none touch-pan-x touch-pan-y"
    >
      {/* Node Inspector Tooltip */}
      {hoveredNode && !hoveredNode.isLeaf && hoveredNode.gateType && (
        <div
          id="node-inspector-tooltip"
          className="absolute z-30 pointer-events-none px-3 py-2 rounded-xl border text-xs font-mono shadow-xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: `${theme.panel}fa`,
            borderColor: hoveredNode.active ? theme.accent : theme.panelBorder,
            color: theme.text,
            left: `clamp(16px, ${hoveredNode.x}px, calc(100% - 180px))`,
            top: `${Math.max(16, hoveredNode.y - 65)}px`,
            boxShadow: hoveredNode.active ? `0 0 20px ${theme.nodeOnGlow}` : '0 10px 25px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <span style={{ color: theme.accent }}>{hoveredNode.gateType} GATE</span>
            <span className="opacity-60 text-[10px]">({GATE_DEFINITIONS[hoveredNode.gateType].formula})</span>
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
            {GATE_DEFINITIONS[hoveredNode.gateType].descriptionJa}
          </div>
          <div className="mt-1 text-[10px] flex items-center gap-1.5">
            <span>出力:</span>
            <span
              className="px-1.5 py-0.2 rounded font-bold"
              style={{
                backgroundColor: hoveredNode.active ? `${theme.accent}30` : 'rgba(255,255,255,0.1)',
                color: hoveredNode.active ? theme.accent : theme.textMuted,
              }}
            >
              {hoveredNode.active ? '1 (ON)' : '0 (OFF)'}
            </span>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        id="circuit-svg-canvas"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        height={layout.height}
        className="max-w-none transition-all duration-300"
        style={{
          filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.25))',
        }}
      >
        <defs>
          {/* Signal Glow Filters */}
          <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="apex-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Linear gradient for active edges */}
          <linearGradient id="active-wire-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={theme.edgeOn} stopOpacity="0.85" />
            <stop offset="100%" stopColor={theme.edgeOn} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* 1. EDGES / WIRES */}
        <g id="circuit-edges" className="circuit-wires">
          {layout.edges.map((edge: LayoutEdge) => {
            // Cubic bezier trace from child to parent
            const midY = (edge.y1 + edge.y2) / 2;
            const pathD = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`;

            return (
              <g key={edge.id} className="edge-group">
                {/* Background base wire */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={edge.active ? theme.edgeOn : theme.edgeOff}
                  strokeWidth={edge.active ? 2.8 : 1.8}
                  strokeLinecap="round"
                  className="transition-colors duration-200"
                  opacity={edge.active ? 0.95 : 0.65}
                />

                {/* Pulsing signal overlay if active */}
                {edge.active && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    className="signal-flowing"
                    opacity={0.7}
                    style={{ filter: 'url(#edge-glow)' }}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* 2. NODES */}
        <g id="circuit-nodes">
          {layout.nodes.map((node: LayoutNode) => {
            // A: LEAF NODE (Input Switch)
            if (node.isLeaf) {
              const s = layout.leafSize;
              const x = node.x - s / 2;
              const y = node.y - s / 2;
              const active = node.active;

              return (
                <g
                  key={node.id}
                  id={`leaf-switch-${node.index}`}
                  className="cursor-pointer group select-none"
                  onClick={() => onToggleLeaf(node.index)}
                  tabIndex={0}
                  role="button"
                  aria-label={`スイッチ ${node.index + 1}: ${active ? 'ON' : 'OFF'}`}
                >
                  {/* Active glow halo */}
                  {active && (
                    <rect
                      x={x - 4}
                      y={y - 4}
                      width={s + 8}
                      height={s + 8}
                      rx={s * 0.38}
                      fill={theme.leafOn}
                      opacity={0.35}
                      className="animate-pulse"
                      style={{ filter: 'url(#edge-glow)' }}
                    />
                  )}

                  {/* Switch Pad */}
                  <rect
                    x={x}
                    y={y}
                    width={s}
                    height={s}
                    rx={s * 0.3}
                    fill={active ? theme.leafOn : theme.leafOff}
                    stroke={active ? theme.accent : theme.nodeBorder}
                    strokeWidth={active ? 2 : 1.2}
                    className="transition-all duration-150 group-hover:scale-105 group-active:scale-90"
                    style={{
                      filter: active ? `drop-shadow(0 0 8px ${theme.nodeOnGlow})` : undefined,
                    }}
                  />

                  {/* Tactile Inner LED */}
                  <circle
                    cx={node.x}
                    cy={node.y - s * 0.12}
                    r={Math.max(2.5, s * 0.12)}
                    fill={active ? '#ffffff' : 'rgba(0,0,0,0.45)'}
                    className="transition-colors duration-150"
                  />

                  {/* State Text: 1 or 0 */}
                  <text
                    x={node.x}
                    y={node.y + s * 0.28}
                    textAnchor="middle"
                    fontSize={Math.max(10, s * 0.34)}
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                    fill={active ? '#ffffff' : theme.textMuted}
                    className="pointer-events-none"
                  >
                    {active ? '1' : '0'}
                  </text>

                  {/* Key index below */}
                  <text
                    x={node.x}
                    y={node.y + s * 0.5 + 13}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    fill={theme.textMuted}
                    opacity={0.7}
                    className="pointer-events-none"
                  >
                    #{node.index + 1}
                  </text>
                </g>
              );
            }

            // B: ROOT APEX NODE (LUMEN CORE)
            if (node.isRoot) {
              const r = layout.nodeR * 1.55;
              const active = node.active;

              return (
                <g
                  key={node.id}
                  id="apex-core-node"
                  className={`select-none ${active ? 'cursor-pointer group' : ''}`}
                  onClick={() => {
                    if (active) onTriggerClear();
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  role="button"
                  aria-label={active ? 'コア点灯 - クリックしてクリア' : '最上段コア (未点灯)'}
                >
                  {/* Radiant expanding pulse rings when active */}
                  {active && (
                    <>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r * 1.3}
                        fill="none"
                        stroke={theme.nodeOn}
                        strokeWidth={1.5}
                        opacity={0.6}
                        className="animate-ping"
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r * 1.7}
                        fill="none"
                        stroke={theme.accent}
                        strokeWidth={1}
                        opacity={0.3}
                        className="animate-pulse"
                      />
                    </>
                  )}

                  {/* Core Base Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={active ? theme.nodeOn : theme.nodeOff}
                    stroke={active ? '#ffffff' : theme.nodeBorder}
                    strokeWidth={active ? 2.5 : 1.5}
                    className="transition-all duration-200 group-hover:scale-105 group-active:scale-95"
                    style={{
                      filter: active ? `url(#apex-glow) drop-shadow(0 0 16px ${theme.nodeOnGlow})` : undefined,
                    }}
                  />

                  {/* Inner Core Symbol */}
                  {active ? (
                    <g className="pointer-events-none">
                      <circle cx={node.x} cy={node.y} r={r * 0.45} fill="#ffffff" />
                      <text
                        x={node.x}
                        y={node.y + r + 18}
                        textAnchor="middle"
                        fontSize={11}
                        fontFamily="var(--font-mono)"
                        fontWeight="700"
                        fill={theme.accent}
                        className="animate-pulse"
                      >
                        ✦ TAP TO IGNITE ✦
                      </text>
                    </g>
                  ) : (
                    <g className="pointer-events-none">
                      <circle cx={node.x} cy={node.y} r={r * 0.35} fill="rgba(0,0,0,0.3)" />
                      {node.gateType && gateDisplayMode !== 'hidden' && (
                        <text
                          x={node.x}
                          y={node.y + 4}
                          textAnchor="middle"
                          fontSize={Math.max(10, r * 0.55)}
                          fontFamily="var(--font-mono)"
                          fontWeight="700"
                          fill={theme.textMuted}
                        >
                          {gateDisplayMode === 'symbol'
                            ? GATE_DEFINITIONS[node.gateType].symbol
                            : node.gateType}
                        </text>
                      )}
                      <text
                        x={node.x}
                        y={node.y - r - 8}
                        textAnchor="middle"
                        fontSize={10}
                        fontFamily="var(--font-mono)"
                        fill={theme.textMuted}
                        opacity={0.8}
                      >
                        APEX
                      </text>
                    </g>
                  )}
                </g>
              );
            }

            // C: INTERMEDIATE LOGIC GATE NODE
            const r = layout.nodeR;
            const active = node.active;
            const gateDef = node.gateType ? GATE_DEFINITIONS[node.gateType] : null;

            return (
              <g
                key={node.id}
                id={`gate-node-${node.layer}-${node.index}`}
                className="cursor-pointer group select-none"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow ring if active */}
                {active && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r + 3}
                    fill="none"
                    stroke={theme.nodeOn}
                    strokeWidth={1.5}
                    opacity={0.5}
                    className="animate-pulse"
                  />
                )}

                {/* Gate Body Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={active ? theme.nodeOn : theme.nodeOff}
                  stroke={active ? '#ffffff' : theme.nodeBorder}
                  strokeWidth={active ? 2 : 1.2}
                  className="transition-all duration-200 group-hover:scale-110"
                  style={{
                    filter: active ? `drop-shadow(0 0 10px ${theme.nodeOnGlow})` : undefined,
                  }}
                />

                {/* Gate Symbol / Label */}
                {gateDef && gateDisplayMode !== 'hidden' && (
                  <text
                    x={node.x}
                    y={node.y + Math.max(3, r * 0.32)}
                    textAnchor="middle"
                    fontSize={gateDisplayMode === 'name' ? Math.max(8, r * 0.6) : Math.max(10, r * 0.85)}
                    fontFamily="var(--font-mono)"
                    fontWeight="800"
                    fill={active ? '#ffffff' : theme.textMuted}
                    className="pointer-events-none select-none"
                  >
                    {gateDisplayMode === 'symbol' ? gateDef.symbol : gateDef.type}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
