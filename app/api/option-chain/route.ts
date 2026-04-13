import { NextRequest, NextResponse } from "next/server";
import { withCache } from "@/lib/server/cache";
import { getOptionChainData } from "@/lib/server/market-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const expiry = searchParams.get("expiry");
  const requestedRange = Number(searchParams.get("strikeRange") ?? "10");
  const strikeRange = Number.isFinite(requestedRange) ? requestedRange : 10;

  try {
    const data = await withCache(
      `option-chain:${symbol ?? "default"}:${expiry ?? "nearest"}:${strikeRange}`,
      10_000,
      () =>
        getOptionChainData({
          symbol,
          expiry,
          strikeRange
        })
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load option chain",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
