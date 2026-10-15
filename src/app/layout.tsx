import type { Metadata } from "next";
import { Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Body face of the public site. Loaded as one variable font file (a single
// request that is always used) instead of one file per weight: the site only
// ever sets 400 for paragraphs, 500 for the menu and 600 for small labels,
// and per-weight files were preloaded on every page even where a weight
// wasn't used.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Only the dashboard's modals use the mono face, so it isn't preloaded on
// every page — it loads on demand where it's actually used.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

// The display face for large titles — only comes in weight 400, which is
// exactly the elegant, non-bold look the design calls for.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Vanessa Trejo",
  description: "Portafolio de Vanessa Trejo, desarrolladora full-stack freelance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistMono.variable} ${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
