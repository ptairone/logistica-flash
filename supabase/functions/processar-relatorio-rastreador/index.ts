import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName } = await req.json();

    if (!fileBase64) {
      throw new Error('PDF não fornecido');
    }

    console.log('Processando relatório de rastreador:', fileName);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em extrair dados de relatórios de rastreadores de caminhões.

IMPORTANTE: Extraia TODOS os dias que aparecem no relatório.

Para cada dia, extraia:
1. Data (formato DD/MM/YYYY)
2. "Em Mov." ou "Em Movimento" (formato HH:MM:SS ou HH:MM)
3. "Parado Ligado" (formato HH:MM:SS ou HH:MM)
4. "Excesso de Jornada" (formato HH:MM:SS ou HH:MM) - se não houver, use 00:00:00

REGRAS DE CONVERSÃO:
- Converta HH:MM:SS para horas decimais (ex: 10:30:00 = 10.5)
- horas_trabalhadas = "Em Mov." + "Parado Ligado" convertido para decimal
- horas_excesso = "Excesso de Jornada" convertido para decimal
- Identifique o dia da semana baseado na data

Retorne JSON no seguinte formato:
{
  "dias": [
    {
      "data": "2024-01-15",
      "dia_semana": 1,
      "horas_trabalhadas": 10.5,
      "horas_excesso": 2.5
    }
  ]
}

dia_semana: 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extraia os dados de todos os dias deste relatório de rastreador:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${fileBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro OpenAI:', error);
      throw new Error(`Erro ao processar com OpenAI: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Resposta GPT-4o:', content);

    // Parse o JSON da resposta
    let resultado;
    try {
      // Remove markdown code blocks se existirem
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      resultado = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error('Erro ao parsear JSON:', e);
      throw new Error('Não foi possível extrair dados estruturados do relatório');
    }

    console.log('Dados extraídos:', resultado);

    return new Response(
      JSON.stringify({ 
        success: true, 
        dados: resultado 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro ao processar relatório:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
