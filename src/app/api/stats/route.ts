import { getAllStatistics } from "@/services/statsService";


export async function GET() {
  try {
    const statistics = await getAllStatistics();
    return Response.json(statistics);
  } catch (error) {
    return Response.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
};
