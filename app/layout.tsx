import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Sora, VT323 } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/nav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "Build AI with AI",
  description: "Build AI apps with AI guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${sora.variable} ${vt323.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Caveat:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
      >
        <ClerkProvider>
          <Nav />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
