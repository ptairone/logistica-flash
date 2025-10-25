import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Chave da OpenAI não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const viagemId = formData.get('viagemId') as string;

    if (!file || !viagemId) {
      return new Response(
        JSON.stringify({ error: 'Arquivo e ID da viagem são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processando comprovante para viagem:', viagemId);
    console.log('Arquivo:', file.name, file.type);

    // Converter arquivo para base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = file.type || 'image/jpeg';

    // Chamar OpenAI para extrair informações
    console.log('Chamando OpenAI para análise da imagem...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em extrair informações de comprovantes fiscais e notas. Analise a imagem e extraia as seguintes informações: tipo de despesa (combustivel, pedagio, alimentacao, hospedagem, manutencao, outros), valor total, data (formato YYYY-MM-DD), e uma descrição breve. Retorne APENAS um JSON válido com as chaves: tipo, valor, data, descricao.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extraia as informações deste comprovante de despesa. Retorne apenas JSON no formato: {"tipo": "combustivel|pedagio|alimentacao|hospedagem|manutencao|outros", "valor": 123.45, "data": "2025-01-01", "descricao": "descrição breve"}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('Erro da OpenAI:', openaiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Erro ao processar com OpenAI: ${openaiResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log('Resposta da OpenAI:', JSON.stringify(openaiData));

    const content = openaiData.choices[0]?.message?.content;
    if (!content) {
      console.error('Nenhum conteúdo retornado pela OpenAI');
      return new Response(
        JSON.stringify({ error: 'Não foi possível extrair informações do comprovante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsear o JSON retornado
    let despesaInfo;
    try {
      // Remover possíveis markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      despesaInfo = JSON.parse(cleanContent);
      console.log('Informações extraídas:', despesaInfo);
    } catch (e) {
      console.error('Erro ao parsear JSON:', e, 'Conteúdo:', content);
      return new Response(
        JSON.stringify({ error: 'Não foi possível interpretar as informações extraídas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar e normalizar os dados
    const tiposValidos = ['combustivel', 'pedagio', 'alimentacao', 'hospedagem', 'manutencao', 'outros'];
    if (!tiposValidos.includes(despesaInfo.tipo)) {
      despesaInfo.tipo = 'outros';
    }

    const resultado = {
      tipo: despesaInfo.tipo,
      valor: parseFloat(despesaInfo.valor) || 0,
      data: despesaInfo.data || new Date().toISOString().split('T')[0],
      descricao: despesaInfo.descricao || 'Extraído automaticamente do comprovante',
      reembolsavel: true
    };

    console.log('Resultado final:', resultado);

    return new Response(
      JSON.stringify(resultado),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro no processamento:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao processar comprovante' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
