export async function GET() {
  return Response.json({
    ok: true,
    service: "raw",
    timestamp: new Date().toISOString(),
  });
}