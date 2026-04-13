import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NIFTY Flow Terminal",
  description:
    "A modern NIFTY 50 option chain dashboard with analytics, charts, watchlists, and strategy tooling."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

