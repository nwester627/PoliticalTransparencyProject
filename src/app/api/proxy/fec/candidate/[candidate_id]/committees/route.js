import { NextResponse } from "next/server";

const BASE_URL = "https://api.open.fec.gov/v1";

export async function GET(request, { params }) {
  const { candidate_id } = params;

  if (!candidate_id) {
    return NextResponse.json(
      { error: "Candidate ID required" },
      { status: 400 }
    );
  }

  try {
    const apiKey =
      process.env.FEC_API_KEY || process.env.NEXT_PUBLIC_FEC_API_KEY;
    const url = `${BASE_URL}/candidate/${candidate_id}/committees/${
      apiKey ? `?api_key=${encodeURIComponent(apiKey)}` : ""
    }`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(
        `FEC API error: ${response.status} for candidate ${candidate_id} committees`
      );
      return NextResponse.json(
        { error: "Failed to fetch candidate committees" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching candidate committees:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
