/**
 * @deprecated Esta função está deprecated. Use calcular-rota-google ao invés.
 * Mantida por compatibilidade temporária.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DistanciaRequest {
  origem_cep: string;
  destino_cep: string;
  origem_cidade?: string;
  origem_uf?: string;
  destino_cidade?: string;
  destino_uf?: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origem_cep, destino_cep, origem_cidade, origem_uf, destino_cidade, destino_uf }: DistanciaRequest = await req.json();

    console.log('Calculando distância entre:', { origem_cep, destino_cep });

    // 1. Geocodificar origem
    const origemCoords = await geocodificar(origem_cep, origem_cidade, origem_uf);
    if (!origemCoords) {
      throw new Error('Não foi possível geocodificar o CEP de origem');
    }

    // 2. Geocodificar destino
    const destinoCoords = await geocodificar(destino_cep, destino_cidade, destino_uf);
    if (!destinoCoords) {
      throw new Error('Não foi possível geocodificar o CEP de destino');
    }

    console.log('Coordenadas obtidas:', { origem: origemCoords, destino: destinoCoords });

    // 3. Calcular distância usando OSRM
    const distanciaKm = await calcularDistanciaOSRM(origemCoords, destinoCoords);

    console.log('Distância calculada:', distanciaKm, 'km');

    return new Response(
      JSON.stringify({
        distancia_km: Math.round(distanciaKm),
        origem: origemCoords,
        destino: destinoCoords,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Erro ao calcular distância:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao calcular distância',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function consultarViaCEP(cep: string): Promise<{
  localidade: string;
  uf: string;
  bairro?: string;
  logradouro?: string;
} | null> {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    const url = `https://viacep.com.br/ws/${cepLimpo}/json/`;
    
    console.log('Consultando ViaCEP:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Erro ao consultar ViaCEP:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.erro) {
      console.error('CEP não encontrado no ViaCEP');
      return null;
    }
    
    console.log('ViaCEP retornou:', data);
    
    return {
      localidade: data.localidade,
      uf: data.uf,
      bairro: data.bairro,
      logradouro: data.logradouro
    };
  } catch (error) {
    console.error('Erro ao consultar ViaCEP:', error);
    return null;
  }
}

async function geocodificar(cep: string, cidade?: string, uf?: string): Promise<Coordinates | null> {
  try {
    // PASSO 1: Tentar obter dados do CEP via ViaCEP
    const dadosCEP = await consultarViaCEP(cep);
    
    // Se ViaCEP falhar, usar cidade/UF fornecidos
    const cidadeFinal = dadosCEP?.localidade || cidade;
    const ufFinal = dadosCEP?.uf || uf;
    
    if (!cidadeFinal || !ufFinal) {
      console.error('Não foi possível obter cidade/UF para o CEP:', cep);
      return null;
    }
    
    // PASSO 2: Geocodificar usando cidade + UF (muito mais preciso que CEP)
    const query = `${cidadeFinal}, ${ufFinal}, Brazil`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=1`;
    
    console.log('Geocodificando via Nominatim:', query);
    
    // Delay para respeitar rate limit do Nominatim (1 req/segundo)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TransportManager/1.0',
      },
    });

    if (!response.ok) {
      console.error('Erro na geocodificação Nominatim:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      console.log('Coordenadas encontradas:', { lat: data[0].lat, lon: data[0].lon, display_name: data[0].display_name });
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }

    console.error('Nenhuma coordenada encontrada para:', query);
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar:', error);
    return null;
  }
}

async function calcularDistanciaOSRM(origem: Coordinates, destino: Coordinates): Promise<number> {
  try {
    // OSRM usa formato lon,lat (não lat,lon)
    const url = `https://router.project-osrm.org/route/v1/driving/${origem.lon},${origem.lat};${destino.lon},${destino.lat}?overview=false`;
    
    console.log('Calculando rota OSRM:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM retornou erro: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('OSRM não conseguiu calcular a rota');
    }

    // Distância vem em metros, converter para km
    const distanciaMetros = data.routes[0].distance;
    const distanciaKm = distanciaMetros / 1000;

    return distanciaKm;
  } catch (error) {
    console.error('Erro ao calcular distância OSRM:', error);
    throw error;
  }
}
