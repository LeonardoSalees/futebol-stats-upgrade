import { finishRound } from "@/services/roundService";

export async function POST(
  request: Request,
  { params }: { params: { roundId: string } }
) {
  const { roundId } = params;

  if (!roundId) {
    return new Response(
      JSON.stringify({ error: "ID da rodada inválido" }),
      { status: 400 }
    );
  }

  try {
    const updatedRound = await finishRound(roundId);

    return new Response(JSON.stringify(updatedRound), { status: 200 });
  } catch (error) {
    console.error("Erro ao finalizar a rodada:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao finalizar a rodada" }),
      { status: 500 }
    );
  }
} 