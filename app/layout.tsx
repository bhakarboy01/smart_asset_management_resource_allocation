import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "Sampadaa — Asset Management Platform",
    template: "%s | Sampadaa",
  },
  description:
    "Sampadaa is a centralised asset management and resource allocation platform for IIT Roorkee Cultural Council.",
  keywords: ["asset management", "resource allocation", "IIT Roorkee", "inventory"],
  authors: [{ name: "Team Sampadaa" }],
  openGraph: {
    title: "Sampadaa — Asset Management Platform",
    description: "Manage shared resources efficiently with Sampadaa",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
