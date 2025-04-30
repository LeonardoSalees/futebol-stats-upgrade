import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RoundWithGames, ApiError } from '../types';

export function useRounds() {
  const [rounds, setRounds] = useState<RoundWithGames[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRounds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rounds');
      if (!response.ok) {
        throw new Error('Erro ao carregar rodadas');
      }
      const data = await response.json();
      console.log('Rodadas carregadas:', data);
      setRounds(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar rodadas:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar rodadas'));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartNewRound = (roundId: number) => {
    if (rounds && rounds.length > 0) {
      const updatedRounds = rounds.map((round) => ({
        ...round,
        isActive: round.id === roundId
      }));
      setRounds(updatedRounds);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  return {
    rounds,
    loading,
    error,
    refetch: fetchRounds,
    handleStartNewRound
  };
} 