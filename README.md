# MoneyFi SDK

A modern DeFi application SDK that enables users to interact with the MoneyFi protocol on the Aptos blockchain. MoneyFi is a DeFAI platform that helps non-DeFi users monetize stablecoins across protocols and blockchains through fully automated, AI-powered strategies.

## Features

- **Multi-Wallet Support**: Connect with popular Aptos wallets (Petra, OKX, Nightly, Pontem)
- **Multi-Token Support**: Deposit and withdraw both USDC and USDT seamlessly
- **Account Management**: Automated user account creation and partnership initialization
- **Real-time Statistics**: Comprehensive portfolio analytics with 8 key metrics
- **Dark/Light Theme**: Material Design 3 theming with automatic system preference detection
- **Transaction Monitoring**: Track transaction hashes with direct links to Aptos Explorer
- **Responsive Design**: Mobile-first interface built with modern UI components
- **Type-safe Development**: Full TypeScript support with comprehensive type definitions

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Routing**: TanStack Router with file-based routing and auto code splitting
- **UI Framework**: Chakra UI v3 with Material Design 3 design system
- **Styling**: Tailwind CSS v4 with custom theme integration
- **Build Tool**: Vite with optimized chunk splitting
- **Blockchain**: Aptos TS SDK v4 with wallet adapter integration
- **State Management**: TanStack Query + Context-based providers
- **Testing**: Vitest with React Testing Library
- **Theme System**: Custom Material Design 3 implementation with CSS variables

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

### Depositing Funds

1. **Connect your wallet** using the wallet button in the header
2. **Select token type** from the dropdown (USDC or USDT)
3. **Enter deposit amount** in the amount field
4. **Click "Deposit"** - the system will automatically:
   - Create your MoneyFi user account (if needed)
   - Initialize your wallet account (if needed)
   - Execute the token deposit
5. **Track your transaction** via the provided Aptos Explorer link

### Viewing Portfolio Statistics

1. Navigate to the **Statistics section** (automatically displayed on dashboard)
2. View **8 comprehensive metrics** including portfolio value, profits, and APR
3. **Refresh statistics** using the refresh button for real-time data
4. Each metric includes **visual indicators** and **formatted values** for easy reading

### Withdrawing Funds

1. Locate the **"Withdraw Funds"** card on the dashboard
2. Click **"Withdraw All"** to initiate full withdrawal
3. **Confirm the transaction** in your wallet
4. **Monitor progress** via the transaction hash link to Aptos Explorer

### Theme Customization

1. Use the **theme toggle** in the header to switch between light and dark modes
2. The system **automatically detects** your system preference on first visit
3. Your theme choice is **saved locally** and persists across sessions
4. All components **dynamically adapt** to the selected theme

## Project Architecture

```
src/
├── auth/                           # Authentication utilities and types
│   ├── types.ts                   # Auth type definitions
│   └── utils.ts                   # Auth helper functions
├── components/                     # Shared UI components
│   ├── layout/                    # Layout components
│   │   ├── header.tsx            # Application header with navigation
│   │   └── layout.tsx            # Main layout wrapper
│   ├── loading/                   # Loading components
│   │   └── loading.tsx           # Loading spinner component
│   └── theme-toggle.tsx          # Dark/light mode toggle
├── config/                        # Application configuration
│   └── common.ts                 # Common configuration constants
├── constants/                     # Application constants
│   ├── address.ts                # Smart contract addresses
│   ├── aptos.ts                  # Aptos client configuration
│   ├── error.ts                  # Error code definitions
│   └── wallet.ts                 # Wallet configuration and deep links
├── hooks/                         # Custom React hooks
│   ├── use-check-wallet-account.tsx  # Wallet account verification
│   ├── use-create.tsx            # Account creation utilities
│   ├── use-media-query.tsx       # Responsive design hooks
│   ├── use-moneyfi-queries.ts    # MoneyFi API query hooks
│   └── use-stats.ts              # Statistics query hooks
├── modules/                       # Feature modules
│   ├── dashboard/                 # Main dashboard module
│   │   ├── components/           # Dashboard-specific components
│   │   │   ├── account/          # Account management components
│   │   │   │   ├── create-partnership.tsx  # Partnership creation
│   │   │   │   └── init-account.tsx        # Account initialization
│   │   │   ├── check-wallet-account/       # Wallet verification
│   │   │   │   └── check-wallet-account.tsx
│   │   │   ├── transaction/      # Transaction components
│   │   │   │   ├── deposit.tsx   # Multi-token deposit interface
│   │   │   │   └── withdraw.tsx  # Withdrawal interface
│   │   │   ├── wallet-button.tsx # Wallet connection button
│   │   │   └── wallet-connect-modal.tsx   # Wallet selection modal
│   │   └── dashboard.tsx         # Main dashboard page
│   ├── not-found/               # 404 error page
│   │   └── not-found.tsx
│   └── stats/                   # Statistics dashboard
│       └── stats.tsx           # Portfolio analytics with 8 metrics
├── provider/                    # React context providers
│   ├── aptos-wallet-provider.tsx  # Aptos wallet integration
│   ├── auth-provider.tsx       # Authentication state management
│   ├── chakra-provider.tsx     # Chakra UI configuration
│   ├── theme-provider.tsx      # Material Design 3 theme system
│   ├── toast-provider.tsx      # Toast notification system
│   └── web3-providers.tsx      # Combined Web3 providers
├── routes/                     # TanStack Router file-based routing
│   ├── __root.tsx             # Root route with providers
│   ├── dashboard.tsx           # Dashboard route
│   ├── index.tsx              # Home route
│   └── stats.tsx              # Statistics route
├── theme/                      # Design system
│   ├── chakra-theme.ts        # Chakra UI theme configuration
│   └── material-design-3.ts   # Material Design 3 implementation
├── types/                      # TypeScript type definitions
│   ├── common.ts              # Common type definitions
│   ├── non-evm.ts            # Non-EVM blockchain types
│   └── wallet.ts             # Wallet-related types
├── utils/                      # Utility functions
│   ├── menu.ts               # Menu utilities
│   ├── toast.ts              # Toast notification helpers
│   ├── utils.tsx             # General utilities
│   └── web3.ts               # Web3 utility functions
├── main.tsx                    # Application entry point
├── reportWebVitals.ts         # Performance monitoring
├── routeTree.gen.ts           # Auto-generated route tree
└── styles.css                 # Global styles and CSS variables
```

