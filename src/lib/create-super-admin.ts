import { supabase } from "@/integrations/supabase/client";

export async function createSuperAdmin() {
  try {
    const { data, error } = await supabase.functions.invoke('criar-super-admin', {
      body: {
        email: 'ptairone@icloud.com',
        password: 'Admin@2024'
      }
    });

    if (error) {
      console.error('Erro ao criar super admin:', error);
      return { success: false, error };
    }

    console.log('Super admin criado com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao chamar edge function:', error);
    return { success: false, error };
  }
}

// Auto-executar ao importar este arquivo
createSuperAdmin().then(result => {
  if (result.success) {
    console.log('✅ Super Admin criado!');
    console.log('Email: ptairone@icloud.com');
    console.log('Senha: Admin@2024');
  } else {
    console.error('❌ Erro ao criar super admin:', result.error);
  }
});
