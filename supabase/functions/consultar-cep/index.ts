import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Função consultar-cep iniciada');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cep } = await req.json();
    
    if (!cep) {
      return new Response(
        JSON.stringify({ error: 'CEP não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove formatação do CEP
    const cepLimpo = cep.replace(/[^\d]/g, '');
    
    console.log('Consultando CEP:', cepLimpo);

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'CEP não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (data.erro) {
      return new Response(
        JSON.stringify({ error: 'CEP inválido' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Dados do CEP obtidos com sucesso');

    const resultado = {
      cep: data.cep,
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
      cidade: `${data.localidade}, ${data.uf}`,
    };

    return new Response(
      JSON.stringify(resultado),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao consultar CEP', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