## Core Components

### Dashboard Components

#### **CreatePartnershipComponent**
Handles the creation and management of partnership accounts within the MoneyFi ecosystem, including automated account setup and partnership initialization.

#### **DepositComponent**
- **Multi-token support**: Deposit both USDC and USDT
- **Smart account management**: Automatically creates user accounts and initializes wallet accounts if needed
- **Multi-step process**: User creation → Account initialization → Token deposit
- **Real-time feedback**: Shows current step progress and detailed error handling
- **Transaction tracking**: Links to Aptos Explorer for transaction verification

#### **WithdrawComponent**
Manages withdrawal of all deposited funds from MoneyFi strategies with comprehensive transaction tracking and error handling.

#### **CheckWalletAccount**
Verifies wallet account status and provides visual feedback on account readiness for MoneyFi operations.

#### **WalletButton**
Displays wallet connection status with user address and provides dropdown menu for address copying and wallet disconnection.

#### **WalletConnectModal**
Modal interface for selecting and connecting to supported Aptos wallets (Petra, OKX, Nightly, Pontem) with deep link support and installation guidance.

### Statistics Dashboard

#### **Stats Component**
Comprehensive portfolio analytics dashboard featuring 8 key metrics:
- **Total Portfolio Value**: Complete portfolio worth
- **Idle Assets**: Non-monetized asset value
- **Total Deposited**: Cumulative deposit amount
- **Cumulative Profits**: Total earnings from strategies
- **Monetized Balance**: Currently active strategy balance
- **Pending Earnings**: Accrued but not yet claimed profits
- **Total Withdrawn**: Historical withdrawal amounts
- **Average APR**: Portfolio performance percentage

### Theme System

#### **ThemeProvider**
- **Material Design 3**: Complete implementation with light/dark modes
- **System Integration**: Automatic system preference detection
- **CSS Variables**: Dynamic theme switching with CSS custom properties
- **Persistent Storage**: Theme preference saved to localStorage
- **Component Integration**: Theme-aware color system for all components

### Layout Components

#### **Header**
Application navigation header with theme toggle and wallet connection status.

#### **Layout**
Main layout wrapper providing consistent structure and theme integration across all pages.

## Development Scripts

```bash
# Development
pnpm dev                    # Start development server on port 3000
pnpm build                  # Production build with TypeScript compilation
pnpm build:dev              # Development build with source maps
pnpm serve                  # Preview production build

# Code Quality
pnpm lint                   # Run ESLint with auto-fix
pnpm prettier              # Check Prettier formatting
pnpm prettier:fix          # Fix Prettier formatting issues
pnpm check-types           # TypeScript type checking
pnpm pre-commit            # Run all quality checks (lint + prettier + types)

# Testing
pnpm test                  # Run Vitest test suite

# Route Management
pnpm generate-routes       # Generate TanStack Router route tree
pnpm watch-routes          # Watch for route changes in development

# API Code Generation
pnpm generate              # Generate API client code using Orval

# Cloudflare Integration
pnpm cf-typegen            # Generate Cloudflare environment types
pnpm wrangler-deploy       # Deploy to Cloudflare Pages
```

## Building for Production

```bash
pnpm build
```

This will create an optimized production build in the `dist/` directory with:
- **Automatic code splitting** via TanStack Router for optimal loading performance
- **Manual chunk separation** for the `aptosmoneyfimockupupgrade` package
- **TypeScript compilation** with strict type checking
- **Tailwind CSS v4 optimization** with Vite integration
- **Asset optimization** and **tree shaking** for minimal bundle size
- **Source maps** (in development builds) for debugging support

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
