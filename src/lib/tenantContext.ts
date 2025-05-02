import { AsyncLocalStorage } from 'node:async_hooks';

// Verificar se estamos em um ambiente que suporta AsyncLocalStorage
const isAsyncLocalStorageSupported = typeof AsyncLocalStorage !== 'undefined';

// Criar instância do AsyncLocalStorage para armazenar o ID do tenant atual
const tenantStorage = isAsyncLocalStorageSupported 
  ? new AsyncLocalStorage<string>()
  : null;

export interface TenantContext {
  tenantId: string;
}

// Função para obter o ID do tenant atual
export function getCurrentTenantId(): string | undefined {
  if (!tenantStorage) {
    // Em ambientes onde AsyncLocalStorage não está disponível
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tenantId') || undefined;
    }
    return undefined;
  }
  return tenantStorage.getStore();
}

// Função para executar código no contexto de um tenant específico
export async function runWithTenant<T>(tenantId: string, callback: () => Promise<T>): Promise<T> {
  // Se AsyncLocalStorage não estiver disponível, apenas executar o callback
  if (!tenantStorage) {
    if (typeof window !== 'undefined') {
      const prevTenantId = localStorage.getItem('tenantId');
      localStorage.setItem('tenantId', tenantId);
      try {
        return await callback();
      } finally {
        if (prevTenantId) {
          localStorage.setItem('tenantId', prevTenantId);
        } else {
          localStorage.removeItem('tenantId');
        }
      }
    }
    return callback();
  }
  return tenantStorage.run(tenantId, callback);
}

// Middleware para Next.js API routes
export function withTenant(handler: any) {
  return async (req: any, res: any) => {
    // Obter tenant do cabeçalho, cookie ou subdomain
    let tenantId: string | undefined;
    
    // Opção 1: Do cabeçalho X-Tenant-ID (útil para APIs)
    if (req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id'] as string;
    }
    
    // Opção 2: Do subdomínio (exemplo: quadra1.meuapp.com)
    else if (req.headers.host) {
      const host = req.headers.host as string;
      const subdomain = host.split('.')[0];
      
      if (subdomain !== 'www' && subdomain !== 'localhost') {
        // Verificar o tenant pelo subdomínio
        try {
          const response = await fetch(`${getBaseUrl(req)}/api/tenant/verify?subdomain=${subdomain}`);
          if (response.ok) {
            const data = await response.json();
            tenantId = data.id;
          }
        } catch (error) {
          console.error('Erro ao verificar tenant pelo subdomínio:', error);
        }
      }
    }
    
    // Opção 3: Do cookie
    else if (req.cookies?.tenantId) {
      tenantId = req.cookies.tenantId;
    }
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não especificado' });
    }
    
    // Executar o manipulador no contexto do tenant
    return runWithTenant(tenantId, () => handler(req, res));
  };
}

// Função auxiliar para obter a URL base
function getBaseUrl(req: any): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

// Hook para React para usar o tenant atual (client-side)
export function useTenant() {
  // Aqui você implementaria um hook que obtém o tenant do contexto React
  // Para simplificar, estamos retornando uma implementação básica
  return {
    tenantId: typeof window !== 'undefined' ? 
      // No client, obter do localStorage ou cookie
      localStorage.getItem('tenantId') : 
      // No servidor, obter do AsyncLocalStorage
      getCurrentTenantId(),
    setTenant: (id: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tenantId', id);
      }
    }
  };
} 