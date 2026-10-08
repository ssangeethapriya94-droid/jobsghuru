import { NextResponse } from "next/server";
import { processCareerCopilotQuery } from "@/lib/ai/careerAssistant";
import { checkRateLimit } from "@/lib/ai/usage";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait a moment before asking again.",
        },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": "0" },
        }
      );
    }

    const body = await req.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a search or question for the AI Career Assistant.",
        },
        { status: 400 }
      );
    }

    const response = await processCareerCopilotQuery({
      query,
      previousFilters: body.previousFilters,
      userId: body.userId,
      clientIp: ip,
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (error) {
    console.error("AI Career Copilot API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process AI Career Assistant request.",
      },
      { status: 500 }
    );
  }
}
