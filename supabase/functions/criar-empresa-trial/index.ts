import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { nome, cnpj, email_contato, telefone, nome_responsavel, senha } = await req.json();

    console.log('Processando auto-cadastro de empresa:', { nome, cnpj });

    // Validar campos obrigatórios
    if (!nome || !cnpj || !email_contato || !nome_responsavel || !senha) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato do CNPJ (14 dígitos, pode ter pontuação)
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      return new Response(
        JSON.stringify({ error: 'CNPJ inválido. Deve conter 14 dígitos.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se CNPJ já existe em empresas ativas
    const { data: empresaExistente } = await supabase
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpj)
      .single();

    if (empresaExistente) {
      return new Response(
        JSON.stringify({ error: 'Este CNPJ já está cadastrado no sistema.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se já existe pedido pendente com este CNPJ
    const { data: pendente } = await supabase
      .from('empresas_pendentes')
      .select('id, status')
      .eq('cnpj', cnpj)
      .eq('status', 'aguardando_aprovacao')
      .single();

    if (pendente) {
      return new Response(
        JSON.stringify({ 
          error: 'Já existe uma solicitação pendente para este CNPJ. Aguarde a análise.' 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extrair domínio do email para facilitar identificação
    const dominioEmail = email_contato.includes('@') 
      ? '@' + email_contato.split('@')[1] 
      : null;

    // Criar registro em empresas_pendentes
    const { data: empresaPendente, error: insertError } = await supabase
      .from('empresas_pendentes')
      .insert([{
        nome,
        cnpj,
        email_contato,
        telefone,
        nome_responsavel,
        senha_hash: senha, // Nota: Em produção, isso seria hasheado
        status: 'aguardando_aprovacao'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar empresa pendente:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar cadastro. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Empresa pendente criada com sucesso:', empresaPendente.id);

    // TODO: Enviar email de notificação para super admin

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Solicitação enviada com sucesso! Você receberá um email em até 24 horas após a aprovação.',
        id: empresaPendente.id
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na função criar-empresa-trial:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
