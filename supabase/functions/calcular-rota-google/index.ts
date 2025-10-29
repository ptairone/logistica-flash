import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RotaRequest {
  origem_cep: string;
  destino_cep: string;
  origem_cidade?: string;
  origem_uf?: string;
  destino_cidade?: string;
  destino_uf?: string;
  numero_eixos?: number;
}

interface RotaResponse {
  distancia_km: number;
  pedagios_valor: number;
  tempo_estimado_horas: number;
  numero_pracas_pedagio: number;
  origem_coords: {
    lat: number;
    lon: number;
  };
  destino_coords: {
    lat: number;
    lon: number;
  };
}

interface Coordinates {
  lat: number;
  lon: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      origem_cep, 
      destino_cep, 
      origem_cidade, 
      origem_uf,
      destino_cidade,
      destino_uf,
      numero_eixos 
    }: RotaRequest = await req.json();
    
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY não configurada');
    }

    console.log('Calculando rota:', { origem_cep, destino_cep, numero_eixos });

    // Geocodificar origem e destino
    const origemCoords = await geocodificar(origem_cep, origem_cidade, origem_uf);
    const destinoCoords = await geocodificar(destino_cep, destino_cidade, destino_uf);

    console.log('Coordenadas:', { origemCoords, destinoCoords });

    // Calcular rota com Google Maps Routes API
    const resultado = await calcularRotaGoogle(
      origemCoords, 
      destinoCoords, 
      GOOGLE_MAPS_API_KEY,
      numero_eixos
    );

    const resposta: RotaResponse = {
      ...resultado,
      origem_coords: origemCoords,
      destino_coords: destinoCoords,
    };

    console.log('Rota calculada:', resposta);

    return new Response(
      JSON.stringify(resposta),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Erro ao calcular rota:', error);
    
    // Em caso de erro, retornar valores zerados para não bloquear o cálculo
    return new Response(
      JSON.stringify({
        distancia_km: 0,
        pedagios_valor: 0,
        tempo_estimado_horas: 0,
        numero_pracas_pedagio: 0,
        origem_coords: { lat: 0, lon: 0 },
        destino_coords: { lat: 0, lon: 0 },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});

async function consultarViaCEP(cep: string): Promise<{ cidade: string; uf: string } | null> {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      console.warn(`ViaCEP não retornou OK para ${cep}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.erro) {
      console.warn(`CEP não encontrado no ViaCEP: ${cep}`);
      return null;
    }
    
    return {
      cidade: data.localidade,
      uf: data.uf
    };
  } catch (error) {
    console.error(`Erro ao consultar ViaCEP para ${cep}:`, error);
    return null;
  }
}

async function geocodificar(
  cep: string, 
  cidade?: string, 
  uf?: string
): Promise<Coordinates> {
  // Tentar obter cidade e UF do ViaCEP se não fornecidos
  let cidadeFinal = cidade;
  let ufFinal = uf;
  
  if (!cidadeFinal || !ufFinal) {
    const viaCepData = await consultarViaCEP(cep);
    if (viaCepData) {
      cidadeFinal = cidadeFinal || viaCepData.cidade;
      ufFinal = ufFinal || viaCepData.uf;
    }
  }
  
  if (!cidadeFinal || !ufFinal) {
    throw new Error(`Não foi possível obter cidade/UF para o CEP ${cep}`);
  }
  
  // Usar Nominatim para geocodificar
  const query = `${cidadeFinal}, ${ufFinal}, Brasil`;
  console.log(`Geocodificando: ${query}`);
  
  // Respeitar rate limit do Nominatim (1 req/segundo)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?` + 
    `q=${encodeURIComponent(query)}&` +
    `format=json&` +
    `limit=1&` +
    `countrycodes=br`,
    {
      headers: {
        'User-Agent': 'TransportadoraApp/1.0'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Nominatim retornou ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data || data.length === 0) {
    throw new Error(`Localização não encontrada para ${query}`);
  }
  
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };
}

async function calcularRotaGoogle(
  origem: Coordinates,
  destino: Coordinates,
  apiKey: string,
  numeroEixos?: number
): Promise<Omit<RotaResponse, 'origem_coords' | 'destino_coords'>> {
  try {
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: origem.lat,
            longitude: origem.lon
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destino.lat,
            longitude: destino.lon
          }
        }
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        vehicleInfo: {
          emissionType: "DIESEL"
        },
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
      },
      languageCode: "pt-BR",
      units: "METRIC"
    };

    console.log('Chamando Google Maps Routes API...');
    
    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.travelAdvisory.tollInfo'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro Google Maps API:', response.status, errorText);
      
      // Se houver erro (quota, etc), retornar valores zerados
      console.warn('Google Maps API falhou. Retornando valores zerados.');
      return {
        distancia_km: 0,
        pedagios_valor: 0,
        tempo_estimado_horas: 0,
        numero_pracas_pedagio: 0
      };
    }

    const data = await response.json();
    console.log('Resposta Google Maps:', JSON.stringify(data));

    if (!data.routes || data.routes.length === 0) {
      throw new Error('Nenhuma rota encontrada');
    }

    const route = data.routes[0];
    
    // Extrair distância (em metros, converter para km)
    const distanciaKm = route.distanceMeters ? route.distanceMeters / 1000 : 0;
    
    // Extrair duração (em segundos com sufixo 's', converter para horas)
    const duracaoSegundos = route.duration ? parseInt(route.duration.replace('s', '')) : 0;
    const tempoHoras = duracaoSegundos / 3600;
    
    // Extrair informações de pedágio
    const tollInfo = route.travelAdvisory?.tollInfo;
    let pedagiosValor = 0;
    let numeroPracas = 0;
    
    if (tollInfo && tollInfo.estimatedPrice) {
      // Google retorna preço em formato de moeda
      // estimatedPrice tem estrutura: [{ currencyCode: "BRL", units: "50", nanos: 500000000 }]
      const prices = tollInfo.estimatedPrice;
      if (prices && prices.length > 0) {
        const price = prices[0];
        // Converter para BRL: units + (nanos / 1000000000)
        pedagiosValor = parseFloat(price.units || 0) + (parseFloat(price.nanos || 0) / 1000000000);
      }
    }

    console.log('Rota processada:', {
      distanciaKm,
      tempoHoras,
      pedagiosValor,
      numeroPracas
    });

    return {
      distancia_km: distanciaKm,
      pedagios_valor: pedagiosValor,
      tempo_estimado_horas: tempoHoras,
      numero_pracas_pedagio: numeroPracas
    };

  } catch (error: any) {
    console.error('Erro ao calcular rota com Google Maps:', error);
    
    // Retornar valores zerados em caso de erro
    return {
      distancia_km: 0,
      pedagios_valor: 0,
      tempo_estimado_horas: 0,
      numero_pracas_pedagio: 0
    };
  }
}
