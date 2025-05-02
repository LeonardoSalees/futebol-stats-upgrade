import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGame, finalizeGame, getAllGames, getGameById, updateGame, updateGameById, updateGameScore } from '@/services/gameService';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenantContext';

// Mock do tenant context
vi.mock('@/lib/tenantContext', () => ({
  getCurrentTenantId: vi.fn().mockReturnValue('mock-tenant-id')
}));

// Definir tenant mock para testes
const MOCK_TENANT_ID = 'mock-tenant-id';

beforeEach(() => {
  // Limpar todos os mocks antes de cada teste
  vi.clearAllMocks();
});

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      round: {
        findUnique: vi.fn(),
      },
      game: {
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      }
    },
  };
});

describe('createGame', () => {
  it('should create a new game if round exists and is not finished', async () => {
    const roundId = 1;
    const gameData = { roundId, homeTeam: 'Team A', awayTeam: 'Team B', tenantId: MOCK_TENANT_ID };

    // Mockando o comportamento da rodada
    (prisma.round.findUnique as any).mockResolvedValue({ finished: false });

    // Mockando o comportamento de criação do jogo
    (prisma.game.create as any).mockResolvedValue({
      id: 1,
      roundId,
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      tenantId: MOCK_TENANT_ID
    });

    const game = await createGame(gameData);

    expect(game).toEqual({
      id: 1,
      roundId,
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      tenantId: MOCK_TENANT_ID
    });
  });

  it('should throw an error if the round is finished', async () => {
    const roundId = 1;
    const gameData = { roundId, homeTeam: 'Team A', awayTeam: 'Team B', tenantId: MOCK_TENANT_ID };

    // Mockando o comportamento da rodada
    (prisma.round.findUnique as any).mockResolvedValue({ finished: true });

    await expect(createGame(gameData)).rejects.toThrow('Não é possível criar um jogo para uma rodada finalizada.');
  });

  it('should throw an error if round does not exist', async () => {
    const roundId = 1;
    const gameData = { roundId, homeTeam: 'Team A', awayTeam: 'Team B', tenantId: MOCK_TENANT_ID };

    // Mockando a rodada não encontrada
    (prisma.round.findUnique as any).mockResolvedValue(null);

    await expect(createGame(gameData)).rejects.toThrow('Rodada não encontrada.');
  });
});

// Teste para getAllGames
describe('getAllGames', () => {
  it('should return all games', async () => {
    // Mockando o comportamento do Prisma
    (prisma.game.findMany as any).mockResolvedValue([
      { id: 1, homeTeam: 'Team A', awayTeam: 'Team B', tenantId: MOCK_TENANT_ID },
      { id: 2, homeTeam: 'Team C', awayTeam: 'Team D', tenantId: MOCK_TENANT_ID },
    ]);

    const games = await getAllGames();
    
    expect(games).toHaveLength(2);
    expect(games[0].homeTeam).toBe('Team A');
    expect(games[1].awayTeam).toBe('Team D');
  });
});

// Teste para updateGame
describe('updateGame', () => {
  it('should update a game', async () => {
    const updatedData = { id: 1, roundId: 2, date: '2025-04-01', tenantId: MOCK_TENANT_ID };

    // Mockando o comportamento do Prisma
    (prisma.game.update as any).mockResolvedValue({
      id: 1,
      roundId: 2,
      date: new Date('2025-04-01'),
      tenantId: MOCK_TENANT_ID
    });

    const updatedGame = await updateGame(updatedData);

    expect(updatedGame).toEqual({
      id: 1,
      roundId: 2,
      date: new Date('2025-04-01'),
      tenantId: MOCK_TENANT_ID
    });
  });
});

// Teste para getGameById
describe('getGameById', () => {
  it('should return a game by ID', async () => {
    const gameId = 1;

    // Mockando o comportamento do Prisma
    (prisma.game.findUnique as any).mockResolvedValue({
      id: 1,
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      started: false,
      time: 0,
      homeScore: 0,
      awayScore: 0,
      roundId: 1,
      finished: false,
      tenantId: MOCK_TENANT_ID
    });

    const game = await getGameById(gameId);

    expect(game).toEqual({
      id: 1,
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      started: false,
      time: 0,
      homeScore: 0,
      awayScore: 0,
      roundId: 1,
      finished: false,
      tenantId: MOCK_TENANT_ID
    });
  });

  it('should throw an error if the game is not found', async () => {
    const gameId = 999;

    // Mockando o comportamento do Prisma
    (prisma.game.findUnique as any).mockResolvedValue(null);

    await expect(getGameById(gameId)).rejects.toThrow('Jogo não encontrado.');
  });
});

