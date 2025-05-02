import { prisma } from '@/lib/prisma';
import { GoalSchema } from "@/schemas/goalSchema";
import { z } from "zod";
import { getCurrentTenantId } from '@/lib/tenantContext';

export async function listGoals(tenantId?: string) {
  try {
    // Obter o tenant atual se não for fornecido
    const currentTenantId = tenantId || getCurrentTenantId();
    
    if (!currentTenantId) {
      throw new Error("TenantId não encontrado");
    }
    
    const goals = await prisma.goal.findMany({
      include: {
        player: true,
        game: true,
        assistPlayer: true,
      },
      where: {
        tenantId: currentTenantId
      }
    });
    return goals;
  } catch (error) {
    throw new Error('Erro ao buscar gols.');
  }
}

export async function createGoal(goalData: z.infer<typeof GoalSchema>) {
  try {
    const parsedData = GoalSchema.parse(goalData);
    // Verifica se o jogo existe
    const gameExists = await prisma.game.findUnique({
      where: { id: parsedData.gameId },
    });
    if (!gameExists) {
      throw new Error('Jogo não encontrado.');
    }

    // Verifica se o jogo foi iniciado
    if (!gameExists.started) {
      throw new Error('O jogo ainda não foi iniciado.');
    }

    // Verifica se o jogador existe
    const playerExists = await prisma.player.findUnique({
      where: { id: parsedData.playerId },
    });
    if (!playerExists) {
      throw new Error('Jogador não encontrado.');
    }

    // Verifica se o jogador da assistência existe, se fornecido
    if (parsedData.assistPlayerId) {
      const assistPlayerExists = await prisma.player.findUnique({
        where: { id: parsedData.assistPlayerId },
      });
      if (!assistPlayerExists) {
        throw new Error('Jogador da assistência não encontrado.');
      }

      // Verifica se o jogador está tentando dar assistência para seu próprio gol
      if (parsedData.assistPlayerId === parsedData.playerId) {
        throw new Error('Um jogador não pode dar assistência para seu próprio gol.');
      }
    }
    if (!goalData.tenantId) {
      throw new Error('O tenantId é obrigatório.');
    }
    const goal = await prisma.goal.create({
      data: { 
        playerId: goalData.playerId,
        gameId: goalData.gameId,
        team: goalData.team,
        minute: goalData.minute,
        assistPlayerId: goalData.assistPlayerId || null,
        tenantId: goalData.tenantId,
      },
      include: {
        player: true,
        game: true,
        assistPlayer: true,
      },
    });
    return goal;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Dados inválidos: ${error.errors[0].message}`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao criar gol.');
  }
}
