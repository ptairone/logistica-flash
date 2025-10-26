import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Função consultar-cnpj iniciada');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cnpj } = await req.json();
    
    if (!cnpj) {
      return new Response(
        JSON.stringify({ error: 'CNPJ não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove formatação do CNPJ
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    
    console.log('Consultando CNPJ:', cnpjLimpo);

    // Tentar BrasilAPI primeiro
    let response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
    
    if (!response.ok) {
      // Se BrasilAPI falhar, tentar ReceitaWS
      console.log('BrasilAPI falhou, tentando ReceitaWS');
      response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'CNPJ não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    console.log('Dados do CNPJ obtidos com sucesso');

    // Normalizar resposta (BrasilAPI e ReceitaWS têm formatos diferentes)
    const resultado = {
      razao_social: data.razao_social || data.nome || '',
      nome_fantasia: data.nome_fantasia || data.fantasia || '',
      cnpj: data.cnpj || cnpjLimpo,
      logradouro: data.logradouro || data.descricao_tipo_de_logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      municipio: data.municipio || data.cidade || '',
      uf: data.uf || '',
      cep: data.cep || '',
      telefone: data.ddd_telefone_1 || data.telefone || '',
      email: data.email || '',
    };

    return new Response(
      JSON.stringify(resultado),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao consultar CNPJ', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
