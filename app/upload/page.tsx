"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  downloadInventoryTemplateCsv,
  INVENTORY_TEMPLATE_HEADERS,
} from "@/src/lib/inventoryTemplate";
import { clearDemoSession, getDemoSession } from "@/src/lib/demoAuth";
import type { InventoryStatus, Listing } from "@/src/lib/models";
import {
  deleteSellerInventoryItem,
  getInventoryWithRemaining,
  replaceSellerInventory,
  updateSellerInventoryStatus,
} from "@/src/lib/sellerInventory";
import {
  getSellerDashboardData,
  saveSellerMonthlyGoal,
} from "@/src/lib/sellerDashboard";
import { getOrders } from "@/src/lib/orders";

type PreviewRow = Record<string, string | number | null | undefined>;

const REQUIRED_HEADERS = INVENTORY_TEMPLATE_HEADERS;

function mapRowToListing(
  row: PreviewRow,
  supplierId: string,
  supplierName: string
): Listing {
  return {
    id: String(row.id ?? ""),
    supplier_id: supplierId,
    supplier_name: supplierName,
    grade: String(row.grade ?? ""),
    finish: String(row.finish ?? ""),
    thickness_mm: Number(row.thickness_mm ?? 0),
    width_mm: Number(row.width_mm ?? 0),
    price_per_mt: Number(row.price_per_mt ?? 0),
    available_mt: Number(row.available_mt ?? 0),
    location: String(row.location ?? ""),
    inventory_status: "active",
  };
}

