'use client';

import { useState, useRef, useEffect } from 'react';

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelectDropdown({ 
  options, 
  selected, 
  onChange, 
  placeholder = 'Select options' 
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (option === 'All') {
      onChange([]); // Clear all (which means 'All' effectively)
      return;
    }

    // If 'All' was implicitly selected (empty array), and we select something else, start with just that.
    // If we are currently selecting options, toggle.
    let newSelected: string[];
    
    if (selected.includes(option)) {
      newSelected = selected.filter(s => s !== option);
    } else {
      newSelected = [...selected, option];
    }
    
    onChange(newSelected);
  };

  const isAllSelected = selected.length === 0;

  return (
    <div 
      ref={dropdownRef}
      style={{ position: 'relative', minWidth: 200 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          fontSize: 14,
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          maxWidth: 180 
        }}>
          {isAllSelected ? 'All Categories' : `${selected.length} Selected`}
        </span>
        <span style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          fontSize: 12,
          color: '#a1a1aa'
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          marginTop: 8,
          background: '#18181b', // Solid background for dropdown to avoid transparency issues
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 8,
          zIndex: 50,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          maxHeight: 300,
          overflowY: 'auto',
        }}>
          {/* 'All' Option */}
          <button
            onClick={() => toggleOption('All')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 8,
              background: isAllSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.1s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isAllSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = isAllSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              border: `2px solid ${isAllSelected ? '#6366f1' : '#52525b'}`,
              background: isAllSelected ? '#6366f1' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#fff',
            }}>
              {isAllSelected && '✓'}
            </div>
            <span style={{ fontSize: 14, color: isAllSelected ? '#fff' : '#d4d4d8' }}>All</span>
          </button>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

          {/* Categories */}
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `2px solid ${isSelected ? '#6366f1' : '#52525b'}`,
                  background: isSelected ? '#6366f1' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#fff',
                }}>
                  {isSelected && '✓'}
                </div>
                <span style={{ fontSize: 14, color: isSelected ? '#fff' : '#d4d4d8' }}>{option}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
