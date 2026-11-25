import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { NavSkeleton, SiteNav } from "@/components/site-nav";

const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "The Margin", template: "%s · The Margin" },
  description: "Essays on attention, craft, and the web. A small blog with a long memory.",
  openGraph: { title: "The Margin", description: "Essays on attention, craft, and the web.", type: "website" },
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Suspense fallback={<NavSkeleton />}>
          <SiteNav />
        </Suspense>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
