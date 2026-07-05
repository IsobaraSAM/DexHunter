# DEXHUNTER

**Find the projects before everyone else does.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vite](https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=FFD62E)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)

## Overview

DEXHUNTER is a live, multi-chain token discovery dashboard built for Web3 developers, not traders. It surfaces new and active crypto projects across Solana, Base, BSC, Ethereum, and Arbitrum, filters out dead liquidity, and layers on an AI-powered Dev Match feature that scores which projects are most likely to need a developer's specific skill set and drafts a pitch ready to send.

Most token screeners are built for people trying to buy in. DEXHUNTER is built for people trying to build.

## Features

### Discover
- Live multi-chain feed (Solana, Base, BSC, Ethereum, Arbitrum)
- Liquidity-wiped pairs automatically excluded
- Time-range filtering: last hour, 6 hours, 24 hours, week, month, all time
- "Brand New" badges on freshly created pairs
- Token images and chain icons on every card
- Sort by volume, liquidity, or newest first
- Pagination through large result sets

### Dev Match
- Build a developer profile: skills, GitHub, past projects, preferred chains
- AI-scored match rating for every live project based on real need signals (no website detected, no socials, early stage)
- Auto-generated, personalized outreach pitch for each match
- One-tap copy to send directly on Telegram or X

### Saved
- Bookmark any project from any tab
- Persistent across sessions

## Tech Stack

- React 18 with TypeScript
- Vite
- Tailwind CSS v4
- Lucide Icons
- DexScreener public API
- Anthropic Claude API for Dev Match scoring

## Getting Started

### Prerequisites
- Node.js 18 or later
- npm (yarn or pnpm also work)

### Installation

```bash
git clone https://github.com/<your-username>/dexhunter.git
cd dexhunter
npm install
```

### Environment Variables

Copy the example file and fill in your own key:

```bash
cp .env.example .env
```

> **Security note:** the Dev Match feature currently calls the Anthropic API. Never ship an API key inside client-side code for a public deployment. Route this call through a serverless function (Netlify Functions, Vercel Edge Functions, or similar) before going live. See Roadmap below.

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
dexhunter/
├── src/
│   ├── App.tsx          # Main application: Discover, Dev Match, Saved tabs
│   ├── main.tsx         # React entry point
│   ├── types.ts         # Shared TypeScript interfaces
│   └── index.css        # Tailwind and global styles
├── index.html           # Vite HTML entry
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript configuration
├── metadata.json         # App metadata
├── package.json          # Dependencies and scripts
├── .env.example           # Environment variable template
├── .gitignore
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## Roadmap

- [ ] Move Anthropic API calls behind a serverless proxy for security and cost control
- [ ] Replace keyword search with a full multi-chain screener feed (150k plus pairs, not just keyword matches)
- [ ] Honeypot and contract safety checks
- [ ] Holder concentration data
- [ ] Persistent "already contacted" tracking
- [ ] CSV export of Dev Match results

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, code style, and PR guidelines.

## Disclaimer

DEXHUNTER aggregates publicly available data from DexScreener for discovery and research purposes. It does not provide financial advice. Always do your own research before engaging with any token or project.

## License

MIT. Full text in [LICENSE](./LICENSE).

## Author

Built by Xenon.

