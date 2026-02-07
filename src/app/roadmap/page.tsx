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

import { useProblems } from '@/context/ProblemsContext';

export default function RoadmapPage() {
    const { problems } = useProblems();
    const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>([]);
    
    useEffect(() => {
        // Fetch progress only
        fetch('/api/progress').then(r => r.json()).then(data => {
            setSolvedProblemIds(data.solvedProblemIds || []);
        }).catch(console.error);
    }, []);

    const solvedCount = problems.filter(p => solvedProblemIds.includes(p._id)).length;
    const totalCount = problems.length;

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(180deg, #0a0a0f 0%, #000 100%)',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Header */}
            {/* Header removed - using GlobalNav */}

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
