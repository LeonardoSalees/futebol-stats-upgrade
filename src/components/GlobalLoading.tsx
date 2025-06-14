"use client";

import { useAppContext } from "@/contexts/AppContext";

export const GlobalLoading = () => {
  const { loading } = useAppContext();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-white text-lg">Carregando...</p>
      </div>
    </div>
  );
}; 