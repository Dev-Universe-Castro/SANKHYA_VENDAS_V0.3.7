
import { NextResponse } from 'next/server';
import { removerProdutoLead } from '@/lib/lead-produtos-service';

export async function POST(request: Request) {
  try {
    const { codItem } = await request.json();

    if (!codItem) {
      return NextResponse.json({ error: 'CODITEM é obrigatório' }, { status: 400 });
    }

    console.log('📥 Recebido pedido para remover produto:', codItem);

    await removerProdutoLead(codItem);

    console.log('✅ Produto removido/inativado com sucesso');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao remover produto:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao remover produto' },
      { status: 500 }
    );
  }
}
