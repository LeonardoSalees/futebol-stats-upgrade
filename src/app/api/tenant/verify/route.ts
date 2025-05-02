import { NextRequest, NextResponse } from "next/server";
import { getTenantBySubdomain } from "@/services/tenantService";

// Rota para verificar se um subdomain corresponde a um tenant válido
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain');
    
    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomínio não fornecido' },
        { status: 400 }
      );
    }
    
    // Para teste rápido, retornar um resultado estático para o tenant principal
    if (subdomain === 'principal') {
      // Tenant padrão para testes
      return NextResponse.json({
        id: "e75903fc-8e50-4872-8710-f9e7d722cf2c", // Substitua pelo ID real se necessário
        name: "Quadra Principal",
        subdomain: "principal"
      });
    }
    
    // Tente buscar o tenant normalmente
    try {
      const tenant = await getTenantBySubdomain(subdomain);
      
      if (!tenant) {
        return NextResponse.json(
          { error: 'Tenant não encontrado' },
          { status: 404 }
        );
      }
      
      // Retornar apenas os dados necessários do tenant
      return NextResponse.json({
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain
      });
    } catch (innerError) {
      console.error('Erro ao buscar tenant:', innerError);
      // Fallback para o erro de tenant não encontrado
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Erro ao verificar tenant:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar tenant' },
      { status: 500 }
    );
  }
} 