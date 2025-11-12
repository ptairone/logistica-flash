-- 1. Adicionar coluna senha_hash à tabela empresas_pendentes
ALTER TABLE public.empresas_pendentes 
ADD COLUMN IF NOT EXISTS senha_hash text;

-- 2. Criar índice por CNPJ para melhor performance
CREATE INDEX IF NOT EXISTS idx_empresas_pendentes_cnpj 
ON public.empresas_pendentes (cnpj);

-- 3. Garantir que o enum app_role tenha o valor super_admin
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'super_admin' 
    AND enumtypid = 'public.app_role'::regtype
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- 4. Adicionar constraint única em user_roles (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_role_unique'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role);
  END IF;
END $$;

-- 5. Garantir que o trigger de criação de perfil existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;