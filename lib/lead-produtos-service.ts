
import axios from 'axios';

const URL_CONSULTA_SERVICO = "https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr?serviceName=CRUDServiceProvider.loadRecords&outputType=json";
const URL_SAVE_SERVICO = "https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr?serviceName=DatasetSP.save&outputType=json";

const ENDPOINT_LOGIN = "https://api.sandbox.sankhya.com.br/login";

const LOGIN_HEADERS = {
  'token': process.env.SANKHYA_TOKEN || "",
  'appkey': process.env.SANKHYA_APPKEY || "",
  'username': process.env.SANKHYA_USERNAME || "",
  'password': process.env.SANKHYA_PASSWORD || ""
};

let cachedToken: string | null = null;

async function obterToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }

  try {
    const resposta = await axios.post(ENDPOINT_LOGIN, {}, {
      headers: LOGIN_HEADERS,
      timeout: 10000
    });

    const token = resposta.data.bearerToken || resposta.data.token;

    if (!token) {
      throw new Error("Token não encontrado na resposta de login.");
    }

    cachedToken = token;
    return token;

  } catch (erro: any) {
    cachedToken = null;
    throw new Error(`Falha na autenticação Sankhya: ${erro.message}`);
  }
}

async function fazerRequisicaoAutenticada(fullUrl: string, method = 'POST', data = {}) {
  const token = await obterToken();

  try {
    const config = {
      method: method.toLowerCase(),
      url: fullUrl,
      data: data,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const resposta = await axios(config);
    return resposta.data;

  } catch (erro: any) {
    if (erro.response && (erro.response.status === 401 || erro.response.status === 403)) {
      cachedToken = null;
      throw new Error("Sessão expirada. Tente novamente.");
    }

    const errorDetails = erro.response?.data || erro.message;
    console.error("❌ Erro na requisição Sankhya:", {
      url: fullUrl,
      method,
      error: errorDetails
    });

    throw new Error(`Falha na comunicação com a API Sankhya: ${JSON.stringify(errorDetails)}`);
  }
}

export interface LeadProduto {
  CODITEM?: string
  CODLEAD: string
  CODPROD: number
  DESCRPROD: string
  QUANTIDADE: number
  VLRUNIT: number
  VLRTOTAL: number
  ATIVO?: string
  DATA_INCLUSAO?: string
}

export async function consultarProdutosLead(codLead: string): Promise<LeadProduto[]> {
  const PAYLOAD = {
    "requestBody": {
      "dataSet": {
        "rootEntity": "AD_ADLEADSPRODUTOS",
        "includePresentationFields": "S",
        "offsetPage": "0",
        "entity": {
          "fieldset": {
            "list": "CODITEM, CODLEAD, CODPROD, DESCRPROD, QUANTIDADE, VLRUNIT, VLRTOTAL, ATIVO, DATA_INCLUSAO"
          }
        },
        "criteria": {
          "expression": {
            "$": `CODLEAD = '${codLead}'`
          }
        }
      }
    }
  };

  try {
    const resposta = await fazerRequisicaoAutenticada(URL_CONSULTA_SERVICO, 'POST', PAYLOAD);
    
    console.log('📦 Resposta da consulta de produtos:', JSON.stringify(resposta, null, 2));
    
    if (!resposta?.responseBody?.entities?.entity) {
      return [];
    }

    // Mapear resposta para array de produtos
    const entities = Array.isArray(resposta.responseBody.entities.entity) 
      ? resposta.responseBody.entities.entity 
      : [resposta.responseBody.entities.entity];

    const produtos = entities.map((e: any) => ({
      CODITEM: e.f0?.$,
      CODLEAD: e.f1?.$,
      CODPROD: Number(e.f2?.$),
      DESCRPROD: e.f3?.$,
      QUANTIDADE: Number(e.f4?.$),
      VLRUNIT: Number(e.f5?.$),
      VLRTOTAL: Number(e.f6?.$),
      ATIVO: e.f7?.$,
      DATA_INCLUSAO: e.f8?.$
    }));
    
    console.log('📋 Produtos mapeados:', produtos);
    return produtos;
  } catch (erro) {
    console.error("Erro ao consultar produtos do lead:", erro);
    return [];
  }
}

export async function adicionarProdutoLead(produto: Omit<LeadProduto, 'CODITEM' | 'DATA_INCLUSAO'>): Promise<void> {
  console.log('🔧 [adicionarProdutoLead] Iniciando adição de produto:', produto);

  // Formatar data no padrão DD/MM/YYYY
  const dataAtual = new Date();
  const dia = String(dataAtual.getDate()).padStart(2, '0');
  const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
  const ano = dataAtual.getFullYear();
  const dataFormatada = `${dia}/${mes}/${ano}`;

  const PAYLOAD = {
    "serviceName": "DatasetSP.save",
    "requestBody": {
      "entityName": "AD_ADLEADSPRODUTOS",
      "standAlone": false,
      "fields": ["CODLEAD", "CODPROD", "DESCRPROD", "QUANTIDADE", "VLRUNIT", "VLRTOTAL", "ATIVO", "DATA_INCLUSAO"],
      "records": [{
        "values": {
          "0": produto.CODLEAD,
          "1": String(produto.CODPROD),
          "2": produto.DESCRPROD,
          "3": String(produto.QUANTIDADE),
          "4": String(produto.VLRUNIT),
          "5": String(produto.VLRTOTAL),
          "6": "S",
          "7": dataFormatada
        }
      }]
    }
  };

  console.log('📤 [adicionarProdutoLead] Payload enviado para Sankhya:', JSON.stringify(PAYLOAD, null, 2));

  try {
    const resposta = await fazerRequisicaoAutenticada(URL_SAVE_SERVICO, 'POST', PAYLOAD);
    console.log('✅ [adicionarProdutoLead] Produto adicionado com sucesso. Resposta:', JSON.stringify(resposta, null, 2));
  } catch (erro: any) {
    console.error('❌ [adicionarProdutoLead] Erro ao adicionar produto:', {
      erro: erro.message,
      stack: erro.stack,
      payload: PAYLOAD
    });
    throw erro;
  }
}

export async function removerProdutoLead(codItem: string): Promise<void> {
  console.log('🗑️ [removerProdutoLead] Inativando produto:', codItem);

  const PAYLOAD = {
    "serviceName": "DatasetSP.save",
    "requestBody": {
      "entityName": "AD_ADLEADSPRODUTOS",
      "standAlone": false,
      "fields": ["ATIVO"],
      "records": [{
        "pk": { CODITEM: codItem },
        "values": {
          "0": "N"
        }
      }]
    }
  };

  console.log('📤 [removerProdutoLead] Payload enviado:', JSON.stringify(PAYLOAD, null, 2));

  try {
    const resposta = await fazerRequisicaoAutenticada(URL_SAVE_SERVICO, 'POST', PAYLOAD);
    console.log('✅ [removerProdutoLead] Produto inativado com sucesso. Resposta:', JSON.stringify(resposta, null, 2));
  } catch (erro: any) {
    console.error('❌ [removerProdutoLead] Erro ao inativar produto:', {
      erro: erro.message,
      stack: erro.stack,
      payload: PAYLOAD
    });
    throw erro;
  }
}
