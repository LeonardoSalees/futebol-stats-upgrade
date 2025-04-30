import { useState, useEffect, useCallback } from 'react';
import { Player } from '@/app/types';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players');
      if (!response.ok) {
        throw new Error('Erro ao carregar jogadores');
      }
      const data = await response.json();
      setPlayers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar jogadores'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    loading,
    error,
    refetchPlayers: fetchPlayers
  };
} 