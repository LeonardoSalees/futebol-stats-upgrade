import { prisma } from '@/lib/prisma';  
import { drawSchema } from "@/schemas/drawSchema";

export async function createTeamsForDraw(data: {roundId: number, teams: { name: string; players: number[] }[], tenantId: string}) {
  try {
    const parsedData = drawSchema.parse(data);
    const existingTeams = await prisma.team.findMany({
      where: { roundId: parsedData.roundId },
    });
  
    if (existingTeams.length > 0) {
      throw new Error('Times já foram sorteados para esta rodada.');
    }
    if (!data.tenantId) {
      throw new Error('O tenantId é obrigatório.');
    }
          
    const createdTeams = await Promise.all(
      parsedData.teams.map(async (team) => {
        const newTeam = await prisma.team.create({
          data: {
            name: team.name,
            roundId: parsedData.roundId,
            players: {
              create: team.players.map((playerId) => ({
                player: { connect: { id: playerId } },
              })),
            },
            tenantId: data.tenantId,
          },
        });

        return newTeam;
      })
    );

    return createdTeams;
  } catch (error) {
    console.error('Erro ao criar os times:', error);
    throw new Error('Erro ao criar os times.');
  }
} 