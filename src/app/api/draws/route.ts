import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const draws = await prisma.round.findMany({
      where: {
        teams: {
          some: {} // Only rounds that have teams (draws)
        }
      },
      include: {
        teams: {
          include: {
            players: {
              include: {
                player: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new Response(JSON.stringify(draws), { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar os sorteios:", error);
    return new Response(JSON.stringify({ error: "Erro ao buscar os sorteios." }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roundId, teams }: { roundId: number; teams: { name: string; players: number[] }[] } = body;

    if (!roundId || !teams || !Array.isArray(teams)) {
      return new Response(JSON.stringify({ error: "Dados inválidos para criação de times." }), { status: 400 });
    }

    const createdTeams = await Promise.all(
      teams.map(async (team) => {
        const newTeam = await prisma.team.create({
          data: {
            name: team.name,
            roundId,
            players: {
              create: team.players.map((playerId) => ({
                player: { connect: { id: playerId } },
              })),
            },
          },
        });

        return newTeam;
      })
    );

    return new Response(JSON.stringify(createdTeams), { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar os times:", error);
    return new Response(JSON.stringify({ error: "Erro ao salvar os times." }), { status: 500 });
  }
} 