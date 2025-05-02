import { prisma } from '@/lib/prisma';
import { gameSchema } from "@/schemas/gameSchema";
export const createGame = async (data: {
  roundId: number;
  date?: string;
  homeTeam: string;
  awayTeam: string;
  tenantId: string;
}) => {
  try {
    const parsedData = gameSchema.parse(data);
    const { roundId, homeTeam, awayTeam, tenantId } = parsedData;

  // Verificar se a rodada existe
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: { finished: true },
  });

  if (!round) {
    throw new Error('Rodada não encontrada.');
  }
  console.log(round);
  if (round.finished) {
    throw new Error('Não é possível criar um jogo para uma rodada finalizada.');
  }
  if (!tenantId) {
    throw new Error('O tenantId é obrigatório.');
  }
  const game = await prisma.game.create({
    data: {
      roundId,
      homeTeam,
      awayTeam,
      tenantId
    },
  });

  return game;
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Não foi possível criar o jogo';
    throw new Error(errorMessage);
  }
};

export const getAllGames = async () => {
  return await prisma.game.findMany({
    include: {
      round: true,
      goals: true,
      assists: true,
    },
    orderBy: {
      date: 'asc',
    },
  });
};

export const updateGame = async (data: {
  id: number;
  roundId?: number;
  date?: string;
}) => {
  const { id, roundId, date } = data;

  const updatedGame = await prisma.game.update({
    where: { id },
    data: {
      roundId,
      date: date ? new Date(date) : undefined,
    },
  });

  return updatedGame;
};

export const getGameById = async (gameId: number) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: {
      awayTeam: true,
      homeTeam: true,
      started: true,
      time: true,
      homeScore: true,
      awayScore: true,
      roundId: true,
      finished: true,
    },
  });

  if (!game) throw new Error('Jogo não encontrado.');

  return game;
};

export const updateGameById = async (
  gameId: number,
  data: { started?: boolean; time?: number }
) => {
  const existingGame = await prisma.game.findUnique({
    where: { id: gameId },
    select: { finished: true },
  });

  if (!existingGame) {
    throw new Error('Jogo não encontrado.');
  }

  if (existingGame.finished) {
    throw new Error('Não é possível atualizar um jogo que já foi finalizado.');
  }

  const game = await prisma.game.update({
    where: { id: gameId },
    data,
  });

  return game;
};

export const updateGameScore = async (gameId: string, homeScore: number, awayScore: number) => {
  // Verifica se o gameId é um número válido
  const parsedGameId = parseInt(gameId);
  if (isNaN(parsedGameId)) {
    throw new Error("ID do jogo inválido.");
  }

  // Verifica se os placares são válidos
  if (typeof homeScore !== "number" || typeof awayScore !== "number") {
    throw new Error("Placar inválido. homeScore e awayScore devem ser números.");
  }

  try {
    // Verificar se o jogo existe
    const existingGame = await prisma.game.findUnique({
      where: { id: parsedGameId },
      select: { finished: true }
    });

    if (!existingGame) {
      throw new Error("Jogo não encontrado.");
    }

    // Verifica se o jogo já foi finalizado
    if (existingGame.finished) {
      throw new Error("Não é possível atualizar o placar de um jogo que já foi finalizado.");
    }

    // Atualiza o placar
    const updatedGame = await prisma.game.update({
      where: { id: parsedGameId },
      data: { homeScore, awayScore }
    });

    return updatedGame;
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Não foi possível atualizar o placar';
    throw new Error(errorMessage);
  }
};

export const finalizeGame = async (gameId: string) => {
  if (!gameId) {
    throw new Error("ID do jogo inválido");
  }

  const existingGame = await prisma.game.findUnique({
    where: { id: parseInt(gameId, 10) },
    select: { finished: true, roundId: true },
  });

  if (!existingGame) {
    throw new Error("Jogo não encontrado");
  }

  if (existingGame.finished) {
    throw new Error("Este jogo já foi finalizado");
  }

  const round = await prisma.round.findUnique({
    where: { id: existingGame.roundId },
    select: { finished: true },
  });

  if (!round) {
    throw new Error("Rodada não encontrada");
  }

  if (round.finished) {
    throw new Error("Não é possível finalizar um jogo em uma rodada finalizada");
  }

  const game = await prisma.game.update({
    where: { id: parseInt(gameId, 10) },
    data: {
      finished: true,
    },
    select: {
      roundId: true,
      finished: true,
    },
  });

  return game;
}
