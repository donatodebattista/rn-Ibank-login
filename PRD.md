# PRODUCT REQUIREMENTS DOCUMENT (PRD) - Autenticación iBank

## 1. Stack Técnico
* **Framework:** React Native + Expo (SDK 57)
* **Backend:** Supabase Auth (`@supabase/supabase-js v2`)
* **Storage:** `@react-native-async-storage/async-storage` para persistir sesión
* **Navegación:** `expo-router` (rutas protegidas) y `expo-linking` (`ibanktp://`)
* **Validaciones:** `react-hook-form` + `zod`

## 2. Reglas de Negocio por Pantalla

### 01. Iniciar sesión (`/sign-in`)
* Botón habilitado solo con email válido y password no vacía.
* Error genérico ("Email o contraseña incorrectos") para evitar enumeración.
* Si el email no está confirmado, redirigir a "Confirmación pendiente".
* Cooldown visual de 60s en el botón si hay error 429.

### 02. Registro (`/sign-up`)
* Checklist visual de validación en tiempo real: mínimo 8 caracteres, mayúscula, minúscula, dígito y símbolo.
* Validar confirmación de contraseña y exigir Checkbox de Términos (UI).
* Anti-enumeración: Si el email ya existe, mostrar éxito neutro sin revelar el estado de la cuenta.

### 03. Confirmación pendiente & 04. Recuperar contraseña
* En recuperación, validar solo formato de email. Mostrar siempre el mensaje: "Si el email existe en nuestro sistema, vas a recibir instrucciones" (Anti-enumeración estricta).
* Ambos flujos deben respetar un cooldown de 60 segundos para el reenvío.

### 05. Nueva contraseña (Change password)
* Acceso solo por deep link (`PASSWORD_RECOVERY`). Si es inválido, mostrar error con link para pedir reset de nuevo.
* Mismo checklist visual de contraseñas. Tras el éxito, ejecutar `signOut` y enviar al Login.

## 3. Reglas Transversales
* Rutas protegidas: Mostrar carga inicial al resolver la sesión. Sin sesión -> Login; con sesión -> Home.
* Mapear errores de Supabase a mensajes amigables en español de forma centralizada.
* Estados de carga uniformes en todos los botones (spinner/disabled) y deshabilitar inputs en cada request.
* Cero exposición de tokens o contraseñas en los logs.
