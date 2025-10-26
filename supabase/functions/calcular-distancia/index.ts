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

async function geocodificar(cep: string, cidade?: string, uf?: string): Promise<Coordinates | null> {
  try {
    // Tentar geocodificar usando CEP brasileiro
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Se tiver cidade e UF, usar uma busca mais precisa
    let query = '';
    if (cidade && uf) {
      query = `${cepLimpo}, ${cidade}, ${uf}, Brazil`;
    } else {
      query = `${cepLimpo}, Brazil`;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=1`;
    
    console.log('Geocodificando:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TransportManager/1.0', // Nominatim requer User-Agent
      },
    });

    if (!response.ok) {
      console.error('Erro na geocodificação:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }

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
