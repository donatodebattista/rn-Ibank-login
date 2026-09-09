# iBank Mobile — Secure Authentication Flow 🏦📱

Flujo de autenticación completo, modular y de nivel bancario desarrollado con **React Native**, **Expo (SDK 57)** y **Supabase Auth (v2)**. Diseñado con fidelidad pixel-perfect siguiendo un sistema de tokens visuales y cumpliendo estrictamente con las directrices de seguridad financiera, anti-enumeración de cuentas y validaciones en tiempo real.

---

## 📑 Tabla de Contenidos
- [Características Principales](#-características-principales)
- [Reglas de Negocio por Pantalla](#-reglas-de-negocio-por-pantalla)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tokens de Diseño](#-tokens-de-diseño)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Configuración en el Panel de Supabase](#-configuración-en-el-panel-de-supabase)
- [Comandos Disponibles](#-comandos-disponibles)
- [Verificación y Pruebas Automatizadas](#-verificación-y-pruebas-automatizadas)
- [Seguridad y Buenas Prácticas](#-seguridad-y-buenas-prácticas)

---

## 🚀 Características Principales

* **Protección Anti-Enumeración:** Mensajes de error neutros y respuestas genéricas para evitar que atacantes determinen si un correo está registrado en el sistema.
* **Checklist Dinámico de Contraseñas:** Evaluación interactiva en tiempo real de 5 reglas de complejidad conforme el usuario escribe.
* **Control de Tasa y Cooldowns de 60s:** Bloqueo temporal interactivo con cuenta regresiva ante errores HTTP 429 o reenvíos de correo.
* **Deep Linking Integrado:** Soporte para el esquema `ibanktp://` y resolución de flujos de recuperación de contraseña (`type=recovery`).
* **Arquitectura Modular Desacoplada:** Separación limpia de pantallas, componentes UI, servicios, hooks de estado y utilidades de validación.
* **Persistencia Segura y Compatibilidad SSR:** Almacenamiento local con AsyncStorage y adaptador seguro para entornos Node.js / exportación web estática.
* **Cero Fuga de Credenciales:** Logger sanitizado que enmascara automáticamente tokens JWT, contraseñas y encabezados sensibles.

---

## 📱 Reglas de Negocio por Pantalla

### 01. Iniciar Sesión (`/sign-in`)
- **Validación:** Botón deshabilitado hasta contar con un email sintácticamente válido y contraseña no vacía.
- **Anti-enumeración:** Errores de autenticación mapeados centralizadamente a *"Email o contraseña incorrectos"*.
- **Email no confirmado:** Si la cuenta no ha sido verificada, redirige automáticamente a la pantalla de confirmación pendiente pasando el correo.
- **Rate Limit:** Cooldown visual de 60 segundos con contador regresivo ante respuestas HTTP 429 de Supabase.
- **Acceso Biométrico:** Botón visual de huella digital integrado en el diseño.

### 02. Registro (`/sign-up`)
- **Checklist en Tiempo Real:** 
  - ✅ Mínimo 8 caracteres
  - ✅ Al menos una letra mayúscula (A-Z)
  - ✅ Al menos una letra minúscula (a-z)
  - ✅ Al menos un dígito numérico (0-9)
  - ✅ Al menos un símbolo o carácter especial (`!@#$%^&*...`)
- **Términos y Condiciones:** Checkbox interactivo obligatorio con modal informativo.
- **Anti-enumeración:** Si el email ya existe, el sistema retorna una respuesta de éxito neutral redirigiendo a la pantalla de confirmación sin exponer el estado de la cuenta.

### 03. Confirmación Pendiente (`/pending-confirmation`)
- Muestra el correo de destino e instrucciones para verificar bandeja de entrada y carpeta de spam.
- Botón para reenviar correo de confirmación con **cooldown estricto de 60 segundos**.
- Enlace directo para regresar al inicio de sesión.

### 04. Recuperar Contraseña (`/forgot-password`)
- **Input de Email:** Reemplazo estricto del campo de teléfono por un campo de correo electrónico validado.
- **Anti-enumeración estricta:** Muestra siempre el mensaje: *"Si el email existe en nuestro sistema, vas a recibir instrucciones"*.
- Cooldown visual de 60 segundos para evitar abusos de envío.

### 05. Nueva Contraseña (`/change-password`)
- **Acceso exclusivo por Deep Link:** Requiere una sesión de recuperación activa (`PASSWORD_RECOVERY`). Si el enlace es inválido o expiró, despliega una vista de error con botón para solicitar un nuevo enlace.
- Mismo checklist interactivo de seguridad de contraseñas.
- Confirmación de contraseña con validación de coincidencia.
- Tras el éxito, ejecuta automáticamente `signOut()` para invalidar la sesión temporal y muestra la pantalla de éxito con botón "Ok" que redirige al login.

### 06. Dashboard Autenticado (`/home`)
- Ruta protegida que verifica sesión activa.
- Resumen de cuenta con tarjeta de crédito Platinum, balance disponible, accesos rápidos (Transferir, QR, Inversiones) y botón de cierre de sesión seguro.

---

## 🛠 Stack Tecnológico

| Componente | Tecnología | Versión |
| :--- | :--- | :--- |
| **Framework Móvil** | [Expo](https://expo.dev) / [React Native](https://reactnative.dev) | SDK 57 / RN 0.86 |
| **Backend & Auth** | [Supabase Auth](https://supabase.com/docs/guides/auth) | `@supabase/supabase-js v2` |
| **Persistencia** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | `^3.1.1` |
| **Navegación** | [Expo Router](https://docs.expo.dev/router/introduction/) | `~57.0.20` |
| **Formularios** | [React Hook Form](https://react-hook-form.com/) | `^7.87.0` |
| **Validación de Esquemas** | [Zod](https://zod.dev/) | `^4.5.4` + `@hookform/resolvers` |
| **Iconografía** | [Expo Vector Icons](https://docs.expo.dev/guides/icons/) | Ionicons |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | Strict Mode |

---

## 📂 Estructura del Proyecto

El código está modularizado para garantizar mantenibilidad, testeabilidad y escalabilidad:

```text
ibank-login/
├── assets/
│   ├── dessign/            # Diseños y pantallas de referencia originales
│   └── images/             # Íconos de splash, launcher y assets estáticos
├── scripts/
│   └── verify-all.ts       # Suite de pruebas automatizadas de lógica y esquemas
├── src/
│   ├── app/                # Rutas basadas en archivos de Expo Router
│   │   ├── _layout.tsx     # Root layout con AuthProvider y Splash Screen
│   │   ├── index.tsx       # Gateway de redirección según estado de sesión
│   │   ├── (auth)/         # Stack público (sign-in, sign-up, forgot, etc.)
│   │   └── (app)/          # Stack protegido (home, dashboard)
│   ├── components/
│   │   └── ui/             # Componentes visuales reutilizables
│   │       ├── AuthHeader.tsx
│   │       ├── AuthIllustration.tsx
│   │       ├── Banner.tsx
│   │       ├── Button.tsx
│   │       ├── CardContainer.tsx
│   │       ├── Checkbox.tsx
│   │       ├── FingerprintButton.tsx
│   │       ├── Input.tsx
│   │       └── PasswordChecklist.tsx
│   ├── constants/
│   │   ├── errors.ts       # Mapeo centralizado de errores Supabase -> Español
│   │   └── tokens.ts       # Paleta de colores, tipografía, radios y sombras
│   ├── hooks/
│   │   ├── useAuth.tsx     # Contexto global y listener onAuthStateChange
│   │   ├── useCooldown.ts  # Temporizador reutilizable para cooldowns de 60s
│   │   └── usePasswordRules.ts # Evaluación reactiva de criterios de clave
│   ├── screens/            # Vistas completas desacopladas de la navegación
│   │   ├── ChangePasswordScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── PendingConfirmationScreen.tsx
│   │   ├── SignInScreen.tsx
│   │   └── SignUpScreen.tsx
│   ├── services/
│   │   ├── authService.ts  # Operaciones de autenticación con Supabase
│   │   └── supabase.ts     # Cliente Supabase con adaptador SSR-safe
│   ├── types/
│   │   ├── auth.ts         # Modelos de sesión, usuario y criterios
│   │   └── navigation.ts   # Tipado estricto de rutas
│   └── utils/
│       ├── errorHandler.ts # Parseo inteligente de errores
│       ├── logger.ts       # Logger con sanitización de credenciales
│       └── validation.ts   # Esquemas Zod para todos los formularios
├── .env.example            # Plantilla de variables de entorno
├── app.json                # Configuración de Expo (esquema ibanktp://)
├── package.json
└── tsconfig.json
```

---

## 🎨 Tokens de Diseño

| Token | Valor Hex / Medida | Propósito |
| :--- | :--- | :--- |
| `primary` | `#3122C3` | Color insignia (encabezados, botones principales, links) |
| `primaryDark` | `#221C6E` | Títulos y tarjeta de saldo bancario |
| `primaryLight` | `#EEF0FD` | Fondos de ilustraciones y botones secundarios |
| `screenLight` | `#F8F9FD` | Fondo de pantallas secundarias y tarjetas |
| `buttonDisabledBg` | `#F0F1F8` | Fondo de botones en estado inactivo |
| `buttonDisabledText`| `#CACDD8` | Texto de botones inactivos |
| `borderSheet` | `36px` | Curvatura superior de la hoja inferior (Bottom sheet) |
| `borderCard` | `22px` | Radio de tarjetas flotantes |
| `borderInput` | `16px` | Radio de inputs de texto |
| `borderButton` | `16px` | Radio de botones principales |

---

## ⚙️ Instalación y Configuración

### 1. Clonar e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd Ibank-login
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo de ejemplo y define las credenciales de tu proyecto de Supabase:
```bash
cp .env.example .env
```

Edita el archivo `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_PUBLICA
```

> [!TIP]
> Si no cuentas con un backend de Supabase configurado de inmediato, puedes iniciar sesión utilizando el correo **`demo@ibank.com`** con cualquier contraseña válida (ej: `Demo123!@#`) para probar todas las pantallas en modo demostración.

---

## 🌐 Configuración en el Panel de Supabase

Para garantizar que los enlaces de confirmación y recuperación abran la app correctamente:

1. Ingresa a tu proyecto en **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Navega a **Authentication** ➔ **URL Configuration**.
3. **Site URL:**
   - Para desarrollo web: `http://localhost:8081`
   - Para móvil: `ibanktp://pending-confirmation`
4. **Redirect URLs (Lista blanca):** Agrega las siguientes rutas:
   - `ibanktp://**`
   - `ibanktp://pending-confirmation`
   - `ibanktp://change-password`
   - `http://localhost:8081/**` *(para pruebas en navegador de PC)*
   - `exp://**` *(si utilizas Expo Go)*
5. **Guardar cambios.**

> [!NOTE]
> El servicio gratuito de correo de Supabase limita el envío a **3-4 correos por hora**. Para agilizar el desarrollo de interfaces, puedes desactivar temporalmente la casilla **"Confirm email"** en **Authentication ➔ Providers ➔ Email**.

---

## 💻 Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm start` | Inicia el servidor de desarrollo Expo (con fix de sandbox para Linux) |
| `npm run android` | Ejecuta la app en emulador o dispositivo Android |
| `npm run ios` | Ejecuta la app en simulador iOS (requiere macOS) |
| `npm run web` | Inicia la app en el navegador web |
| `npx tsc --noEmit` | Ejecuta la verificación estricta de tipos TypeScript |
| `npx tsx scripts/verify-all.ts` | Corre la suite de 24 pruebas automatizadas de validación y reglas |

---

## 🧪 Verificación y Pruebas Automatizadas

El proyecto incluye un script de validación integral (`scripts/verify-all.ts`) que comprueba:

1. **Esquema de Inicio de Sesión:** Rechazo de correos inválidos y contraseñas vacías.
2. **Criterios de Contraseña y Registro:** Validación de los 5 requisitos de longitud y caracteres, y obligatoriedad de los Términos y Condiciones.
3. **Cambio de Contraseña:** Validación de coincidencia entre nueva contraseña y confirmación.
4. **Mapeo de Errores Supabase:** Verificación de respuestas anti-enumeración, detección de errores 429 con cooldown de 60 segundos y captura de cuentas sin confirmar.

Para ejecutar las pruebas:
```bash
npx tsx scripts/verify-all.ts
```

Resultado esperado:
```text
Total tests: 24 | Passed: 24 | Failed: 0
```

---

## 🔒 Seguridad y Buenas Prácticas

- **Anti-User Enumeration:** Tanto el registro como la recuperación de contraseña responden con mensajes neutros para evitar que atacantes reconozcan correos registrados.
- **Sanitización de Logs:** [`src/utils/logger.ts`](file:///home/donato/4to%20sistemas/mobile-dev/login-Ibank/Ibank-login/src/utils/logger.ts) intercepta cualquier impresión en consola y enmascara automáticamente campos como `password`, `token`, `access_token` y `secret`.
- **Invalidación Inmediata de Sesión en Recovery:** Al actualizar la contraseña en el flujo de recuperación, se invoca `signOut()` de inmediato para obligar a un inicio de sesión limpio con las nuevas credenciales.
- **Almacenamiento Seguro SSR:** El cliente Supabase cuenta con un adaptador para evitar errores de tipo `window is not defined` durante la compilación estática o ejecución en entornos Node.js.

---

Desarrollado con ❤️ para **iBank**.
