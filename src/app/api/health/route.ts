import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();
    await db.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "HEALTHY",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      database: {
        status: "CONNECTED",
        latencyMs: dbLatencyMs,
      },
      system: {
        memoryUsage: process.memoryUsage(),
        uptimeSeconds: Math.floor(process.uptime()),
      },
    });
  } catch (error: any) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "UNHEALTHY",
        error: error.message || "Database connection failure",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
