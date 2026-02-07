'use client';

import { useState, useMemo, useEffect } from 'react';
import { roadmapNodes, roadmapEdges, RoadmapNode } from '@/data/roadmapData';
import Link from 'next/link';

interface Problem {
    _id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    order: number;
}

interface RoadmapProps {
    problems: Problem[];
    solvedProblemIds: string[];
}

// Node dimensions
const NODE_WIDTH = 140;
const NODE_HEIGHT = 50;

export function Roadmap({ problems, solvedProblemIds }: RoadmapProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate progress for each category
    const categoryProgress = useMemo(() => {
        const progress: Record<string, { solved: number; total: number }> = {};
        
        for (const node of roadmapNodes) {
            const categoryProblems = problems.filter(p => p.category === node.category);
            const solvedCount = categoryProblems.filter(p => solvedProblemIds.includes(p._id)).length;
            progress[node.category] = {
                solved: solvedCount,
                total: categoryProblems.length,
            };
        }
        
        return progress;
    }, [problems, solvedProblemIds]);

    // Get problems for selected category
    const selectedProblems = useMemo(() => {
        if (!selectedCategory) return [];
        return problems
            .filter(p => p.category === selectedCategory)
            .sort((a, b) => a.order - b.order);
    }, [problems, selectedCategory]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Hard': return '#ef4444';
            default: return '#71717a';
        }
    };

    const getNodeColor = (progress: { solved: number; total: number }) => {
        if (progress.total === 0) return { bg: 'rgba(99, 102, 241, 0.6)', border: 'rgba(99, 102, 241, 0.8)', glow: 'rgba(99, 102, 241, 0.4)' };
        const ratio = progress.solved / progress.total;
        if (ratio === 1) return { bg: 'rgba(16, 185, 129, 0.7)', border: 'rgba(16, 185, 129, 0.9)', glow: 'rgba(16, 185, 129, 0.5)' };
        if (ratio > 0) return { bg: 'rgba(99, 102, 241, 0.7)', border: 'rgba(99, 102, 241, 0.9)', glow: 'rgba(99, 102, 241, 0.5)' };
        return { bg: 'rgba(99, 102, 241, 0.5)', border: 'rgba(99, 102, 241, 0.7)', glow: 'rgba(99, 102, 241, 0.3)' };
    };

    // Generate curved path between two nodes - connecting from bottom center of 'from' to top center of 'to'
    const generatePath = (from: RoadmapNode, to: RoadmapNode) => {
        // From: bottom center of the node
        const fromX = from.x;
        const fromY = from.y + NODE_HEIGHT;
        
        // To: top center of the node
        const toX = to.x;
        const toY = to.y;
        
        // Control points for smooth bezier curve
        const midY = (fromY + toY) / 2;
        
        return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
    };

    // Check if an edge is connected to hovered node
    const isEdgeHighlighted = (edge: { from: string; to: string }) => {
        return hoveredNode === edge.from || hoveredNode === edge.to;
    };

    // Mobile Card Component
    const MobileRoadmapCard = ({ node }: { node: RoadmapNode }) => {
        const progress = categoryProgress[node.category] || { solved: 0, total: 0 };
        const colors = getNodeColor(progress);
        const isComplete = progress.total > 0 && progress.solved === progress.total;
        const progressPercent = progress.total > 0 ? (progress.solved / progress.total) * 100 : 0;

        return (
            <button
                onClick={() => setSelectedCategory(node.category)}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg.replace('0.', '0.').replace(/[\d.]+\)$/, (m) => (parseFloat(m) * 0.7).toFixed(1) + ')')})`,
                    border: `2px solid ${colors.border}`,
                    borderRadius: 14,
                    color: isComplete ? '#34d399' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: `0 4px 15px rgba(0, 0, 0, 0.3), 0 0 15px ${colors.glow}`,
                    backdropFilter: 'blur(8px)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Progress bar */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'rgba(0,0,0,0.3)',
                }}>
                    <div style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        background: isComplete 
                            ? 'linear-gradient(90deg, #10b981, #34d399)' 
                            : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        transition: 'width 0.3s ease',
                    }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{node.label}</div>
                        <div style={{ 
                            fontSize: 13, 
                            color: isComplete ? '#34d399' : '#a1a1aa',
                            fontWeight: 500,
                        }}>
                            {progress.solved}/{progress.total} completed
                        </div>
                    </div>
                    <div style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: isComplete ? '#34d399' : '#6366f1',
                    }}>
                        {Math.round(progressPercent)}%
                    </div>
                </div>
            </button>
        );
    };

    // Mobile Layout
    if (isMobile) {
        return (
            <div style={{ padding: '0 16px' }}>
                {/* CSS for mobile */}
                <style>{`
                    .mobile-roadmap-card {
                        transition: transform 0.2s ease, box-shadow 0.2s ease;
                    }
                    .mobile-roadmap-card:active {
                        transform: scale(0.98);
                    }
                `}</style>
                
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 12,
                    paddingBottom: 24,
                }}>
                    {roadmapNodes.map((node) => (
                        <div key={node.id} className="mobile-roadmap-card">
                            <MobileRoadmapCard node={node} />
                        </div>
                    ))}
                </div>

                {/* Problems Modal */}
                {selectedCategory && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(8px)',
                        }}
                        onClick={() => setSelectedCategory(null)}
                    >
                        <div
                            style={{
                                width: '100%',
                                maxHeight: '85vh',
                                background: '#0a0a0f',
                                borderRadius: '20px 20px 0 0',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                overflow: 'hidden',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Handle bar */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                padding: '12px 0 8px' 
                            }}>
                                <div style={{ 
                                    width: 40, 
                                    height: 4, 
                                    borderRadius: 2, 
                                    background: 'rgba(255,255,255,0.2)' 
                                }} />
                            </div>
                            
                            {/* Modal Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 20px 16px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            }}>
                                <h2 style={{ 
                                    fontSize: 18, 
                                    fontWeight: 700, 
                                    color: '#fff',
                                    margin: 0,
                                }}>
                                    {selectedCategory}
                                </h2>
                                <span style={{ fontSize: 14, color: '#71717a' }}>
                                    {categoryProgress[selectedCategory]?.solved || 0}/{categoryProgress[selectedCategory]?.total || 0}
                                </span>
                            </div>
                            
                            {/* Problems List */}
                            <div style={{ 
                                padding: 16, 
                                maxHeight: 'calc(85vh - 100px)', 
                                overflowY: 'auto',
                                WebkitOverflowScrolling: 'touch',
                            }}>
                                {selectedProblems.map((problem) => {
                                    const isSolved = solvedProblemIds.includes(problem._id);
                                    return (
                                        <Link
                                            key={problem._id}
                                            href={`/problem/${problem._id}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                padding: '14px 16px',
                                                marginBottom: 8,
                                                background: isSolved 
                                                    ? 'rgba(16, 185, 129, 0.1)' 
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                border: `1px solid ${isSolved 
                                                    ? 'rgba(16, 185, 129, 0.2)' 
                                                    : 'rgba(255, 255, 255, 0.06)'}`,
                                                borderRadius: 12,
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {/* Status Icon */}
                                            <div style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: isSolved 
                                                    ? '#10b981' 
                                                    : 'rgba(255, 255, 255, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 12,
                                                color: '#fff',
                                                flexShrink: 0,
                                            }}>
                                                {isSolved ? '✓' : ''}
                                            </div>
                                            
                                            {/* Problem Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ 
                                                    fontSize: 15, 
                                                    fontWeight: 500, 
                                                    color: '#fff',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {problem.title}
                                                </div>
                                            </div>
                                            
                                            {/* Difficulty Badge */}
                                            <span style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: getDifficultyColor(problem.difficulty),
                                                background: `${getDifficultyColor(problem.difficulty)}20`,
                                                padding: '5px 10px',
                                                borderRadius: 8,
                                                flexShrink: 0,
                                            }}>
                                                {problem.difficulty}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Desktop Layout (original graph view)
    return (
        <div style={{ position: 'relative', width: '100%', minHeight: 900 }}>
            {/* CSS Animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.02); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 10px var(--glow-color); }
                    50% { box-shadow: 0 0 25px var(--glow-color), 0 0 40px var(--glow-color); }
                }
                @keyframes flowLine {
                    0% { stroke-dashoffset: 20; }
                    100% { stroke-dashoffset: 0; }
                }
                .roadmap-node {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .roadmap-node:hover {
                    transform: scale(1.08) translateY(-2px);
                }
                .roadmap-edge {
                    transition: all 0.3s ease;
                }
                .roadmap-edge-highlighted {
                    stroke: rgba(99, 102, 241, 0.8) !important;
                    stroke-width: 3 !important;
                    stroke-dasharray: 8 4;
                    animation: flowLine 0.5s linear infinite;
                }
            `}</style>

            {/* SVG for connections */}
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                }}
                viewBox="0 0 800 900"
                preserveAspectRatio="xMidYMin meet"
            >
                <defs>
                    <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.6)" />
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0.3)" />
                    </linearGradient>
                    <linearGradient id="edgeGradientHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 1)" />
                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0.8)" />
                    </linearGradient>
                </defs>
                {roadmapEdges.map((edge, index) => {
                    const fromNode = roadmapNodes.find(n => n.id === edge.from);
                    const toNode = roadmapNodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    
                    const highlighted = isEdgeHighlighted(edge);
                    
                    return (
                        <path
                            key={index}
                            className={`roadmap-edge ${highlighted ? 'roadmap-edge-highlighted' : ''}`}
                            d={generatePath(fromNode, toNode)}
                            fill="none"
                            stroke={highlighted ? "url(#edgeGradientHighlight)" : "url(#edgeGradient)"}
                            strokeWidth={highlighted ? 3 : 2}
                            strokeLinecap="round"
                            markerEnd={highlighted ? "url(#arrowhead-highlight)" : "url(#arrowhead)"}
                        />
                    );
                })}
            </svg>

            {/* Nodes */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: 900,
                }}
            >
                {roadmapNodes.map((node) => {
                    const progress = categoryProgress[node.category] || { solved: 0, total: 0 };
                    const colors = getNodeColor(progress);
                    const isComplete = progress.total > 0 && progress.solved === progress.total;
                    const isHovered = hoveredNode === node.id;
                    
                    return (
                        <button
                            key={node.id}
                            className="roadmap-node"
                            onClick={() => setSelectedCategory(node.category)}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            style={{
                                position: 'absolute',
                                left: `calc(${(node.x / 800) * 100}% - 70px)`,
                                top: node.y,
                                width: NODE_WIDTH,
                                height: NODE_HEIGHT,
                                padding: '8px 12px',
                                background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg.replace('0.', '0.').replace(/[\d.]+\)$/, (m) => (parseFloat(m) * 0.7).toFixed(1) + ')')})`,
                                border: `2px solid ${colors.border}`,
                                borderRadius: 12,
                                color: isComplete ? '#34d399' : '#fff',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'center',
                                boxShadow: isHovered 
                                    ? `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}` 
                                    : `0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px ${colors.glow}`,
                                backdropFilter: 'blur(8px)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Progress bar background */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 3,
                                background: 'rgba(0,0,0,0.3)',
                            }}>
                                <div style={{
                                    width: `${progress.total > 0 ? (progress.solved / progress.total) * 100 : 0}%`,
                                    height: '100%',
                                    background: isComplete 
                                        ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                        : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                    transition: 'width 0.3s ease',
                                }} />
                            </div>
                            <div style={{ marginBottom: 2, position: 'relative', zIndex: 1 }}>{node.label}</div>
                            <div style={{ 
                                fontSize: 10, 
                                color: isComplete ? '#34d399' : '#a1a1aa',
                                fontWeight: 500,
                                position: 'relative',
                                zIndex: 1,
                            }}>
                                {progress.solved}/{progress.total}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Problems Modal */}
            {selectedCategory && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(8px)',
                        padding: 24,
                    }}
                    onClick={() => setSelectedCategory(null)}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 500,
                            maxHeight: '80vh',
                            background: '#0a0a0f',
                            borderRadius: 16,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        }}>
                            <h2 style={{ 
                                fontSize: 18, 
                                fontWeight: 700, 
                                color: '#fff',
                                margin: 0,
                            }}>
                                {selectedCategory}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 13, color: '#71717a' }}>
                                    {categoryProgress[selectedCategory]?.solved || 0}/{categoryProgress[selectedCategory]?.total || 0} solved
                                </span>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 6,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#a1a1aa',
                                        fontSize: 16,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        {/* Problems List */}
                        <div style={{ 
                            padding: 12, 
                            maxHeight: 'calc(80vh - 60px)', 
                            overflowY: 'auto' 
                        }}>
                            {selectedProblems.map((problem) => {
                                const isSolved = solvedProblemIds.includes(problem._id);
                                return (
                                    <Link
                                        key={problem._id}
                                        href={`/problem/${problem._id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '12px 14px',
                                            marginBottom: 6,
                                            background: isSolved 
                                                ? 'rgba(16, 185, 129, 0.1)' 
                                                : 'rgba(255, 255, 255, 0.03)',
                                            border: `1px solid ${isSolved 
                                                ? 'rgba(16, 185, 129, 0.2)' 
                                                : 'rgba(255, 255, 255, 0.06)'}`,
                                            borderRadius: 10,
                                            textDecoration: 'none',
                                            transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = isSolved 
                                                ? 'rgba(16, 185, 129, 0.15)' 
                                                : 'rgba(255, 255, 255, 0.06)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = isSolved 
                                                ? 'rgba(16, 185, 129, 0.1)' 
                                                : 'rgba(255, 255, 255, 0.03)';
                                        }}
                                    >
                                        {/* Status Icon */}
                                        <div style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            background: isSolved 
                                                ? '#10b981' 
                                                : 'rgba(255, 255, 255, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            color: '#fff',
                                            flexShrink: 0,
                                        }}>
                                            {isSolved ? '✓' : ''}
                                        </div>
                                        
                                        {/* Problem Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ 
                                                fontSize: 14, 
                                                fontWeight: 500, 
                                                color: '#fff',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {problem.title}
                                            </div>
                                        </div>
                                        
                                        {/* Difficulty Badge */}
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: getDifficultyColor(problem.difficulty),
                                            background: `${getDifficultyColor(problem.difficulty)}20`,
                                            padding: '4px 8px',
                                            borderRadius: 6,
                                            flexShrink: 0,
                                        }}>
                                            {problem.difficulty}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

