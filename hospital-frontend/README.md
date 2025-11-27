# Hospital Frontend (Fixed Asset Trading)

This is the Next.js frontend for the Fixed Asset Trading project (Hospital Asset Trading Platform).

What is included
- Pages for Home, Bank, Hospital, Patients, Trades
- Role-specific login flows (Patient / Bank / Hospital) — demo client-side auth
- UI components (Card, Button, Input, Modal, Badge)
- Basic Web3 provider (MetaMask) and contract helpers using `ethers`

Quick setup

1. Install dependencies

```powershell
cd hospital-frontend
npm install
```

2. Start the frontend dev server

```powershell
npm run dev
# If Next picks another port, open the displayed URL (e.g. http://localhost:3001)
```

3. Run contracts locally (optional, for integration)

```powershell
# in project root
npx hardhat node
# in another terminal deploy contracts
node scripts/deploy.ts
```

Notes
- The frontend uses a simple `localStorage` session helper for demo logins. Replace with real auth for production.
- Database integration and event indexing are out of scope for this frontend task — you said you'll implement DB later.
- Contract ABIs are read from `artifacts/` (the project Hardhat artifacts folder). Update addresses in code or env when deploying contracts.

Next steps you can ask me to implement
- Wire pages to live contract functions (mintAssetToken, recordTrade, distributeProfit) using connected signer.
- Add Prisma + Postgres schema and APIs for off-chain indexing (you requested DB later).
- Implement an event indexer to populate `trades` and `distributions` from on-chain events.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
