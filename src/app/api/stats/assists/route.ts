import { getPlayerRanking } from "@/services/statsService";


export async function GET() {
  try {
    const assists = await getPlayerRanking();
    return Response.json(assists);
  } catch (error) {
    return Response.json({ error: "Erro ao buscar ranking de assistências" }, { status: 500 });
  }
}