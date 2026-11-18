import { NextRequest, NextResponse } from "next/server";
import { getProjects, saveProject } from "@/lib/projects";

// Public GET: returns all live projects for the website
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    
    let projects = getProjects();
    if (category && category !== "All Systems") {
      projects = projects.filter(p => p.category === category);
    }

    return NextResponse.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST: The Auto-Publish Webhook / API
// Call this from n8n, cURL, GitHub Actions, or the Admin dashboard to automatically upload a new project!
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key") || request.nextUrl.searchParams.get("key");
    const configuredKey = process.env.AUTO_PUBLISH_KEY || "rehan_voiceai_secret_key_2026";

    // Allow from admin dashboard or authorized API call
    if (apiKey && apiKey !== configuredKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Invalid x-api-key header." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.liveUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields: 'title' and 'liveUrl' are mandatory." 
        },
        { status: 400 }
      );
    }

    const result = saveProject(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project published successfully and now live on website!",
        project: result.project
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to publish project" },
      { status: 500 }
    );
  }
}
