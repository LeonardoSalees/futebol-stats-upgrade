'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  createdAt: string;
  updatedAt: string;
  playersCount?: number;
  gamesCount?: number;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTenant, setNewTenant] = useState({ name: '', subdomain: '' });
  const router = useRouter();

  // Carregar os tenants
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/admin/tenants');
        if (!response.ok) {
          throw new Error('Falha ao carregar tenants');
        }
        const data = await response.json();
        setTenants(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Criar novo tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTenant),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar tenant');
      }

      const createdTenant = await response.json();
      setTenants([...tenants, createdTenant]);
      setNewTenant({ name: '', subdomain: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Excluir tenant
  const handleDeleteTenant = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tenant? Esta ação não pode ser desfeita e todos os dados serão perdidos.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tenants/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao excluir tenant');
      }

      setTenants(tenants.filter(tenant => tenant.id !== id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Acessar o tenant
  const accessTenant = (subdomain: string) => {
    // Em ambiente de desenvolvimento, pode ser útil usar parâmetros de consulta
    // Em produção, você redirecionaria para o subdomínio real
    const isProd = process.env.NODE_ENV === 'production';
    
    if (isProd) {
      window.open(`https://${subdomain}.seudominio.com`, '_blank');
    } else {
      router.push(`/admin/tenant-preview?subdomain=${subdomain}`);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Quadras</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => setError(null)}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Quadras</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Adicionar Nova Quadra</h2>
        <form onSubmit={handleCreateTenant}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nome da Quadra</label>
            <input
              type="text"
              value={newTenant.name}
              onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
              minLength={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Subdomínio</label>
            <div className="flex items-center">
              <input
                type="text"
                value={newTenant.subdomain}
                onChange={(e) => setNewTenant({ 
                  ...newTenant, 
                  subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                })}
                className="w-full border border-gray-300 px-3 py-2 rounded-l"
                required
                pattern="[a-z0-9-]+"
                minLength={3}
              />
              <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-r">
                .seudominio.com
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Apenas letras minúsculas, números e hífens
            </p>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Adicionar Quadra'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6 bg-gray-50 border-b">Quadras Cadastradas</h2>
        
        {loading && tenants.length === 0 ? (
          <div className="p-6 text-center">Carregando...</div>
        ) : tenants.length === 0 ? (
          <div className="p-6 text-center">Nenhuma quadra cadastrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left">Nome</th>
                  <th className="py-3 px-6 text-left">Subdomínio</th>
                  <th className="py-3 px-6 text-center">Jogadores</th>
                  <th className="py-3 px-6 text-center">Jogos</th>
                  <th className="py-3 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">{tenant.name}</td>
                    <td className="py-4 px-6">{tenant.subdomain}</td>
                    <td className="py-4 px-6 text-center">{tenant.playersCount}</td>
                    <td className="py-4 px-6 text-center">{tenant.gamesCount}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => accessTenant(tenant.subdomain)}
                          className="bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                        >
                          Acessar
                        </button>
                        <Link
                          href={`/admin/tenants/${tenant.id}`}
                          className="bg-yellow-500 text-white py-1 px-3 rounded text-sm hover:bg-yellow-600"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 