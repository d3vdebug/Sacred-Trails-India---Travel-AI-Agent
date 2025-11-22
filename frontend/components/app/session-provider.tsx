'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { RoomContext } from '@livekit/components-react';
import { APP_CONFIG_DEFAULTS, type AppConfig } from '@/app-config';
import { useRoom } from '@/hooks/useRoom';

const SessionContext = createContext<{
  appConfig: AppConfig;
  isSessionActive: boolean;
  startSession: () => void;
  endSession: () => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
}>({
  appConfig: APP_CONFIG_DEFAULTS,
  isSessionActive: false,
  startSession: () => {},
  endSession: () => {},
  selectedVoice: 'hi-IN-Aman',
  setSelectedVoice: () => {},
});

interface SessionProviderProps {
  appConfig: AppConfig;
  children: React.ReactNode;
}

export const SessionProvider = ({ appConfig, children }: SessionProviderProps) => {
  const [selectedVoice, setSelectedVoice] = useState('hi-IN-Aman');
  const { room, isSessionActive, startSession, endSession } = useRoom(appConfig, selectedVoice);
  const contextValue = useMemo(
    () => ({ appConfig, isSessionActive, startSession, endSession, selectedVoice, setSelectedVoice }),
    [appConfig, isSessionActive, startSession, endSession, selectedVoice, setSelectedVoice]
  );

  return (
    <RoomContext.Provider value={room}>
      <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
    </RoomContext.Provider>
  );
};

export function useSession() {
  return useContext(SessionContext);
}
