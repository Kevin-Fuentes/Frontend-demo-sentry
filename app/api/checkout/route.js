export async function POST(request) {
  const body = await request.json();

  // BUG #2: no se valida que `body.items` sea un array. El "pago exprés" del
  // cliente manda { express, productId } sin `items`, así que aquí lanza:
  //   TypeError: Cannot read properties of undefined (reading 'reduce')
  // Sentry lo reporta vía `onRequestError` (instrumentation.js) con la ruta
  // y los detalles de la request.
  //
  // Fix:
  //   if (!Array.isArray(body.items)) {
  //     return Response.json({ error: "items must be an array" }, { status: 400 });
  //   }
  const total = body.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return Response.json({ total });
}