function MiniBarChart({
  data,
}: {
  data: { label: string; value: number; color?: string }[];
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const width = (item.value / maxValue) * 100;

        return (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-neutral-600">{item.label}</span>
              <span className="font-semibold text-neutral-950">
                {item.value.toFixed(1)}
              </span>
            </div>
            <div className="h-3 rounded-full bg-neutral-100">
              <div
                className={`h-3 rounded-full ${item.color || "bg-sky-500"}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function UploadPage() {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [fullRows, setFullRows] = useState<PreviewRow[]>([]);
  const [missingHeaders, setMissingHeaders] = useState<string[]>([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [publishMessage, setPublishMessage] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const session = useMemo(() => getDemoSession(), []);
  const dashboard = useMemo(
    () => getSellerDashboardData(),
    [publishMessage, refreshKey]
  );
  const inventoryRows = useMemo(
    () => getInventoryWithRemaining(),
    [publishMessage, refreshKey]
  );

  useEffect(() => {
    const orders = getOrders();
    const pending = orders.filter(
      (order) => order.status === "pending_supplier"
    ).length;
    setPendingOrdersCount(pending);
  }, [refreshKey, publishMessage]);

  const handleDownloadTemplate = () => {
    downloadInventoryTemplateCsv();
  };

  const handleLogout = () => {
    clearDemoSession();
    window.location.href = "/login";
  };

  const handleFileSelection = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFileName("");
      setPreviewRows([]);
      setFullRows([]);
      setMissingHeaders([]);
      setValidationMessage("");
      setPublishMessage("");
      return;
    }

    setSelectedFileName(file.name);
    setPublishMessage("");

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json<PreviewRow>(worksheet, {
        defval: "",
      });

      const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
      const missing = REQUIRED_HEADERS.filter(
        (header) => !headers.includes(header)
      );

      setMissingHeaders(missing);
      setPreviewRows(rows.slice(0, 8));
      setFullRows(rows);

      if (missing.length > 0) {
        setValidationMessage(
          `Faltan columnas obligatorias: ${missing.join(", ")}`
        );
      } else {
        setValidationMessage(
          "Archivo válido. Ya puedes publicarlo en el inventario del vendedor."
        );
      }
    } catch {
      setPreviewRows([]);
      setFullRows([]);
      setMissingHeaders(REQUIRED_HEADERS);
      setValidationMessage(
        "No se pudo leer el archivo. Usa un .xlsx o .csv válido."
      );
    }
  };

  const handlePublishInventory = () => {
    if (fullRows.length === 0 || missingHeaders.length > 0) {
      setPublishMessage("Primero carga un archivo válido.");
      return;
    }

    const sellerName = session?.company || "Centro de Servicio Demo";
    const sellerId = session?.email || "seller@demo.com";

    const cleanRows = fullRows
      .map((row) => mapRowToListing(row, sellerId, sellerName))
      .filter((row) => row.id && row.grade);

    replaceSellerInventory(cleanRows);
    setPublishMessage("Inventario publicado correctamente.");
    setRefreshKey((prev) => prev + 1);
  };

  const handleSaveGoal = () => {
    const target = Number(goalInput || 0);

    if (target <= 0) {
      setPublishMessage("Ingresa una meta mensual válida.");
      return;
    }

    saveSellerMonthlyGoal(target);
    setPublishMessage("Meta mensual actualizada correctamente.");
    setGoalInput("");
    setRefreshKey((prev) => prev + 1);
  };

  const handleStatusChange = (id: string, nextStatus: InventoryStatus) => {
    updateSellerInventoryStatus(id, nextStatus);
    setPublishMessage(
      nextStatus === "active"
        ? "Inventario activado correctamente."
        : "Inventario desactivado correctamente."
    );
    setRefreshKey((prev) => prev + 1);
  };

  const handleDelete = (id: string) => {
    deleteSellerInventoryItem(id);
    setPublishMessage("Inventario eliminado correctamente.");
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="site-container flex items-center justify-between py-4">
          <Link href="/upload" className="flex items-center gap-3">
            <div className="logo-badge">RAW</div>
            <div>
              <p className="text-base font-semibold tracking-tight">RAW</p>
              <p className="text-sm text-neutral-500">Portal vendedor</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/upload" className="nav-link-active">
              Dashboard
            </Link>

            <Link
              href="/seller/orders"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              aria-label="Órdenes pendientes"
              title="Órdenes pendientes"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                <path d="M10 17a2 2 0 0 0 4 0" />
              </svg>

              {pendingOrdersCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 text-[10px] font-semibold text-white">
                  {pendingOrdersCount}
                </span>
              )}
            </Link>

            <Link href="/seller/orders" className="nav-link">
              Órdenes
            </Link>
            <Link href="/login" className="nav-link">
              Cambiar rol
            </Link>
            <button type="button" onClick={handleLogout} className="nav-link">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(186,230,253,0.28),transparent_24%),linear-gradient(to_bottom,#ffffff,#f8fafc)]" />
        <div className="site-container py-14 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 section-pill">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Vendedor · dashboard ejecutivo
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
              Inventario, metas y pedidos
              <span className="block text-neutral-400">
                desde un solo panel.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
              Diseñado para revisarse cómodamente desde iPad, con métricas claras,
              poco ruido visual y foco en operación real.
            </p>

            {session?.role === "seller" ? (
              <div className="mt-6 rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                Sesión activa como vendedor:{" "}
                <span className="font-semibold">
                  {session.company || "Centro de Servicio Demo"}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="site-container py-10 lg:py-14">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass-card p-6">
            <p className="text-sm text-neutral-500">MT disponibles</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              {dashboard.stats.total_available_mt.toFixed(1)}
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-neutral-500">MT vendidas</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              {dashboard.stats.sold_mt.toFixed(1)}
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-neutral-500">MT por vender</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              {dashboard.stats.remaining_mt.toFixed(1)}
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-neutral-500">Valor inventario</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              ${dashboard.stats.inventory_value_usd.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm text-neutral-500">Meta mensual</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                  {dashboard.goal.month_label}
                </h2>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={`${dashboard.goal.target_mt}`}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Guardar meta
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-neutral-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-neutral-500">Progreso</span>
                <span className="text-sm font-semibold text-neutral-950">
                  {dashboard.stats.sold_mt.toFixed(1)} /{" "}
                  {dashboard.goal.target_mt.toFixed(1)} MT
                </span>
              </div>

              <div className="h-4 rounded-full bg-neutral-200">
                <div
                  className="h-4 rounded-full bg-sky-500 transition-all"
                  style={{ width: `${dashboard.goal_progress_pct}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-neutral-600">
                Cumplimiento:{" "}
                <span className="font-semibold text-neutral-950">
                  {dashboard.goal_progress_pct.toFixed(1)}%
                </span>
              </p>
            </div>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Órdenes por estatus
            </h2>
            <div className="mt-6">
              <MiniBarChart
                data={dashboard.status_breakdown.map((item, index) => ({
                  label: item.label,
                  value: item.value,
                  color:
                    index === 0
                      ? "bg-amber-400"
                      : index === 1
                      ? "bg-green-500"
                      : "bg-red-500",
                }))}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Subir inventario
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Carga de archivo
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Sube tu archivo, valida columnas, previsualiza los registros y
              publícalos en el inventario del vendedor.
            </p>

            <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-sky-200 bg-sky-50/40 px-6 py-14 text-center transition hover:bg-sky-50">
              <span className="text-lg font-semibold text-neutral-950">
                Seleccionar archivo
              </span>
              <span className="mt-2 text-sm text-neutral-500">
                Formato recomendado: .xlsx
              </span>

              <input
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={handleFileSelection}
              />
            </label>

            {selectedFileName ? (
              <div className="mt-5 rounded-[20px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Archivo seleccionado:{" "}
                <span className="font-semibold">{selectedFileName}</span>
              </div>
            ) : (
              <div className="mt-5 rounded-[20px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                Aún no has seleccionado un archivo.
              </div>
            )}

            {validationMessage ? (
              <div
                className={`mt-4 rounded-[20px] px-4 py-3 text-sm ${
                  missingHeaders.length > 0
                    ? "border border-red-200 bg-red-50 text-red-700"
                    : "border border-sky-200 bg-sky-50 text-sky-700"
                }`}
              >
                {validationMessage}
              </div>
            ) : null}

            {publishMessage ? (
              <div className="mt-4 rounded-[20px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {publishMessage}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePublishInventory}
                className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Publicar inventario
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                Descargar plantilla
              </button>
            </div>

            {previewRows.length > 0 ? (
              <div className="mt-8 overflow-x-auto rounded-[24px] border border-neutral-200">
                <table className="min-w-full border-collapse bg-white text-sm">
                  <thead>
                    <tr className="bg-neutral-50">
                      {Object.keys(previewRows[0]).map((key) => (
                        <th
                          key={key}
                          className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, index) => (
                      <tr key={index} className="border-b border-neutral-100">
                        {Object.keys(previewRows[0]).map((key) => (
                          <td key={key} className="px-4 py-3 text-neutral-600">
                            {String(row[key] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Formato esperado
            </h2>

            <div className="mt-6 rounded-[24px] bg-neutral-50 p-5">
              <p className="text-sm font-medium text-neutral-950">
                Encabezados requeridos
              </p>
              <div className="mt-4 space-y-2 text-sm text-neutral-600">
                {REQUIRED_HEADERS.map((header) => (
                  <p key={header}>
                    <span className="font-semibold text-neutral-950">
                      {header}
                    </span>
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-neutral-50 p-5">
              <p className="text-sm font-medium text-neutral-950">
                Plantilla RAW
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                El botón de descarga genera una plantilla real en CSV para
                iniciar la carga.
              </p>
            </div>

            <Link
              href="/seller/orders"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-sky-200 bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
            >
              Ir a órdenes pendientes
            </Link>
          </div>
        </div>

        <div className="mt-6 glass-card p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Inventario publicado
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-neutral-600">
            Aquí puedes controlar qué materiales están activos, inactivos,
            reservados o vendidos.
          </p>

          {inventoryRows.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-600">
              Aún no hay inventario publicado.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-[24px] border border-neutral-200">
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                      ID
                    </th>
                    <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                      Grade
                    </th>
                    <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                      Disponible
                    </th>
                    <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                      Vendido
                    </th>
                    <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                      Remanente
                    </th>
                    <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                      Estatus
                    </th>
                    <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryRows.map((row) => (
                    <tr key={row.id} className="border-b border-neutral-100">
                      <td className="px-4 py-3 text-neutral-600">{row.id}</td>
                      <td className="px-4 py-3 text-neutral-600">{row.grade}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {Number(row.available_mt).toFixed(1)} MT
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {Number(row.sold_mt).toFixed(1)} MT
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-950">
                        {Number(row.remaining_mt).toFixed(1)} MT
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            row.inventory_status === "active"
                              ? "border border-green-200 bg-green-50 text-green-700"
                              : row.inventory_status === "reserved"
                              ? "border border-amber-200 bg-amber-50 text-amber-700"
                              : row.inventory_status === "sold"
                              ? "border border-sky-200 bg-sky-50 text-sky-700"
                              : "border border-neutral-200 bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {row.inventory_status === "active" && "Activo"}
                          {row.inventory_status === "reserved" && "Reservado"}
                          {row.inventory_status === "sold" && "Vendido"}
                          {row.inventory_status === "inactive" && "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {row.inventory_status === "inactive" ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.id, "active")}
                              className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                            >
                              Activar
                            </button>
                          ) : row.inventory_status === "active" ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.id, "inactive")}
                              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                            >
                              Desactivar
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}