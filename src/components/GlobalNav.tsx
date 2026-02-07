'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useIsMobile } from '@/lib/useIsMobile';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';

export function GlobalNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isMobile = useIsMobile(768);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const activityButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: isMobile ? '8px 10px' : '8px 14px',
    borderRadius: 8,
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    fontSize: isMobile ? 12 : 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const getlinkStyle = (path: string, color: string, colorBg: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: isMobile ? '8px 10px' : '8px 14px',
    borderRadius: 8,
    background: isActive(path) ? colorBg : 'rgba(255,255,255,0.05)',
    border: isActive(path) ? `1px solid ${colorBg.replace('0.15', '0.3')}` : '1px solid rgba(255,255,255,0.1)',
    color: isActive(path) ? color : '#a1a1aa',
    fontSize: isMobile ? 12 : 13,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s',
  });

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0 clamp(12px, 4vw, 24px)',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <img 
              src="/developer.png" 
              alt="Logo" 
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
              }}
            />
            {!isMobile && (
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>NeetCode 150</span>
            )}
          </Link>
          
          {/* Navigation Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
            {/* Activity Button */}
            <button
              onClick={() => setShowHeatmapModal(true)}
              style={activityButtonStyle}
            >
              <span>📊</span>
              <span>{isMobile ? 'Activity' : 'Activity'}</span>
            </button>
            
            {/* Roadmap Link */}
            <Link 
              href="/roadmap"
              style={getlinkStyle('/roadmap', '#818cf8', 'rgba(99, 102, 241, 0.15)')}
            >
              <span>🗺️</span>
              <span>Roadmap</span>
            </Link>
            
            {/* Revision Link */}
            <Link 
              href="/revision"
              style={getlinkStyle('/revision', '#fbbf24', 'rgba(245, 158, 11, 0.15)')}
            >
              <span>📚</span>
              <span>Revision</span>
            </Link>
          </div>
          
          {/* Auth Button */}
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
              {isMobile ? 'Login' : 'Admin'}
            </button>
          )}
        </div>
      </header>

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
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#fff' }}>Admin Login</h2>
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

      {/* Heatmap Modal */}
      {showHeatmapModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            padding: 24,
          }}
          onClick={() => setShowHeatmapModal(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: 900,
              background: '#0a0a0f',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 0,
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h2 style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                color: '#fff',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span>📊</span>
                Activity Heatmap
              </h2>
              <button
                onClick={() => setShowHeatmapModal(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#a1a1aa',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Heatmap Content */}
            <div style={{ padding: 24 }}>
              <ActivityHeatmap />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
