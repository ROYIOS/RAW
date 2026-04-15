import type { ShippingQuoteRequest, ShippingQuoteResponse } from "@/src/lib/models";

function getZoneByZip(zip: string) {
  const z = zip.trim();
  if (/^\d{5}$/.test(z) === false) return "UNKNOWN";
  const prefix = parseInt(z.slice(0, 2), 10);

  // Ejemplo simple: solo para demo
  if (prefix >= 70 && prefix <= 79) return "NORTE";
  if (prefix >= 20 && prefix <= 39) return "CENTRO";
  if (prefix >= 40 && prefix <= 69) return "BAJIO_SUR";
  return "OTROS";
}

function rateUsdPerMt(origin: string, zone: string) {
  // Tabla mock (luego DB). Ajusta como quieras.
  const baseByOrigin: Record<string, number> = {
    SLP: 55,
    QRO: 50,
    MTY: 65,
  };

  const zoneFactor: Record<string, number> = {
    NORTE: 1.25,
    CENTRO: 1.0,
    BAJIO_SUR: 1.1,
    OTROS: 1.35,
    UNKNOWN: 1.5,
  };

  const base = baseByOrigin[origin] ?? 60;
  const factor = zoneFactor[zone] ?? 1.5;

  return Math.round(base * factor);
}

export async function POST(req: Request) {
  const body = (await req.json()) as ShippingQuoteRequest;

  const origin = (body.origin ?? "").trim().toUpperCase();
  const destinationZip = (body.destinationZip ?? "").trim();
  const totalMt = Number(body.totalMt ?? 0);

  if (!origin || !destinationZip || !Number.isFinite(totalMt) || totalMt <= 0) {
    return Response.json(
      { ok: false, error: "Invalid payload. Required: origin, destinationZip, totalMt>0" },
      { status: 400 }
    );
  }

  const zone = getZoneByZip(destinationZip);
  const usd_per_mt = rateUsdPerMt(origin, zone);
  const total_usd = Math.round(usd_per_mt * totalMt);

  const res: ShippingQuoteResponse = {
    usd_per_mt,
    total_usd,
    origin,
    destinationZip,
    totalMt,
  };

  return Response.json(res);
}