// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { NextAbstractWalletProvider } from "@/components/agw-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Dapper Duck",
  description: "Collect Meme Snacks • Dodge FUD Bags",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {/* v0 / AGW provider wrapper */}
        <NextAbstractWalletProvider>
          {children}
          <Toaster />
        </NextAbstractWalletProvider>
      </body>
    </html>
  );
}
