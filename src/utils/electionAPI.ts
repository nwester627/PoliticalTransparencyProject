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
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const url = `${backendBase}/api/election-dashboard`;

    const resp = await axios.get(url, { params: { address } });
    if (resp && resp.data) {
      return resp.data;
    }

    return mockElectionData;
  } catch (error) {
    console.error(
      "Error fetching election dashboard data from backend:",
      error
    );
    return mockElectionData;
  }
};
