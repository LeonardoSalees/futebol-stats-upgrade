"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRounds } from '@/hooks/useRounds';
import { usePlayers } from '@/hooks/usePlayers';
import { RoundWithGames, ApiError, Player } from '@/types';

interface AppContextType {
  rounds: RoundWithGames[] | undefined;
  loading: boolean;
  error: ApiError | null;
  refetchRounds: () => Promise<void>;
  hasActiveGame: boolean;
  activeRound: RoundWithGames | undefined;
  players: Player[] | undefined;
  refetchPlayers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const { rounds, loading: roundsLoading, error: roundsError, refetch: refetchRoundsBase } = useRounds();
  const { players, loading: playersLoading, error: playersError, refetchPlayers } = usePlayers();
  const [activeRound, setActiveRound] = useState<RoundWithGames | undefined>(undefined);
  const [hasActiveGame, setHasActiveGame] = useState(false);

  const refetchRounds = useCallback(async () => {
    await refetchRoundsBase();
  }, [refetchRoundsBase]);

  useEffect(() => {
    if (rounds && rounds.length > 0) {
      const active = rounds.find(round => !round.finished);
      
      const hasActiveGameInRounds = rounds.some(round => 
        round.games.some(game => !game.finished && game.started)
      );
      
      setActiveRound(active);
      setHasActiveGame(hasActiveGameInRounds);
    } else {
      setActiveRound(undefined);
      setHasActiveGame(false);
    }
  }, [rounds]);

  return (
    <AppContext.Provider
      value={{
        rounds,
        loading: roundsLoading || playersLoading,
        error: roundsError || playersError,
        refetchRounds,
        hasActiveGame,
        activeRound,
        players,
        refetchPlayers
      }}
    >
      {children}
    </AppContext.Provider>
  );
}; 