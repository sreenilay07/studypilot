import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Info, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

export function KnowledgeMap({ knowledgeMap = { nodes: [], edges: [] }, weakTopics = [], onSelectConcept }) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);

  const nodes = knowledgeMap.nodes || [];
  const edges = knowledgeMap.edges || [];

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.6));
  const handleResetZoom = () => setZoom(1);

  // Position calculation for nodes in a clean circular / grid layout
  const getNodePosition = (index, total) => {
    if (total <= 1) return { x: 300, y: 180 };
    const radius = 140;
    const centerX = 300;
    const centerY = 180;
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const nodePositions = nodes.reduce((acc, node, index) => {
    acc[node.id || node.label] = getNodePosition(index, nodes.length);
    return acc;
  }, {});

  const getNodeStatus = (nodeLabel) => {
    const weakMatch = (weakTopics || []).find(
      (w) => w.concept && w.concept.toLowerCase().includes((nodeLabel || '').toLowerCase())
    );
    if (!weakMatch) return 'Strong';
    return weakMatch.status || 'Needs Revision';
  };

  return (
    <div className="space-y-4">
      {/* Legend & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F5F1E8] border border-[#172B3A]/20 rounded-md">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-semibold text-[#172B3A]/70 uppercase tracking-wider">Legend:</span>
          <StatusBadge status="Strong" />
          <StatusBadge status="Needs Revision" />
          <StatusBadge status="Weak" />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 text-[#172B3A] hover:bg-[#172B3A]/10 rounded border border-[#172B3A]/20"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-2 text-[#172B3A]/70">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 text-[#172B3A] hover:bg-[#172B3A]/10 rounded border border-[#172B3A]/20"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset View"
            className="p-1.5 text-[#172B3A] hover:bg-[#172B3A]/10 rounded border border-[#172B3A]/20 ml-1"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] overflow-hidden min-h-[380px] flex items-center justify-center">
        {!nodes.length ? (
          <div className="text-center py-12 text-[#172B3A]/60">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No knowledge map concepts generated yet.</p>
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <svg className="w-[600px] h-[360px] overflow-visible">
              {/* Draw Edges */}
              {edges.map((edge, idx) => {
                const start = nodePositions[edge.from] || { x: 300, y: 180 };
                const end = nodePositions[edge.to] || { x: 300, y: 180 };
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;

                return (
                  <g key={idx}>
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="#172B3A"
                      strokeOpacity="0.3"
                      strokeWidth="1.5"
                      strokeDasharray={edge.relationship ? '4 3' : 'none'}
                    />
                    {edge.relationship && (
                      <text
                        x={midX}
                        y={midY - 4}
                        fill="#172B3A"
                        fontSize="9"
                        fontFamily="Inter"
                        opacity="0.65"
                        textAnchor="middle"
                      >
                        {edge.relationship}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {nodes.map((node) => {
                const pos = nodePositions[node.id || node.label] || { x: 300, y: 180 };
                const status = getNodeStatus(node.label);
                const isSelected = selectedNode?.label === node.label;

                let borderStyle = 'stroke="#172B3A" strokeWidth="1.5"';
                if (status === 'Weak') {
                  borderStyle = 'stroke="#172B3A" strokeWidth="2.5" strokeDasharray="3 3"';
                } else if (status === 'Needs Revision') {
                  borderStyle = 'stroke="#172B3A" strokeWidth="1.5" strokeOpacity="0.5"';
                }

                return (
                  <g
                    key={node.id || node.label}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedNode(node);
                      if (onSelectConcept) onSelectConcept(node.label);
                    }}
                  >
                    <rect
                      x="-70"
                      y="-20"
                      width="140"
                      height="40"
                      rx="6"
                      fill={isSelected ? '#172B3A' : '#F5F1E8'}
                      {...({ stroke: '#172B3A', strokeWidth: isSelected ? 2 : 1 })}
                    />
                    <text
                      x="0"
                      y="4"
                      fill={isSelected ? '#F5F1E8' : '#172B3A'}
                      fontSize="12"
                      fontWeight="600"
                      fontFamily="Inter"
                      textAnchor="middle"
                    >
                      {node.label.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Selected Node Details Drawer / Panel */}
      {selectedNode && (
        <div className="p-4 border-2 border-[#172B3A] rounded-md bg-[#F5F1E8] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-[#172B3A]/60 uppercase tracking-wider">Concept Focus</span>
              <h4 className="text-lg font-bold text-[#172B3A] font-display">{selectedNode.label}</h4>
            </div>
            <StatusBadge status={getNodeStatus(selectedNode.label)} />
          </div>

          <p className="text-xs text-[#172B3A]/80 leading-relaxed">
            Key node in current study material. Understanding this concept is essential for mastering related topic mechanisms.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#172B3A]/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedNode(null)}
            >
              Close Details
            </Button>
            {onSelectConcept && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelectConcept(selectedNode.label)}
              >
                Revise Concept <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeMap;
