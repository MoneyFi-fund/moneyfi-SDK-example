# MoneyFi SDK

A DeFi application SDK that enables users to interact with the MoneyFi protocol on the Aptos blockchain. MoneyFi is a DeFAI platform that helps non-DeFi users monetize stablecoins across protocols and blockchains through fully automated, AI-powered strategies.

## Features

- **Aptos Wallet Integration**: Connect with popular Aptos wallets (Petra, OKX, Nightly, Pontem)
- **USDC Deposit & Withdrawal**: Seamlessly deposit USDC into MoneyFi strategies and withdraw funds
- **Real-time Balance Tracking**: View your withdrawable balance in both USDT and USDC
- **Transaction Monitoring**: Track transaction hashes and link to Aptos Explorer
- **Responsive Design**: Mobile-friendly interface built with modern UI components
- **Type-safe Development**: Full TypeScript support with comprehensive type definitions

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Routing**: TanStack Router with file-based routing
- **Styling**: Tailwind CSS + Chakra UI v3
- **Build Tool**: Vite
- **Blockchain**: Aptos integration via @aptos-labs/wallet-adapter-react
- **State Management**: Context-based authentication and wallet management
- **Testing**: Vitest with React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- An Aptos wallet extension (Petra, OKX, etc.)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd moneyfi-sdk
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APTOS_CLIENT_API_KEY=your_aptos_api_key_here
```

## Usage

### Connecting a Wallet

1. Click the "Connect Wallet" button in the header
2. Select your preferred Aptos wallet from the modal
3. Approve the connection in your wallet extension
4. Your wallet address will appear in the header once connected

### Depositing USDC

1. Ensure your wallet is connected
2. Navigate to the "Deposit USDC" card
3. Enter the amount you want to deposit
4. Click "Deposit" and confirm the transaction in your wallet
5. View the transaction hash and link to explorer upon success

### Viewing Balances

1. The "Withdrawable Balance" card shows your available funds
2. Displays both USDT and USDC balances
3. Click "Refresh" to update the latest balance information

### Withdrawing Funds

1. Use the "Withdraw Funds" card to withdraw all deposited funds
2. Click "Withdraw All" to initiate the withdrawal
3. Confirm the transaction in your wallet
4. Track the transaction via the provided hash link

## Project Structure

```
src/
├── auth/                    # Authentication types and utilities
├── config/                  # Application configuration
├── constants/              # Wallet constants and configurations
├── modules/
│   └── dashboard/          # Main dashboard module
│       ├── components/     # Dashboard components
│       │   ├── transactions/  # Transaction-related components
│       │   ├── wallet-button.tsx
│       │   └── wallet-connect-modal.tsx
│       └── dashboard.tsx   # Main dashboard page
├── provider/               # React context providers
│   ├── auth-provider.tsx   # Authentication management
│   ├── aptos-wallet-provider.tsx
│   ├── chakra-provider.tsx # UI theme provider
│   └── web3-providers.tsx  # Blockchain providers
├── routes/                 # TanStack Router routes
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Core Components

### WalletButton
Displays wallet connection status and user address with dropdown menu for copying address and disconnecting.

### DepositComponent
Handles USDC deposits into MoneyFi strategies with amount input and transaction confirmation.

### WithdrawComponent
Manages withdrawal of all funds from MoneyFi strategies with single-click operation.

### BalancePreviewComponent
Shows real-time withdrawable balances in USDT and USDC with refresh capability.

### WalletConnectModal
Modal interface for selecting and connecting to various Aptos wallets with installation support.

## Development Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm serve                  # Preview production build

# Code Quality
pnpm lint                   # Run ESLint
pnpm prettier              # Check Prettier formatting
pnpm prettier:fix          # Fix Prettier formatting
pnpm check-types           # TypeScript type checking
pnpm pre-commit            # Run all checks (lint + prettier + types)

# Testing
pnpm test                  # Run test suite

# Route Management
pnpm generate-routes       # Generate route tree
pnpm watch-routes          # Watch route changes

# Deployment
pnpm wrangler-deploy       # Deploy to Cloudflare Pages
```

## Building for Production

```bash
pnpm build
```

This will create an optimized production build in the `dist/` directory with:
- Code splitting for optimal loading
- Separate chunks for the Aptos MoneyFi package
- TypeScript compilation and type checking
- Tailwind CSS optimization

## Deployment

The project is configured for deployment on Cloudflare Pages:

```bash
pnpm wrangler-deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the pre-commit checks (`pnpm pre-commit`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is private and proprietary to MoneyFi.

## Support

For questions and support, please contact the MoneyFi development team.
