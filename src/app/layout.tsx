import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tom Integrations — AI for Small Business",
  description:
    "Never miss another call. AI receptionist and social media management for small businesses in Chattanooga and beyond.",
  openGraph: {
    title: "Tom Integrations — AI for Small Business",
    description:
      "Never miss another call. AI receptionist and social media management for small businesses.",
    type: "website",
    locale: "en_US",
    siteName: "Tom Integrations",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <script src="/tracking.js" defer />
      </body>
    </html>
  );
}
