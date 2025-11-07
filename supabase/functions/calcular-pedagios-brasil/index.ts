/**
 * @deprecated Esta função está deprecated. Use calcular-rota-brasil ao invés.
 * A API Rotas Brasil fornece dados mais precisos e completos em uma única chamada.
 * Mantida temporariamente para compatibilidade.
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PedagioBrasilRequest {
  origem_lat: number;
  origem_lon: number;
  destino_lat: number;
  destino_lon: number;
}

interface PracaPedagio {
  nome: string;
  valor: number;
  cidade?: string;
  uf?: string;
  rodovia?: string;
  latitude?: number;
  longitude?: number;
}

interface PedagioBrasilResponse {
  valor_total: number;
  numero_pracas: number;
  pracas: PracaPedagio[];
  sucesso: boolean;
  erro?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origem_lat, origem_lon, destino_lat, destino_lon }: PedagioBrasilRequest = await req.json();
    
    const CALCULAR_PEDAGIO_API_KEY = Deno.env.get('CALCULAR_PEDAGIO_API_KEY');
    if (!CALCULAR_PEDAGIO_API_KEY) {
      console.warn('⚠️ CALCULAR_PEDAGIO_API_KEY não configurada, retornando valores zerados');
      return new Response(
        JSON.stringify({
          valor_total: 0,
          numero_pracas: 0,
          pracas: [],
          sucesso: false,
          erro: 'API key não configurada'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log('🛣️ Calculando pedágios com API Calcular Pedágio:', {
      origem: { lat: origem_lat, lon: origem_lon },
      destino: { lat: destino_lat, lon: destino_lon }
    });

    const requestBody = {
      pontos: [
        [origem_lat, origem_lon],
        [destino_lat, destino_lon]
      ],
      Final: [destino_lat, destino_lon]
    };

    console.log('📤 Request body:', JSON.stringify(requestBody));

    const response = await fetch('https://www.calcularpedagio.com.br/api/coordenadas/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CALCULAR_PEDAGIO_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro API Calcular Pedágio:', response.status, errorText);
      
      // Retornar valores zerados em caso de erro
      return new Response(
        JSON.stringify({
          valor_total: 0,
          numero_pracas: 0,
          pracas: [],
          sucesso: false,
          erro: `API retornou status ${response.status}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const data = await response.json();
    console.log('📥 Resposta API:', JSON.stringify(data));

    // Processar resposta da API
    const pracas: PracaPedagio[] = [];
    let valorTotal = 0;

    // A API retorna um array de rotas, pegamos a primeira
    if (data.rotas && data.rotas.length > 0) {
      const rota = data.rotas[0];
      
      if (rota.pedagios && Array.isArray(rota.pedagios)) {
        rota.pedagios.forEach((pedagio: any) => {
          const valor = parseFloat(pedagio.valor || 0);
          valorTotal += valor;
          
          pracas.push({
            nome: pedagio.nome || 'Praça não identificada',
            valor: valor,
            cidade: pedagio.cidade,
            uf: pedagio.uf,
            rodovia: pedagio.rodovia,
            latitude: pedagio.latitude,
            longitude: pedagio.longitude,
          });
        });
      }

      // Se a API retorna valor total direto
      if (rota.valorTotal !== undefined) {
        valorTotal = parseFloat(rota.valorTotal);
      }
    }

    const resultado: PedagioBrasilResponse = {
      valor_total: valorTotal,
      numero_pracas: pracas.length,
      pracas: pracas,
      sucesso: true,
    };

    console.log('✅ Pedágios calculados:', resultado);

    return new Response(
      JSON.stringify(resultado),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('💥 Erro ao calcular pedágios:', error);
    
    // Retornar valores zerados em caso de erro inesperado
    return new Response(
      JSON.stringify({
        valor_total: 0,
        numero_pracas: 0,
        pracas: [],
        sucesso: false,
        erro: error.message || 'Erro desconhecido'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
