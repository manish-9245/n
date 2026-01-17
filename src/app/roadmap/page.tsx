'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Roadmap } from '@/components/Roadmap';

interface Problem {
    _id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    order: number;
}

export default function RoadmapPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/collections/neetcode-150/problems').then(r => r.json()),
            fetch('/api/progress').then(r => r.json()),
        ]).then(([problemsData, progressData]) => {
            setProblems(problemsData);
            setSolvedProblemIds(progressData.solvedProblemIds || []);
            setLoading(false);
        }).catch(error => {
            console.error('Error loading data:', error);
            setLoading(false);
        });
    }, []);

    // Calculate overall progress
    const solvedCount = problems.filter(p => solvedProblemIds.includes(p._id)).length;
    const totalCount = problems.length;

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                background: '#000', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: 48, 
                        height: 48, 
                        border: '4px solid #6366f1', 
                        borderTopColor: 'transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#71717a', fontSize: 14 }}>Loading roadmap...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(180deg, #0a0a0f 0%, #000 100%)',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0 24px',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                            <img 
                                src="/developer.png" 
                                alt="Logo" 
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                }}
                            />
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>NeetCode 150</span>
                        </Link>
                        <span style={{ 
                            padding: '6px 12px', 
                            background: 'rgba(99, 102, 241, 0.2)', 
                            borderRadius: 8,
                            fontSize: 13,
                            color: '#818cf8',
                            fontWeight: 500,
                        }}>
                            Roadmap
                        </span>
                    </div>
                    
                    <Link 
                        href="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 16px',
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#a1a1aa',
                            fontSize: 14,
                            textDecoration: 'none',
                        }}
                    >
                        ← Back to Problems
                    </Link>
                </div>
            </header>

            {/* Progress Overview */}
            <section style={{ 
                padding: '40px 24px 20px', 
                textAlign: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
                <h1 style={{ 
                    fontSize: 32, 
                    fontWeight: 800, 
                    marginBottom: 16,
                    background: 'linear-gradient(135deg, #fff, #a1a1aa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Study Roadmap
                </h1>
                <p style={{ color: '#71717a', marginBottom: 24, fontSize: 15 }}>
                    Click on any topic to see related problems
                </p>
                
                {/* Progress Stats */}
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 16,
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                    <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%',
                        background: `conic-gradient(#6366f1 ${(solvedCount / totalCount) * 100}%, rgba(255,255,255,0.1) 0)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: '#0a0a0f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#fff',
                        }}>
                            {Math.round((solvedCount / totalCount) * 100)}%
                        </div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                            {solvedCount}/{totalCount}
                        </div>
                        <div style={{ fontSize: 13, color: '#71717a' }}>
                            Problems Solved
                        </div>
                    </div>
                </div>
            </section>

            {/* Roadmap */}
            <main style={{ 
                maxWidth: 900, 
                margin: '0 auto', 
                padding: '40px 24px 80px',
            }}>
                <Roadmap problems={problems} solvedProblemIds={solvedProblemIds} />
            </main>
        </div>
    );
}
