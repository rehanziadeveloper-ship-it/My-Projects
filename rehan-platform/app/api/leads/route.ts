import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LeadInquiry } from "@/lib/types";

const leadsFilePath = path.join(process.cwd(), "data", "leads.json");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email && !body.contact) {
      return NextResponse.json(
        { success: false, error: "Email or WhatsApp contact is required." },
        { status: 400 }
      );
    }

    const email = body.email || body.contact || "inquiry@lead.com";

    const lead: LeadInquiry = {
      id: `lead-${Date.now().toString(36)}`,
      agencyName: body.agencyName || body.agency || "Agency / Business",
      contactName: body.contactName || body.name || "Agency Partner",
      email: email,
      phone: body.phone || body.whatsapp || "",
      monthlyLeads: body.monthlyLeads || "Custom",
      biggestBottleneck: body.biggestBottleneck || body.message || "24/7 Voice AI & Automation",
      preferredModel: body.preferredModel || "White-label Technical Partner",
      notes: body.notes || body.message || "",
      createdAt: new Date().toISOString(),
      status: "new"
    };

    // Save locally
    let leads: LeadInquiry[] = [];
    if (fs.existsSync(leadsFilePath)) {
      try {
        leads = JSON.parse(fs.readFileSync(leadsFilePath, "utf8"));
      } catch (e) {
        leads = [];
      }
    }
    leads.unshift(lead);
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), "utf8");

    // Forward to n8n webhook asynchronously if configured
    const n8nWebhookUrl = process.env.N8N_LEAD_WEBHOOK_URL || "https://n8n.srv1767318.hstgr.cloud/webhook/cal-booking-engine";
    try {
      fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "Agency Company Website",
          event: "New Partner Inquiry",
          lead
        })
      }).catch(err => console.log("n8n dispatch notification:", err.message));
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: "Message received. Muhammad Rehan will review your inquiry and reply within 2 hours.",
      leadId: lead.id
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process lead inquiry" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let leads: LeadInquiry[] = [];
    if (fs.existsSync(leadsFilePath)) {
      leads = JSON.parse(fs.readFileSync(leadsFilePath, "utf8"));
    }
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
