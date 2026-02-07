'use client';
import { useState } from 'react';
import { GlareCard } from '@/components/ui/glare-card';
import Link from 'next/link';
import { useIsMobile } from '@/lib/useIsMobile';
// ActivityHeatmap and next-auth imports removed as they are moved to GlobalNav

interface Problem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  order: number;
}


import { useProblems } from '@/context/ProblemsContext';

export default function PageClient() {
  // Removed session/modal state as it is now in GlobalNav
  const { problems } = useProblems();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile(768);



  const categories = ['All', ...Array.from(new Set(problems.map(p => p.category)))];

  const filteredProblems = problems.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });



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

  const stats = {
    easy: problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard: problems.filter(p => p.difficulty === 'Hard').length,
  };



  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #0a0a0f 0%, #000 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      {/* Header removed - now in GlobalNav */}

      {/* Hero */}
      <section style={{ padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px) clamp(32px, 6vw, 48px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(36px, 8vw, 64px)', 
            fontWeight: 800, 
            lineHeight: 1.1,
            marginBottom: 24,
            background: 'linear-gradient(180deg, #fff 0%, #71717a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Master Technical<br />
            <span style={{ 
              background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Interviews</span>
          </h1>
          <p style={{ fontSize: 18, color: '#71717a', marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
            Track your progress on the 150 essential LeetCode patterns. Practice smarter, not harder.
          </p>
          
          {/* Stats */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 32,
            flexWrap: 'wrap',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>{stats.easy}</div>
              <div style={{ fontSize: 14, color: '#71717a' }}>Easy</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>{stats.medium}</div>
              <div style={{ fontSize: 14, color: '#71717a' }}>Medium</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#ef4444' }}>{stats.hard}</div>
              <div style={{ fontSize: 14, color: '#71717a' }}>Hard</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{problems.length}</div>
              <div style={{ fontSize: 14, color: '#71717a' }}>Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section style={{
        position: 'sticky',
        top: 64,
        zIndex: 40,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: isMobile ? '12px 16px' : '12px clamp(12px, 4vw, 24px)',
      }}>
        {isMobile ? (
          /* Mobile Filter Layout */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Search Input - Full Width */}
            <div style={{ position: 'relative' }}>
              <span style={{ 
                position: 'absolute', 
                left: 14, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#71717a',
                fontSize: 16,
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 42px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
            </div>
            
            {/* Category Chips + Count Row */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 12, 
            }}>
              {/* Category Chips - Horizontal Scroll */}
              <div style={{ 
                display: 'flex', 
                gap: 8, 
                overflowX: 'auto', 
                flex: 1,
                paddingBottom: 4,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}>
                <style>{`.filter-chips::-webkit-scrollbar { display: none; }`}</style>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      background: selectedCategory === cat 
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                        : 'rgba(255,255,255,0.08)',
                      border: selectedCategory === cat 
                        ? 'none' 
                        : '1px solid rgba(255,255,255,0.15)',
                      color: selectedCategory === cat ? '#fff' : '#a1a1aa',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {/* Results Count - Vertically Centered */}
              <div style={{ 
                fontSize: 12, 
                color: '#71717a', 
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}>
                {filteredProblems.length}/{problems.length}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Filter Layout */
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}>
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                maxWidth: 'min(320px, 100%)',
                flex: '1 1 200px',
                padding: '12px 16px',
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
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
                minWidth: 'min(160px, 100%)',
                flex: '0 0 auto',
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} style={{ background: '#18181b' }}>{cat}</option>
              ))}
            </select>
            
            <span style={{ 
              fontSize: 14, 
              color: '#71717a',
              display: 'flex',
              alignItems: 'center',
            }}>
              {filteredProblems.length} of {problems.length} problems
            </span>
          </div>
        )}
      </section>

      {/* Problem Grid */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(24px, 6vw, 48px) clamp(12px, 4vw, 24px)' }}>
        {filteredProblems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#a1a1aa', marginBottom: 8 }}>No problems found</h3>
            <p style={{ color: '#71717a' }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
            gap: 'clamp(12px, 3vw, 24px)',
          }}>
            {filteredProblems.map((problem) => {
              const diffStyles = getDifficultyStyles(problem.difficulty);
              return (
                <Link 
                  key={problem._id} 
                  href={`/problem/${problem._id}`}
                  style={{ textDecoration: 'none', display: 'block', height: 200 }}
                >
                  <GlareCard className="card-content">
                    <div style={{ 
                      padding: 20, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column' 
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}>
                        <span style={{ 
                          fontSize: 12, 
                          fontFamily: 'monospace',
                          color: '#71717a',
                          background: 'rgba(255,255,255,0.05)',
                          padding: '4px 8px',
                          borderRadius: 6,
                        }}>
                          #{problem.order}
                        </span>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 600,
                          color: diffStyles.color,
                          background: diffStyles.bg,
                          border: `1px solid ${diffStyles.border}`,
                          padding: '4px 10px',
                          borderRadius: 6,
                        }}>
                          {problem.difficulty}
                        </span>
                      </div>
                      
                      <h3 style={{ 
                        fontSize: 16, 
                        fontWeight: 600, 
                        color: '#fff',
                        lineHeight: 1.4,
                        marginBottom: 'auto',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {problem.title}
                      </h3>
                      
                      <div style={{ 
                        paddingTop: 12, 
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        marginTop: 12,
                      }}>
                        <span style={{ 
                          fontSize: 12, 
                          color: '#71717a',
                          background: 'rgba(255,255,255,0.03)',
                          padding: '4px 10px',
                          borderRadius: 6,
                        }}>
                          {problem.category}
                        </span>
                      </div>
                    </div>
                  </GlareCard>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, color: '#52525b' }}>
          Built for mastering technical interviews • NeetCode 150 Tracker
        </p>
      </footer>

      {/* Modals removed - now in GlobalNav */}
    </div>
  );
}
