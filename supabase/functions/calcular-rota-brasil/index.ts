import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RotaBrasilRequest {
  origem_cep: string;
  destino_cep: string;
  tipo_veiculo?: 'auto' | 'caminhao' | 'onibus' | 'moto';
  numero_eixos?: number;
  preco_combustivel?: number;
  consumo_km_l?: number;
  tabela_frete?: string;
}

interface CidadeEstado {
  cidade: string;
  estado: string;
}

interface PracaPedagio {
  nome: string;
  valor: number;
  cidade?: string;
  uf?: string;
  rodovia?: string;
}

interface RotaBrasilResponse {
  distancia_km: number;
  tempo_estimado_horas: number | null;
  pedagios_valor: number;
  numero_pracas_pedagio: number;
  pracas_pedagio: PracaPedagio[];
  combustivel_estimado_valor?: number;
  valor_frete_minimo?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      origem_cep,
      destino_cep,
      tipo_veiculo = 'caminhao',
      numero_eixos = 3,
      preco_combustivel,
      consumo_km_l,
      tabela_frete = 'a'
    }: RotaBrasilRequest = await req.json();

    const ROTAS_BRASIL_TOKEN = Deno.env.get('ROTAS_BRASIL_API_TOKEN');
    if (!ROTAS_BRASIL_TOKEN) {
      throw new Error('ROTAS_BRASIL_API_TOKEN não configurado');
    }

    console.log('🚛 Calculando rota com Rotas Brasil:', {
      origem_cep,
      destino_cep,
      tipo_veiculo,
      numero_eixos
    });

    // Converter CEPs em cidade,estado
    const origem = await consultarCEP(origem_cep);
    const destino = await consultarCEP(destino_cep);

    console.log('📍 Localizações:', { origem, destino });

    // Formatar pontos no padrão da API: "cidade,estado;cidade,estado"
    const pontosParam = `${formatarCidade(origem.cidade)},${formatarEstado(origem.estado)};${formatarCidade(destino.cidade)},${formatarEstado(destino.estado)}`;
    
    // Montar URL com parâmetros
    const params = new URLSearchParams({
      token: ROTAS_BRASIL_TOKEN,
      pontos: pontosParam,
      veiculo: tipo_veiculo,
      eixo: numero_eixos.toString(),
      paradas: 'true', // Para obter coordenadas das praças
      tabela: tabela_frete,
    });

    // Adicionar parâmetros opcionais
    if (preco_combustivel) {
      params.append('combustivel', preco_combustivel.toString());
    }
    if (consumo_km_l) {
      params.append('consumo', consumo_km_l.toString());
    }

    const url = `http://rotasbrasil.com.br/apiRotas/enderecos/?${params.toString()}`;
    console.log('🌐 URL da requisição:', url.replace(ROTAS_BRASIL_TOKEN, 'TOKEN_OCULTO'));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro Rotas Brasil:', response.status, errorText);
      throw new Error(`API Rotas Brasil retornou erro: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Resposta Rotas Brasil:', JSON.stringify(data));

    // Processar resposta
    const resultado: RotaBrasilResponse = {
      distancia_km: Math.round((data.distancia || 0) * 100) / 100,
      tempo_estimado_horas: data.tempo ? Math.round((data.tempo / 60) * 100) / 100 : null, // Converter minutos para horas
      pedagios_valor: Math.round((data.pedagio || 0) * 100) / 100,
      numero_pracas_pedagio: data.quantidade_pedagios || 0,
      pracas_pedagio: processarPracas(data.pracas || []),
      combustivel_estimado_valor: data.combustivel ? Math.round(data.combustivel * 100) / 100 : undefined,
      valor_frete_minimo: data.frete_minimo ? Math.round(data.frete_minimo * 100) / 100 : undefined,
    };

    console.log('📊 Resultado processado:', resultado);

    return new Response(
      JSON.stringify(resultado),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Erro ao calcular rota:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao calcular rota com Rotas Brasil',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Consulta CEP via ViaCEP para obter cidade e estado
 */
async function consultarCEP(cep: string): Promise<CidadeEstado> {
  const cepLimpo = cep.replace(/\D/g, '');
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      throw new Error(`Erro ao consultar CEP ${cep}`);
    }
    
    const data = await response.json();
    
    if (data.erro) {
      throw new Error(`CEP ${cep} não encontrado`);
    }
    
    return {
      cidade: data.localidade,
      estado: data.uf,
    };
  } catch (error) {
    console.error(`Erro ao consultar CEP ${cep}:`, error);
    throw new Error(`Não foi possível consultar o CEP ${cep}`);
  }
}

/**
 * Formata nome da cidade removendo acentos e substituindo espaços
 * Ex: "São Paulo" -> "sao paulo"
 */
function formatarCidade(cidade: string): string {
  return cidade
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ') // Mantém espaços simples
    .trim();
}

/**
 * Formata sigla do estado
 * Ex: "SP" -> "sao paulo"
 */
function formatarEstado(uf: string): string {
  const estados: Record<string, string> = {
    'AC': 'acre',
    'AL': 'alagoas',
    'AP': 'amapa',
    'AM': 'amazonas',
    'BA': 'bahia',
    'CE': 'ceara',
    'DF': 'distrito federal',
    'ES': 'espirito santo',
    'GO': 'goias',
    'MA': 'maranhao',
    'MT': 'mato grosso',
    'MS': 'mato grosso do sul',
    'MG': 'minas gerais',
    'PA': 'para',
    'PB': 'paraiba',
    'PR': 'parana',
    'PE': 'pernambuco',
    'PI': 'piaui',
    'RJ': 'rio de janeiro',
    'RN': 'rio grande do norte',
    'RS': 'rio grande do sul',
    'RO': 'rondonia',
    'RR': 'roraima',
    'SC': 'santa catarina',
    'SP': 'sao paulo',
    'SE': 'sergipe',
    'TO': 'tocantins',
  };
  
  return estados[uf.toUpperCase()] || uf.toLowerCase();
}

/**
 * Processa array de praças de pedágio da API
 */
function processarPracas(pracas: any[]): PracaPedagio[] {
  if (!Array.isArray(pracas) || pracas.length === 0) {
    return [];
  }
  
  return pracas.map((praca: any) => ({
    nome: praca.nome || 'Praça não identificada',
    valor: Math.round((praca.valor || 0) * 100) / 100,
    cidade: praca.cidade,
    uf: praca.uf,
    rodovia: praca.rodovia,
  }));
}
