"use client";

import Script from "next/script";
import { useEffect } from "react";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import Link from "next/link";

export default function GamePage() {
  // Ensure full-viewport sizing for canvas
  useEffect(() => {
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
  }, []);

  return (
    <div className="relative w-screen h-[100svh] overflow-hidden">
      {/* Game Canvas */}
      <canvas id="game" className="absolute inset-0 w-full h-full" />

      {/* Score HUD - Always visible during gameplay */}
      <div id="hud" className="absolute top-4 left-4 z-40">
        <div
          id="score"
          className="rounded-xl bg-white/85 px-3 py-2 shadow font-bold backdrop-blur-sm"
        >
          Score: <span id="scoreVal">0</span>
        </div>
      </div>

      {/* Power-up Indicator */}
      <div id="powerup-indicator" className="hidden absolute top-16 left-4 z-40">
        <div className="rounded-xl bg-white/85 px-3 py-2 shadow backdrop-blur-sm border-l-4 border-orange-500">
          <div id="powerup-text" className="text-sm font-bold text-gray-800">⚡ Power-up</div>
          <div id="powerup-timer" className="text-xs text-gray-600">10s</div>
        </div>
      </div>


      {/* Main Menu */}
      <div id="menu">
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-white/90 p-6 shadow-xl w-[min(560px,92vw)] backdrop-blur-sm">
            <h1 className="text-3xl font-extrabold mb-1">Dapper Duck</h1>
            <p className="mb-5 text-neutral-700">Collect Meme Snacks • Dodge FUD Bags</p>
            <div className="space-y-3">
              <button
                id="freeGameBtn"
                className="w-full rounded-xl bg-green-500 hover:bg-green-600 px-4 py-3 text-white font-bold shadow transition-colors"
              >
                🆓 Free Game
              </button>
                     <button
                       id="paidGameBtn"
                       disabled
                       className="w-full rounded-xl bg-gray-400 cursor-not-allowed px-4 py-3 text-white font-bold shadow opacity-60"
                     >
                       💎 Pay 0.001 ETH (Coming Soon)
                     </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <div id="gameOver" className="hidden">
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-white/90 p-6 shadow-xl text-center w-[min(420px,92vw)] backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-2">Game Over</h2>
            <p id="reason" className="mb-2">You fell!</p>
            <div id="finalScore" className="mb-4 text-lg font-bold text-orange-600">
              Final Score: <span id="finalScoreVal">0</span>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                id="retryBtn"
                className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-white font-bold shadow transition-colors"
              >
                Retry
              </button>
              <Link
                href="/"
                className="rounded-xl bg-neutral-200 hover:bg-neutral-300 px-4 py-2 font-bold shadow transition-colors text-gray-800"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="absolute top-4 right-4 z-50">
        <ConnectWalletButton />
      </div>

      {/* Load Game Script */}
      <Script src="/game.js" strategy="afterInteractive" />
    </div>
  );
}
