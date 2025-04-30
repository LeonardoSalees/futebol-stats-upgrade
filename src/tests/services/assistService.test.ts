import { describe, it, expect, vi, afterEach } from 'vitest';
import { createAssist, updateAssist, getAssistById, getAllAssists } from '@/services/assistService';
import prisma from '@/lib/prisma';

vi.mock('@/lib/prisma', () => {
  return {
    default: {
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
    const assistData = { playerId: 1, gameId: 1, minute: 45, team: 'Team A' };
    (prisma.assist.create as jest.Mock).mockResolvedValue(assistData);

    const result = await createAssist(assistData);
    expect(prisma.assist.create).toHaveBeenCalledWith({ data: assistData });
    expect(result).toEqual(assistData);
  });

  it('should not allow an assist for both teams in the same game', async () => {
    const assistData = { playerId: 1, gameId: 1, minute: 45, team: 'Team A' };
    (prisma.assist.findFirst as jest.Mock).mockResolvedValue({ playerId: 1, gameId: 1, team: 'Team B' });

    await expect(createAssist(assistData)).rejects.toThrow('O jogador já deu assistência para o outro time neste jogo.');
  });

  it('should not allow a player to assist their own goal', async () => {
    const assistData = { playerId: 1, gameId: 1, minute: 45, team: 'Team A' };
    (prisma.goal.findFirst as jest.Mock).mockResolvedValue({ playerId: 1, gameId: 1, minute: 45 });

    await expect(createAssist(assistData)).rejects.toThrow('O jogador não pode dar assistência para seu próprio gol.');
  });

  it('should update an assist', async () => {
    const updatedData = { minute: 50 };
    (prisma.assist.update as jest.Mock).mockResolvedValue({ id: 1, ...updatedData });

    const result = await updateAssist(1, updatedData);
    expect(prisma.assist.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updatedData });
    expect(result).toEqual({ id: 1, ...updatedData });
  });

  it('should get an assist by ID', async () => {
    const assist = { id: 1, playerId: 1, gameId: 1, minute: 45, team: 'Team A' };
    (prisma.assist.findUnique as jest.Mock).mockResolvedValue(assist);

    const result = await getAssistById(1);
    expect(prisma.assist.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(assist);
  });

  it('should get all assists', async () => {
    const assists = [{ id: 1, playerId: 1, gameId: 1, minute: 45, team: 'Team A' }];
    (prisma.assist.findMany as jest.Mock).mockResolvedValue(assists);

    const result = await getAllAssists();
    expect(prisma.assist.findMany).toHaveBeenCalled();
    expect(result).toEqual(assists);
  });
}); 