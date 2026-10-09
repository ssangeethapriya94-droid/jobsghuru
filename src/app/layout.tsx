import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";

const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", weight: ["600", "700", "800"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "JobsGhuru: verified jobs, honest matching", template: "%s · JobsGhuru" },
  description: "Find verified jobs, see exactly why you match, and get a reply to every application.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
