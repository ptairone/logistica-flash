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

    const { email, password } = await req.json();

    console.log('Criando super admin:', email);

    // Verificar se já existe
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users.find(u => u.email === email);

    let userId: string;

    if (userExists) {
      console.log('Usuário já existe:', userExists.id);
      userId = userExists.id;
    } else {
      // Criar usuário no Supabase Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome: 'Super Admin',
        }
      });

      if (createError) {
        console.error('Erro ao criar usuário:', createError);
        return new Response(
          JSON.stringify({ error: 'Erro ao criar usuário: ' + createError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = newUser.user!.id;
      console.log('Usuário criado:', userId);
    }

    // Verificar se já tem a role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .maybeSingle();

    if (existingRole) {
      console.log('Usuário já é super admin');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Usuário já é super admin',
          user_id: userId
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Adicionar role super_admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{
        user_id: userId,
        role: 'super_admin',
        empresa_id: null // Super admin não tem empresa
      }]);

    if (roleError) {
      console.error('Erro ao adicionar role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Erro ao adicionar role: ' + roleError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Super admin criado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Super admin criado com sucesso!',
        user_id: userId,
        email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função criar-super-admin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: 'Erro interno: ' + errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
