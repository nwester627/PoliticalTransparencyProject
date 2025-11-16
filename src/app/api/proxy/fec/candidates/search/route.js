import { NextResponse } from "next/server";

const BASE_URL = "https://api.open.fec.gov/v1";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const perPage = searchParams.get("per_page") || "1";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter required" },
      { status: 400 }
    );
  }

  try {
    const url = `${BASE_URL}/candidates/search/?q=${encodeURIComponent(
      query
    )}&per_page=${perPage}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(`FEC API error: ${response.status} for candidates search`);
      return NextResponse.json(
        { error: "Failed to fetch candidates" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
