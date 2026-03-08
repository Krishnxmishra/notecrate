import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SetupNudgeServer } from "@/components/setup-nudge-server";
import { ThemeInitializer } from "@/components/theme-initializer";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NoteCrate — Organize material. Get clarity.",
  description: "AI-powered research workspace. Save highlights, synthesize knowledge, create documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to apply theme + font size before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  try {
    var t = localStorage.getItem('nc_theme');
    var dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
    var s = localStorage.getItem('nc_font_size') || 'medium';
    document.documentElement.setAttribute('data-font-size', s);
  } catch(e){}
})();
        ` }} />
      </head>
      <body className={`${instrumentSans.variable} font-sans antialiased`}>
        <TooltipProvider delayDuration={200}>
          <ThemeInitializer />
          {children}
          <SetupNudgeServer />
        </TooltipProvider>
      </body>
    </html>
  );
}
