import prisma from "@/lib/prisma";
import { GoalSchema } from "@/schemas/goalSchema";
import { z } from "zod";

export async function listGoals() {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        player: true,
        game: true,
      },
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
    const goal = await prisma.goal.create({
      data: { 
        playerId: goalData.playerId,
        gameId: goalData.gameId,
        team: goalData.team,
        minute: goalData.minute,
      }
    });
    return goal;
  } catch (error) {
    throw new Error('Erro ao criar gol.');
  }
}
