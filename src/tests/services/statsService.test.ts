import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPlayerRanking,
  getGameStatistics,
  getRoundStatistics,
  getAllStatistics,
} from '@/services/statsService';
import prisma from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  default: {
    player: {
      findMany: vi.fn(),
    },
    game: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    round: {
      findUnique: vi.fn(),
    },
    team: {
      findMany: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPlayerRanking', () => {
  it('should return players ranked by total goals + assists', async () => {
    (prisma.player.findMany as any).mockResolvedValue([
      { id: 1, name: 'Player 1', goals: [{ id: 1 }], assists: [{ id: 1 }] },
      { id: 2, name: 'Player 2', goals: [{ id: 2 }, { id: 3 }], assists: [] },
    ]);

    const ranking = await getPlayerRanking();

    expect(ranking).toEqual([
      { playerId: 2, name: 'Player 2', goals: 2, assists: 0, total: 2 },
      { playerId: 1, name: 'Player 1', goals: 1, assists: 1, total: 2 },
    ]);
  });
});

describe('getGameStatistics', () => {
  it('should return goal and assist data for a game', async () => {
    (prisma.game.findUnique as any).mockResolvedValue({
      id: 1,
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      homeScore: 2,
      awayScore: 1,
      goals: [
        { id: 1, player: { name: 'Player 1' } },
        { id: 2, player: { name: 'Player 2' } },
      ],
      assists: [
        { id: 1, player: { name: 'Player 3' } },
      ],
    });

    const stats = await getGameStatistics('1');

    expect(stats.homeTeam).toBe('Team A');
    expect(stats.goals).toHaveLength(2);
    expect(stats.assists).toHaveLength(1);
  });

  it('should throw an error if game not found', async () => {
    (prisma.game.findUnique as any).mockResolvedValue(null);

    await expect(getGameStatistics('1')).rejects.toThrow('Jogo não encontrado');
  });
});

describe('getRoundStatistics', () => {
  it('should return stats for all games in the round', async () => {
    (prisma.round.findUnique as any).mockResolvedValue({
      games: [
        {
          homeTeam: 'A',
          awayTeam: 'B',
          homeScore: 1,
          awayScore: 2,
          goals: [{ id: 1, player: { name: 'P1' } }],
          assists: [{ id: 2, player: { name: 'P2' } }],
        },
      ],
    });

    const stats = await getRoundStatistics('1');
    expect(stats).toHaveLength(1);
    expect(stats[0].goals[0].player).toBe('P1');
  });

  it('should throw an error if round not found', async () => {
    (prisma.round.findUnique as any).mockResolvedValue(null);

    await expect(getRoundStatistics('1')).rejects.toThrow('Rodada não encontrada');
  });
});

describe('getAllStatistics', () => {
  it('should return combined statistics', async () => {
    (prisma.player.findMany as any).mockResolvedValue([
      {
        id: 1,
        name: 'Player 1',
        isAvailable: true,
        goals: [{ id: 1 }, { id: 2 }],
        assists: [{ id: 3 }],
        _count: { goals: 2, assists: 1 },
      },
    ]);

    (prisma.game.findMany as any).mockResolvedValue([
      {
        id: 1,
        date: new Date('2024-01-15'),
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 3,
        awayScore: 2,
        goals: [{ id: 1 }, { id: 2 }],
        assists: [{ playerId: 1 }],
      },
    ]);

    (prisma.team.findMany as any).mockResolvedValue([
      {
        id: 1,
        name: 'Team A',
        round: {},
        players: [{ playerId: 1, player: {} }],
      },
    ]);

    const stats = await getAllStatistics();

    expect(stats.totalGoals).toBe(2);
    expect(stats.totalAssists).toBe(1);
    expect(stats.totalGames).toBe(1);
    expect(stats.topScorer.name).toBe('Player 1');
    expect(stats.teams).toHaveLength(1);
  });
});
