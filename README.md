# Next.js + Sentry — demo con 2 errores intencionales

## Setup

```bash
cd nextjs-demo
npm install
cp .env.local.example .env.local   # pega tu DSN real de Sentry ahí
npm run dev
```

Abre http://localhost:3000.

Si no tienes un proyecto de Sentry todavía: https://sentry.io → **Create Project** → plataforma **Next.js** → copia el DSN.

## Los dos bugs

### Bug 1 — `app/page.js` (cliente)

`getUserCity(user)` hace `user.address.city` sin comprobar que `address`
exista. El usuario "Bob" no tiene `address`, así que al pulsar su botón
"Ver ciudad" lanza:

```
TypeError: Cannot read properties of undefined (reading 'city')
```

Como es una excepción no capturada en el navegador, el SDK de Sentry
(`instrumentation-client.js`) la reporta automáticamente vía su
`GlobalHandlers` integration — verás el stack trace exacto en el Issue de
Sentry, incluyendo la línea de `getUserCity`.

**Corrección:**
```js
function getUserCity(user) {
  return user.address?.city ?? "Ciudad desconocida";
}
```

### Bug 2 — `app/api/checkout/route.js` (servidor)

El endpoint asume que `body.items` es un array y llama `.reduce(...)`
directamente. Si el cliente no manda `items` (el botón de la demo lo omite
a propósito), lanza:

```
TypeError: Cannot read properties of undefined (reading 'reduce')
```

`instrumentation.js` exporta `onRequestError = Sentry.captureRequestError`,
así que Sentry captura el error del servidor con el contexto de la request
(ruta, método, etc.) adjunto.

**Corrección:**
```js
if (!Array.isArray(body.items)) {
  return Response.json({ error: "items must be an array" }, { status: 400 });
}
```

## Flujo esperado con Sentry

1. Dispara los dos bugs desde la página principal.
2. En Sentry, verás dos Issues distintos (uno con "React" / browser context,
   otro con "Next.js Server" context).
3. Cada Issue apunta a la línea exacta y trae el stack trace completo — así
   es como Sentry "corrige" el error: te dice dónde y por qué, tú aplicas el
   guard/validación de arriba.
