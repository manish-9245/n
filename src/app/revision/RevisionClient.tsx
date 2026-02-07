'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { RevisionCarousel } from './RevisionCarousel';

interface Solution {
    _id: string;
    name?: string;
    language: string;
    code: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    explanation?: string;
}

interface Note {
    _id: string;
    content: string;
}

interface RevisionProblem {
    _id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    description: string;
    order: number;
    solutions: Solution[];
    note: Note | null;
}

interface RevisionClientProps {
    problems: RevisionProblem[];
}

export function RevisionClient({ problems }: RevisionClientProps) {
    const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = useMemo(() => {
        return ['All', ...Array.from(new Set(problems.map(p => p.category)))];
    }, [problems]);

    const filteredProblems = useMemo(() => {
        return problems.filter(p => {
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [problems, selectedCategory, searchQuery]);

    // Only show problems that have solutions or notes
    const problemsWithContent = useMemo(() => {
        return filteredProblems.filter(p => p.solutions.length > 0 || p.note);
    }, [filteredProblems]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Hard': return '#ef4444';
            default: return '#71717a';
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0a0a0f 0%, #000 100%)',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <style>{`
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                }
                @media (min-width: 769px) {
                    .desktop-only { display: block !important; }
                }
            `}</style>
            
            {/* Filters */}
            <section style={{
                position: 'sticky',
                top: 64,
                zIndex: 40,
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '12px clamp(12px, 4vw, 24px)',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                }}>
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: '1 1 200px',
                            maxWidth: 300,
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontSize: 14,
                            outline: 'none',
                        }}
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontSize: 14,
                            outline: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat} style={{ background: '#18181b' }}>{cat}</option>
                        ))}
                    </select>
                    <span style={{ fontSize: 13, color: '#71717a' }}>
                        {problemsWithContent.length} problems with content
                    </span>
                </div>
            </section>

            {/* Problem List */}
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px clamp(12px, 4vw, 24px)' }}>
                {problemsWithContent.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#a1a1aa', marginBottom: 8 }}>
                            No problems with solutions or notes
                        </h3>
                        <p style={{ color: '#71717a' }}>
                            Start solving problems and adding notes to see them here!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {problemsWithContent.map((problem) => {
                            const isExpanded = expandedProblem === problem._id;
                            const diffColor = getDifficultyColor(problem.difficulty);

                            return (
                                <div
                                    key={problem._id}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 16,
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {/* Problem Header - Clickable */}
                                    <button
                                        onClick={() => setExpandedProblem(isExpanded ? null : problem._id)}
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16,
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {/* Expand Icon */}
                                        <span style={{
                                            fontSize: 16,
                                            color: '#71717a',
                                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                        }}>
                                            ▶
                                        </span>

                                        {/* Order */}
                                        <span style={{
                                            fontSize: 12,
                                            fontFamily: 'monospace',
                                            color: '#52525b',
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '4px 8px',
                                            borderRadius: 6,
                                        }}>
                                            #{problem.order}
                                        </span>

                                        {/* Title */}
                                        <span style={{
                                            flex: 1,
                                            fontSize: 15,
                                            fontWeight: 600,
                                            color: '#fff',
                                        }}>
                                            {problem.title}
                                        </span>

                                        {/* Category - Desktop Only */}
                                        <span className="desktop-only" style={{
                                            fontSize: 11,
                                            color: '#71717a',
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '4px 10px',
                                            borderRadius: 6,
                                        }}>
                                            {problem.category}
                                        </span>

                                        {/* Difficulty */}
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: diffColor,
                                            background: `${diffColor}20`,
                                            padding: '4px 10px',
                                            borderRadius: 6,
                                        }}>
                                            {problem.difficulty}
                                        </span>

                                        {/* Content indicators */}
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {problem.solutions.length > 0 && (
                                                <span style={{
                                                    fontSize: 10,
                                                    color: '#6366f1',
                                                    background: 'rgba(99, 102, 241, 0.15)',
                                                    padding: '3px 6px',
                                                    borderRadius: 4,
                                                }}>
                                                    {problem.solutions.length} sol
                                                </span>
                                            )}
                                            {problem.note && (
                                                <span style={{
                                                    fontSize: 10,
                                                    color: '#f59e0b',
                                                    background: 'rgba(245, 158, 11, 0.15)',
                                                    padding: '3px 6px',
                                                    borderRadius: 4,
                                                }}>
                                                    📝
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div style={{
                                            borderTop: '1px solid rgba(255,255,255,0.08)',
                                            padding: '20px',
                                        }}>
                                            {/* Description */}
                                            {problem.description && (
                                                <div style={{ marginBottom: 24 }}>
                                                    <h4 style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: '#a1a1aa',
                                                        marginBottom: 10,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                    }}>
                                                        Problem Description
                                                    </h4>
                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            lineHeight: 1.7,
                                                            color: '#d4d4d8',
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: problem.description }}
                                                    />
                                                </div>
                                            )}

                                            {/* Carousel for Notes & Solutions */}
                                            {(problem.note || problem.solutions.length > 0) && (
                                                <div style={{ marginBottom: 24 }}>
                                                    <RevisionCarousel 
                                                        note={problem.note} 
                                                        solutions={problem.solutions} 
                                                    />
                                                </div>
                                            )}

                                            {/* Link to problem */}
                                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                <Link
                                                    href={`/problem/${problem._id}`}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        padding: '10px 16px',
                                                        borderRadius: 8,
                                                        background: 'rgba(99, 102, 241, 0.15)',
                                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                                        color: '#818cf8',
                                                        fontSize: 13,
                                                        fontWeight: 500,
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    Open Problem →
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
