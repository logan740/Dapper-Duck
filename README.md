# Dapper Duck 🦆

A fun blockchain-integrated game where you play as a dapper duck collecting meme snacks while dodging FUD bags! Built with Next.js and integrated with Abstract Global Wallet for Web3 functionality.

## 🎮 Game Features

- **Dapper Duck Gameplay**: Control a duck that flaps through obstacles
- **Collect Meme Snacks**: Gather different types of snacks for points
- **Dodge FUD Bags**: Avoid falling FUD (Fear, Uncertainty, Doubt) bags
- **Difficulty Scaling**: Game gets progressively harder over time
- **Web3 Integration**: Connect your Abstract wallet to play
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dapper-duck-web
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Web3**: Abstract Global Wallet (AGW) integration
- **Blockchain**: Abstract Testnet (configurable for mainnet)
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: Wagmi for Web3 state
- **TypeScript**: Full type safety throughout

## 🎯 Game Controls

- **Mouse/Touch**: Click or tap to flap
- **Keyboard**: Spacebar or any key to flap
- **Objective**: Collect snacks, avoid FUD bags, survive as long as possible!

## 🔧 Configuration

The game is currently configured to use Abstract Testnet. To switch to mainnet:

1. Update `src/config/chain.ts`
2. Change the chain import from `abstractTestnet` to `abstractMainnet`
3. Update your wallet to connect to the correct network

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── connect-wallet-button.tsx
├── config/             # Configuration files
│   ├── chain.ts        # Blockchain configuration
│   └── viem-clients.ts # Viem client setup
└── lib/                # Utility functions
public/
├── game.js            # Main game logic
└── assets/            # Game assets (images)
```

## 🚀 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
