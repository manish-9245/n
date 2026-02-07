'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  order: number;
}

interface ProblemsContextType {
  problems: Problem[];
  setProblems: (problems: Problem[]) => void;
}

const ProblemsContext = createContext<ProblemsContextType | undefined>(undefined);

export function ProblemsProvider({ 
  children, 
  initialProblems 
}: { 
  children: ReactNode;
  initialProblems: Problem[];
}) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems);

  return (
    <ProblemsContext.Provider value={{ problems, setProblems }}>
      {children}
    </ProblemsContext.Provider>
  );
}

export function useProblems() {
  const context = useContext(ProblemsContext);
  if (context === undefined) {
    throw new Error('useProblems must be used within a ProblemsProvider');
  }
  return context;
}
