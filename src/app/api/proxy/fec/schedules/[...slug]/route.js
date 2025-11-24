import { NextResponse } from "next/server";

const BASE_URL = "https://api.open.fec.gov/v1";

export async function GET(request, { params }) {
  const { slug } = params;
  const { searchParams } = new URL(request.url);

  try {
    const apiKey =
      process.env.FEC_API_KEY || process.env.NEXT_PUBLIC_FEC_API_KEY;
    const url = `${BASE_URL}/schedules/${slug.join(
      "/"
    )}?${searchParams.toString()}${
      apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : ""
    }`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(
        `FEC API error: ${response.status} for schedules/${slug.join("/")}`
      );
      return NextResponse.json(
        { error: "Failed to fetch schedules data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
