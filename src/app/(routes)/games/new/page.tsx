// app/games/new/page.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation"; // Para redirecionamento

export default function CreateGame() {
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateGame = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date }),
    });

    const data = await res.json();

    if (res.ok) {
      // Redirecionar para a página de jogos após sucesso
      router.push("/games");
    } else {
      setError(data.error || "Erro ao criar jogo");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Jogo</h1>

      {/* <Card>
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 text-red-500 font-semibold">{error}</div>
          )}
          <form onSubmit={handleCreateGame} className="flex flex-col gap-4">
            <input
              type="date"
              className="p-2 border border-gray-300 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded flex items-center justify-center"
            >
              <Plus className="inline mr-2" />
              Criar Jogo
            </button>
          </form>
        </CardContent>
      </Card> */}
    </div>
  );
}
