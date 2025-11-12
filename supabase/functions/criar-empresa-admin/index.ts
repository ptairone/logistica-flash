import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Cliente para validar autenticação (usa anon key + token do usuário)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! }
      }
    });

    // Cliente para operações administrativas (usa service role)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Erro de autenticação:', userError);
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se é super_admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    if (!roles) {
      console.error('Usuário não é super_admin');
      return new Response(
        JSON.stringify({ error: 'Sem permissão' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { empresa, admin } = await req.json();

    console.log('Criando empresa:', empresa.nome);
    console.log('Criando admin:', admin.email);

    // 1. Criar a empresa (usar supabaseAdmin)
    const { data: empresaCriada, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .insert({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        email_contato: empresa.email_contato,
        telefone: empresa.telefone,
        status: empresa.status || 'trial',
        data_inicio_trial: empresa.data_inicio_trial,
        data_fim_trial: empresa.data_fim_trial,
        observacoes: empresa.observacoes,
        cor_primaria: empresa.cor_primaria,
        created_by: user.id,
      })
      .select()
      .single();

    if (empresaError) {
      console.error('Erro ao criar empresa:', empresaError);
      throw empresaError;
    }

    console.log('Empresa criada com ID:', empresaCriada.id);

    try {
      // 2. Criar usuário admin no Auth (usar supabaseAdmin)
      const { data: adminUser, error: adminUserError } = await supabaseAdmin.auth.admin.createUser({
        email: admin.email,
        password: admin.senha,
        email_confirm: true,
        user_metadata: {
          nome: admin.nome,
          empresa_id: empresaCriada.id,
        },
      });

      if (adminUserError) {
        console.error('Erro ao criar usuário admin:', adminUserError);
        throw adminUserError;
      }

      console.log('Usuário admin criado com ID:', adminUser.user.id);

      // 3. Criar role admin em user_roles (usar supabaseAdmin)
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: adminUser.user.id,
          role: 'admin',
          empresa_id: empresaCriada.id,
        });

      if (roleError) {
        console.error('Erro ao criar role:', roleError);
        throw roleError;
      }

      console.log('Role admin criada para usuário:', adminUser.user.id);

      // 4. Criar perfil do admin (usar supabaseAdmin)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: adminUser.user.id,
          nome: admin.nome,
          email: admin.email,
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Não é crítico, continua
      }

      return new Response(
        JSON.stringify({
          success: true,
          empresa: empresaCriada,
          admin: {
            id: adminUser.user.id,
            email: admin.email,
            nome: admin.nome,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      // Rollback: deletar empresa se houve erro ao criar admin
      console.error('Erro ao criar admin, fazendo rollback da empresa:', error);
      
      await supabaseAdmin
        .from('empresas')
        .delete()
        .eq('id', empresaCriada.id);

      throw error;
    }

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao criar empresa e administrador' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
