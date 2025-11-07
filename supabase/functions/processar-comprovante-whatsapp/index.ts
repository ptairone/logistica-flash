import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar secret do webhook (segurança)
    const N8N_WEBHOOK_SECRET = Deno.env.get('N8N_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('X-Webhook-Secret');
    
    if (N8N_WEBHOOK_SECRET && providedSecret !== N8N_WEBHOOK_SECRET) {
      console.error('Unauthorized: Invalid webhook secret');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { telefone, imagem_url, imagem_base64, mensagem_texto } = await req.json();

    if (!telefone || (!imagem_url && !imagem_base64)) {
      return new Response(JSON.stringify({ error: 'Telefone e imagem são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processando comprovante WhatsApp de:', telefone);

    // Limpar telefone (remover caracteres especiais)
    const telefoneLimpo = telefone.replace(/\D/g, '');

    // 1. Identificar motorista pelo telefone
    const { data: motorista, error: motoristaError } = await supabase
      .from('motoristas')
      .select('id, nome, user_id')
      .or(`telefone.eq.${telefone},telefone.eq.${telefoneLimpo}`)
      .single();

    if (motoristaError || !motorista) {
      console.error('Motorista não encontrado:', telefone);
      return new Response(JSON.stringify({
        success: false,
        error: 'Motorista não encontrado. Verifique se o número está cadastrado.'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Motorista encontrado:', motorista.nome);

    // 2. Buscar viagem ativa do motorista
    const { data: viagem } = await supabase
      .from('viagens')
      .select('id, codigo, status')
      .eq('motorista_id', motorista.id)
      .eq('status', 'em_andamento')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('Viagem ativa:', viagem?.codigo || 'Nenhuma');

    // 3. Download e upload da imagem para Supabase Storage
    let imagemStorageUrl = '';
    let imagemBase64Final = imagem_base64;

    if (imagem_url) {
      // Download da imagem
      const imageResponse = await fetch(imagem_url);
      if (!imageResponse.ok) {
        throw new Error('Erro ao baixar imagem');
      }
      const imageBlob = await imageResponse.blob();
      const imageBuffer = await imageBlob.arrayBuffer();
      imagemBase64Final = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    }

    // Upload para Storage
    const fileName = `${motorista.id}/${Date.now()}-whatsapp.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('comprovantes')
      .upload(fileName, Uint8Array.from(atob(imagemBase64Final), c => c.charCodeAt(0)), {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      throw new Error('Erro ao salvar imagem');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('comprovantes')
      .getPublicUrl(fileName);

    imagemStorageUrl = publicUrl;
    console.log('Imagem salva em:', imagemStorageUrl);

    // 4. Chamar IA para classificar o comprovante
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const systemPrompt = `Você é um assistente de classificação de comprovantes para motoristas de caminhão.

ANALISE A IMAGEM E DETERMINE O TIPO:

1. HODOMETRO - Painel do veículo mostrando quilometragem
2. ABASTECIMENTO - Nota fiscal de posto de combustível
3. DESPESA_ALIMENTACAO - Recibo de restaurante, lanchonete
4. DESPESA_PEDAGIO - Ticket de praça de pedágio
5. DESPESA_HOSPEDAGEM - Nota de hotel, pousada
6. DESPESA_MANUTENCAO - Recibo de oficina, borracharia, pneus
7. DESPESA_OUTRAS - Outras despesas gerais
8. RECEBIMENTO - Comprovante de pagamento de frete recebido
9. ADIANTAMENTO - Comprovante de adiantamento recebido
10. DESCONHECIDO - Não foi possível identificar

RETORNE JSON VÁLIDO com a estrutura:
{
  "tipo_identificado": "abastecimento",
  "confianca": "alta",
  "dados_extraidos": {
    "valor": 689.50,
    "litros": 120,
    "km_veiculo": 45000,
    "posto": "Shell",
    "data": "2025-11-07"
  },
  "sugestao_confirmacao": "Abastecimento de 120L por R$ 689,50 no Posto Shell?"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: mensagem_texto || 'Classifique esta imagem' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imagemBase64Final}` } }
            ]
          }
        ],
        temperature: 0.1
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Limite de requisições da IA excedido. Tente novamente em alguns minutos.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Créditos da IA esgotados. Contate o administrador.');
      }
      throw new Error('Erro ao processar imagem com IA');
    }

    const aiData = await aiResponse.json();
    let classificacao;
    
    try {
      const content = aiData.choices[0].message.content;
      // Limpar possível markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      classificacao = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Erro ao parsear resposta da IA:', e);
      classificacao = {
        tipo_identificado: 'DESCONHECIDO',
        confianca: 'baixa',
        dados_extraidos: {},
        sugestao_confirmacao: 'Não foi possível identificar o tipo de comprovante automaticamente.'
      };
    }

    console.log('Classificação IA:', classificacao);

    // 5. Registrar log em comprovantes_whatsapp
    const { data: comprovanteLog, error: logError } = await supabase
      .from('comprovantes_whatsapp')
      .insert({
        motorista_id: motorista.id,
        viagem_id: viagem?.id || null,
        telefone: telefone,
        imagem_url: imagemStorageUrl,
        tipo_identificado: classificacao.tipo_identificado,
        confianca: classificacao.confianca,
        dados_extraidos: classificacao.dados_extraidos,
        status: 'processando'
      })
      .select()
      .single();

    if (logError) {
      console.error('Erro ao registrar log:', logError);
    }

    // 6. Processar e criar registro no banco de dados
    let registroId = null;
    let tipoRegistro = '';

    try {
      const tipo = classificacao.tipo_identificado.toUpperCase();
      const dados = classificacao.dados_extraidos;

      if (tipo === 'HODOMETRO' && viagem) {
        // Atualizar km_inicial ou km_final da viagem
        const kmVeiculo = dados.km_veiculo || dados.km || dados.quilometragem;
        
        if (kmVeiculo) {
          if (!viagem.km_inicial) {
            await supabase
              .from('viagens')
              .update({ km_inicial: kmVeiculo })
              .eq('id', viagem.id);
            tipoRegistro = 'km_inicial';
          } else if (!viagem.km_final) {
            await supabase
              .from('viagens')
              .update({ km_final: kmVeiculo })
              .eq('id', viagem.id);
            tipoRegistro = 'km_final';
          }
          registroId = viagem.id;
        }
      } else if (tipo === 'ABASTECIMENTO' && viagem) {
        // Criar abastecimento
        const { data: abast } = await supabase
          .from('abastecimentos')
          .insert({
            motorista_id: motorista.id,
            viagem_id: viagem.id,
            veiculo_id: viagem.veiculo_id,
            km_veiculo: dados.km_veiculo || 0,
            litros: dados.litros || 0,
            valor_total: dados.valor || dados.valor_total || 0,
            posto_nome: dados.posto || dados.posto_nome || '',
            data_abastecimento: dados.data || new Date().toISOString(),
            comprovante_url: imagemStorageUrl,
            status: 'pendente_validacao'
          })
          .select()
          .single();
        
        registroId = abast?.id;
        tipoRegistro = 'abastecimento';
      } else if (tipo.startsWith('DESPESA_') && viagem) {
        // Criar despesa
        const tipoDespesa = tipo.replace('DESPESA_', '').toLowerCase();
        const { data: desp } = await supabase
          .from('despesas')
          .insert({
            viagem_id: viagem.id,
            tipo: tipoDespesa,
            valor: dados.valor || dados.valor_total || 0,
            descricao: dados.descricao || classificacao.sugestao_confirmacao,
            data: dados.data || new Date().toISOString(),
            anexo_url: imagemStorageUrl,
            origem: 'motorista'
          })
          .select()
          .single();
        
        registroId = desp?.id;
        tipoRegistro = 'despesa';
      } else if ((tipo === 'RECEBIMENTO' || tipo === 'ADIANTAMENTO') && viagem) {
        // Criar transação
        const { data: trans } = await supabase
          .from('transacoes_viagem')
          .insert({
            viagem_id: viagem.id,
            tipo: tipo.toLowerCase(),
            valor: dados.valor || dados.valor_total || 0,
            descricao: dados.descricao || classificacao.sugestao_confirmacao,
            data: dados.data || new Date().toISOString()
          })
          .select()
          .single();
        
        registroId = trans?.id;
        tipoRegistro = 'transacao';
      }

      // Atualizar status do log
      if (comprovanteLog) {
        await supabase
          .from('comprovantes_whatsapp')
          .update({ status: 'confirmado' })
          .eq('id', comprovanteLog.id);
      }
    } catch (error) {
      console.error('Erro ao processar registro:', error);
      
      // Atualizar status do log com erro
      if (comprovanteLog) {
        await supabase
          .from('comprovantes_whatsapp')
          .update({
            status: 'erro',
            erro_mensagem: error.message
          })
          .eq('id', comprovanteLog.id);
      }
    }

    // 7. Retornar resposta estruturada
    return new Response(JSON.stringify({
      success: true,
      motorista_nome: motorista.nome,
      viagem_codigo: viagem?.codigo || null,
      tipo_identificado: classificacao.tipo_identificado,
      confianca: classificacao.confianca,
      sugestao_confirmacao: classificacao.sugestao_confirmacao,
      registro_id: registroId,
      tipo_registro: tipoRegistro,
      comprovante_log_id: comprovanteLog?.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao processar comprovante WhatsApp:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
