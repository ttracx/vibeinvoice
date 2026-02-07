import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VibeInvoice - Simple Invoice Generator",
  description: "Create, manage, and send professional invoices in minutes. Track payments, manage clients, and export PDFs effortlessly.",
  keywords: ["invoice", "billing", "invoice generator", "payment tracking", "pdf export"],
  authors: [{ name: "VibeCaaS" }],
  openGraph: {
    title: "VibeInvoice - Simple Invoice Generator",
    description: "Create, manage, and send professional invoices in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
