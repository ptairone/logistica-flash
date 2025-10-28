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
    const vehicle = { type: 'Truck', axles: eixosValidados };
    
    console.log('Veículo enviado ao TollGuru:', vehicle);

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
        mapProvider: 'osrm',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro TollGuru:', response.status, errorText);
      console.error('Veículo enviado:', vehicle);
      throw new Error(`TollGuru API erro: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Resposta TollGuru:', JSON.stringify(data));

    const route = data.routes?.[0];
    if (!route) {
      throw new Error('Nenhuma rota encontrada');
    }

    const costs = route.costs || {};
    
    const pedagios: PedagioResponse = {
      valor_total: costs.toll || 0,
      moeda: costs.currency || 'USD',
      pracas: (route.tolls || []).map((toll: any) => ({
        nome: toll.name || 'Praça não identificada',
        valor: toll.cost || 0,
        latitude: toll.lat || 0,
        longitude: toll.lng || 0,
      })),
      distancia_km: route.distance?.metric || 0,
      tempo_estimado_minutos: Math.round((route.duration?.value || 0) / 60),
    };

    const taxaCambio = await obterTaxaCambio();
    const pedagiosBRL = {
      ...pedagios,
      valor_total: pedagios.valor_total * taxaCambio,
      moeda: 'BRL',
      pracas: pedagios.pracas.map(p => ({
        ...p,
        valor: p.valor * taxaCambio,
      })),
    };

    console.log('Pedágios calculados:', pedagiosBRL);

    return new Response(
      JSON.stringify(pedagiosBRL),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Erro ao calcular pedágios:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao calcular pedágios',
        details: error.toString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
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
