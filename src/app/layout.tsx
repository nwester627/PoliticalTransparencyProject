import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
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
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
