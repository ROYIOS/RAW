export default function SellerHomePage() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-semibold">RAW — Vendedor</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Este es el espacio del vendedor. Aquí vamos a implementar el flujo “vendedor” de tus diagramas.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border p-6">
          <h2 className="text-lg font-medium">Acciones (MVP)</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            <li>Ver bandeja de solicitudes</li>
            <li>Solicitar info faltante</li>
            <li>Generar cotización</li>
            <li>Marcar como enviada</li>
          </ul>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="text-lg font-medium">Controles futuros</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            <li>Autorizaciones por monto / margen</li>
            <li>Roles internos (ventas, pricing, admin)</li>
            <li>Auditoría / bitácora</li>
          </ul>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border p-6">
        <p className="text-sm text-neutral-700">
          Siguiente paso: conectar esta vista a una “bandeja” real basada en los estados del flujo.
        </p>
      </div>
    </main>
  );
}