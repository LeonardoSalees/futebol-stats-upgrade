'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TenantNotFoundPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Quadra não encontrada</h1>
        
        <div className="mb-6 text-gray-600">
          <p className="mb-4">
            A quadra que você está procurando não existe ou não está disponível.
          </p>
          <p>
            Verifique se o subdomínio está correto ou entre em contato com o administrador.
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Link 
            href="/"
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Ir para a página inicial
          </Link>
          
          <button
            onClick={() => router.push('/')}
            className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Tentar novamente
          </button>
          
          <Link 
            href="mailto:suporte@seudominio.com"
            className="text-blue-600 hover:underline"
          >
            Contatar suporte
          </Link>
        </div>
      </div>
    </div>
  );
} 