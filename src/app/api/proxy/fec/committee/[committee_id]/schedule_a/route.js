import { NextResponse } from "next/server";

const BASE_URL = "https://api.open.fec.gov/v1";

export async function GET(request, { params }) {
  const { committee_id } = params;
  const { searchParams } = new URL(request.url);
  const perPage = searchParams.get("per_page") || "10";
  const twoYearPeriod = searchParams.get("two_year_transaction_period");

  if (!committee_id) {
    return NextResponse.json(
      { error: "Committee ID required" },
      { status: 400 }
    );
  }

  try {
    const apiKey =
      process.env.FEC_API_KEY || process.env.NEXT_PUBLIC_FEC_API_KEY;
    let url = `${BASE_URL}/committee/${committee_id}/schedules/schedule_a/?per_page=${perPage}`;
    if (twoYearPeriod) {
      url += `&two_year_transaction_period=${twoYearPeriod}`;
    }
    if (apiKey) {
      url += `&api_key=${encodeURIComponent(apiKey)}`;
    }

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(
        `FEC API error: ${response.status} for committee ${committee_id} schedule_a`
      );
      return NextResponse.json(
        { error: "Failed to fetch committee schedule_a" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching committee schedule_a:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
