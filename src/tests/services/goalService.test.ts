import { describe, it, expect, vi, beforeEach } from "vitest";
import { createGoal, listGoals } from "@/services/goalService";
import { GoalSchema } from "@/schemas/goalSchema";
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenantContext';

// Mock do tenant context
vi.mock('@/lib/tenantContext', () => ({
  getCurrentTenantId: vi.fn().mockReturnValue('mock-tenant-id')
}));

// Definir tenant mock para testes
const MOCK_TENANT_ID = 'mock-tenant-id';

// Mock das funções do Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    goal: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    game: {
      findUnique: vi.fn(),
    },
    player: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Goal Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listGoals", () => {
    it("deve retornar a lista de gols", async () => {
      const mockGoals = [{ id: 1, team: "A", minute: 10, tenantId: MOCK_TENANT_ID }];
      (prisma.goal.findMany as any).mockResolvedValue(mockGoals);

      const goals = await listGoals(MOCK_TENANT_ID);

      expect(goals).toEqual(mockGoals);
      expect(prisma.goal.findMany).toHaveBeenCalledWith({
        include: {
          player: true,
          game: true,
          assistPlayer: true,
        },
        where: {
          tenantId: MOCK_TENANT_ID
        }
      });
    });

    it("deve lançar erro ao falhar na busca", async () => {
      (prisma.goal.findMany as any).mockRejectedValue(new Error("DB error"));

      await expect(listGoals(MOCK_TENANT_ID)).rejects.toThrow("Erro ao buscar gols.");
    });
  });

  describe("createGoal", () => {
    const validGoal = {
      playerId: 1,
      gameId: 1,
      team: "A",
      minute: 15,
      tenantId: MOCK_TENANT_ID
    };

    it("deve criar um gol com dados válidos", async () => {
      (prisma.game.findUnique as any).mockResolvedValue({ id: 1, started: true });
      (prisma.player.findUnique as any).mockResolvedValue({ id: 1 });
      (prisma.goal.create as any).mockResolvedValue({ id: 1, ...validGoal });

      const result = await createGoal(validGoal);

      expect(result).toEqual({ id: 1, ...validGoal });
    });

    it("deve lançar erro se o jogo não existir", async () => {
      (prisma.game.findUnique as any).mockResolvedValue(null);

      await expect(createGoal(validGoal)).rejects.toThrow("Jogo não encontrado.");
    });

    it("deve lançar erro se o jogo não estiver iniciado", async () => {
      (prisma.game.findUnique as any).mockResolvedValue({ id: 1, started: false });

      await expect(createGoal(validGoal)).rejects.toThrow("O jogo ainda não foi iniciado.");
    });

    it("deve lançar erro se o jogador não existir", async () => {
      (prisma.game.findUnique as any).mockResolvedValue({ id: 1, started: true });
      (prisma.player.findUnique as any).mockResolvedValue(null);

      await expect(createGoal(validGoal)).rejects.toThrow("Jogador não encontrado.");
    });

    it("deve lançar erro se os dados forem inválidos", async () => {
      const invalidGoal = {
        playerId: -1,
        gameId: 1,
        team: "",
        minute: 15,
        tenantId: MOCK_TENANT_ID
      };

      await expect(createGoal(invalidGoal as any)).rejects.toThrow("Dados inválidos:");
    });
  });
});