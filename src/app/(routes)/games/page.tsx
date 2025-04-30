// app/games/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FaPlus, FaEdit, FaTrash, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function GamesPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const handleNewGame = () => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem criar novos jogos");
      return;
    }
    router.push("/games/new");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Jogos</h1>
        <div className="flex items-center">
          {isAdmin ? (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleNewGame}
            >
              <FaPlus className="mr-2" />
              Novo Jogo
            </Button>
          ) : (
            <div className="flex items-center text-gray-400 text-sm">
              <FaLock className="mr-2" />
              Apenas administradores podem criar jogos
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Time Casa
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Placar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Time Visitante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {/* Exemplo de linha da tabela */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Time A</td>
              <td className="px-6 py-4 whitespace-nowrap text-center">2 x 1</td>
              <td className="px-6 py-4 whitespace-nowrap">Time B</td>
              <td className="px-6 py-4 whitespace-nowrap">01/01/2024</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Finalizado
                </span>
              </td>
              {isAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    <FaEdit className="mr-2" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <FaTrash className="mr-2" />
                    Excluir
                  </Button>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
