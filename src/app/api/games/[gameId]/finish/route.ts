import { finalizeGame } from "@/services/gameService";

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const { gameId } = params;

  if (!gameId) {
    return new Response(
      JSON.stringify({ error: "ID do jogo inválido" }),
      { status: 400 }
    );
  }

  try {
    const game = await finalizeGame(gameId);

    return new Response(JSON.stringify(game), { status: 200 });
  } catch (error: any) {
    let status = 500;
    let errorMessage = "Erro ao finalizar o jogo";

    // Personalizando o erro baseado no tipo
    if (error.message === "ID do jogo inválido") {
      status = 400;
      errorMessage = error.message;
    } else if (error.message === "Jogo não encontrado") {
      status = 404;
      errorMessage = error.message;
    } else if (error.message === "Este jogo já foi finalizado") {
      status = 403;
      errorMessage = error.message;
    } else if (error.message === "Rodada não encontrada") {
      status = 404;
      errorMessage = error.message;
    } else if (error.message === "Não é possível finalizar um jogo em uma rodada finalizada") {
      status = 403;
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status }
    );
  }
}
