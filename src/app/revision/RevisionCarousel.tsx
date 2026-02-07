'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

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

interface RevisionCarouselProps {
    note: Note | null;
    solutions: Solution[];
}

export function RevisionCarousel({ note, solutions }: RevisionCarouselProps) {
    // Build items array: Note first (if exists), then solutions
    const items = [
        ...(note ? [{ type: 'note' as const, data: note }] : []),
        ...solutions.map(s => ({ type: 'solution' as const, data: s }))
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    if (items.length === 0) return null;

    const currentItem = items[activeIndex];

    const getLanguageColor = (language: string) => {
        const colors: Record<string, string> = {
            python: '#3776ab',
            javascript: '#f7df1e',
            typescript: '#3178c6',
            java: '#ed8b00',
            cpp: '#00599c',
            c: '#a8b9cc',
            go: '#00add8',
            rust: '#dea584',
        };
        return colors[language.toLowerCase()] || '#6366f1';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Tabs / Indicators */}
            <div style={{ 
                display: 'flex', 
                gap: 8, 
                overflowX: 'auto', 
                paddingBottom: 4,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                {items.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    let label = '';
                    let icon = '';
                    let color = isActive ? '#fff' : '#71717a';
                    let bg = isActive ? 'rgba(255,255,255,0.1)' : 'transparent';
                    let border = isActive ? 'rgba(255,255,255,0.2)' : 'transparent';

                    if (item.type === 'note') {
                        label = 'My Notes';
                        icon = '📝';
                        if (isActive) {
                            color = '#fbbf24';
                            bg = 'rgba(245, 158, 11, 0.15)';
                            border = 'rgba(245, 158, 11, 0.3)';
                        }
                    } else {
                        const sol = item.data as Solution;
                        label = sol.name || `${sol.language} Solution`;
                        icon = '💻';
                        if (isActive) {
                            const langColor = getLanguageColor(sol.language);
                            color = langColor;
                            bg = `${langColor}20`; // 20 hex opacity
                            border = `${langColor}40`;
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 12px',
                                borderRadius: 8,
                                background: bg,
                                border: `1px solid ${border}`,
                                color: color,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                            }}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div style={{ minHeight: 400 }}>
                {currentItem.type === 'note' ? (
                    /* Note View */
                    <div style={{
                        padding: 24,
                        background: 'rgba(245, 158, 11, 0.05)',
                        border: '1px solid rgba(245, 158, 11, 0.1)',
                        borderRadius: 12,
                    }}>
                        <div style={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: '#fef3c7',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                            {(currentItem.data as Note).content}
                        </div>
                    </div>
                ) : (
                    /* Solution View */
                    (() => {
                        const solution = currentItem.data as Solution;
                        return (
                            <div style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 12,
                                overflow: 'hidden',
                            }}>
                                {/* Solution Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#71717a' }}>
                                        {solution.timeComplexity && (
                                            <span title="Time Complexity">⏱️ {solution.timeComplexity}</span>
                                        )}
                                        {solution.spaceComplexity && (
                                            <span title="Space Complexity">💾 {solution.spaceComplexity}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Explanation */}
                                {solution.explanation && (
                                    <div style={{
                                        padding: '16px',
                                        background: 'rgba(99, 102, 241, 0.05)',
                                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        color: '#e0e7ff',
                                        whiteSpace: 'pre-wrap',
                                    }}>
                                        {solution.explanation}
                                    </div>
                                )}

                                {/* Code Editor */}
                                <div style={{ height: Math.max(300, Math.min(500, (solution.code.split('\n').length + 1) * 20)) }}>
                                    <Editor
                                        height="100%"
                                        language={solution.language === 'cpp' ? 'cpp' : solution.language}
                                        value={solution.code}
                                        theme="vs-dark"
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            lineNumbers: 'on',
                                            padding: { top: 16, bottom: 16 },
                                            renderLineHighlight: 'none',
                                            scrollbar: {
                                                vertical: 'auto',
                                                horizontal: 'auto',
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
}
