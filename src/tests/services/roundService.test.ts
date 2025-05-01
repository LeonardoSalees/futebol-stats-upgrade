import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listRounds, createRound, getRoundById, finishRound } from '@/services/roundService';

vi.mock('@/lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      round: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      game: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    },
  };
});

import prisma from '@/lib/prisma'; // após o mock, isso pega o mockado

describe('Round Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listRounds', () => {
    it('deve retornar uma lista de rodadas', async () => {
      const mockRounds = [
        { id: 1, date: new Date(), finished: false, games: [] },
        { id: 2, date: new Date(), finished: true, games: [] },
      ];

      (prisma.round.findMany as jest.Mock).mockResolvedValue(mockRounds);

      const result = await listRounds();

      expect(result).toEqual(mockRounds);
      expect(prisma.round.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('createRound', () => {
    it('deve criar uma nova rodada se não houver rodada existente no dia', async () => {
      const mockRound = { id: 1 };
    
      // Primeira chamada: Não existe rodada no dia
      (prisma.round.findFirst as jest.Mock).mockResolvedValueOnce(null);
      
      // Segunda chamada: Não existe rodada anterior
      (prisma.round.findFirst as jest.Mock).mockResolvedValueOnce(null);
    
      // Mock de criação da nova rodada
      (prisma.round.create as jest.Mock).mockResolvedValue(mockRound);
    
      const result = await createRound();
    
      // Verifique as expectativas para duas chamadas do findFirst
      expect(result).toEqual(mockRound);
      expect(prisma.round.findFirst).toHaveBeenCalledTimes(2);  // Agora esperamos 2 chamadas
      expect(prisma.round.create).toHaveBeenCalledTimes(1);
    });

    it('deve retornar uma rodada existente se já houver rodada no dia', async () => {
      const mockRound = { id: 1, date: new Date() };
      (prisma.round.findFirst as jest.Mock).mockResolvedValue(mockRound);

      const result = await createRound({ date: new Date(), finished: false });

      expect(result).toEqual({ existingRound: true, round: mockRound });
      expect(prisma.round.findFirst).toHaveBeenCalledTimes(1);
    });

    it('deve lançar um erro se já existir uma rodada com o número da rodada seguinte', async () => {
      (prisma.round.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.round.findUnique as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(createRound({ date: new Date(), finished: false }))
        .rejects
        .toThrow('Já existe uma rodada com o número 1.');
    });
  });

  describe('getRoundById', () => {
    it('deve retornar a rodada se encontrada', async () => {
      const mockRound = { id: 1, date: new Date(), games: [], teams: [] };
      (prisma.round.findUnique as jest.Mock).mockResolvedValue(mockRound);

      const result = await getRoundById('1');

      expect(result).toEqual(mockRound);
      expect(prisma.round.findUnique).toHaveBeenCalledTimes(1);
    });

    it('deve lançar um erro se a rodada não for encontrada', async () => {
      (prisma.round.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getRoundById('1')).rejects.toThrow('Rodada não encontrada');
    });

    it('deve lançar um erro se o ID da rodada for inválido', async () => {
      await expect(getRoundById('invalid')).rejects.toThrow('ID da rodada inválido');
    });
  });

  describe('finishRound', () => {
    it('deve finalizar a rodada se não houver jogos em andamento', async () => {
      const mockRound = { id: 1, finished: false, games: [] };
      (prisma.round.findUnique as jest.Mock).mockResolvedValue(mockRound);
      (prisma.round.update as jest.Mock).mockResolvedValue({ ...mockRound, finished: true });

      const result = await finishRound('1');

      expect(result.finished).toBe(true);
      expect(prisma.round.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar um erro se a rodada já estiver finalizada', async () => {
      const mockRound = { id: 1, finished: true, games: [] };
      (prisma.round.findUnique as jest.Mock).mockResolvedValue(mockRound);

      await expect(finishRound('1')).rejects.toThrow('Esta rodada já está finalizada');
    });

    it('deve lançar um erro se existirem jogos em andamento', async () => {
      const mockRound = {
        id: 1,
        finished: false,
        games: [{ finished: false }],
      };
      (prisma.round.findUnique as jest.Mock).mockResolvedValue(mockRound);

      await expect(finishRound('1')).rejects.toThrow(
        'Não é possível finalizar a rodada. Existem jogos em andamento.',
      );
    });
  });
});
