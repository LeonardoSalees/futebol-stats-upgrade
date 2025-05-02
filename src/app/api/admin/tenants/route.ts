import { NextRequest, NextResponse } from 'next/server';
import { 
  listTenants, 
  createTenant, 
  TenantSchema 
} from '@/services/tenantService';
import { verifyAdmin } from '@/lib/auth';

// Listar todos os tenants
export async function GET(req: NextRequest) {
  try {
    // Verificar se o usuário é administrador
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const tenants = await listTenants();
    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Erro ao listar tenants:', error);
    return NextResponse.json(
      { error: 'Falha ao listar tenants' },
      { status: 500 }
    );
  }
}

// Criar um novo tenant
export async function POST(req: NextRequest) {
  try {
    // Verificar se o usuário é administrador
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    // Obter os dados do request
    const data = await req.json();
    
    // Validar os dados
    try {
      TenantSchema.parse(data);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Criar o tenant
    const tenant = await createTenant(data);
    return NextResponse.json(tenant, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar tenant:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar tenant' },
      { status: 500 }
    );
  }
} 