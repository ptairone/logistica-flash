import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { userId, novaSenha } = await req.json();

    if (!userId || !novaSenha) {
      return new Response(
        JSON.stringify({ error: "userId e novaSenha são obrigatórios" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Validar senha
    if (novaSenha.length < 6) {
      return new Response(
        JSON.stringify({ error: "A senha deve ter no mínimo 6 caracteres" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Atualizar senha do usuário usando o Admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: novaSenha }
    );

    if (error) {
      console.error("Erro ao atualizar senha:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Senha alterada com sucesso"
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Erro na função:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro desconhecido" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
