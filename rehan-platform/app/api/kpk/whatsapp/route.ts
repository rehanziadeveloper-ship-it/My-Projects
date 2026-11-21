import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const secret =
      request.headers.get("x-kpk-secret") ||
      request.headers.get("X-KPK-Secret") ||
      "cb0000a5a3d8306b7f83476370b7a79d5121089a71ba3210";

    const n8nUrl = "https://n8n.srv1767318.hstgr.cloud/webhook/kpk/whatsapp";
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-kpk-secret": secret,
      },
      body: rawBody,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("KPK Webhook proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Proxy failure" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "ZeroLoss KPK WhatsApp Inbound Gateway",
    timestamp: new Date().toISOString(),
  });
}
