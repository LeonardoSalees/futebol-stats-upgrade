import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Dados recebidos para criação de times:", body);

    const { roundId, teams }: { roundId: number; teams: { name: string; players: number[] }[] } = body;

    if (!roundId || !teams || !Array.isArray(teams)) {
      console.error("Dados inválidos para criação de times:", { roundId, teams });
      return new Response(JSON.stringify({ error: "Dados inválidos para criação de times." }), { status: 400 });
    }

    console.log("Criando times para a rodada:", roundId);
    console.log("Times a serem criados:", teams);

    // Verificar se a rodada existe
    const round = await prisma.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      console.error("Rodada não encontrada:", roundId);
      return new Response(JSON.stringify({ error: "Rodada não encontrada." }), { status: 404 });
    }

    // Verificar se a rodada já tem times
    const existingTeams = await prisma.team.findMany({
      where: { roundId },
    });

    if (existingTeams.length > 0) {
      console.error("A rodada já tem times:", existingTeams);
      return new Response(JSON.stringify({ error: "A rodada já tem times." }), { status: 400 });
    }

    // Criar os times
    const createdTeams = await Promise.all(
      teams.map(async (team) => {
        console.log("Criando time:", team.name, "com jogadores:", team.players);
        
        // Criar o time
        const newTeam = await prisma.team.create({
          data: {
            name: team.name,
            roundId,
          },
        });
        
        console.log("Time criado:", newTeam);
        
        // Adicionar os jogadores ao time
        await Promise.all(
          team.players.map(async (playerId) => {
            await prisma.playerOnTeam.create({
              data: {
                playerId,
                teamId: newTeam.id,
              },
            });
          })
        );
        
        return newTeam;
      })
    );

    console.log("Times criados com sucesso:", createdTeams);
    return new Response(JSON.stringify(createdTeams), { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar os times:", error);
    return new Response(JSON.stringify({ error: "Erro ao salvar os times." }), { status: 500 });
  }
}

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: {
          include: {
            player: true,
          },
        },
        round: {
          include: {
            games: {
              include: {
                goals: true,
                assists: true,
              },
            },
          },
        },
      },
    });

    const teamsWithStats = teams.map(team => {
      const teamGames = team.round?.games || [];
      const teamGoals = teamGames.reduce((acc, game) => {
        const teamGoalsInGame = game.goals.filter(goal => 
          team.players.some(tp => tp.player.id === goal.playerId)
        ).length;
        return acc + teamGoalsInGame;
      }, 0);

      const teamAssists = teamGames.reduce((acc, game) => {
        const teamAssistsInGame = game.assists.filter(assist => 
          team.players.some(tp => tp.player.id === assist.playerId)
        ).length;
        return acc + teamAssistsInGame;
      }, 0);

      const wins = teamGames.filter(game => {
        const teamScore = game.goals.filter(goal => 
          team.players.some(tp => tp.player.id === goal.playerId)
        ).length;
        const opponentScore = game.goals.filter(goal => 
          !team.players.some(tp => tp.player.id === goal.playerId)
        ).length;
        return teamScore > opponentScore;
      }).length;

      const draws = teamGames.filter(game => {
        const teamScore = game.goals.filter(goal => 
          team.players.some(tp => tp.player.id === goal.playerId)
        ).length;
        const opponentScore = game.goals.filter(goal => 
          !team.players.some(tp => tp.player.id === goal.playerId)
        ).length;
        return teamScore === opponentScore;
      }).length;

      return {
        ...team,
        goals: teamGoals,
        assists: teamAssists,
        games: teamGames.length,
        wins,
        draws,
        losses: teamGames.length - wins - draws,
      };
    });
  
    return new Response(JSON.stringify(teamsWithStats), { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar os times:", error);
    return new Response(JSON.stringify({ error: "Erro ao buscar os times." }), { status: 500 });
  }
}
