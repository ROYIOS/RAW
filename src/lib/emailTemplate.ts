export function buildNewOrderNotificationEmail({
  buyerName,
  buyerCompany,
  orderId,
  totalUsd,
}: {
  buyerName: string;
  buyerCompany: string;
  orderId: string;
  totalUsd: number;
}) {
  return `
  <html>
    <body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111111;">
      <table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7;padding:32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
              <tr>
                <td style="padding:36px 36px 20px 36px;">
                  <div style="display:inline-block;padding:10px 14px;border:1px solid #dbeafe;border-radius:999px;background:#f0f9ff;color:#0369a1;font-size:12px;font-weight:600;letter-spacing:0.02em;">
                    RAW Marketplace
                  </div>

                  <h1 style="margin:18px 0 8px 0;font-size:30px;line-height:1.15;font-weight:700;color:#111111;">
                    Nueva solicitud de compra
                  </h1>

                  <p style="margin:0;font-size:15px;line-height:1.7;color:#6b7280;">
                    Has recibido una nueva solicitud de cliente dentro de RAW. Revisa el pedido y confirma disponibilidad cuanto antes.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:0 36px 12px 36px;">
                  <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:18px;padding:18px 20px;">
                    <p style="margin:0 0 10px 0;font-size:13px;color:#6b7280;">Resumen de la solicitud</p>
                    <p style="margin:0 0 8px 0;font-size:15px;color:#111111;"><strong>Orden:</strong> ${orderId}</p>
                    <p style="margin:0 0 8px 0;font-size:15px;color:#111111;"><strong>Cliente:</strong> ${buyerCompany}</p>
                    <p style="margin:0 0 8px 0;font-size:15px;color:#111111;"><strong>Contacto:</strong> ${buyerName}</p>
                    <p style="margin:0;font-size:15px;color:#111111;"><strong>Total estimado:</strong> $${Number(
                      totalUsd
                    ).toLocaleString()} USD</p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:8px 36px 32px 36px;">
                  <a href="https://your-domain.com/seller/orders" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:14px;font-size:14px;font-weight:600;">
                    Revisar orden
                  </a>

                  <p style="margin:20px 0 0 0;font-size:12px;line-height:1.7;color:#9ca3af;">
                    Este aviso fue generado automáticamente por RAW Marketplace.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:18px 0 0 0;font-size:12px;color:#9ca3af;">
              RAW · Industrial B2B Marketplace
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}