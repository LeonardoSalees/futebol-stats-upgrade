'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TenantTestPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extrair subdomínio do host
    const host = window.location.host;
    const subdomain = host.split('.')[0];
    const isLocalSubdomain = host.includes('localhost') && subdomain !== 'localhost';
    
    // Para depuração
    console.log('Host:', host);
    console.log('Subdomain:', subdomain);
    console.log('isLocalSubdomain:', isLocalSubdomain);
    
    // Verificar se temos um subdomínio
    if (isLocalSubdomain || (subdomain !== 'localhost' && !host.startsWith('localhost'))) {
      console.log('Verificando tenant para subdomínio:', subdomain);
      
      // Verificar o tenant
      fetch(`/api/tenant/verify?subdomain=${subdomain}`)
        .then(res => {
          console.log('Status resposta:', res.status);
          if (!res.ok) {
            throw new Error('Tenant não encontrado (status ' + res.status + ')');
          }
          return res.json();
        })
        .then(data => {
          console.log('Dados do tenant:', data);
          setTenant(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Erro ao verificar tenant:', err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      console.log('Usando tenant padrão (central)');
      setTenant({ name: 'Sistema Central', subdomain: 'central' });
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl">Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Teste de Tenant
        </h1>
        
        {error ? (
          <div className="mb-6 text-red-600">
            <p className="font-bold">Erro:</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="font-bold text-lg">Tenant atual:</p>
            {tenant ? (
              <div className="mt-2 p-4 bg-gray-50 rounded">
                <p><span className="font-semibold">Nome:</span> {tenant.name}</p>
                <p><span className="font-semibold">Subdomínio:</span> {tenant.subdomain}</p>
                <p><span className="font-semibold">ID:</span> {tenant.id}</p>
              </div>
            ) : (
              <p className="mt-2 text-gray-500">Nenhum tenant detectado</p>
            )}
          </div>
        )}
        
        <div className="mt-4">
          <Link 
            href="/"
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
} 