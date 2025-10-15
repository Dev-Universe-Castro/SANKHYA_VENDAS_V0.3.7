
import { NextResponse } from 'next/server';
import { atualizarStatusLead } from '@/lib/lead-atividades-service';

export async function POST(request: Request) {
  try {
    const { codLead, status, motivoPerda } = await request.json();

    if (!codLead || !status) {
      return NextResponse.json({ error: 'CODLEAD e STATUS são obrigatórios' }, { status: 400 });
    }

    await atualizarStatusLead(codLead, status, motivoPerda);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar status' },
      { status: 500 }
    );
  }
}