// Teste para updateGameById
describe('updateGameById', () => {
  it('should update the game by ID if not finished', async () => {
    const gameId = 1;
    const data = { started: true, time: 10 };

    // Mockando o comportamento do Prisma
    (prisma.game.findUnique as any) .mockResolvedValue({ finished: false });
    (prisma.game.update as any).mockResolvedValue({
      id: gameId,
      started: true,
      time: 10,
      tenantId: MOCK_TENANT_ID
    });

    const updatedGame = await updateGameById(gameId, data);

    expect(updatedGame).toEqual({
      id: gameId,
      started: true,
      time: 10,
      tenantId: MOCK_TENANT_ID
    });
  });

  it('should throw an error if the game is finished', async () => {
    const gameId = 1;
    const data = { started: true, time: 10 };

    // Mockando o comportamento do Prisma
    (prisma.game.findUnique as any).mockResolvedValue({ finished: true });

    await expect(updateGameById(gameId, data)).rejects.toThrow(
      'Não é possível atualizar um jogo que já foi finalizado.'
    );
  });
});

// Teste para updateGameScore
describe('updateGameScore', () => {
  it('should update the score of a game', async () => {
    const gameId = '1';
    const homeScore = 2;
    const awayScore = 3;

    // Mockando o comportamento do Prisma
    (prisma.game.findUnique as any).mockResolvedValue({ finished: false });
    (prisma.game.update as any).mockResolvedValue({
      id: 1,
      homeScore,
      awayScore,
      tenantId: MOCK_TENANT_ID
    });

    const updatedGame = await updateGameScore(gameId, homeScore, awayScore);

    expect(updatedGame).toEqual({
      id: 1,
      homeScore,
      awayScore,
      tenantId: MOCK_TENANT_ID
    });
  });

  it('should throw an error if the game is finished', async () => {
    const gameId = '1';
    const homeScore = 2;
    const awayScore = 3;

    // Mockando o comportamento do Prisma
    (prisma.game.findUnique as any).mockResolvedValue({ finished: true });

    await expect(updateGameScore(gameId, homeScore, awayScore)).rejects.toThrow(
      'Não é possível atualizar o placar de um jogo que já foi finalizado.'
    );
  });

  it('should throw an error if the game ID is invalid', async () => {
    const gameId = 'invalid';
    const homeScore = 2;
    const awayScore = 3;

    await expect(updateGameScore(gameId, homeScore, awayScore)).rejects.toThrow(
      'ID do jogo inválido.'
    );
  });
});

// Teste para finalizeGame    
describe('finalizeGame', () => {
  it('should throw error if gameId is invalid', async () => {
    try {
      await finalizeGame('');
    } catch (error: any) {
      expect(error.message).toBe('ID do jogo inválido');
    }
  });
  
  it('should throw error if game not found', async () => {
    (prisma.game.findUnique as any).mockResolvedValue(null);
    
    await expect(finalizeGame('1')).rejects.toThrow('Jogo não encontrado');
  });
  
  it('should throw error if game is already finished', async () => {
    (prisma.game.findUnique as any).mockResolvedValue({ 
      id: 1, 
      finished: true,
      tenantId: MOCK_TENANT_ID
    });
    
    await expect(finalizeGame('1')).rejects.toThrow('Este jogo já foi finalizado');
  });
  
  it('should throw error if round not found', async () => {
    (prisma.game.findUnique as any).mockResolvedValue({ 
      id: 1, 
      finished: false, 
      roundId: 999,
      tenantId: MOCK_TENANT_ID
    });
    (prisma.round.findUnique as any).mockResolvedValue(null);
    
    await expect(finalizeGame('1')).rejects.toThrow('Rodada não encontrada');
  });
  
  it('should throw error if round is finished', async () => {
    (prisma.game.findUnique as any).mockResolvedValue({ 
      id: 1, 
      finished: false, 
      roundId: 1,
      tenantId: MOCK_TENANT_ID
    });
    (prisma.round.findUnique as any).mockResolvedValue({ id: 1, finished: true });
    
    await expect(finalizeGame('1')).rejects.toThrow('Não é possível finalizar um jogo em uma rodada finalizada');
  });
  
  it('should successfully finalize a game', async () => {
    (prisma.game.findUnique as any).mockResolvedValue({ 
      id: 1, 
      finished: false, 
      roundId: 1,
      tenantId: MOCK_TENANT_ID
    });
    (prisma.round.findUnique as any).mockResolvedValue({ id: 1, finished: false });
    (prisma.game.update as any).mockResolvedValue({ 
      id: 1, 
      finished: true,
      roundId: 1,
      tenantId: MOCK_TENANT_ID
    });
    
    const result = await finalizeGame('1');
    
    expect(result.finished).toBe(true);
    expect(prisma.game.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { finished: true },
      select: { roundId: true, finished: true }
    });
  });
});
