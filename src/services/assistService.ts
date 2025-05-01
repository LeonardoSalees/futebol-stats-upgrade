import prisma from '@/lib/prisma';
import { assistSchema } from '@/schemas/assistSchema';
import { ZodError } from 'zod';

// Cria uma nova assistência
export async function createAssist(data: { playerId: number; gameId: number; minute: number; team: string }) {
  try {
    // Valida os dados de entrada
  const parsedData = assistSchema.parse(data);

  // Verifica se já existe um gol no mesmo minuto
  const existingGoal = await prisma.goal.findFirst({
    where: {
      gameId: parsedData.gameId,
      minute: parsedData.minute,
    },
  });

  // Se existir um gol no mesmo minuto, verifica se o jogador da assistência é o mesmo do gol
  if (existingGoal && existingGoal.playerId === parsedData.playerId) {
    throw new Error('O jogador não pode dar assistência para seu próprio gol.');
  }

  // Verifica se já existe uma assistência para o jogador no mesmo jogo, mas para um time diferente
  const existingAssist = await prisma.assist.findFirst({
    where: {
      playerId: parsedData.playerId,
      gameId: parsedData.gameId,
      team: {
        not: parsedData.team,
      },
    },
  });

  if (existingAssist) {
    throw new Error('O jogador já deu assistência para o outro time neste jogo.');
  }

  return prisma.assist.create({
    data: parsedData,
  });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar assistência';
    throw new Error(errorMessage);
  }
}
// Atualiza uma assistência existente
export async function updateAssist(id: number, data: Partial<{ playerId: number; gameId: number; minute: number; team: string }>) {
  // Valida os dados de entrada
  const parsedData = assistSchema.partial().parse(data);

  return prisma.assist.update({
    where: { id },
    data: parsedData,
  });
}

// Busca uma assistência por ID
export async function getAssistById(id: number) {
  return prisma.assist.findUnique({
    where: { id },
  });
}

// Lista todas as assistências
export async function getAllAssists() {
  return prisma.assist.findMany();
}

// Deleta uma assistência por ID
export async function deleteAssist(id: number) {
  return prisma.assist.delete({
    where: { id },
  });
}
