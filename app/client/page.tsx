export default function ClientHomePage() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-semibold">RAW — Cliente</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Este es el espacio del cliente. Aquí vamos a implementar el flujo “cliente” de tus diagramas.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border p-6">
          <h2 className="text-lg font-medium">Acciones (MVP)</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            <li>Crear solicitud (RFQ)</li>
            <li>Ver estatus de la solicitud</li>
            <li>Enviar información faltante</li>
            <li>Recibir y revisar cotización</li>
          </ul>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="text-lg font-medium">Estatus típicos</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            <li>Draft</li>
            <li>Submitted</li>
            <li>Need Info</li>
            <li>Quoted</li>
            <li>Accepted / Rejected</li>
          </ul>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border p-6">
        <p className="text-sm text-neutral-700">
          Siguiente paso: convertir tus diagramas en pantallas reales (crear solicitud, lista de solicitudes y detalle).
        </p>
      </div>
    </main>
  );
}
