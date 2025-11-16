import Link from "next/link";
import Header from "@/components/Header/Header";
import PageHeader from "@/components/UI/PageHeader/PageHeader";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main style={{ padding: 40, maxWidth: 980, margin: "0 auto" }}>
        <PageHeader
          title="Voter Registration & Resources"
          description="Find official resources to register, check your registration status, request an absentee ballot, and learn about ID and deadline requirements."
        />

        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            marginTop: 18,
          }}
        >
          <p>
            Registering to vote is quick and often available online through your
            state. Below are trusted resources to get started.
          </p>

          <ul>
            <li>
              <a href="https://www.vote.org" target="_blank" rel="noreferrer">
                National registration and status check — vote.org
              </a>
            </li>
            <li>
              <a
                href="https://www.usa.gov/election-office"
                target="_blank"
                rel="noreferrer"
              >
                Find your state&apos;s election office — usa.gov
              </a>
            </li>
            <li>
              <a
                href="https://www.vote.org/absentee-ballot/"
                target="_blank"
                rel="noreferrer"
              >
                Absentee & mail ballot information — vote.org
              </a>
            </li>
          </ul>

          <p style={{ marginTop: 12 }}>
            If you need help, contact your local election office. You can also
            find state-specific instructions on each state&apos;s election
            website.
          </p>

          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: 12,
              color: "var(--color-primary)",
            }}
          >
            Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
