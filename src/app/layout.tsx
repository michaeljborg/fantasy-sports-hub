import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";
import { BackgroundDecor } from "@/components/background-decor";
import { SiteHeader } from "@/components/site-header";
import { ThemeLab, themeLabScript } from "@/components/theme-lab";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Fantasy Sports Hub",
    template: "%s · Fantasy Sports Hub",
  },
  description: "Your fantasy sports tools in one place.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b101c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* TEMP: Theme Lab, applies saved palette before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeLabScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeLab />
        <BackgroundDecor />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
