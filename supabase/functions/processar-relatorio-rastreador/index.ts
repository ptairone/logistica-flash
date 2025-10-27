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
    const { imagens, fileName } = await req.json();

    if (!imagens || !Array.isArray(imagens) || imagens.length === 0) {
      throw new Error('Nenhuma imagem fornecida');
    }

    console.log(`Processando ${imagens.length} imagens do relatório: ${fileName}`);

    let todosDias: any[] = [];

    // Processar cada imagem
    for (let i = 0; i < imagens.length; i++) {
      console.log(`Processando página ${i + 1}/${imagens.length}`);
      
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
              content: `Você é um assistente especializado em extrair dados de relatórios de rastreadores veiculares do sistema "Trucks Control".

O relatório contém uma tabela com as seguintes colunas:
- Data (formato DD/MM/AAAA)
- Km (quilometragem rodada)
- Em Mov. (tempo em movimento no formato HH:MM:SS)
- Parado Ligado (tempo parado com motor ligado no formato HH:MM:SS)
- Veículo Desligado (tempo com veículo desligado)
- Excesso de Jornada (tempo de excesso sobre 8h no formato HH:MM:SS) - JÁ CALCULADO!
- Tempo Noturno (tempo trabalhado entre 22h e 06h no formato HH:MM:SS)

IMPORTANTE:
1. O relatório JÁ CALCULA o excesso de jornada (coluna "Excesso de Jornada")
2. Você deve APENAS EXTRAIR os dados, NÃO CALCULAR nada
3. Considere jornada normal de 8 horas/dia
4. Retorne TODOS os dias visíveis na tabela

Para cada dia, extraia:
- data: string no formato "YYYY-MM-DD" (converta de DD/MM/AAAA)
- dia_semana: número de 0 (domingo) a 6 (sábado)
- km_rodados: número (quilometragem do dia)
- horas_em_movimento: número decimal de horas (converta HH:MM:SS para decimal)
- horas_parado_ligado: número decimal de horas (converta HH:MM:SS para decimal)
- horas_excesso_jornada: número decimal de horas (LEIA da coluna "Excesso de Jornada", converta para decimal)
- horas_tempo_noturno: número decimal de horas (LEIA da coluna "Tempo Noturno", converta para decimal)
- horas_totais: número decimal (soma de Em Mov. + Parado Ligado em decimal)
- horas_normais: número (limitado a 8h, ou seja, min(horas_totais, 8))
- horas_extras: número (use horas_excesso_jornada da tabela)

CONVERSÃO DE TEMPO:
- HH:MM:SS para decimal: dividir minutos por 60 e segundos por 3600, somar tudo
- Exemplo: 10:30:00 = 10 + 30/60 + 0/3600 = 10.5
- Exemplo: 02:45:30 = 2 + 45/60 + 30/3600 = 2.758

Retorne um JSON no formato:
{
  "dias": [
    {
      "data": "2025-09-24",
      "dia_semana": 3,
      "km_rodados": 434,
      "horas_em_movimento": 7.4,
      "horas_parado_ligado": 0.17,
      "horas_totais": 7.57,
      "horas_normais": 7.57,
      "horas_extras": 0,
      "horas_tempo_noturno": 0
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
                  text: `Extraia os dados de TODOS os dias desta página do relatório (página ${i + 1}/${imagens.length}):`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imagens[i]
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
        console.error(`Erro OpenAI na página ${i + 1}:`, error);
        throw new Error(`Erro ao processar página ${i + 1} com OpenAI: ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      console.log(`Resposta GPT-4o página ${i + 1}:`, content);

      // Parse o JSON da resposta
      try {
        // Remove markdown code blocks se existirem
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content;
        const resultado = JSON.parse(jsonStr.trim());
        
        // Adicionar dias desta página
        if (resultado.dias && Array.isArray(resultado.dias)) {
          todosDias = todosDias.concat(resultado.dias);
          console.log(`Página ${i + 1}: ${resultado.dias.length} dias extraídos`);
        }
      } catch (e) {
        console.error(`Erro ao parsear JSON da página ${i + 1}:`, e);
        throw new Error(`Não foi possível extrair dados estruturados da página ${i + 1}`);
      }
    }

    console.log(`Total de dias extraídos: ${todosDias.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        dados: { dias: todosDias }
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
