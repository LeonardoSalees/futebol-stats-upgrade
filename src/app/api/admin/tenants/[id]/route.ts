import { NextRequest, NextResponse } from 'next/server';
import { 
  getTenant, 
  updateTenant, 
  deleteTenant,
  TenantSchema 
} from '@/services/tenantService';
import { verifyAdmin } from '@/lib/auth';

// Obter um tenant específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuário é administrador
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const id = params.id;
    const tenant = await getTenant(id);
    
    if (!tenant || !Array.isArray(tenant) || tenant.length === 0) {
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant[0]);
  } catch (error) {
    console.error('Erro ao obter tenant:', error);
    return NextResponse.json(
      { error: 'Falha ao obter tenant' },
      { status: 500 }
    );
  }
}

// Atualizar um tenant
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuário é administrador
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const id = params.id;
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

    const tenant = await updateTenant(id, data);
    return NextResponse.json(tenant);
  } catch (error: any) {
    console.error('Erro ao atualizar tenant:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar tenant' },
      { status: 500 }
    );
  }
}

// Excluir um tenant
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuário é administrador
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const id = params.id;
    await deleteTenant(id);
    
    return NextResponse.json(
      { message: 'Tenant excluído com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao excluir tenant:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao excluir tenant' },
      { status: 500 }
    );
  }
} 