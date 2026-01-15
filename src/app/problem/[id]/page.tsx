'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { useIsMobile } from '@/lib/useIsMobile';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  leetcodeUrl?: string;
}

interface Solution {
  _id: string;
  name?: string;
  language: string;
  code: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  explanation?: string;
  createdAt?: string;
  updatedAt?: string;
}

const LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚡' },
  { id: 'go', name: 'Go', icon: '🔵' },
];

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { data: session } = useSession();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  /* State Updates */
  const [note, setNote] = useState('');
  const [noteUpdatedAt, setNoteUpdatedAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'solutions' | 'notes'>('description');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [noteType, setNoteType] = useState<'problem' | 'solution'>('problem');
  const [solutionNote, setSolutionNote] = useState('');

  /* ... useEffects ... */



  const [currentSolutionId, setCurrentSolutionId] = useState<string | null>(null);
  const [isNewSolution, setIsNewSolution] = useState(false);
  const [code, setCode] = useState('');
  const [solutionName, setSolutionName] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Mobile responsive state
  const isMobile = useIsMobile(768);
  const [mobileTab, setMobileTab] = useState<'problem' | 'solutions' | 'editor'>('problem');

  useEffect(() => {
    fetchProblem();
    fetchSolutions();
    fetchNote();
  }, [unwrappedParams.id]);

  const fetchProblem = async () => {
    try {
      const res = await fetch(`/api/problems/${unwrappedParams.id}`);
      const data = await res.json();
      setProblem(data);
    } catch (error) {
      console.error('Error fetching problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolutions = async () => {
    try {
      const res = await fetch(`/api/solutions?problemId=${unwrappedParams.id}`);
      const data = await res.json();
      setSolutions(data);
      
      // Load first solution if available and no solution is currently selected
      if (data.length > 0 && !currentSolutionId) {
        const solution = data[0];
        loadSolutionById(solution._id, data);
      }
    } catch (error) {
      console.error('Error fetching solutions:', error);
    }
  };

  const fetchNote = async () => {
    try {
      const res = await fetch(`/api/notes?problemId=${unwrappedParams.id}`);
      const data = await res.json();
      if (data) {
        setNote(data.content || '');
        setNoteUpdatedAt(data.updatedAt || data.createdAt || null);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    }
  };

  const saveSolution = async () => {
    if (!session) return;
    setSaving(true);

    try {
      if (currentSolutionId && !isNewSolution) {
        // Update existing solution
        await fetch(`/api/solutions/${currentSolutionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: solutionName, 
            language: selectedLanguage,
            code, 
            timeComplexity, 
            spaceComplexity,
            explanation: solutionNote 
          }),
        });
      } else {
        // Create new solution
        const res = await fetch('/api/solutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId: unwrappedParams.id,
            name: solutionName || 'Untitled Solution',
            language: selectedLanguage,
            code,
            timeComplexity,
            spaceComplexity,
            explanation: solutionNote
          }),
        });
        const newSolution = await res.json();
        setCurrentSolutionId(newSolution._id);
        setIsNewSolution(false);
      }
      
      fetchSolutions();
    } catch (error) {
      console.error('Error saving solution:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    if (!session) return;
    setSaving(true);

    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: unwrappedParams.id, content: note }),
      });
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSolutionById = (id: string, solutionsList: Solution[] = solutions) => {
    const solution = solutionsList.find(s => s._id === id);
    if (solution) {
      setCurrentSolutionId(solution._id);
      setIsNewSolution(false);
      setSelectedLanguage(solution.language);
      setCode(solution.code);
      setSolutionName(solution.name || '');
      setTimeComplexity(solution.timeComplexity || '');
      setSpaceComplexity(solution.spaceComplexity || '');
      setSolutionNote(solution.explanation || '');
    }
  };

  const createNewSolution = () => {
    setCurrentSolutionId(null);
    setIsNewSolution(true);
    setCode('');
    setSolutionName('');
    setTimeComplexity('');
    setSpaceComplexity('');
    setSelectedLanguage('python');
    setSolutionNote('');
  };

  const deleteSolution = async (id: string) => {
    if (!session || !confirm('Delete this solution?')) return;
    
    try {
      await fetch(`/api/solutions/${id}`, { method: 'DELETE' });
      
      // If we deleted the current solution, load another one or clear
      if (currentSolutionId === id) {
        const remaining = solutions.filter(s => s._id !== id);
        if (remaining.length > 0) {
          loadSolutionById(remaining[0]._id, remaining);
        } else {
          createNewSolution();
        }
      }
      
      fetchSolutions();
    } catch (error) {
      console.error('Error deleting solution:', error);
    }
  };

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' };
      case 'Medium':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' };
      case 'Hard':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' };
      default:
        return { color: '#71717a', bg: 'rgba(113, 113, 122, 0.15)', border: 'rgba(113, 113, 122, 0.4)' };
    }
  };

  const getLanguageIcon = (langId: string) => {
    const lang = LANGUAGES.find(l => l.id === langId);
    return lang?.icon || '📄';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
          <p style={{ color: '#71717a', fontSize: 14 }}>Loading problem...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!problem) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <h2 style={{ color: '#fff', fontSize: 24 }}>Problem not found</h2>
        <Link href="/" style={{ color: '#6366f1', textDecoration: 'none' }}>
          ← Back to problems
        </Link>
      </div>
    );
  }

  const diffStyles = getDifficultyStyles(problem.difficulty);


  // ... imports 
  
  // Note: We need to ensure we import these at the top level, but for this specific tool call we can't edit top imports easily without context of top of file.
  // Actually, I should probably read the file again to make sure I have the imports correct or use replace_file to add them.
  // Wait, I can't just replace the bottom without the top imports.
  // I will use `replace_file_content` to replace the WHOLE file or a large chunk, but I need to make sure I add the imports. 
  // Since I saw the file earlier, I know the imports are at lines 1-8. 
  // I'll do a focused replace for imports first, then the layout to be safe, or just one big replace if it fits? 
  // It's 800 lines, might be too big for one replace call if I don't want to reprint everything.  
  // Actually, I can replace the imports first.
  
  // Layout Logic:
  // The header stays fixed at top? Or part of layout? The current code has header sticky. 
  // Ideally: Header (Fixed Height) + PanelGroup (Remaining Height).
  // Current: <div minHeight="100vh" flex col> <Header> <div flex:1 overflow:hidden>...</div> </div>
  // So I just need to replace the flex:1 div with the PanelGroup.

  return (
    <div style={{ 
      height: '100vh', 
      background: '#09090b',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden' // Important to prevent window scroll
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: isMobile ? '0 12px' : '0 24px',
        height: isMobile ? 48 : 56,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1920,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 8 : 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16, flex: 1, minWidth: 0 }}>
            <Link 
              href="/" 
              style={{ 
                color: '#71717a', 
                textDecoration: 'none',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: isMobile ? '6px 8px' : '6px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0,
              }}
            >
              {isMobile ? '←' : '← Problems'}
            </Link>
            
            {!isMobile && <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />}
            
            <h1 style={{ 
              fontSize: isMobile ? 14 : 16, 
              fontWeight: 600, 
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
            }}>
              {problem.title}
            </h1>
            
            <span style={{ 
              fontSize: isMobile ? 10 : 12, 
              fontWeight: 600,
              color: diffStyles.color,
              background: diffStyles.bg,
              border: `1px solid ${diffStyles.border}`,
              padding: isMobile ? '2px 6px' : '4px 10px',
              borderRadius: 6,
              flexShrink: 0,
            }}>
              {problem.difficulty}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {!session && !isMobile && (
              <span style={{ fontSize: 12, color: '#71717a' }}>
                👁 View Only
              </span>
            )}
            {session && (
              <span style={{ 
                fontSize: isMobile ? 10 : 12, 
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: isMobile ? '2px 6px' : '4px 10px',
                borderRadius: 6,
              }}>
                {isMobile ? '✓' : '✓ Admin'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Mobile Tab Navigation */}
        {isMobile && (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: '#09090b',
            flexShrink: 0,
          }}>
            {(['problem', 'solutions', 'editor'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={`mobile-tab ${mobileTab === tab ? 'active' : ''}`}
              >
                {tab === 'problem' ? '📖 Problem' : tab === 'solutions' ? '💡 Solutions' : '✏️ Editor'}
              </button>
            ))}
          </div>
        )}
        
        {/* Mobile Layout */}
        {isMobile ? (
          <div style={{ height: 'calc(100% - 46px)', overflow: 'auto' }}>
            {/* Problem Tab Content */}
            {mobileTab === 'problem' && (
              <div style={{ padding: 16 }}>
                <div style={{ 
                  fontSize: 12, 
                  color: '#a1a1aa',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '6px 10px',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'inline-block',
                }}>
                  {problem.category}
                </div>
                
                <style>{`
                  .prose p { margin-bottom: 1rem; color: #a1a1aa; line-height: 1.7; }
                  .prose strong { color: #fff; font-weight: 600; }
                  .prose ul, .prose ol { margin-bottom: 1rem; padding-left: 1.5rem; color: #a1a1aa; }
                  .prose li { margin-bottom: 0.5rem; }
                  .prose code { 
                    background: rgba(99, 102, 241, 0.1);
                    padding: 0.2em 0.4em;
                    border-radius: 4px;
                    font-size: 0.85em;
                    font-family: monospace;
                    color: #a78bfa; 
                  }
                  .prose pre {
                    background: #18181b;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow: auto;
                    margin-bottom: 1rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #e4e4e7;
                  }
                `}</style>
                
                <div 
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />
                
                {problem.leetcodeUrl && (
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <a 
                      href={problem.leetcodeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#6366f1',
                        textDecoration: 'none',
                        fontSize: 14,
                        padding: '10px 16px',
                        borderRadius: 8,
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}
                    >
                      View on LeetCode →
                    </a>
                  </div>
                )}
                
                {/* Notes Section in Problem Tab for Mobile */}
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e4e4e7', margin: 0 }}>Notes</h3>
                    {noteUpdatedAt && (
                      <span style={{ fontSize: 11, color: '#52525b' }}>Updated {formatDate(noteUpdatedAt)}</span>
                    )}
                  </div>
                  {session ? (
                    <>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Write notes for this problem..."
                        style={{
                          width: '100%',
                          minHeight: 150,
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                          padding: 12,
                          color: '#e4e4e7',
                          fontSize: 14,
                          fontFamily: 'monospace',
                          resize: 'vertical',
                          outline: 'none',
                        }}
                      />
                      <button 
                        onClick={saveNote}
                        disabled={saving}
                        style={{
                          marginTop: 12,
                          padding: '10px 20px',
                          borderRadius: 8,
                          background: saving ? '#3f3f46' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          border: 'none',
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {saving ? 'Saving...' : 'Save Note'}
                      </button>
                    </>
                  ) : (
                    note ? (
                      <div className="markdown-content">
                        <ReactMarkdown>{note}</ReactMarkdown>
                      </div>
                    ) : (
                      <p style={{ color: '#71717a', fontSize: 14 }}>No notes yet</p>
                    )
                  )}
                </div>
              </div>
            )}
            
            {/* Solutions Tab Content */}
            {mobileTab === 'solutions' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {session && (
                  <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button 
                      onClick={createNewSolution}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      + New Solution
                    </button>
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'auto' }}>
                  {solutions.length === 0 && !isNewSolution && (
                    <div style={{ padding: 32, textAlign: 'center', color: '#71717a' }}>
                      No solutions yet
                    </div>
                  )}
                  {isNewSolution && (
                    <div 
                      className="mobile-solution-item active"
                      onClick={() => setMobileTab('editor')}
                    >
                      <div style={{ fontSize: 15, color: '#fff', marginBottom: 4 }}>New Solution</div>
                      <div style={{ fontSize: 12, color: '#a5b4fc' }}>Draft - Tap to edit</div>
                    </div>
                  )}
                  {solutions.map(sol => {
                    const isActive = sol._id === currentSolutionId && !isNewSolution;
                    const langInfo = LANGUAGES.find(l => l.id === sol.language);
                    
                    return (
                      <div
                        key={sol._id}
                        className={`mobile-solution-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          loadSolutionById(sol._id);
                          setMobileTab('editor');
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 15, color: isActive ? '#fff' : '#d4d4d8', marginBottom: 4 }}>
                              {sol.name || 'Untitled'}
                            </div>
                            <div style={{ fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span>{langInfo?.icon || '📄'}</span>
                              <span>{langInfo?.name || sol.language}</span>
                              {sol.timeComplexity && <span>• {sol.timeComplexity}</span>}
                              {sol.createdAt && <span style={{ color: '#52525b' }}>• {formatDate(sol.createdAt)}</span>}
                            </div>
                          </div>
                          {session && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteSolution(sol._id); }}
                              style={{ background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer', padding: 8 }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Editor Tab Content */}
            {mobileTab === 'editor' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Editor Header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.3)',
                }}>
                  {session ? (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input 
                        value={solutionName} 
                        onChange={(e) => setSolutionName(e.target.value)}
                        placeholder="Solution Name"
                        style={{
                          flex: 1,
                          minWidth: 120,
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 500,
                          outline: 'none',
                          padding: '4px 0',
                        }} 
                      />
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        style={{
                          background: '#18181b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          borderRadius: 4,
                          fontSize: 13,
                          padding: '6px 8px',
                        }}
                      >
                        {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.icon} {l.name}</option>)}
                      </select>
                      <button 
                        onClick={saveSolution}
                        disabled={saving}
                        style={{
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 16px',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: '#a1a1aa', fontSize: 14 }}>
                      {solutionName || 'Untitled Solution'} • {LANGUAGES.find(l => l.id === selectedLanguage)?.name}
                    </div>
                  )}
                </div>
                
                {/* Editor Area */}
                <div style={{ flex: 1, minHeight: 300, overflow: 'hidden' }}>
                  <Editor
                    height="100%"
                    language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                    value={code || (session ? '' : '// No solution selected')}
                    onChange={(value) => session && setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      readOnly: !session,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      automaticLayout: true,
                      wordWrap: 'off',
                      scrollBeyondLastColumn: 5,
                      scrollbar: {
                        horizontal: 'visible',
                        horizontalScrollbarSize: 10,
                        useShadows: false,
                      },
                    }}
                  />
                </div>
                
                {/* Complexity Footer */}
                <div style={{ 
                  padding: 12, 
                  borderTop: '1px solid rgba(255,255,255,0.1)', 
                  display: 'flex', 
                  gap: 12,
                  flexWrap: 'wrap',
                }}>
                  <div style={{ flex: '1 1 100px' }}>
                    <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Time</label>
                    <input 
                      value={timeComplexity}
                      onChange={(e) => setTimeComplexity(e.target.value)}
                      disabled={!session}
                      placeholder="O(n)"
                      style={{ 
                        width: '100%', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: 'none', 
                        color: '#fff', 
                        fontSize: 13,
                        padding: '6px 10px',
                        borderRadius: 4
                      }}
                    />
                  </div>
                  <div style={{ flex: '1 1 100px' }}>
                    <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Space</label>
                    <input 
                      value={spaceComplexity}
                      onChange={(e) => setSpaceComplexity(e.target.value)}
                      disabled={!session}
                      placeholder="O(1)"
                      style={{ 
                        width: '100%', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: 'none', 
                        color: '#fff', 
                        fontSize: 13,
                        padding: '6px 10px',
                        borderRadius: 4
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Desktop Layout - Resizable Panels */
          <PanelGroup orientation="horizontal" style={{ height: '100%', width: '100%' }}>
            {/* Left Panel - Description/Notes */}
            <Panel defaultSize="40" minSize="20" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#0a0a0f',
                }}>
                    {/* Tabs */}
                    <div style={{ 
                        display: 'flex', 
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(0,0,0,0.3)',
                        flexShrink: 0
                    }}>
                        {(['description', 'notes'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                            padding: '14px 24px',
                            fontSize: 14,
                            fontWeight: 500,
                            color: activeTab === tab ? '#fff' : '#71717a',
                            background: activeTab === tab ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                        ))}
                    </div>
                    
                    {/* Tab Content */}
                    <div style={{ 
                        flex: 1, 
                        overflow: 'auto', 
                        padding: 24,
                        minHeight: 0
                    }}>
                        {activeTab === 'description' && (
                        <div>
                            <style>{`
                            .prose p { margin-bottom: 1rem; color: #a1a1aa; line-height: 1.7; }
                            .prose strong { color: #fff; font-weight: 600; }
                            .prose ul, .prose ol { margin-bottom: 1rem; padding-left: 1.5rem; color: #a1a1aa; }
                            .prose li { margin-bottom: 0.5rem; }
                            .prose code { 
                                background: rgba(99, 102, 241, 0.1);
                                padding: 0.2em 0.4em;
                                border-radius: 4px;
                                font-size: 0.9em;
                                font-family: monospace;
                                color: #a78bfa; 
                            }
                            .prose pre {
                                background: #18181b;
                                padding: 1rem;
                                border-radius: 0.5rem;
                                overflow: auto;
                                margin-bottom: 1rem;
                                border: 1px solid rgba(255,255,255,0.1);
                                color: #e4e4e7;
                            }
                            .example-block {
                                border-left: 3px solid #6366f1;
                                padding-left: 16px;
                                margin-bottom: 16px;
                            }
                            .example-io {
                                font-family: monospace;
                                background: rgba(255,255,255,0.05);
                                padding: 2px 6px;
                                border-radius: 4px;
                                color: #e4e4e7;
                            }
                            `}</style>
                            <div style={{ 
                            fontSize: 13, 
                            color: '#a1a1aa',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '8px 12px',
                            borderRadius: 8,
                            marginBottom: 24,
                            display: 'inline-block',
                            }}>
                            {problem.category}
                            </div>
                            
                            <div 
                            className="prose"
                            dangerouslySetInnerHTML={{ __html: problem.description }}
                            />
                            
                            {problem.leetcodeUrl && (
                            <div style={{ 
                                marginTop: 32, 
                                paddingTop: 24, 
                                borderTop: '1px solid rgba(255,255,255,0.1)' 
                            }}>
                                <a 
                                href={problem.leetcodeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    color: '#6366f1',
                                    textDecoration: 'none',
                                    fontSize: 14,
                                    padding: '10px 16px',
                                    borderRadius: 8,
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                }}
                                >
                                View on LeetCode →
                                </a>
                            </div>
                            )}
                        </div>
                        )}
                        
                        {activeTab === 'notes' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                             <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                <button
                                    onClick={() => setNoteType('problem')}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: 13,
                                        borderRadius: 6,
                                        background: noteType === 'problem' ? '#3f3f46' : 'transparent',
                                        color: noteType === 'problem' ? '#fff' : '#71717a',
                                        border: '1px solid',
                                        borderColor: noteType === 'problem' ? '#52525b' : 'rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    General Notes
                                </button>
                                <button
                                    onClick={() => setNoteType('solution')}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: 13,
                                        borderRadius: 6,
                                        background: noteType === 'solution' ? '#3f3f46' : 'transparent',
                                        color: noteType === 'solution' ? '#fff' : '#71717a',
                                        border: '1px solid',
                                        borderColor: noteType === 'solution' ? '#52525b' : 'rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Solution Notes
                                </button>
                             </div>

                            {session ? (
                            <>
                                <textarea
                                value={noteType === 'problem' ? note : solutionNote}
                                onChange={(e) => noteType === 'problem' ? setNote(e.target.value) : setSolutionNote(e.target.value)}
                                placeholder={noteType === 'problem' ? "Write general notes for this problem..." : "Write notes specific to this solution (e.g. approach explanation)..."}
                                style={{
                                    flex: 1,
                                    minHeight: 300,
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12,
                                    padding: 16,
                                    color: '#e4e4e7',
                                    fontSize: 14,
                                    fontFamily: 'monospace',
                                    resize: 'none',
                                    outline: 'none',
                                }}
                                />
                                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                                {noteType === 'solution' && !currentSolutionId && (
                                    <span style={{ fontSize: 12, color: '#fbbf24' }}>* Select a solution to save notes</span>
                                )}
                                <button 
                                    onClick={noteType === 'problem' ? saveNote : saveSolution}
                                    disabled={saving || (noteType === 'solution' && !currentSolutionId && !isNewSolution)} // Allow save if new solution (it creates one)
                                    style={{
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    background: saving ? '#3f3f46' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: (noteType === 'solution' && !currentSolutionId && !isNewSolution) ? 0.5 : 1
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Note'}
                                </button>
                                </div>
                            </>
                            ) : (
                            <div>
                                {noteType === 'problem' ? (
                                    note ? (
                                        <div className="markdown-content">
                                            <ReactMarkdown>{note}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                                            <p style={{ color: '#71717a' }}>No notes yet</p>
                                        </div>
                                    )
                                ) : (
                                    solutionNote ? (
                                        <div className="markdown-content">
                                            <ReactMarkdown>{solutionNote}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                            <div style={{ fontSize: 48, marginBottom: 16 }}>💡</div>
                                            <p style={{ color: '#71717a' }}>No solution notes</p>
                                        </div>
                                    )
                                )}
                            </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>
            </Panel>
            
            <PanelResizeHandle style={{
                width: 4,
                background: '#18181b',
                cursor: 'col-resize',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{ width: 2, height: 24, background: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
            </PanelResizeHandle>

            {/* Right Side - Solutions & Editor */}
            <Panel minSize="20">
                <PanelGroup orientation="horizontal" style={{ height: '100%', width: '100%' }}>
                    {/* Solutions Sidebar */}
                    <Panel defaultSize="25" minSize="15" style={{ display: 'flex', flexDirection: 'column' }}>
                         <div style={{
                            height: '100%',
                            borderRight: '1px solid rgba(255,255,255,0.1)', // Keep border visual even with handle?
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(0,0,0,0.2)',
                         }}>
                            <div style={{
                                padding: '16px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#e4e4e7',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <span>Solutions</span>
                                {session && (
                                    <button 
                                        onClick={createNewSolution}
                                        style={{
                                            background: 'rgba(99, 102, 241, 0.2)',
                                            color: '#a5b4fc',
                                            border: '1px solid rgba(99, 102, 241, 0.4)',
                                            borderRadius: 4,
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                    +
                                    </button>
                                )}
                            </div>
                            
                            <div style={{ flex: 1, overflow: 'auto' }}>
                                {solutions.length === 0 && !isNewSolution && (
                                    <div style={{ padding: 16, color: '#71717a', fontSize: 13, textAlign: 'center' }}>
                                        No solutions yet
                                    </div>
                                )}
                                {isNewSolution && (
                                    <div style={{
                                        padding: '12px 16px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        borderLeft: '2px solid #6366f1',
                                        cursor: 'pointer',
                                    }}>
                                        <div style={{ fontSize: 14, color: '#fff', marginBottom: 2 }}>New Solution</div>
                                        <div style={{ fontSize: 12, color: '#a5b4fc' }}>Draft</div>
                                    </div>
                                )}
                                {solutions.map(sol => {
                                    const isActive = sol._id === currentSolutionId && !isNewSolution;
                                    const langInfo = LANGUAGES.find(l => l.id === sol.language);
                                    
                                    return (
                                        <div
                                            key={sol._id}
                                            onClick={() => loadSolutionById(sol._id)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
                                                transition: 'background 0.2s',
                                            }}
                                        >
                                            <div style={{ fontSize: 14, color: isActive ? '#fff' : '#d4d4d8', marginBottom: 2 }}>
                                                {sol.name || 'Untitled'}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span>{langInfo?.icon || '📄'}</span>
                                                <span>{langInfo?.name || sol.language}</span>
                                                {sol.createdAt && <span style={{ color: '#52525b' }}>• {formatDate(sol.createdAt)}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                         </div>
                    </Panel>

                    <PanelResizeHandle style={{
                        width: 4,
                        background: '#18181b',
                        cursor: 'col-resize',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <div style={{ width: 2, height: 24, background: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
                    </PanelResizeHandle>

                    {/* Editor & Complexity - Main Working Area */}
                    <Panel minSize="30" style={{ display: 'flex', flexDirection: 'column' }}>
                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#0f0f14' }}>
                            {/* Editor Header / Meta Controls */}
                            <div style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(0,0,0,0.3)',
                            }}>
                                {/* Left: Name and Language Input (Editable if Session) */}
                                <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                                    {session ? (
                                        <>
                                            <input 
                                                value={solutionName} 
                                                onChange={(e) => setSolutionName(e.target.value)}
                                                placeholder="Solution Name"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#fff',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    outline: 'none',
                                                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                                                    padding: '4px 0',
                                                    width: 200,
                                                }} 
                                            />
                                            <select
                                                value={selectedLanguage}
                                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                                style={{
                                                    background: '#18181b',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    color: '#fff',
                                                    borderRadius: 4,
                                                    fontSize: 13,
                                                    padding: '4px 8px',
                                                }}
                                            >
                                                {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.icon} {l.name}</option>)}
                                            </select>
                                        </>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#fff', fontWeight: 500 }}>{solutionName || 'Untitled Solution'}</span>
                                            <span style={{ fontSize: 12, color: '#71717a' }}>
                                                {LANGUAGES.find(l => l.id === selectedLanguage)?.name || selectedLanguage}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Actions */}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {session && currentSolutionId && !isNewSolution && (
                                        <button onClick={() => deleteSolution(currentSolutionId)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                                    )}
                                    {session && (
                                        <button 
                                            onClick={saveSolution}
                                            disabled={saving}
                                            style={{
                                                background: '#10b981',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 6,
                                                padding: '6px 16px',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Editor */}
                            <div style={{ flex: 1 }}>
                                <Editor
                                    height="100%"
                                    language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                                    value={code || (session ? '' : '// No solution selected')}
                                    onChange={(value) => session && setCode(value || '')}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        readOnly: !session,
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        automaticLayout: true, // IMPORTANT for smooth resizing
                                    }}
                                />
                            </div>

                            {/* Complexity Footer */}
                            <div style={{ 
                                    padding: 12, 
                                    borderTop: '1px solid rgba(255,255,255,0.1)', 
                                    display: 'flex', 
                                    gap: 16 
                            }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Time Complexity</label>
                                    <input 
                                        value={timeComplexity}
                                        onChange={(e) => setTimeComplexity(e.target.value)}
                                        disabled={!session}
                                        placeholder="O(n)"
                                        style={{ 
                                            width: '100%', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: 'none', 
                                            color: '#fff', 
                                            fontSize: 13,
                                            padding: '6px 10px',
                                            borderRadius: 4
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Space Complexity</label>
                                    <input 
                                        value={spaceComplexity}
                                        onChange={(e) => setSpaceComplexity(e.target.value)}
                                        disabled={!session}
                                        placeholder="O(1)"
                                        style={{ 
                                            width: '100%', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: 'none', 
                                            color: '#fff', 
                                            fontSize: 13,
                                            padding: '6px 10px',
                                            borderRadius: 4
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </Panel>
         </PanelGroup>
        )}
      </div>
     </div>
  );
}
