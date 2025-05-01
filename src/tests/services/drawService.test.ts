import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTeamsForDraw } from '@/services/drawService';
import prisma from '@/lib/prisma';
beforeEach(() => {
  // Limpar todos os mocks antes de cada teste
  vi.clearAllMocks();
});

vi.mock('@/lib/prisma', () => {
  return {
    default: {
      team: {
        findMany: vi.fn(), // Adicione o mock para findMany
        create: vi.fn(),
      },
    },
  };
});

describe('createTeamsForDraw', () => {
  it('should create teams successfully', async () => {
    const mockTeams = [
      { name: 'Team A', players: [1, 2, 3] },
      { name: 'Team B', players: [4, 5, 6] },
    ];

    // Simular que não há times existentes
    (prisma.team.findMany as any).mockResolvedValueOnce([]);

    // Simular criação bem-sucedida de times
    (prisma.team.create as any).mockResolvedValueOnce({ id: 1, name: 'Team A' });
    (prisma.team.create as any).mockResolvedValueOnce({ id: 2, name: 'Team B' });

    const result = await createTeamsForDraw({roundId: 1, teams: mockTeams});

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('name', 'Team A');
    expect(result[1]).toHaveProperty('name', 'Team B');
  });

  it('should throw an error if team creation fails', async () => {
    const mockTeams = [
      { name: 'Team A', players: [1, 2, 3] },
    ];

    // Simular que não há times existentes
    (prisma.team.findMany as any).mockResolvedValueOnce([]);

    // Simular falha na criação de times
    (prisma.team.create as any).mockRejectedValueOnce(new Error('Database error'));

    await expect(createTeamsForDraw({roundId: 1, teams: mockTeams})).rejects.toThrow('Erro ao criar os times.');
  });
});