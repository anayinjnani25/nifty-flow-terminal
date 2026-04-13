import { NextResponse } from "next/server";
import { withCache } from "@/lib/server/cache";
import { getMarketSummaryData } from "@/lib/server/market-service";

export async function GET() {
  try {
    const data = await withCache("market-summary", 30_000, getMarketSummaryData);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load market summary",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

