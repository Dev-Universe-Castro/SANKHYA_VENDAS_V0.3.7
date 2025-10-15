import axios from 'axios';

export interface LeadAtividade {
  CODATIVIDADE: string
  CODLEAD: string
  TIPO: 'LIGACAO' | 'EMAIL' | 'REUNIAO' | 'VISITA' | 'PEDIDO' | 'CLIENTE' | 'NOTA' | 'WHATSAPP' | 'PROPOSTA'
  DESCRICAO: string
  DATA_HORA: string
  DATA_INICIO: string
  DATA_FIM: string
  CODUSUARIO: number
  DADOS_COMPLEMENTARES?: string
  NOME_USUARIO?: string
  COR?: string
  ORDEM?: number
  ATIVO?: string
  STATUS?: 'AGUARDANDO' | 'ATRASADO' | 'REALIZADO'
}

const ENDPOINT_LOGIN = "https://api.sandbox.sankhya.com.br/login";
const URL_CONSULTA_SERVICO = "https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr?serviceName=CRUDServiceProvider.loadRecords&outputType=json";
const URL_SAVE_SERVICO = "https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr?serviceName=DatasetSP.save&outputType=json";

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

    throw new Error(`Falha na comunicação com a API Sankhya: ${JSON.stringify(erro.response?.data || erro.message)}`);
  }
}

function mapearEntidades(entities: any, primaryKey: string): any[] {
  if (!entities || !entities.entity) {
    return [];
  }

  const fieldNames = entities.metadata.fields.field.map((f: any) => f.name);
  const entityArray = Array.isArray(entities.entity) ? entities.entity : [entities.entity];

  return entityArray.map((rawEntity: any) => {
    const cleanObject: any = {};

    if (rawEntity.$) {
      cleanObject[primaryKey] = rawEntity.$[primaryKey] || "";
    }

    for (let i = 0; i < fieldNames.length; i++) {
      const fieldKey = `f${i}`;
      const fieldName = fieldNames[i];

      if (rawEntity[fieldKey]) {
        cleanObject[fieldName] = rawEntity[fieldKey].$;
      }
    }

    return cleanObject;
  });
}

const formatarDataParaSankhya = (dataISO: string) => {
  if (!dataISO) return "";
  try {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    return "";
  }
};

