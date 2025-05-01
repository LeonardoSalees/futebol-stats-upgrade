import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { createPlayer, getAllPlayers, getPlayerById, updatePlayer, getAvailablePlayers } from '@/services/playerService';
import prisma from '@/lib/prisma';

beforeEach(() => {
  // Limpar todos os mocks antes de cada teste
  vi.clearAllMocks();
});

vi.mock('@/lib/prisma', () => {
  return {
    default: {
      player: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

describe('Player Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a player', async () => {
    const playerData = { name: 'John Doe', isAvailable: true, team: 'Team A' };
    (prisma.player.create as jest.Mock).mockResolvedValue(playerData);

    const result = await createPlayer(playerData);
    expect(prisma.player.create).toHaveBeenCalledWith({
      data: playerData,
      include: { assists: true, goals: true },
    });
    expect(result).toEqual(playerData);
  });

  it('should get all players', async () => {
    const players = [{ id: 1, name: 'John Doe', isAvailable: true, team: 'Team A' }];
    (prisma.player.findMany as jest.Mock).mockResolvedValue(players);

    const result = await getAllPlayers();
    expect(prisma.player.findMany).toHaveBeenCalled();
    expect(result).toEqual(players);
  });

  it('should get a player by ID', async () => {
    const player = { id: 1, name: 'John Doe', isAvailable: true, team: 'Team A' };
    (prisma.player.findUnique as jest.Mock).mockResolvedValue(player);

    const result = await getPlayerById(1);
    expect(prisma.player.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { assists: true, goals: true },
    });
    expect(result).toEqual(player);
  });

  it('should update a player', async () => {
    const updatedPlayer = { id: 1, name: 'John Doe', isAvailable: false, team: 'Team A' };
    (prisma.player.update as jest.Mock).mockResolvedValue(updatedPlayer);

    const result = await updatePlayer(1, { isAvailable: false });
    expect(prisma.player.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isAvailable: false },
      include: { assists: true, goals: true },
    });
    expect(result).toEqual(updatedPlayer);
  });
});

describe('Player Service - getAvailablePlayers', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return available players ordered by goals count', async () => {
    const mockPlayers = [
      { id: 1, name: 'Player 1', isAvailable: true, _count: { goals: 5, assists: 2 } },
      { id: 2, name: 'Player 2', isAvailable: true, _count: { goals: 3, assists: 1 } },
    ];
    (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);

    const players = await getAvailablePlayers();
    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        _count: {
          select: {
            goals: true,
            assists: true,
          },
        },
      },
      orderBy: {
        goals: {
          _count: 'desc',
        },
      },
    });
    expect(players).toEqual(mockPlayers);
  });

  it('should throw an error if fetching players fails', async () => {
    (prisma.player.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    await expect(getAvailablePlayers()).rejects.toThrow('Erro ao buscar jogadores disponíveis.');
  });
});