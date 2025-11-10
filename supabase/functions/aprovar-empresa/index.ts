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

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar que usuário é super_admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se é super admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isSuperAdmin = roles?.some(r => r.role === 'super_admin');
    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Apenas super admin pode aprovar empresas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { empresa_pendente_id } = await req.json();

    if (!empresa_pendente_id) {
      return new Response(
        JSON.stringify({ error: 'ID da empresa pendente é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Aprovando empresa pendente:', empresa_pendente_id);

    // Buscar dados da empresa pendente
    const { data: empresaPendente, error: fetchError } = await supabase
      .from('empresas_pendentes')
      .select('*')
      .eq('id', empresa_pendente_id)
      .single();

    if (fetchError || !empresaPendente) {
      return new Response(
        JSON.stringify({ error: 'Empresa pendente não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (empresaPendente.status !== 'aguardando_aprovacao') {
      return new Response(
        JSON.stringify({ error: 'Esta empresa já foi processada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extrair domínio do email
    const dominioEmail = empresaPendente.email_contato.includes('@')
      ? '@' + empresaPendente.email_contato.split('@')[1]
      : null;

    // 1. Criar empresa com status trial
    const { data: novaEmpresa, error: empresaError } = await supabase
      .from('empresas')
      .insert([{
        nome: empresaPendente.nome,
        cnpj: empresaPendente.cnpj,
        email_contato: empresaPendente.email_contato,
        telefone: empresaPendente.telefone,
        dominio_email: dominioEmail,
        status: 'trial',
        data_inicio_trial: new Date().toISOString(),
        data_fim_trial: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: user.id
      }])
      .select()
      .single();

    if (empresaError) {
      console.error('Erro ao criar empresa:', empresaError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar empresa' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Empresa criada:', novaEmpresa.id);

    // 2. Criar usuário admin da empresa no Supabase Auth
    const { data: novoUser, error: userCreateError } = await supabase.auth.admin.createUser({
      email: empresaPendente.email_contato,
      password: empresaPendente.senha_hash,
      email_confirm: true,
      user_metadata: {
        nome: empresaPendente.nome_responsavel,
        empresa_id: novaEmpresa.id,
        empresa_nome: novaEmpresa.nome
      }
    });

    if (userCreateError) {
      console.error('Erro ao criar usuário:', userCreateError);
      // Rollback: deletar empresa criada
      await supabase.from('empresas').delete().eq('id', novaEmpresa.id);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário admin' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário admin criado:', novoUser.user?.id);

    // 3. Criar role admin para o novo usuário
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{
        user_id: novoUser.user!.id,
        role: 'admin',
        empresa_id: novaEmpresa.id
      }]);

    if (roleError) {
      console.error('Erro ao criar role:', roleError);
      // Rollback
      await supabase.auth.admin.deleteUser(novoUser.user!.id);
      await supabase.from('empresas').delete().eq('id', novaEmpresa.id);
      return new Response(
        JSON.stringify({ error: 'Erro ao configurar permissões' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Atualizar status da empresa pendente
    await supabase
      .from('empresas_pendentes')
      .update({
        status: 'aprovada',
        analisado_por: user.id,
        analisado_em: new Date().toISOString()
      })
      .eq('id', empresa_pendente_id);

    console.log('Empresa aprovada com sucesso');

    // TODO: Enviar email de boas-vindas com credenciais

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Empresa aprovada com sucesso!',
        empresa: {
          id: novaEmpresa.id,
          nome: novaEmpresa.nome,
          cnpj: novaEmpresa.cnpj,
          admin_email: empresaPendente.email_contato,
          trial_ate: novaEmpresa.data_fim_trial
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na função aprovar-empresa:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
