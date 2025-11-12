import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Political Project",
  description: "A Next.js application for political engagement",
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
