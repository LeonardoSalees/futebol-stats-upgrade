import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { createPlayer, getAllPlayers, getPlayerById, updatePlayer, getAvailablePlayers } from '@/services/playerService';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenantContext';

// Mock do tenant context
vi.mock('@/lib/tenantContext', () => ({
  getCurrentTenantId: vi.fn().mockReturnValue('mock-tenant-id')
}));

beforeEach(() => {
  // Limpar todos os mocks antes de cada teste
  vi.clearAllMocks();
});

// Definir tenant mock para testes
const MOCK_TENANT_ID = 'mock-tenant-id';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      player: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      goal: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      assist: {
        findMany: vi.fn().mockResolvedValue([]),
      }
    },
  };
});

describe('Player Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a player with tenant ID', async () => {
    const playerData = { name: 'John Doe', isAvailable: true, team: 'Team A' };
    const createdPlayer = { id: 1, ...playerData, tenantId: MOCK_TENANT_ID };
    
    // Mock do método create do Prisma
    (prisma.player.create as any).mockResolvedValue(createdPlayer);
    
    const result = await createPlayer(playerData, MOCK_TENANT_ID);
    
    // Verificar se o tenant ID foi passado para a consulta
    expect(prisma.player.create).toHaveBeenCalledWith({
      data: {
        ...playerData,
        tenantId: MOCK_TENANT_ID
      }
    });
    expect(result).toEqual({ ...createdPlayer, goals: [], assists: [] });
  });

  it('should get all players for a tenant', async () => {
    const players = [
      { id: 1, name: 'John Doe', isAvailable: true, team: 'Team A', tenantId: MOCK_TENANT_ID }
    ];
    
    // Mock do método findMany do Prisma
    (prisma.player.findMany as any).mockResolvedValue(players);
    
    const result = await getAllPlayers(MOCK_TENANT_ID);
    
    // Verificar se o tenant ID foi usado na consulta
    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: { tenantId: MOCK_TENANT_ID }
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(1);
  });

  it('should get a player by ID with tenant context', async () => {
    const player = { id: 1, name: 'John Doe', isAvailable: true, team: 'Team A', tenantId: MOCK_TENANT_ID };
    
    // Mock do método findUnique do Prisma
    (prisma.player.findUnique as any).mockResolvedValue(player);
    
    const result = await getPlayerById(1, MOCK_TENANT_ID);
    
    // Verificar se o tenant ID foi usado na consulta
    expect(prisma.player.findUnique).toHaveBeenCalledWith({
      where: {
        id_tenantId: {
          id: 1,
          tenantId: MOCK_TENANT_ID
        }
      }
    });
    expect(result).toMatchObject({
      id: 1,
      tenantId: MOCK_TENANT_ID
    });
  });

  it('should update a player for a specific tenant', async () => {
    const updatedPlayer = { 
      id: 1, 
      name: 'John Doe', 
      isAvailable: false, 
      team: 'Team A', 
      tenantId: MOCK_TENANT_ID 
    };
    
    // Mock do método update do Prisma
    (prisma.player.update as any).mockResolvedValue(updatedPlayer);
    
    const result = await updatePlayer(1, { isAvailable: false }, MOCK_TENANT_ID);
    
    // Verificar se o tenant ID foi usado na consulta de atualização
    expect(prisma.player.update).toHaveBeenCalledWith({
      where: {
        id_tenantId: {
          id: 1,
          tenantId: MOCK_TENANT_ID
        }
      },
      data: {
        name: undefined,
        isAvailable: false,
        team: undefined
      }
    });
    expect(result).toMatchObject({
      id: 1,
      isAvailable: false,
      tenantId: MOCK_TENANT_ID
    });
  });

  it('should get available players for a tenant', async () => {
    const mockPlayers = [
      { 
        id: 1, 
        name: 'Player 1', 
        isAvailable: true, 
        tenantId: MOCK_TENANT_ID,
        goals: Array(5).fill({}),
        assists: Array(2).fill({})
      },
      { 
        id: 2, 
        name: 'Player 2', 
        isAvailable: true, 
        tenantId: MOCK_TENANT_ID,
        goals: Array(3).fill({}),
        assists: Array(1).fill({})
      }
    ];
    
    // Mock do método findMany do Prisma
    (prisma.player.findMany as any).mockResolvedValue(mockPlayers);
    
    const players = await getAvailablePlayers(MOCK_TENANT_ID);
    
    // Verificar se o tenant ID foi usado na consulta
    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {
        isAvailable: true,
        tenantId: MOCK_TENANT_ID
      },
      include: {
        goals: true,
        assists: true
      },
      orderBy: {
        goals: {
          _count: 'desc'
        }
      }
    });
    expect(players).toHaveLength(2);
    expect(players[0].goal_count).toBe(5);
  });

  it('should throw an error if tenant ID is not provided or available', async () => {
    // Simular caso em que o tenant ID não está disponível
    (getCurrentTenantId as any).mockReturnValueOnce(undefined);
    
    // Verificar se a função lança erro quando não há tenant ID
    await expect(getAllPlayers()).rejects.toThrow('TenantId não encontrado');
  });

  it('should throw an error if fetching players fails', async () => {
    (prisma.player.findMany as any).mockRejectedValue(new Error('Database error'));

    await expect(getAvailablePlayers(MOCK_TENANT_ID)).rejects.toThrow('Erro ao buscar jogadores disponíveis.');
  });
});