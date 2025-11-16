import { NextResponse } from "next/server";

const API_KEY = process.env.CONGRESS_API_KEY || "DEMO_KEY";
const BASE_URL = "https://api.congress.gov/v3";

export async function GET(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  }

  try {
    const url = `${BASE_URL}/member/${id}?api_key=${API_KEY}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(`Congress API error: ${response.status} for member ${id}`);
      return NextResponse.json(
        { error: "Failed to fetch member data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching member data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
