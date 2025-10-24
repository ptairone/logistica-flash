-- Adicionar papel de administrador para o usuário ptairone@hotmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('50addea7-473b-4986-a0c6-9de3533b6d55', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;