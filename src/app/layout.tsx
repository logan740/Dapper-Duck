// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { WalletProvider } from "@/components/wallet-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Dapper Duck",
  description: "Collect Meme Snacks • Dodge FUD Bags",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {/* Multi-wallet provider supporting AGW and MetaMask */}
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
