export const INVENTORY_TEMPLATE_HEADERS = [
  "id",
  "grade",
  "finish",
  "thickness_mm",
  "width_mm",
  "price_per_mt",
  "available_mt",
  "location",
];

export const INVENTORY_TEMPLATE_ROWS = [
  [
    "raw-001",
    "409",
    "2B",
    "1.5",
    "1219",
    "1850",
    "24",
    "San Luis Potosí",
  ],
  [
    "raw-002",
    "304L",
    "2B",
    "1.2",
    "1500",
    "2650",
    "18",
    "Querétaro",
  ],
];

export function downloadInventoryTemplateCsv() {
  const rows = [INVENTORY_TEMPLATE_HEADERS, ...INVENTORY_TEMPLATE_ROWS];
  const csv = rows.map((row) => row.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "raw_inventory_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}