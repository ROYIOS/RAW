import type { OrderStatus } from "@/src/lib/models";

export function getOrderStatusMeta(status: OrderStatus) {
  switch (status) {
    case "pending_supplier":
      return {
        label: "Pendiente de proveedor",
        badgeClass:
          "border-amber-200 bg-amber-50 text-amber-700",
        panelClass:
          "border-amber-100 bg-amber-50",
        title: "Esperando respuesta del proveedor",
        description:
          "La solicitud fue enviada y está pendiente de confirmación por parte del centro de servicio.",
      };

    case "confirmed":
      return {
        label: "Confirmada",
        badgeClass:
          "border-green-200 bg-green-50 text-green-700",
        panelClass:
          "border-green-100 bg-green-50",
        title: "Orden confirmada",
        description:
          "El proveedor confirmó la solicitud y puede continuar el flujo comercial.",
      };

    case "rejected":
      return {
        label: "Rechazada",
        badgeClass:
          "border-red-200 bg-red-50 text-red-700",
        panelClass:
          "border-red-100 bg-red-50",
        title: "Orden rechazada",
        description:
          "El proveedor rechazó la solicitud. RAW puede revisar alternativas o reasignación.",
      };

    case "expired":
      return {
        label: "Expirada",
        badgeClass:
          "border-red-200 bg-red-50 text-red-700",
        panelClass:
          "border-red-100 bg-red-50",
        title: "Tiempo agotado",
        description:
          "El proveedor no respondió dentro del tiempo establecido. RAW puede intervenir manualmente.",
      };

    case "admin_override":
      return {
        label: "Confirmada por RAW",
        badgeClass:
          "border-sky-200 bg-sky-50 text-sky-700",
        panelClass:
          "border-sky-100 bg-sky-50",
        title: "Intervención de RAW",
        description:
          "RAW confirmó la orden manualmente para mantener continuidad operativa.",
      };

    default:
      return {
        label: "Sin estatus",
        badgeClass:
          "border-neutral-200 bg-neutral-50 text-neutral-700",
        panelClass:
          "border-neutral-100 bg-neutral-50",
        title: "Sin información",
        description:
          "No hay información disponible para esta orden.",
      };
  }
}