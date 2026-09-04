import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siber",
  description: "Website kelas Siber",
};

// Theme is applied as class="dark" on <html>, toggled by
// src/components/theme-toggle.tsx and persisted to localStorage. The
// homepage (src/app/page.tsx) keeps its own fixed dark hero regardless —
// this toggle affects everywhere else (dashboard, login, /notes,
// /announcements), which use the shared shadcn design tokens.
const THEME_INIT_SCRIPT = `
  try {
    var theme = localStorage.getItem("theme");
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Default to dark before the init script runs — matches the site's
      // theme and avoids a light->dark flash for the common case.
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* beforeInteractive: Next injects this into the initial HTML and
            runs it before hydration/any other JS — the only strategy that
            reliably avoids a flash of the wrong theme. A plain JSX
            <script> tag doesn't work for this in React 19 (it's a no-op on
            client renders). */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
