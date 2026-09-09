-- ==============================================================================
-- iBank: Función RPC para actualización directa de contraseña con código
-- ==============================================================================
-- Esta función permite a la app móvil de iBank actualizar la contraseña de un usuario
-- en auth.users introduciendo el código del diseño '8422' o '123456', sin depender
-- de enlaces de correo ni de deep links en Expo Go.
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase: https://supabase.com/dashboard/project/qcsypkevznfyklsptawa
-- 2. Ve a la pestaña 'SQL Editor' en el menú lateral izquierdo.
-- 3. Crea una 'New query', pega este código completo y presiona 'Run'.
-- ==============================================================================

create extension if not exists pgcrypto;

create or replace function public.reset_user_password(
  user_email text,
  new_password text,
  code text
)
returns json
language plpgsql
security definer
set search_path = public, extensions, auth
as $$
declare
  target_user_id uuid;
begin
  -- 1. Validar código de verificación (8422 del diseño 'Forgot password #4.png' o 123456)
  if code not in ('8422', '123456') then
    return json_build_object('success', false, 'error', 'Código de verificación incorrecto');
  end if;

  -- 2. Buscar al usuario por correo normalizado
  select id into target_user_id
  from auth.users
  where lower(trim(email)) = lower(trim(user_email));

  if target_user_id is null then
    return json_build_object('success', false, 'error', 'No se encontró ninguna cuenta con ese correo');
  end if;

  -- 3. Actualizar la contraseña encriptada usando bcrypt (pgcrypto)
  update auth.users
  set encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  where id = target_user_id;

  return json_build_object('success', true);
end;
$$;

-- Otorgar permisos de ejecución para que la app móvil pueda invocarlo
grant execute on function public.reset_user_password(text, text, text) to anon, authenticated;
