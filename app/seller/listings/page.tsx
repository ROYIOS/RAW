import { MOCK_LISTINGS } from "@/src/lib/mockData";

export default function SellerListingsPage() {
  return (
    <main className="space-y-6">
      <div className="surface surface-hover p-7">
        <h1 className="text-3xl font-semibold tracking-tight">Vendedor · Listings</h1>
        <p className="mt-2 text-sm muted">
          Publicaciones con precio por MT y disponibilidad por coil. (Mock hoy; DB después).
        </p>
      </div>

      <div className="surface overflow-hidden">
        <div className="grid grid-cols-6 gap-2 border-b p-4 text-xs font-semibold muted-2"
             style={{ borderColor: "rgb(var(--border))" }}>
          <div>ID</div>
          <div>Grado</div>
          <div>Dimensiones</div>
          <div>Disponibilidad</div>
          <div>Precio</div>
          <div>Origen</div>
        </div>

        {MOCK_LISTINGS.map((l) => (
          <div
            key={l.id}
            className="grid grid-cols-6 gap-2 p-4 text-sm border-b last:border-b-0"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <div className="text-neutral-900">{l.id}</div>
            <div className="text-neutral-900 font-medium">{l.grade}</div>
            <div className="text-neutral-900">
              {l.thickness_mm}mm × {l.width_mm}mm {l.finish ? `(${l.finish})` : ""}
            </div>
            <div className="text-neutral-900">
              {l.available_coils} coils · {l.coil_mt.toFixed(2)} MT/coil
            </div>
            <div className="text-neutral-900">${l.price_usd_per_mt} USD/MT</div>
            <div className="text-neutral-900">{l.location}</div>
          </div>
        ))}
      </div>

      <div className="text-sm muted">
        Siguiente: pantalla para crear/editar listings, vigencia de precio, auditoría y permisos.
      </div>
    </main>
  );
}