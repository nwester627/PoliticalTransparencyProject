// Clean single implementation of the Election API utilities

import axios from "axios";

// Mock data for development/fallback
export const mockElectionData = {
  dates: [
    {
      date: "November 5, 2024",
      event: "Presidential General Election",
      type: "general" as const,
      status: "completed" as const,
      resultsUrl: "/elections/2024-presidential",
    },
    {
      date: "October 7, 2024",
      event: "Early Voting Begins (Most States)",
      type: "deadline" as const,
      status: "completed" as const,
      resultsUrl: "/elections/2024-presidential",
    },
    {
      date: "October 5, 2024",
      event: "Voter Registration Deadline (Most States)",
      type: "deadline" as const,
      status: "completed" as const,
      resultsUrl: "/elections/2024-presidential",
    },
  ],
  voterInfo: {
    state: "Your State",
    registrationDeadline: "October 5, 2024",
    votingMethods: ["In Person", "Mail", "Early Voting"],
    requirements: ["Valid ID", "Registered to Vote", "Citizen"],
  },
};

// Type definitions
export interface ElectionDate {
  date: string;
  event: string;
  type: "primary" | "general" | "deadline";
  status?: "upcoming" | "completed";
  resultsUrl?: string;
  state?: string;
}

export interface VoterInfo {
  state: string;
  registrationDeadline: string;
  votingMethods: string[];
  requirements: string[];
}

// Fetch elections and return formatted dashboard data
export const fetchElectionDashboardData = async (address?: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY;
    if (!apiKey) {
      console.warn("Google Civic API key not found, using mock data");
      return mockElectionData;
    }

    // Get all available elections
    const electionsResponse = await axios.get(
      `https://www.googleapis.com/civicinfo/v2/elections`,
      { params: { key: apiKey } }
    );

    const allElections = electionsResponse.data.elections || [];
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    // Upcoming (within next 3 months)
    const upcomingWithin3Months = allElections.filter((election: any) => {
      const electionDate = new Date(election.electionDay);
      return electionDate >= today && electionDate <= threeMonthsFromNow;
    });

    // Recent past elections (most recent first)
    const pastElections = allElections
      .filter((election: any) => new Date(election.electionDay) < today)
      .sort(
        (a: any, b: any) =>
          new Date(b.electionDay).getTime() - new Date(a.electionDay).getTime()
      );

    // Decide what to show: upcoming within 3 months or recent past (3-4)
    let selectedElections: any[] = [];
    if (upcomingWithin3Months.length > 0) {
      selectedElections = upcomingWithin3Months
        .sort(
          (a: any, b: any) =>
            new Date(a.electionDay).getTime() -
            new Date(b.electionDay).getTime()
        )
        .slice(0, 4);
    } else {
      selectedElections = pastElections.slice(0, 4);
    }

    // Map to our format
    const dates: ElectionDate[] = selectedElections.map((election: any) => {
      const d = new Date(election.electionDay);
      const isUpcoming = d >= today && d <= threeMonthsFromNow;
      return {
        date: d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        event: election.name || "Election",
        type: "general",
        status: isUpcoming ? "upcoming" : "completed",
        resultsUrl: `/elections/${election.id}`,
        state: "National",
      };
    });

    // Fetch voter info for the nearest upcoming election if available
    let voterInfo: VoterInfo = mockElectionData.voterInfo;
    if (upcomingWithin3Months.length > 0) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/civicinfo/v2/voterinfo`,
          {
            params: {
              key: apiKey,
              address: address || "New York, NY",
              electionId: upcomingWithin3Months[0].id,
            },
          }
        );

        voterInfo = {
          state: response.data.normalizedInput?.state || "Your State",
          registrationDeadline: "TBD",
          votingMethods:
            response.data.state?.electionAdministrationBody?.votingMethods ||
            (response.data.pollingLocations?.length > 0
              ? ["In Person", "Mail"]
              : ["In Person", "Mail", "Early Voting"]),
          requirements: ["Valid ID", "Registered to Vote", "Citizen"],
        };
      } catch (e) {
        console.warn(
          "voterinfo fetch failed, using mock voter info",
          (e as any)?.message || e
        );
      }
    }

    return {
      dates: dates.length > 0 ? dates : mockElectionData.dates,
      voterInfo,
    };
  } catch (error) {
    console.error("Error fetching election dashboard data:", error);
    return mockElectionData;
  }
};
