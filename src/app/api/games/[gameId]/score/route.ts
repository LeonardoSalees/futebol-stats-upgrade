import { updateGameScore } from "@/services/gameService";


export async function POST(
    req: Request, 
  ) {
    try {
      const body = await req.json();
      const { homeScore, awayScore, gameId } = body;
      const updatedGame = await updateGameScore(gameId, homeScore, awayScore);
  
      return new Response(JSON.stringify(updatedGame), { status: 200 });
    } catch (error) {
      console.error("Erro ao atualizar o placar:", error);
      return new Response(
        JSON.stringify({ error: "Erro interno ao atualizar o placar." }),
        { status: 500 }
      );
    }
  }