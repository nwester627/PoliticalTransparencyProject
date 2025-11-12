import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Political Transparency Project",
  description:
    "Track congressional representatives and political accountability",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
