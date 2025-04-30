// app/players/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaArrowLeft, FaSave, FaUser, FaUserCheck } from "react-icons/fa";

export default function CreatePlayer() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState({
    name: "",
    isAvailable: true
  });

  const handleCreatePlayer = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(player),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirecionar para a página de jogadores após sucesso
        router.push("/players");
      } else {
        setError(data.error || "Erro ao criar jogador");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 shadow rounded-lg p-4 sm:p-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-4 text-gray-400 hover:text-white"
                onClick={() => router.push("/players")}
                title="Voltar para lista de jogadores"
              >
                <FaArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Cadastrar Novo Jogador</h1>
                <p className="mt-1 text-sm text-gray-400">Preencha os dados do novo jogador</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 shadow rounded-lg p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
                {error}
              </div>
            )}
            
            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                    <FaUser className="mr-2 h-4 w-4 text-blue-400" />
                    Nome
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nome do jogador"
                    value={player.name}
                    onChange={(e) => setPlayer({ ...player, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 w-full"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex items-center mt-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <input
                      id="isAvailable"
                      type="checkbox"
                      checked={player.isAvailable}
                      onChange={(e) => setPlayer({ ...player, isAvailable: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-300 flex items-center">
                      <FaUserCheck className="mr-2 h-4 w-4 text-green-400" />
                      Disponível para jogos
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md transition-all duration-200 p-2 rounded-lg"
                  disabled={loading}
                  title="Salvar jogador"
                >
                  {loading ? (
                    <span>Salvando...</span>
                  ) : (
                    <FaSave className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