const formatarDataHoraParaSankhya = (dataHoraISO: string) => {
  if (!dataHoraISO) return "";
  try {
    const date = new Date(dataHoraISO);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const seg = String(date.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
  } catch (e) {
    return "";
  }
};

const converterDataSankhyaParaISO = (dataSankhya: string) => {
  if (!dataSankhya) return "";
  try {
    const partes = dataSankhya.split(' ');
    const [dia, mes, ano] = partes[0].split('/');

    if (partes.length > 1) {
      const [hora, min, seg] = partes[1].split(':');
      const diaStr = dia.padStart(2, '0');
      const mesStr = mes.padStart(2, '0');
      const horaStr = hora.padStart(2, '0');
      const minStr = min.padStart(2, '0');
      const segStr = (seg || '0').padStart(2, '0');

      // Retornar sem o 'Z' para evitar conversão de fuso horário
      return `${ano}-${mesStr}-${diaStr}T${horaStr}:${minStr}:${segStr}`;
    } else {
      const diaStr = dia.padStart(2, '0');
      const mesStr = mes.padStart(2, '0');
      // Retornar sem o 'Z' para evitar conversão de fuso horário
      return `${ano}-${mesStr}-${diaStr}T00:00:00`;
    }
  } catch (e) {
    console.error('Erro ao converter data do Sankhya:', dataSankhya, e);
    return "";
  }
};

export async function consultarAtividades(codLead: string, ativo: string = 'S'): Promise<LeadAtividade[]> {
  let criteriaExpression = `ATIVO = '${ativo}'`;

  if (codLead) {
    criteriaExpression += ` AND CODLEAD = ${codLead}`;
  }

  const PAYLOAD = {
    "requestBody": {
      "dataSet": {
        "rootEntity": "AD_ADLEADSATIVIDADES",
        "includePresentationFields": "S",
        "offsetPage": "0",
        "entity": {
          "fieldset": {
            "list": "CODLEAD, TIPO, DESCRICAO, DATA_HORA, DATA_INICIO, DATA_FIM, CODUSUARIO, DADOS_COMPLEMENTARES, COR, ORDEM, ATIVO, STATUS"
          }
        },
        "criteria": {
          "expression": {
            "$": criteriaExpression
          }
        },
        "orderBy": {
          "ORDEM": "DESC"
        }
      }
    }
  };

  try {
    const resposta = await fazerRequisicaoAutenticada(URL_CONSULTA_SERVICO, 'POST', PAYLOAD);

    if (!resposta?.responseBody?.entities) {
      return [];
    }

    const atividades = mapearEntidades(resposta.responseBody.entities, 'CODATIVIDADE') as LeadAtividade[];

    return atividades.map(atividade => ({
      ...atividade,
      DATA_HORA: converterDataSankhyaParaISO(atividade.DATA_HORA),
      DATA_INICIO: atividade.DATA_INICIO ? converterDataSankhyaParaISO(atividade.DATA_INICIO) : '',
      DATA_FIM: atividade.DATA_FIM ? converterDataSankhyaParaISO(atividade.DATA_FIM) : ''
    }));
  } catch (erro) {
    console.error("❌ Erro ao consultar atividades:", erro);
    return [];
  }
}

export async function criarAtividade(atividade: Partial<LeadAtividade> & { COR?: string }): Promise<LeadAtividade & { CODATIVIDADE: string }> {
  const dataHoraCriacao = formatarDataHoraParaSankhya(new Date().toISOString());
  const dataInicio = formatarDataHoraParaSankhya(atividade.DATA_INICIO || new Date().toISOString());
  const dataFim = formatarDataHoraParaSankhya(atividade.DATA_FIM || atividade.DATA_INICIO || new Date().toISOString());

  // Buscar atividades apenas se houver CODLEAD
  const atividadesExistentes = atividade.CODLEAD 
    ? await consultarAtividades(String(atividade.CODLEAD))
    : [];
  const maiorOrdem = atividadesExistentes.length > 0 
    ? Math.max(...atividadesExistentes.map(a => a.ORDEM || 0))
    : 0;
  const novaOrdem = maiorOrdem + 1;

  // Determinar status inicial
  const dataInicioDate = new Date(atividade.DATA_INICIO || new Date().toISOString());
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dataInicioDate.setHours(0, 0, 0, 0);
  
  const statusInicial = dataInicioDate < hoje ? 'ATRASADO' : 'AGUARDANDO';

  const PAYLOAD = {
    "serviceName": "DatasetSP.save",
    "requestBody": {
      "entityName": "AD_ADLEADSATIVIDADES",
      "standAlone": false,
      "fields": ["CODLEAD", "TIPO", "DESCRICAO", "DATA_HORA", "DATA_INICIO", "DATA_FIM", "CODUSUARIO", "DADOS_COMPLEMENTARES", "COR", "ORDEM", "ATIVO", "STATUS"],
      "records": [{
        "values": {
          "0": atividade.CODLEAD ? String(atividade.CODLEAD) : "",
          "1": atividade.TIPO,
          "2": atividade.DESCRICAO || "",
          "3": dataHoraCriacao,
          "4": dataInicio,
          "5": dataFim,
          "6": String(atividade.CODUSUARIO),
          "7": atividade.DADOS_COMPLEMENTARES || "",
          "8": atividade.COR || "",
          "9": String(novaOrdem),
          "10": "S",
          "11": statusInicial
        }
      }]
    }
  };

  try {
    const response = await fazerRequisicaoAutenticada(URL_SAVE_SERVICO, 'POST', PAYLOAD);
    console.log('✅ Atividade criada com sucesso:', response);

    // Buscar atividade criada (com ou sem CODLEAD)
    const criterio = atividade.CODLEAD ? String(atividade.CODLEAD) : "";
    const atividades = await consultarAtividades(criterio);

    if (!atividades || atividades.length === 0) {
      throw new Error('Atividade criada mas não foi possível recuperá-la');
    }

    return atividades[0] as LeadAtividade & { CODATIVIDADE: string };
  } catch (erro: any) {
    console.error('❌ Erro ao criar atividade:', erro);
    throw new Error(`Falha ao criar atividade: ${erro.message}`);
  }
}

export async function atualizarStatusLead(codLead: string, status: 'EM_ANDAMENTO' | 'GANHO' | 'PERDIDO', motivoPerda?: string): Promise<void> {
  const dataAtual = formatarDataParaSankhya(new Date().toISOString().split('T')[0]);

  const fields = ["STATUS_LEAD", "DATA_ATUALIZACAO"];
  const values: any = {
    "0": status,
    "1": dataAtual
  };

  if (status === 'PERDIDO' && motivoPerda) {
    fields.push("MOTIVO_PERDA");
    values["2"] = motivoPerda;
  }

  if (status === 'GANHO' || status === 'PERDIDO') {
    fields.push("DATA_CONCLUSAO");
    const conclusaoIndex = motivoPerda ? "3" : "2";
    values[conclusaoIndex] = dataAtual;
  }

  const PAYLOAD = {
    "serviceName": "DatasetSP.save",
    "requestBody": {
      "entityName": "AD_LEADS",
      "standAlone": false,
      "fields": fields,
      "records": [{
        "pk": { CODLEAD: String(codLead) },
        "values": values
      }]
    }
  };

  await fazerRequisicaoAutenticada(URL_SAVE_SERVICO, 'POST', PAYLOAD);
}