'use client';

import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { GlareCard } from '@/components/ui/glare-card';
import Link from 'next/link';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  order: number;
}

export default function Home() {
  const { data: session } = useSession();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await fetch('/api/collections/neetcode-150/problems');
      const data = await res.json();
      setProblems(data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(problems.map(p => p.category)))];

  const filteredProblems = problems.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const result = await signIn('credentials', {
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoginError('Invalid password');
    } else {
      setShowLoginModal(false);
      setPassword('');
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

  const stats = {
    easy: problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard: problems.filter(p => p.difficulty === 'Hard').length,
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
          <p style={{ color: '#71717a', fontSize: 14 }}>Loading problems...</p>
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 18,
              color: '#fff'
            }}>N</div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>NeetCode 150</span>
          </Link>
          
          {session ? (
            <button 
              onClick={() => signOut()}
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
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Admin
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 24px 48px', textAlign: 'center' }}>
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
        padding: '16px 24px',
      }}>
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
              maxWidth: 320,
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
              minWidth: 160,
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} style={{ background: '#18181b' }}>{cat}</option>
            ))}
          </select>
          
          <span style={{ fontSize: 14, color: '#71717a' }}>
            {filteredProblems.length} of {problems.length} problems
          </span>
        </div>
      </section>

      {/* Problem Grid */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        {filteredProblems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#a1a1aa', marginBottom: 8 }}>No problems found</h3>
            <p style={{ color: '#71717a' }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
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

      {/* Login Modal */}
      {showLoginModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            padding: 24,
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: 400,
              background: '#18181b',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 32,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Admin Login</h2>
            <p style={{ color: '#71717a', marginBottom: 24, fontSize: 14 }}>
              Enter the admin password to continue
            </p>
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, color: '#a1a1aa', marginBottom: 8 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  placeholder="Enter password"
                  autoFocus
                />
              </div>
              
              {loginError && (
                <div style={{ 
                  marginBottom: 16, 
                  padding: 12, 
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontSize: 14,
                }}>
                  {loginError}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  type="submit" 
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Login
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowLoginModal(false)} 
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#a1a1aa',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
