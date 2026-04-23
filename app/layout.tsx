import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { FilterBar } from "@/components/FilterBar";

export const metadata: Metadata = {
  title: "Castrol x Schbang | Insights Dashboard",
  description:
    "Live influencer performance, brand integration & campaign analytics dashboard for Castrol x Schbang.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/schbang_logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/schbang_logo.png" />
        <link rel="shortcut icon" href="/schbang_logo.png" />
        <link rel="apple-touch-icon" href="/schbang_logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-ink-900">
        <Providers>
          <div className="min-h-screen flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 w-full">
              <TopBar />
              <FilterBar />
              <main className="px-4 md:px-6 lg:px-8 pb-16 pt-4 flex-1 w-full max-w-full overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
