import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { InspectionSessionSummary } from '../types';

interface InspectionContextType {
  currentSessionId: string;
  currentCabinetId: string;
  sessionsList: InspectionSessionSummary[];
  loadingSessions: boolean;
  setCurrentSessionId: (id: string, cabinetId?: string) => void;
  refreshSessions: () => Promise<void>;
  loadDemoSession: () => Promise<void>;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export const InspectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSessionId, setSessionIdState] = useState<string>(() => {
    return localStorage.getItem('eagle_eye_session_id') || 'INS-2026-0891';
  });
  const [currentCabinetId, setCabinetIdState] = useState<string>(() => {
    return localStorage.getItem('eagle_eye_cabinet_id') || 'CAB-4092';
  });
  const [sessionsList, setSessionsList] = useState<InspectionSessionSummary[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const refreshSessions = async () => {
    setLoadingSessions(true);
    try {
      const sessions = await api.getInspections();
      setSessionsList(sessions);

      // If currentSessionId exists in sessions, sync cabinet_id
      const found = sessions.find((s) => s.id === currentSessionId);
      if (found) {
        setCabinetIdState(found.cabinet_id);
        localStorage.setItem('eagle_eye_cabinet_id', found.cabinet_id);
      } else if (sessions.length > 0 && currentSessionId === 'INS-2026-0891') {
        // Find CAB-4092 or first
        const cab4092 = sessions.find((s) => s.cabinet_id === 'CAB-4092') || sessions[0];
        setSessionIdState(cab4092.id);
        setCabinetIdState(cab4092.cabinet_id);
        localStorage.setItem('eagle_eye_session_id', cab4092.id);
        localStorage.setItem('eagle_eye_cabinet_id', cab4092.cabinet_id);
      }
    } catch (err) {
      console.error('Failed to fetch inspection sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  const setCurrentSessionId = (id: string, cabinetId?: string) => {
    setSessionIdState(id);
    localStorage.setItem('eagle_eye_session_id', id);

    if (cabinetId) {
      setCabinetIdState(cabinetId);
      localStorage.setItem('eagle_eye_cabinet_id', cabinetId);
    } else {
      const matched = sessionsList.find((s) => s.id === id);
      if (matched) {
        setCabinetIdState(matched.cabinet_id);
        localStorage.setItem('eagle_eye_cabinet_id', matched.cabinet_id);
      }
    }
  };

  const loadDemoSession = async () => {
    try {
      await api.loadDemoPack(currentSessionId);
      await refreshSessions();
    } catch (err) {
      console.error('Failed to load demo pack:', err);
    }
  };

  return (
    <InspectionContext.Provider
      value={{
        currentSessionId,
        currentCabinetId,
        sessionsList,
        loadingSessions,
        setCurrentSessionId,
        refreshSessions,
        loadDemoSession,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspectionSession = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspectionSession must be used within an InspectionProvider');
  }
  return context;
};
