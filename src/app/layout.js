import "./globals.css";
import { Manrope, Sora } from "next/font/google";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const headingFont = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata = {
  title: {
    default: "AI Assess Pro",
    template: "%s | AI Assess Pro",
  },
  description: "Professional AI readiness assessment for for-profit and non-profit organizations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
