import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildNewOrderNotificationEmail } from "@/src/lib/emailTemplate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyerName, buyerCompany, orderId, totalUsd } = body ?? {};

    if (!buyerName || !buyerCompany || !orderId) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: "RESEND_API_KEY not configured.",
      });
    }

    const resend = new Resend(resendApiKey);

    const html = buildNewOrderNotificationEmail({
      buyerName,
      buyerCompany,
      orderId,
      totalUsd: Number(totalUsd || 0),
    });

    const result = await resend.emails.send({
      from: "RAW Marketplace <onboarding@resend.dev>",
      to: ["roy_floresba@icloud.com"],
      subject: `Nueva solicitud de compra · ${orderId}`,
      html,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
