import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { createAssist, updateAssist, getAssistById, getAllAssists } from '@/services/assistService';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenantContext';

beforeEach(() => {
  // Limpar todos os mocks antes de cada teste
  vi.clearAllMocks();
}); 

// Mock do tenant context
vi.mock('@/lib/tenantContext', () => ({
  getCurrentTenantId: vi.fn().mockReturnValue('mock-tenant-id')
}));

// Definir tenant mock para testes
const MOCK_TENANT_ID = 'mock-tenant-id';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      assist: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        delete: vi.fn(),
        findFirst: vi.fn(),
      },
      goal: {
        findFirst: vi.fn(),
      },
    },
  };
});

describe('Assist Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create an assist', async () => {
    const assistData = { playerId: 1, gameId: 1, minute: 45, team: 'Team A', tenantId: MOCK_TENANT_ID };
    (prisma.assist.create as any).mockResolvedValue(assistData);

    const result = await createAssist(assistData);
    expect(prisma.assist.create).toHaveBeenCalledWith({ data: assistData });
    expect(result).toEqual(assistData);
  });

  it('should not allow an assist for both teams in the same game', async () => {
    const assistData = { playerId: 1, gameId: 1, minute: 45, team: 'Team A', tenantId: MOCK_TENANT_ID };
  
    // Simula que o jogador já deu assistência para o outro time (Team B)
    (prisma.assist.findFirst as any).mockImplementation(async (args: { where: { playerId: number, gameId: number, team?: { not: string } } }) => {
      console.log('Mock chamado com args:', args);
      if (
        args.where.playerId === 1 &&
        args.where.gameId === 1 &&
        args.where.team?.not === 'Team A'
      ) {
        return {
          playerId: 1,
          gameId: 1,
          minute: 30,
          team: 'Team B',
        };
      }
      return null;
    });
  
    await expect(createAssist(assistData)).rejects.toThrow(
      'O jogador já deu assistência para o outro time neste jogo.'
    );
  });

  it('should not allow a player to assist their own goal', async () => {
    const assistData = { playerId: 1, gameId: 1, minute: 45, team: 'Team A', tenantId: MOCK_TENANT_ID };
    (prisma.goal.findFirst as any).mockResolvedValue({ playerId: 1, gameId: 1, minute: 45 });

    await expect(createAssist(assistData)).rejects.toThrow('O jogador não pode dar assistência para seu próprio gol.');
  });

  it('should update an assist', async () => {
    const updatedData = { minute: 50 };
    (prisma.assist.update as any).mockResolvedValue({ id: 1, ...updatedData });

    const result = await updateAssist(1, updatedData);
    expect(prisma.assist.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updatedData });
    expect(result).toEqual({ id: 1, ...updatedData });
  });

  it('should get an assist by ID', async () => {
    const assist = { id: 1, playerId: 1, gameId: 1, minute: 45, team: 'Team A', tenantId: MOCK_TENANT_ID };
    (prisma.assist.findUnique as any).mockResolvedValue(assist);

    const result = await getAssistById(1);
    expect(prisma.assist.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(assist);
  });

  it('should get all assists', async () => {
    const assists = [{ id: 1, playerId: 1, gameId: 1, minute: 45, team: 'Team A', tenantId: MOCK_TENANT_ID }];
    (prisma.assist.findMany as any).mockResolvedValue(assists);

    const result = await getAllAssists();
    expect(prisma.assist.findMany).toHaveBeenCalled();
    expect(result).toEqual(assists);
  });
}); 