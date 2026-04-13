import { NextRequest, NextResponse } from "next/server";
import { withCache } from "@/lib/server/cache";
import { searchSymbols } from "@/lib/server/market-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const data = await withCache(`search:${query}`, 60_000, () => searchSymbols(query));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Search failed",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
