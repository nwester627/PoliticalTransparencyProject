// Clean single implementation of the Election API utilities

// Utilities for voter registration information (election results removed)

export const registrationInfo = {
  title: "Register to Vote",
  intro:
    "Registering to vote is the most important step. Use the links below to check registration, find your state's requirements, and register online where available.",
  resources: [
    {
      label: "National registration and status check",
      url: "https://www.vote.org",
    },
    {
      label: "Absentee and mail ballot information",
      url: "https://www.vote.org/absentee-ballot/",
    },
    {
      label: "Find your state's election office",
      url: "https://www.usa.gov/election-office",
    },
  ],
  reminders: [
    "Have a valid ID available where required",
    "Register before your state's deadline",
    "Confirm your registration status before election day",
  ],
};

export const fetchElectionDashboardData = async () => {
  // Keep the same function name used by the UI but return voter registration info
  return {
    dates: [],
    voterInfo: {
      state: "",
      registrationDeadline: "Check your state page",
      votingMethods: ["In Person", "Mail"],
      requirements: registrationInfo.reminders,
    },
    registrationInfo,
  };
};

export const backendBase =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const buildBackendUrl = (path: string) => `${backendBase}${path}`;
