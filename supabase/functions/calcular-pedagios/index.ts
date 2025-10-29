/**
 * @deprecated Esta função está deprecated. Use calcular-rota-google ao invés.
 * Mantida por compatibilidade temporária.
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PedagioRequest {
  origem: {
    lat: number;
    lon: number;
  };
  destino: {
    lat: number;
    lon: number;
  };
  tipo_veiculo?: string;
  numero_eixos?: number;
}

interface PedagioResponse {
  valor_total: number;
  moeda: string;
  pracas: Array<{
    nome: string;
    valor: number;
    latitude: number;
    longitude: number;
  }>;
  distancia_km: number;
  tempo_estimado_minutos: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origem, destino, tipo_veiculo, numero_eixos }: PedagioRequest = await req.json();
    
    const TOLLGURU_API_KEY = Deno.env.get('TOLLGURU_API_KEY');
    if (!TOLLGURU_API_KEY) {
      throw new Error('TOLLGURU_API_KEY não configurada');
    }

    console.log('Calculando pedágios:', { origem, destino, tipo_veiculo, numero_eixos });

    // Validar número de eixos (2-9, padrão 3)
    const eixosValidados = Math.min(9, Math.max(2, numero_eixos || 3));
    const vehicle = { axles: eixosValidados };
    
    console.log('Veículo enviado ao TollGuru:', vehicle, 'serviceProvider: here');

    const response = await fetch('https://apis.tollguru.com/toll/v2/origin-destination-waypoints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TOLLGURU_API_KEY,
      },
      body: JSON.stringify({
        from: {
          lat: origem.lat,
          lng: origem.lon,
        },
        to: {
          lat: destino.lat,
          lng: destino.lon,
        },
        vehicle: vehicle,
        serviceProvider: 'here',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro TollGuru:', response.status, errorText);
      console.error('Veículo enviado:', vehicle);
      
      // Se for erro de quota (403) ou qualquer outro erro da API, retornar valores zerados
      // ao invés de falhar completamente
      if (response.status === 403) {
        console.warn('Quota da API TollGuru excedida. Retornando valores zerados.');
      } else {
        console.warn(`TollGuru API retornou ${response.status}. Retornando valores zerados.`);
      }
      
      // Retornar resposta válida com valores zerados
      return new Response(
        JSON.stringify({
          valor_total: 0,
          moeda: 'BRL',
          pracas: [],
          distancia_km: 0,
          tempo_estimado_minutos: null,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const data = await response.json();
    console.log('Resposta TollGuru:', JSON.stringify(data));

    const route = data.routes?.[0];
    if (!route) {
      throw new Error('Nenhuma rota encontrada');
    }

    const costs = route.costs || {};
    console.log('Costs retornados:', costs);
    
    // Priorizar cash, senão tag, senão 0
    const valorTotalOriginal = costs.cash || costs.tag || 0;
    const moedaOriginal = costs.currency || 'USD';
    
    const pedagios: PedagioResponse = {
      valor_total: valorTotalOriginal,
      moeda: moedaOriginal,
      pracas: (route.tolls || []).map((toll: any) => ({
        nome: toll.name || 'Praça não identificada',
        valor: toll.cashCost || toll.tagCost || 0,
        latitude: toll.lat || 0,
        longitude: toll.lng || 0,
      })),
      distancia_km: route.distance?.metric || 0,
      tempo_estimado_minutos: Math.round((route.duration?.value || 0) / 60),
    };

    // Converter moeda apenas se não for BRL
    let pedagiosFinais = pedagios;
    if (moedaOriginal !== 'BRL') {
      const taxaCambio = await obterTaxaCambio();
      pedagiosFinais = {
        ...pedagios,
        valor_total: pedagios.valor_total * taxaCambio,
        moeda: 'BRL',
        pracas: pedagios.pracas.map(p => ({
          ...p,
          valor: p.valor * taxaCambio,
        })),
      };
    }

    console.log('Pedágios calculados:', pedagiosFinais);

    return new Response(
      JSON.stringify(pedagiosFinais),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Erro ao calcular pedágios:', error);
    
    // Em caso de erro inesperado, retornar valores zerados ao invés de erro 500
    // Isso permite que o cálculo de fretes continue sem pedágios
    console.warn('Retornando valores zerados devido a erro inesperado');
    
    return new Response(
      JSON.stringify({
        valor_total: 0,
        moeda: 'BRL',
        pracas: [],
        distancia_km: 0,
        tempo_estimado_minutos: null,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});

// Função removida - agora usamos objeto vehicle diretamente

async function obterTaxaCambio(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates.BRL || 5.0;
  } catch {
    return 5.0;
  }
}
