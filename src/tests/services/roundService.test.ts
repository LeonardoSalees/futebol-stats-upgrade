import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listRounds, createRound, getRoundById, finishRound } from '@/services/roundService';
import { getCurrentTenantId } from '@/lib/tenantContext';

// Mock do tenant context
vi.mock('@/lib/tenantContext', () => ({
  getCurrentTenantId: vi.fn().mockReturnValue('mock-tenant-id')
}));

// Definir tenant ID mock para testes
const MOCK_TENANT_ID = 'mock-tenant-id';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
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

import { prisma } from '@/lib/prisma'; // após o mock, isso pega o mockado

describe('Round Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listRounds', () => {
    it('deve retornar uma lista de rodadas para um tenant específico', async () => {
      const mockRounds = [
        { id: 1, date: new Date(), finished: false, games: [], tenantId: MOCK_TENANT_ID },
        { id: 2, date: new Date(), finished: true, games: [], tenantId: MOCK_TENANT_ID },
      ];

      // Usar findMany em vez de SQL Raw
      (prisma.round.findMany as any).mockResolvedValue(mockRounds);

      const result = await listRounds(MOCK_TENANT_ID);

      expect(result).toEqual(mockRounds);
      expect(prisma.round.findMany).toHaveBeenCalledWith({
        where: { tenantId: MOCK_TENANT_ID },
        include: {
          games: {
            include: {
              goals: true,
              assists: true,
              players: {
                include: {
                  player: true
                }
              }
            },
            orderBy: {
              date: 'desc'
            }
          }
        },
        orderBy: {
          id: 'desc'
        }
      });
    });
  });

  describe('createRound', () => {
    it('deve criar uma nova rodada se não houver rodada existente no dia', async () => {
      const mockRound = { id: 1, tenantId: MOCK_TENANT_ID };
    
      // Primeira chamada: Não existe rodada no dia
      (prisma.round.findFirst as any).mockResolvedValueOnce(null);
      
      // Segunda chamada: Para numeral da rodada
      (prisma.round.findFirst as any).mockResolvedValueOnce(null);
      
      // Terceira chamada: Criar nova rodada
      (prisma.round.create as any).mockResolvedValue(mockRound);
    
      const result = await createRound(undefined, MOCK_TENANT_ID);
    
      expect(result).toEqual(mockRound);
      expect(prisma.round.create).toHaveBeenCalledTimes(1);
    });

    it('deve retornar uma rodada existente se já houver rodada no dia', async () => {
      const mockRound = { id: 1, date: new Date(), tenantId: MOCK_TENANT_ID };
      
      // Mock para encontrar uma rodada existente
      (prisma.round.findFirst as any).mockResolvedValue(mockRound);

      const result = await createRound({ date: new Date(), finished: false }, MOCK_TENANT_ID);

      expect(result).toEqual({ existingRound: true, round: mockRound });
      expect(prisma.round.findFirst).toHaveBeenCalledTimes(1);
    });

    it('deve lançar um erro se o tenant ID não estiver disponível', async () => {
      // Simular caso em que o tenant ID não está disponível
      (getCurrentTenantId as any).mockReturnValueOnce(undefined);
      
      await expect(createRound({ date: new Date(), finished: false }))
        .rejects
        .toThrow('TenantId não encontrado');
    });
  });

  describe('getRoundById', () => {
    it('deve retornar a rodada se encontrada', async () => {
      const mockRound = { 
        id: 1, 
        date: new Date(), 
        games: [], 
        teams: [],
        tenantId: MOCK_TENANT_ID 
      };
      
      // Mock para encontrar uma rodada existente
      (prisma.round.findUnique as any).mockResolvedValue(mockRound);

      const result = await getRoundById('1', MOCK_TENANT_ID);

      expect(result).toEqual(mockRound);
      expect(prisma.round.findUnique).toHaveBeenCalledWith({
        where: {
          id_tenantId: {
            id: 1,
            tenantId: MOCK_TENANT_ID
          }
        },
        include: {
          games: {
            include: {
              goals: {
                include: {
                  player: true
                }
              },
              assists: {
                include: {
                  player: true
                }
              },
              players: {
                include: {
                  player: true
                }
              }
            },
            orderBy: {
              date: 'desc'
            }
          },
          teams: true
        }
      });
    });

    it('deve lançar um erro se a rodada não for encontrada', async () => {
      // Mock para não encontrar rodada
      (prisma.round.findUnique as any).mockResolvedValue(null);

      await expect(getRoundById('1', MOCK_TENANT_ID)).rejects.toThrow('Rodada não encontrada');
    });

    it('deve lançar um erro se o ID da rodada for inválido', async () => {
      await expect(getRoundById('invalid', MOCK_TENANT_ID)).rejects.toThrow('ID da rodada inválido');
    });
  });

  describe('finishRound', () => {
    it('deve finalizar a rodada se não houver jogos em andamento', async () => {
      const mockRound = { 
        id: 1, 
        finished: false, 
        games: [],
        tenantId: MOCK_TENANT_ID
      };
      
      // Mock para encontrar rodada
      (prisma.round.findUnique as any).mockResolvedValue(mockRound);
      
      // Mock para os jogos da rodada (todos finalizados)
      (prisma.game.findMany as any).mockResolvedValue([]);
      
      // Mock para update da rodada
      (prisma.round.update as any).mockResolvedValue({ ...mockRound, finished: true });

      const result = await finishRound('1', MOCK_TENANT_ID);

      expect(result.finished).toBe(true);
      expect(prisma.round.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar um erro se a rodada já estiver finalizada', async () => {
      const mockRound = { 
        id: 1, 
        finished: true, 
        games: [],
        tenantId: MOCK_TENANT_ID
      };
      
      // Mock para encontrar rodada já finalizada
      (prisma.round.findUnique as any).mockResolvedValue(mockRound);

      await expect(finishRound('1', MOCK_TENANT_ID)).rejects.toThrow('Esta rodada já está finalizada');
    });

    it('deve lançar um erro se existirem jogos em andamento', async () => {
      const mockRound = {
        id: 1,
        finished: false,
        tenantId: MOCK_TENANT_ID
      };
      
      // Mock para encontrar a rodada
      (prisma.round.findUnique as any).mockResolvedValue(mockRound);
      
      // Mock para encontrar jogos não finalizados
      (prisma.game.findMany as any).mockResolvedValue([{ id: 1, finished: false }]);

      await expect(finishRound('1', MOCK_TENANT_ID)).rejects.toThrow(
        'Não é possível finalizar a rodada. Existem jogos em andamento.'
      );
    });
  });
});
