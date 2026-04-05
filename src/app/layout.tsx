import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Tom Integrations",
  description: "AI Receptionist and AI Social Media Manager for small businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-neutral-950 text-neutral-100 antialiased">
        <Toaster theme="dark" richColors position="top-right" />
        {children}
        <script src="/tracking.js" defer />
      </body>
    </html>
  );
}
