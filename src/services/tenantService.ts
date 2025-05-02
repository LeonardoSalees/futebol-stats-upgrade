import { prisma } from '@/lib/prisma';
import { z } from "zod";

// Schema de validação para criação de tenant
export const TenantSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  subdomain: z
    .string()
    .min(3, "Subdomínio deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Subdomínio deve conter apenas letras minúsculas, números e hífens")
});

export type TenantInput = z.infer<typeof TenantSchema>;

// Listar todos os tenants
export async function listTenants() {
  // Esta função deve ser chamada apenas no painel de administração central
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          players: true,
          games: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Transformar o resultado para manter o formato esperado pelo app
  return tenants.map(tenant => ({
    ...tenant,
    playersCount: tenant._count.players,
    gamesCount: tenant._count.games
  }));
}

// Obter tenant pelo ID
export async function getTenant(id: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          players: true,
          games: true
        }
      }
    }
  });

  if (!tenant) {
    return null;
  }

  return {
    ...tenant,
    playersCount: tenant._count.players,
    gamesCount: tenant._count.games
  };
}

// Obter tenant pelo subdomínio
export async function getTenantBySubdomain(subdomain: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain }
  });
  
  return tenant;
}

// Criar novo tenant
export async function createTenant(data: TenantInput) {
  const validatedData = TenantSchema.parse(data);
  
  // Verificar se o subdomínio já existe
  const existingTenant = await prisma.tenant.findUnique({
    where: { subdomain: validatedData.subdomain }
  });
  
  if (existingTenant) {
    throw new Error("Este subdomínio já está em uso");
  }
  
  // Criar o tenant
  return prisma.tenant.create({
    data: {
      name: validatedData.name,
      subdomain: validatedData.subdomain.toLowerCase(),
    }
  });
}

// Atualizar tenant
export async function updateTenant(id: string, data: Partial<TenantInput>) {
  // Não permitir mudar o subdomínio se já existir
  if (data.subdomain) {
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        subdomain: data.subdomain,
        id: { not: id }
      }
    });
    
    if (existingTenant) {
      throw new Error("Este subdomínio já está em uso");
    }
  }
  
  return prisma.tenant.update({
    where: { id },
    data,
  });
}

// Excluir tenant (cuidado, isso exclui todos os dados do tenant!)
export async function deleteTenant(id: string) {
  // Esta é uma operação destrutiva. Em ambiente real, você pode querer
  // adicionar verificações adicionais ou apenas marcar como inativo.
  
  // Verificar se o tenant existe
  const tenant = await prisma.tenant.findUnique({
    where: { id },
  });
  
  if (!tenant) {
    throw new Error("Tenant não encontrado");
  }
  
  // Em um sistema de produção, você deve implementar aqui uma estratégia
  // de backup dos dados antes de excluí-los, ou preferir uma exclusão lógica
  // mantendo os dados e apenas marcando o tenant como inativo.
  
  // Excluir o tenant e todos os seus dados em cascata
  // Nota: Isso exige configuração de cascata no Prisma Schema
  return prisma.tenant.delete({
    where: { id },
  });
} 