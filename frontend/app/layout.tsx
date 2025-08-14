// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export const metadata = {
  title: "AI Stock Analyzer",
  description: "Phase-1 Dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
