import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Chave da Lovable AI não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const viagemId = formData.get('viagemId') as string;
    const tipo = formData.get('tipo') as string || 'despesa';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Arquivo é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📸 Processando comprovante:', {
      tipo,
      viagemId,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)}KB`,
      mimeType: file.type
    });

    // Converter arquivo para base64 usando chunks para evitar stack overflow
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64 = btoa(binary);
    const mimeType = file.type || 'image/jpeg';

    // Definir prompt baseado no tipo
    let systemPrompt = '';
    
    if (tipo === 'abastecimento') {
      systemPrompt = `Você é um assistente especializado em extrair informações de comprovantes de ABASTECIMENTO de combustível.

INSTRUÇÕES:
- Extraia o KM DO VEÍCULO (odômetro) no momento do abastecimento
- Extraia a QUANTIDADE DE LITROS abastecida
- Extraia o VALOR TOTAL pago
- Identifique o NOME DO POSTO (ex: "Shell", "Petrobras", "Ipiranga")
- Identifique CIDADE e UF do posto (se visível)
- Identifique a DATA e HORA do abastecimento

RETORNE APENAS JSON válido no formato:
{
  "km_veiculo": 123456,
  "litros": 120.5,
  "valor_total": 689.50,
  "posto_nome": "Shell",
  "posto_cidade": "São Paulo",
  "posto_uf": "SP",
  "data_abastecimento": "2025-10-28T14:30:00"
}

Se não conseguir identificar algum campo, retorne null para esse campo.`;
    } else {
      systemPrompt = `Você é um assistente especializado em extrair informações de comprovantes fiscais brasileiros (notas fiscais, recibos, cupons).

INSTRUÇÕES:
- Identifique o tipo de despesa: combustivel, pedagio, alimentacao, hospedagem, manutencao, outros
- Extraia o VALOR TOTAL do documento (procure por "Total", "Valor", "R$")
- Identifique a DATA (formato YYYY-MM-DD)
- Crie uma descrição breve (ex: "Abastecimento Posto Shell", "Pedágio BR-101")

RETORNE APENAS JSON válido no formato:
{"tipo": "combustivel", "valor": 123.45, "data": "2025-10-27", "descricao": "texto breve"}

Se não conseguir identificar algum campo, use valores padrão sensatos.`;
    }

    // Chamar Lovable AI para extrair informações
    console.log('🤖 Chamando Lovable AI para análise da imagem...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extraia as informações deste comprovante de despesa. Retorne apenas JSON no formato especificado.'
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
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Erro da Lovable AI:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos esgotados. Adicione créditos em Settings → Workspace → Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Erro ao processar com Lovable AI: ${aiResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('✅ Resposta da Lovable AI:', JSON.stringify(aiData));

    const content = aiData.choices[0]?.message?.content;
    if (!content) {
      console.error('❌ Nenhum conteúdo retornado pela Lovable AI');
      return new Response(
        JSON.stringify({ error: 'Não foi possível extrair informações do comprovante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsear o JSON retornado
    let dadosExtraidos;
    try {
      // Remover possíveis markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      dadosExtraidos = JSON.parse(cleanContent);
      console.log('📋 Informações extraídas:', dadosExtraidos);
    } catch (e) {
      console.error('❌ Erro ao parsear JSON:', e, 'Conteúdo:', content);
      return new Response(
        JSON.stringify({ error: 'Não foi possível interpretar as informações extraídas. Preencha manualmente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let resultado;
    
    if (tipo === 'abastecimento') {
      resultado = {
        dados: dadosExtraidos
      };
    } else {
      // Validar e normalizar os dados de despesa
      const tiposValidos = ['combustivel', 'pedagio', 'alimentacao', 'hospedagem', 'manutencao', 'outros'];
      if (!tiposValidos.includes(dadosExtraidos.tipo)) {
        dadosExtraidos.tipo = 'outros';
      }

      resultado = {
        tipo: dadosExtraidos.tipo,
        valor: parseFloat(dadosExtraidos.valor) || 0,
        data: dadosExtraidos.data || new Date().toISOString().split('T')[0],
        descricao: dadosExtraidos.descricao || 'Extraído automaticamente do comprovante',
        reembolsavel: true
      };
    }

    console.log('🎯 Resultado final:', resultado);

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
