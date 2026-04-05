import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "DevFolioGen: AI-Powered Portfolio Generator",
  description: "Turn your GitHub profile into a stunning portfolio in seconds with AI-powered insights.",
  openGraph: {
    title: "DevFolioGen: AI-Powered Portfolio Generator",
    description: "Generate a professional developer portfolio from your GitHub profile.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "DevFolioGen",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "DevFolioGen: AI-Powered Portfolio Generator",
    description: "Generate a professional developer portfolio from your GitHub profile.",
    images: ["/og.png"],
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <meta name="google-site-verification" content="01RSOFnpsCxoymkIv5grg4fWEXlEAooR046blv6h0bg" />
      </head>
      <body
        className="antialiased"
        style={
          {
            "--font-playfair": 'Georgia, "Times New Roman", serif',
          } as CSSProperties
        }
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          themes={[
            "light",
            "dark",
            "vintage-light",
            "vintage-dark",
            "mono-light",
            "mono-dark",
            "neobrutalism-light",
            "neobrutalism-dark",
            "t3chat-light",
            "t3chat-dark",
          ]}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
