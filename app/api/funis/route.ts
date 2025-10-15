
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { consultarFunis } from '@/lib/funis-service';

export async function GET(request: Request) {
  try {
    console.log('📡 API - Iniciando consulta de funis...');
    
    // Obter usuário autenticado do cookie
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      console.error('❌ Cookie de usuário não encontrado');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    let currentUser;
    try {
      currentUser = JSON.parse(userCookie.value);
    } catch (e) {
      console.error('❌ Erro ao parsear cookie de usuário:', e);
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const isAdmin = currentUser.role === 'Administrador';
    const codUsuario = currentUser.id;

    console.log(`👤 Usuário autenticado: ${currentUser.name} (ID: ${codUsuario}, Admin: ${isAdmin})`);

    const funis = await consultarFunis(codUsuario, isAdmin);
    console.log(`✅ API - ${funis.length} funis retornados`);
    return NextResponse.json(funis);
  } catch (error: any) {
    console.error('❌ API - Erro ao consultar funis:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao consultar funis',
        details: 'Verifique a conexão com a API Sankhya'
      },
      { status: 500 }
    );
  }
}

// Desabilitar cache para esta rota
export const dynamic = 'force-dynamic';
export const revalidate = 0;
