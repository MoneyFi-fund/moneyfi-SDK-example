# MoneyFi SDK

A modern DeFi application SDK that enables users to interact with the MoneyFi protocol on the Aptos blockchain. MoneyFi is a DeFAI platform that helps non-DeFi users monetize stablecoins across protocols and blockchains through fully automated, AI-powered strategies.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Transaction Flow Documentation](#transaction-flow-documentation)
  - [Account Initialization Flow Deep Dive](#account-initialization-flow-deep-dive)
    - [Direct Transaction Initialization Architecture](#direct-transaction-initialization-architecture)
    - [Account Initialization Process Flow](#account-initialization-process-flow)
    - [1. Authentication and Validation Phase](#1-authentication-and-validation-phase)
    - [2. SDK Initialization Request](#2-sdk-initialization-request)
    - [3. Transaction Data Processing and Validation](#3-transaction-data-processing-and-validation)
    - [4. Direct Transaction Execution](#4-direct-transaction-execution)
    - [Error Handling and Cache Management](#error-handling-and-cache-management)
    - [Key Differences from Deposit Flow](#key-differences-from-deposit-flow)
  - [Deposit Flow Deep Dive](#deposit-flow-deep-dive)
    - [Multi-Step Deposit Workflow Architecture](#multi-step-deposit-workflow-architecture)
    - [Workflow Execution Sequence](#workflow-execution-sequence)
    - [1. User Input Validation](#1-user-input-validation)
    - [2. Creating User Phase](#2-creating-user-phase)
    - [3. Smart Account Management System](#3-smart-account-management-system)
    - [4. Deposit Execution Phase](#4-deposit-execution-phase)
    - [Error Handling and Recovery Mechanisms](#error-handling-and-recovery-mechanisms)
  - [Withdraw Component Deep Dive](#withdraw-component-deep-dive)
    - [Signature-Based Withdrawal Architecture](#signature-based-withdrawal-architecture)
    - [Withdrawal Process Flow](#withdrawal-process-flow)
    - [1. Portfolio Validation System](#1-portfolio-validation-system)
    - [2. Message Construction and Serialization](#2-message-construction-and-serialization)
    - [3. Multi-Signature Support System](#3-multi-signature-support-system)
    - [4. Asynchronous Status Polling](#4-asynchronous-status-polling)
    - [Dynamic UI Feedback](#dynamic-ui-feedback)
  - [Statistics Flow Deep Dive](#statistics-flow-deep-dive)
    - [Portfolio Analytics Architecture](#portfolio-analytics-architecture)
    - [Statistics Configuration System](#statistics-configuration-system)
    - [Data Formatting Utilities](#data-formatting-utilities)
    - [Statistics Refresh Flow](#statistics-refresh-flow)
    - [Real-Time Statistics Display](#real-time-statistics-display)
    - [Loading and Error States](#loading-and-error-states)
    - [Manual Refresh Functionality](#manual-refresh-functionality)
- [Hook Architecture Documentation](#hook-architecture-documentation)
  - [useDelayedBalanceRefetch Pattern](#usedelayedbalancerefetch-pattern)
  - [useGetTxInitializationAccountMutation Implementation](#usegettxinitializationaccountmutation-implementation)
  - [useDepositMutation Implementation](#usedepositmutation-implementation)
  - [useWithdrawMutation Implementation](#usewithdrawmutation-implementation)
  - [useGetUserStatisticsQuery Implementation](#usegetuserstatisticsquery-implementation)
- [SDK Integration Patterns](#sdk-integration-patterns)
  - [MoneyFi SDK Instantiation](#moneyfi-sdk-instantiation)
  - [Transaction Lifecycle Patterns](#transaction-lifecycle-patterns)
    - [1. Deposit Transaction Flow](#1-deposit-transaction-flow)
    - [2. Withdrawal Transaction Flow](#2-withdrawal-transaction-flow)
  - [Query Management and Caching Strategy](#query-management-and-caching-strategy)
    - [Query Key Patterns](#query-key-patterns)
    - [Cache Invalidation Strategy](#cache-invalidation-strategy)
  - [Error Handling Patterns](#error-handling-patterns)
    - [Centralized Error Management](#centralized-error-management)
    - [User-Friendly Error Messages](#user-friendly-error-messages)
  - [Performance Optimization Patterns](#performance-optimization-patterns)
    - [Optimistic Updates](#optimistic-updates)
    - [Memory Management](#memory-management)
  - [Development Best Practices](#development-best-practices)
    - [Type Safety](#type-safety)
    - [Configuration Management](#configuration-management)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Multi-Wallet Support**: Connect with popular Aptos wallets (Petra, OKX, Nightly, Pontem)
- **Multi-Token Support**: Deposit and withdraw both USDC and USDT seamlessly
- **Account Management**: Automated user account creation
- **Real-time Statistics**: Comprehensive portfolio analytics with 9 key metrics including referral rewards
- **Dark/Light Theme**: Material Design 3 theming with automatic system preference detection
- **Transaction Monitoring**: Track transaction hashes with direct links to Aptos Explorer
- **Responsive Design**: Mobile-first interface built with modern UI components
- **Type-safe Development**: Full TypeScript support with comprehensive type definitions

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

### Withdrawing Funds

1. Locate the **"Withdraw Funds"** card on the dashboard
2. **Select token type** from the dropdown (USDC or USDT)
3. **Enter withdrawal amount** or click **"MAX"** to withdraw your total portfolio value
4. **Click "Withdraw"** - the system will:
   - Create a signed withdrawal message
   - Submit the withdrawal request to MoneyFi
   - Poll for withdrawal approval status
   - Automatically fetch real-time token balances and adjust the withdrawal amount if needed (based on available token liquidity)
   - Execute the withdrawal transaction with the optimal amount
5. **Monitor progress** via the transaction hash link to Aptos Explorer

**Smart Amount Adjustment**: The system automatically adjusts your withdrawal amount if the selected token's available liquidity is less than your requested amount, ensuring successful withdrawals even when specific token balances are limited.

---

## Transaction Flow Documentation

The MoneyFi SDK implements a sophisticated three-layer transaction processing architecture designed for seamless DeFi operations on the Aptos blockchain:

1. **Presentation Layer**: React components (`src/modules/dashboard/components/transaction/`)
2. **Hook Layer**: Custom React hooks with TanStack Query integration (`src/hooks/`)
3. **SDK Layer**: MoneyFi TypeScript SDK integration (`@moneyfi/ts-sdk`)

### Transaction Flow Architecture Diagram

```mermaid
graph TD
    A[User Interface] --> B[React Components]
    B --> C[Custom Hooks]
    C --> D[MoneyFi SDK]
    D --> E[Aptos Blockchain]

    B1[DepositComponent] --> C1[useDepositMutation]
    B2[WithdrawComponent] --> C2[useWithdrawMutation]
    B3[StatsComponent] --> C3[useGetUserStatisticsQuery]

    C1 --> D1[getDepositTxPayload]
    C2 --> D2[reqWithdraw]
    C3 --> D3[getUserStatistic]

    D1 --> E1[Transaction Signing]
    D2 --> E2[Status Polling]
    D3 --> E3[Data Fetching]
```

### Account Initialization Flow Deep Dive

#### Direct Transaction Initialization Architecture

The `useGetTxInitializationAccountMutation` implements a streamlined approach to wallet account initialization, directly generating and executing initialization transactions without complex multi-agent signatures.

#### Account Initialization Process Flow

```mermaid
flowchart TD
    A[User Trigger] --> B[Authentication Check]
    B --> C[Address Validation]
    C --> D[SDK getInitializationWalletAccountTxPayload]
    D --> E{Response Type?}
    E -->|Transaction Data| F[Transaction Construction]
    E -->|Already Initialized| G[Return Existing Data]
    F --> H[Function Validation]
    H --> I[InputTransactionData Creation]
    I --> J[signAndSubmitTransaction]
    J --> K[Blockchain Submission]
    K --> L[Query Invalidation]
    L --> M[Success State]
    G --> M

    style A fill:#e1f5fe
    style D fill:#fff3e0
    style F fill:#fce4ec
    style J fill:#e8f5e8
    style M fill:#e8f5e8
```

#### 1. Authentication and Validation Phase

The initialization process begins with comprehensive authentication checks:

```typescript
// From use-create.tsx
export const useGetTxInitializationAccountMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();

  return useMutation({
    mutationFn: async ({ address }: { address: string }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }
      // Process continues...
    },
  });
};
```

#### 2. SDK Initialization Request

The system requests initialization data from the MoneyFi SDK:

```typescript
// From use-create.tsx - SDK initialization call
const initializationData =
  await moneyFiAptos.getInitializationWalletAccountTxPayload({
    user_address: { Aptos: address },
  });
```

#### 3. Transaction Data Processing and Validation

The mutation intelligently handles different response types and validates transaction structure:

```typescript
// From use-create.tsx - Transaction data validation
if (
  initializationData &&
  typeof initializationData === "object" &&
  "function" in initializationData
) {
  const transaction: InputTransactionData = {
    data: {
      function:
        initializationData.function as `${string}::${string}::${string}`,
      functionArguments: initializationData.functionArguments || [],
    },
  };

  const response = await signAndSubmitTransaction(transaction);
  return response;
}

return initializationData;
```

#### 4. Direct Transaction Execution

Unlike the deposit flow's multi-agent approach, initialization uses direct transaction submission:

```typescript
// From use-create.tsx - Direct transaction execution
const response = await signAndSubmitTransaction(transaction);
```

#### Error Handling and Cache Management

The initialization flow implements comprehensive error handling and cache invalidation:

```typescript
// From use-create.tsx - Error handling and cache management
onSuccess: (data, variables) => {
  queryClient.invalidateQueries({
    queryKey: createQueryKeys.initialization(variables.address),
  });
},
onError: (error) => {
  console.error("Account initialization failed:", error);
},
retry: false,
```

#### Key Differences from Deposit Flow

1. **Single-Step Process**: No multi-phase state management required
2. **Direct Execution**: No multi-agent transaction complexity
3. **Simplified Payload**: Uses Aptos wallet's `signAndSubmitTransaction` directly
4. **Conditional Logic**: Handles both transaction and non-transaction responses

### Deposit Flow Deep Dive

#### Multi-Step Deposit Workflow Architecture

The `DepositComponent` implements a sophisticated state machine with four distinct phases:

```typescript
type DepositState =
  | "idle"
  | "creating-user"
  | "initializing-account"
  | "depositing";
```

#### Workflow Execution Sequence

```mermaid
flowchart TD
    A[User Input] --> B{Amount Valid?}
    B -->|No| A
    B -->|Yes| C[Creating User Phase]
    C --> D[useGetOrCreateUserMutation]
    D --> E{Has Wallet Account?}
    E -->|No| F[Initializing Account Phase]
    E -->|Yes| I[Depositing Phase]
    F --> G[checkOrCreateAptosAccount]
    G --> H[Multi-Agent Transaction]
    H --> I
    I --> J[useDepositMutation]
    J --> K[SDK Payload Generation]
    K --> L[Transaction Signing]
    L --> M[Blockchain Submission]
    M --> N[Query Invalidation]
    N --> O[Success State]

    style A fill:#e1f5fe
    style C fill:#fff3e0
    style F fill:#fce4ec
    style I fill:#e8f5e8
    style O fill:#e8f5e8
```

#### 1. User Input Validation

The deposit process begins with comprehensive input validation:

```typescript
// From deposit.tsx
const [amount, setAmount] = useState("");
const [selectedToken, setSelectedToken] = useState<"USDC" | "USDT">("USDC");

const tokenAddress =
  selectedToken === "USDC" ? APTOS_ADDRESS.USDC : APTOS_ADDRESS.USDT;

// Validation in handleDeposit
const handleDeposit = async () => {
  if (!amount || !user?.address) {
    return;
  }
  // Process continues...
};
```

#### 2. Creating User Phase

The system automatically creates a MoneyFi user account if it doesn't exist:

```typescript
// From deposit.tsx
setCurrentStep("creating-user");
await new Promise<any>((resolve, reject) => {
  createUserMutation.mutate(
    {
      address: user.address,
      refBy: undefined,
    },
    {
      onSuccess: async (data) => {
        // Invalidate user-related queries after successful user creation
        await queryClient.invalidateQueries({
          queryKey: ["user", user.address],
        });
        await queryClient.invalidateQueries({
          queryKey: ["userProfile"],
        });
        resolve(data);
      },
      onError: (error) => {
        reject(error);
      },
    }
  );
});
```

#### 3. Smart Account Management System

The most sophisticated part of the deposit flow is the multi-agent transaction system for account initialization:

```typescript
// From deposit.tsx - Multi-agent transaction construction
const checkOrCreateAptosAccount = async () => {
  if (!user?.address || !aptosAccount?.address) {
    throw new Error("User address or Aptos account not available");
  }

  try {
    const data = await new Promise<any>((resolve, reject) => {
      initAccountMutation.mutate(
        { address: user.address },
        {
          onSuccess: (data) => {
            resolve(data);
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });

    const signed_tx =
      typeof data === "object" && data?.signed_tx ? data.signed_tx : null;
    if (!signed_tx) {
      throw new Error("No signed transaction returned from initialization");
    }

    const txBytes = new Uint8Array(
      atob(signed_tx)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const de = new Deserializer(txBytes);
    const tx = SignedTransaction.deserialize(de);
    const operatorAuth = (
      tx.authenticator as TransactionAuthenticatorMultiAgent
    ).sender.bcsToBytes();
    const operatorAddress = new AccountAddress(
      new Uint8Array(
        APTOS_CONFIG.OPERATOR_ADDRESS.match(/.{1,2}/g)?.map((byte) =>
          parseInt(byte, 16)
        ) || []
      )
    );
    const multiAgentTx = new MultiAgentTransaction(tx.raw_txn, [
      operatorAddress,
    ]);

    const feepayerAuthenticator = await aptosSignTransaction({
      transactionOrPayload: multiAgentTx,
    });

    const submitTx = await aptosSubmitTransaction({
      transaction: multiAgentTx,
      senderAuthenticator: feepayerAuthenticator.authenticator,
      additionalSignersAuthenticators: [
        AccountAuthenticator.deserialize(new Deserializer(operatorAuth)),
      ],
    });
  } catch (error) {
    console.error("Account initialization failed:", error);
    throw error;
  }
};
```

#### 4. Deposit Execution Phase

The final phase uses the MoneyFi SDK to generate and submit the deposit transaction:

```typescript
// From deposit.tsx
setCurrentStep("depositing");
await depositMutation.mutate(
  { amount, tokenAddress },
  {
    onSuccess: async (data) => {
      // Comprehensive query invalidation strategy
      queryClient.invalidateQueries({
        queryKey: moneyFiQueryKeys.balance(user.address),
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions", user.address],
      });
      queryClient.invalidateQueries({
        queryKey: statsQueryKeys.user(user.address),
      });

      setAmount("");
      setSuccessData({ hash: data.hash });
      setCurrentStep("idle");
    },
  }
);
```

#### Error Handling and Recovery Mechanisms

The deposit flow implements comprehensive error handling:

- **Atomic Operations**: Each step completes entirely or rolls back completely
- **State Consistency**: UI state automatically synchronizes with transaction state
- **User Feedback**: Real-time progress indicators with specific error messages
- **Retry Capability**: Users can restart the process without data corruption

```typescript
// From deposit.tsx - Comprehensive error handling
{
  (stepError ||
    depositMutation.isError ||
    createUserMutation.isError ||
    initAccountMutation.isError) && (
    <Alert.Root status="error">
      <Alert.Description>
        <Text color="error.800">
          {stepError ||
            (depositMutation.error instanceof Error
              ? depositMutation.error.message
              : "Deposit failed")}
        </Text>
      </Alert.Description>
    </Alert.Root>
  );
}
```

### Withdraw Component Deep Dive

#### Signature-Based Withdrawal Architecture

The `WithdrawComponent` implements a sophisticated cryptographic signature system supporting both Ed25519 and Keyless signature schemes.

#### Withdrawal Process Flow

```mermaid
flowchart TD
    A[User Input] --> B[Portfolio Validation]
    B --> C[Amount Validation]
    C --> D[Message Construction]
    D --> E[Signature Creation]
    E --> F{Signature Type?}
    F -->|Ed25519| G[Ed25519 Signature]
    F -->|Keyless| H[Keyless Signature]
    G --> I[Payload Transformation]
    H --> I
    I --> J[SDK reqWithdraw]
    J --> K[Status Polling Loop]
    K --> L{Status Done?}
    L -->|No| M[Wait 3s]
    M --> K
    L -->|Yes| N[Transaction Payload Generation]
    N --> O[Transaction Signing]
    O --> P[Blockchain Submission]
    P --> Q[Success State]

    style A fill:#e1f5fe
    style D fill:#fff3e0
    style F fill:#fce4ec
    style K fill:#ffeb3b
    style Q fill:#e8f5e8
```

#### 1. Portfolio Validation System

The withdraw component uses `userStats.total_value` as the maximum withdrawable amount, providing users with a clear understanding of their total portfolio value:

```typescript
// From withdraw.tsx - Portfolio validation using userStats
const { data: userStats } = useGetUserStatisticsQuery(user?.address);

// Get wallet amount for display only
const { data: walletAmountData } = useGetWalletAmountQuery(user?.address || null);

// Validation logic - use userStats.total_value as max withdraw amount
const maxWithdrawAmount = Number(userStats?.total_value || 0);
const currentAmount = amount ? parseFloat(amount) : 0;
const isAmountExceeded = currentAmount > maxWithdrawAmount;
const isAmountValid = currentAmount > 0 && !isAmountExceeded;

const handleMaxAmount = () => {
  if (maxWithdrawAmount > 0) {
    setAmount(maxWithdrawAmount.toString());
  }
};
```

**Key Design Decision**: The maximum withdrawal amount is derived from `userStats.total_value` rather than individual token balances. This ensures users can withdraw up to their total portfolio value, with the backend automatically adjusting the actual withdrawal amount based on available token liquidity.

#### 2. Message Construction and Serialization

Withdrawal messages are constructed with deterministic serialization:

```typescript
// From withdraw.tsx - Message construction
const amountNum = parseFloat(amount.toString());
const nonce = Math.random().toString(36).substring(2, 15);

const message = {
  amount: amountNum,
  target_chain_id: -1, // Aptos mainnet identifier
  token_address:
    selectedToken === "USDC" ? APTOS_ADDRESS.USDC : APTOS_ADDRESS.USDT,
};

const messageSerialized = JSON.stringify(message);
const withdrawSignature = await aptosSignMessage({
  message: messageSerialized,
  nonce,
});
```

#### 3. Multi-Signature Support System

The component automatically detects and handles different signature types:

```typescript
// From withdraw.tsx - Multi-signature support
const isWalletFromEd25519 = isEd25519(aptosAccount?.publicKey.toString());

if (!isWalletFromEd25519) {
  // Keyless signature construction
  const encodedKeylessPubkey = new KeylessPublicKey(
    (aptosAccount?.publicKey as any).publicKey.iss,
    (aptosAccount?.publicKey as any).publicKey.idCommitment
  );

  const encodedKeylessSignature = new KeylessSignature({
    ...(withdrawSignature.signature as any).signature,
  });

  payload = {
    encoded_signature: encodedKeylessSignature.toString(),
    encoded_pubkey: encodedKeylessPubkey.toString(),
    full_message: withdrawSignature.fullMessage.toString(),
  };
} else {
  // Ed25519 signature construction
  payload = {
    encoded_signature: withdrawSignature.signature.toString(),
    encoded_pubkey: aptosAccount.publicKey.toString(),
    full_message: withdrawSignature.fullMessage.toString(),
  };
}
```

#### 4. Asynchronous Status Polling with Dynamic Amount Adjustment

The withdrawal process implements sophisticated status polling with automatic liquidity-based amount adjustment:

```typescript
// From use-moneyfi-queries.ts - Status polling with dynamic amount adjustment
const pollWithdrawStatus = async (): Promise<any> => {
  while (true) {
    const statusResponse = await moneyFiAptos.getWithdrawStatus(user.address);

    if (
      (statusResponse as any) === "done" ||
      (statusResponse as any)?.status === "done"
    ) {
      // Fetch wallet amount to check withdraw_amount
      const walletAmountResponse = await moneyFiAptos.getWalletAccountAssets({
        sender: user.address,
      });

      // Find the matching token by comparing token_address
      const targetAddress = tokenAddress.replace("0x", "");
      const matchedToken = (walletAmountResponse as any)?.data?.find(
        (token: { token_address: string; withdraw_amount: string }) =>
          token.token_address === targetAddress
      );

      // Determine the actual amount to withdraw
      let actualAmount = amount;
      if (matchedToken) {
        const withdrawAmountBigInt = BigInt(matchedToken.withdraw_amount);
        const requestedAmountBigInt = BigInt(amount.toString());
        // If withdraw_amount is smaller than requested amount, use withdraw_amount
        if (withdrawAmountBigInt < requestedAmountBigInt) {
          actualAmount = withdrawAmountBigInt as any;
        }
      }

      const txPayload = await moneyFiAptos.getWithdrawTxPayload({
        sender: user.address,
        chain_id: -1,
        token_address: tokenAddress,
        amount: actualAmount as bigint,
      });

      return { txPayload };
    }

    // 3-second polling interval for optimal balance between responsiveness and API load
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
};
```

**Dynamic Amount Adjustment Logic**: After the withdrawal request is approved (status returns "done"), the system:
1. Fetches the current wallet account assets via `getWalletAccountAssets()`
2. Matches the selected token by comparing `token_address`
3. Extracts the `withdraw_amount` for the matched token
4. Compares the `withdraw_amount` with the user's requested amount
5. If `withdraw_amount` is smaller (indicating limited token liquidity), it uses the `withdraw_amount` instead
6. Proceeds with the transaction using the adjusted amount

This ensures that withdrawals never fail due to insufficient token-specific liquidity, even when the user's total portfolio value is higher than the available amount for a specific token.

#### Dynamic UI Feedback

The withdrawal interface provides comprehensive user feedback:

```typescript
// From withdraw.tsx - Dynamic validation UI
<Input
  type="number"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  borderColor={isAmountExceeded ? "error.500" : cardColors.border}
  _focus={{
    borderColor: isAmountExceeded ? "error.500" : "primary.500",
    boxShadow: isAmountExceeded
      ? `0 0 0 2px error.200`
      : `0 0 0 2px primary.200`,
  }}
/>;
{
  isAmountExceeded && (
    <Text color="error.600">
      Amount cannot exceed your total portfolio value of $
      {maxWithdrawAmount.toLocaleString()}
    </Text>
  );
}
```

### Statistics Flow Deep Dive

#### Portfolio Analytics Architecture

The `StatsComponent` provides comprehensive portfolio analytics with 9 key metrics including referral balance, implementing a sophisticated data presentation system with real-time refresh capabilities.

#### Statistics Configuration System

The component uses a configuration-driven approach for displaying metrics:

```typescript
// From stats.tsx - Statistics configuration
const statsConfig = [
  {
    key: "total_value",
    label: "Total Portfolio Value",
    icon: BiDollar,
    formatter: formatCurrency,
    color: "success.600",
    bgColor: "success.50",
    borderColor: "success.200",
  },
  {
    key: "idle_asset_value",
    label: "Idle Assets",
    icon: BiWallet,
    formatter: formatCurrency,
    color: "neutral.600",
    bgColor: "neutral.50",
    borderColor: "neutral.200",
  },
  {
    key: "total_deposited_liquidity",
    label: "Total Deposited",
    icon: BiDownArrowCircle,
    formatter: formatCurrency,
    color: "primary.600",
    bgColor: "primary.50",
    borderColor: "primary.200",
  },
  {
    key: "cumulative_yield_profits",
    label: "Cumulative Profits",
    icon: BiTrendingUp,
    formatter: formatCurrency,
    color: "success.700",
    bgColor: "success.50",
    borderColor: "success.200",
  },
  {
    key: "total_monetized_balance",
    label: "Monetized Balance",
    icon: BiTargetLock,
    formatter: formatCurrency,
    color: "secondary.600",
    bgColor: "secondary.50",
    borderColor: "secondary.200",
  },
  {
    key: "pending_yield_earnings",
    label: "Pending Earnings",
    icon: BiAward,
    formatter: formatCurrency,
    color: "warning.600",
    bgColor: "warning.50",
    borderColor: "warning.200",
  },
  {
    key: "total_withdrawn_liquidity",
    label: "Total Withdrawn",
    icon: BiUpArrowCircle,
    formatter: formatCurrency,
    color: "error.600",
    bgColor: "error.50",
    borderColor: "error.200",
  },
  {
    key: "apr_avg",
    label: "Average APR",
    icon: RiPercentLine,
    formatter: formatPercentage,
    color: "tertiary.600",
    bgColor: "tertiary.50",
    borderColor: "tertiary.200",
  },
  {
    key: "referral_balance",
    label: "Referral Balance",
    icon: BiDollarCircle,
    formatter: formatCurrency,
    color: "black",
    bgColor: "gray.100",
    borderColor: "black",
  },
];
```

#### Data Formatting Utilities

The component implements utility functions for consistent data presentation:

```typescript
// From stats.tsx - Utility functions
const formatCurrency = (value: number): string => {
  if (value === 0) return "$0.00";
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
```

#### Statistics Refresh Flow

```mermaid
flowchart TD
    A[User Clicks Refresh] --> B[getUserStatsQuery.refetch]
    B --> C[Loading State]
    C --> D[MoneyFi SDK Call]
    D --> E[getUserStatistic API]
    E --> F{Response Success?}
    F -->|Yes| G[Update Statistics Grid]
    F -->|No| H[Error State Display]
    G --> I[Reset Loading State]
    H --> J[Retry Option]
    J --> B

    style A fill:#e1f5fe
    style C fill:#fff3e0
    style G fill:#e8f5e8
    style H fill:#ffcdd2
```

#### Real-Time Statistics Display

The component renders statistics using a responsive grid system:

```typescript
// From stats.tsx - Statistics grid rendering
{
  getUserStatsQuery.isSuccess && getUserStatsQuery.data && (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={4}>
      {statsConfig.map((stat) => {
        const IconComponent = stat.icon;
        const value =
          getUserStatsQuery.data[
            stat.key as keyof typeof getUserStatsQuery.data
          ] || 0;
        const formattedValue = stat.formatter(Number(value));

        return (
          <Card.Root
            key={stat.key}
            bg={cardColors.background}
            border="1px solid"
            borderColor={stat.borderColor}
            borderRadius={materialDesign3Theme.borderRadius.md}
            p={6}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              boxShadow: materialDesign3Theme.elevation.level2,
              transform: "translateY(-2px)",
            }}
          >
            {/* Card content with icon, label, and formatted value */}
          </Card.Root>
        );
      })}
    </SimpleGrid>
  );
}
```

#### Loading and Error States

The statistics component implements comprehensive state management:

```typescript
// From stats.tsx - Loading state
{
  getUserStatsQuery.isPending && (
    <Box display="flex" flexDirection="column" alignItems="center" p={8}>
      <Spinner size="xl" color="primary.500" borderWidth="4px" />
      <Text mt={4} color={cardColors.textSecondary}>
        Loading your statistics...
      </Text>
    </Box>
  );
}

// Error state with retry functionality
{
  getUserStatsQuery.isError && (
    <Alert.Root status="error">
      <Alert.Description>
        <VStack align="stretch" gap={3}>
          <Text color="error.800" fontWeight="medium">
            Failed to load statistics
          </Text>
          <Text color="error.700" fontSize="sm">
            {getUserStatsQuery.error instanceof Error
              ? getUserStatsQuery.error.message
              : "An unknown error occurred while fetching your portfolio statistics."}
          </Text>
          <Button
            onClick={handleRefreshStats}
            size="sm"
            colorScheme="error"
            variant="outline"
          >
            Try Again
          </Button>
        </VStack>
      </Alert.Description>
    </Alert.Root>
  );
}
```

#### Manual Refresh Functionality

Users can manually refresh their statistics with instant feedback:

```typescript
// From stats.tsx - Manual refresh implementation
const handleRefreshStats = () => {
  getUserStatsQuery.refetch();
};

<Button
  onClick={handleRefreshStats}
  loading={getUserStatsQuery.isFetching}
  disabled={getUserStatsQuery.isFetching}
>
  {getUserStatsQuery.isFetching ? "Refreshing..." : "Refresh Statistics"}
</Button>;
```

---

## Hook Architecture Documentation

The MoneyFi SDK implements a sophisticated hook-based architecture using TanStack Query for optimal state management, caching, and synchronization with the Aptos blockchain.

### useDelayedBalanceRefetch Pattern

A core architectural pattern that implements optimistic updates with blockchain confirmation:

```typescript
// From use-moneyfi-queries.ts - Delayed refetch configuration
export const BALANCE_REFETCH_CONFIG = {
  immediate: 0, // Immediate optimistic refetch
  delayed: 4000, // 4 seconds delayed refetch for blockchain confirmation
  staleTime: 30_000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
} as const;

export const useDelayedBalanceRefetch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerDelayedRefetch = useCallback(
    async (
      options: { immediate?: boolean; delayed?: boolean } = {
        immediate: true,
        delayed: true,
      }
    ) => {
      const queryKey = moneyFiQueryKeys.balance(user?.address);

      // Clear any existing timeout to prevent multiple delayed refetches
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      try {
        // Immediate optimistic refetch
        if (options.immediate) {
          await queryClient.refetchQueries({
            queryKey,
            type: "active",
          });
        }

        // Schedule delayed refetch for blockchain confirmation
        if (options.delayed) {
          timeoutRef.current = setTimeout(async () => {
            try {
              await queryClient.refetchQueries({
                queryKey,
                type: "active",
              });
            } catch (error) {
              console.error("Delayed balance refetch failed:", error);
            } finally {
              timeoutRef.current = null;
            }
          }, BALANCE_REFETCH_CONFIG.delayed);
        }
      } catch (error) {
        console.error("Immediate balance refetch failed:", error);
      }
    },
    [queryClient, user?.address]
  );

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { triggerDelayedRefetch, cleanup };
};
```

### useGetTxInitializationAccountMutation Implementation

Streamlined mutation hook for direct wallet account initialization:

```typescript
// From use-create.tsx - Account initialization mutation
export const useGetTxInitializationAccountMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  return useMutation({
    mutationFn: async ({ address }: { address: string }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const initializationData =
          await moneyFiAptos.getInitializationWalletAccountTxPayload({
            user_address: { Aptos: address },
          });
        if (
          initializationData &&
          typeof initializationData === "object" &&
          "function" in initializationData
        ) {
          const transaction: InputTransactionData = {
            data: {
              function:
                initializationData.function as `${string}::${string}::${string}`,
              functionArguments: initializationData.functionArguments || [],
            },
          };

          const response = await signAndSubmitTransaction(transaction);
          return response;
        }

        return initializationData;
      } catch (error) {
        console.error("Error initializing account:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: createQueryKeys.initialization(variables.address),
      });
    },
    onError: (error) => {
      console.error("Account initialization failed:", error);
    },
    retry: false,
  });
};
```

### useDepositMutation Implementation

Advanced mutation hook with sophisticated transaction processing:

```typescript
// From use-moneyfi-queries.ts - Deposit mutation implementation
export const useDepositMutation = ({
  tokenAddress,
  sender: userAddress,
  amount,
}: DepositMutationParams) => {
  const { isAuthenticated, user } = useAuth();
  const { signTransaction, submitTransaction } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetch();

  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return useMutation({
    mutationFn: async ({
      amount,
      tokenAddress,
    }: {
      amount: string;
      tokenAddress: string;
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const amountInSmallestUnit = BigInt(
        Math.floor(Number(amount) * 1_000_000)
      );

      // SDK payload generation
      const payload = await moneyFiAptos.getDepositTxPayload({
        sender: userAddress,
        chain_id: -1,
        token_address: tokenAddress,
        amount: amountInSmallestUnit,
      });

      // Base64 decoding with manual byte conversion
      const binaryString = atob(payload.tx);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Transaction deserialization and execution
      const de = new Deserializer(bytes);
      const depositTx = RawTransaction.deserialize(de);
      const depoistTxSimple = new SimpleTransaction(depositTx);

      const submitTx = await signTransaction({
        transactionOrPayload: depoistTxSimple,
      });

      const rst = await submitTransaction({
        transaction: depoistTxSimple,
        senderAuthenticator: submitTx.authenticator,
      });

      return rst;
    },

    onSuccess: async (data) => {
      await triggerDelayedRefetch({
        immediate: true,
        delayed: true,
      });
    },

    onError: (error) => {
      console.error("Deposit transaction failed:", error);
      cleanup();
    },

    retry: false,
  });
};
```

### useWithdrawMutation Implementation

Sophisticated withdrawal mutation with status polling and dynamic amount adjustment:

```typescript
// From use-moneyfi-queries.ts - Withdraw mutation with polling and amount adjustment
export const useWithdrawMutation = (tokenAddress: string, amount: BigInt) => {
  const { isAuthenticated, user } = useAuth();
  const { account: aptosAccount } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetch();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
  const { signTransaction, submitTransaction } = useWallet();

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return useMutation({
    mutationFn: async ({
      address,
      payload,
    }: {
      address: string;
      payload: {
        encoded_signature: string;
        encoded_pubkey: string;
        full_message: string;
      };
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!aptosAccount) {
        throw new Error("Wallet account not connected");
      }

      // Transform the payload to match ReqWithdrawPayload structure
      const transformedPayload = {
        signature: payload.encoded_signature,
        pubkey: payload.encoded_pubkey,
        message: payload.full_message,
      };
      await moneyFiAptos.reqWithdraw(
        address,
        transformedPayload
      );

      // Poll for withdraw status until it's done
      const pollWithdrawStatus = async (): Promise<any> => {
        while (true) {
          const statusResponse = await moneyFiAptos.getWithdrawStatus(
            user.address
          );

          if (
            (statusResponse as any) === "done" ||
            (statusResponse as any)?.status === "done"
          ) {
            // Fetch wallet amount to check withdraw_amount
            const walletAmountResponse = await moneyFiAptos.getWalletAccountAssets({
              sender: user.address,
            });

            // Find the matching token by comparing token_address
            const targetAddress = tokenAddress.replace("0x", "");
            const matchedToken = (walletAmountResponse as any)?.data?.find(
              (token: { token_address: string; withdraw_amount: string }) =>
                token.token_address === targetAddress
            );

            // Determine the actual amount to withdraw
            let actualAmount = amount;
            if (matchedToken) {
              const withdrawAmountBigInt = BigInt(matchedToken.withdraw_amount);
              const requestedAmountBigInt = BigInt(amount.toString());
              // If withdraw_amount is smaller than requested amount, use withdraw_amount
              if (withdrawAmountBigInt < requestedAmountBigInt) {
                actualAmount = withdrawAmountBigInt as any;
              }
            }

            const txPayload = await moneyFiAptos.getWithdrawTxPayload({
              sender: user.address,
              chain_id: -1,
              token_address: tokenAddress,
              amount: actualAmount as bigint,
            });

            return { txPayload };
          }

          // Wait 3 seconds before checking again
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      };

      return await pollWithdrawStatus();
    },
    onSuccess: async (data) => {
      const { txPayload } = data;

      // Decode base64 string to bytes
      const binaryString = atob(txPayload.tx);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const de = new Deserializer(bytes);
      const withdrawTx = RawTransaction.deserialize(de);
      const withdrawTxSimple = new SimpleTransaction(withdrawTx);

      const submitTx = await signTransaction({
        transactionOrPayload: withdrawTxSimple,
      });
      const rst = await submitTransaction({
        transaction: withdrawTxSimple,
        senderAuthenticator: submitTx.authenticator,
      });

      await triggerDelayedRefetch({
        immediate: true,
        delayed: true,
      });

      return rst;
    },
    onError: (error) => {
      console.error("Withdraw transaction failed:", error);
      cleanup();
    },
    retry: false, // Don't retry mutations automatically
  });
};
```

**Key Enhancement**: The mutation now includes a liquidity-aware amount adjustment mechanism within the polling loop. After the withdrawal request is approved, the system fetches real-time token balances and automatically adjusts the withdrawal amount if the available token liquidity (`withdraw_amount`) is less than the requested amount. This prevents transaction failures due to token-specific liquidity constraints while still allowing users to withdraw up to their total portfolio value.

### useGetUserStatisticsQuery Implementation

Optimized query hook for portfolio statistics:

```typescript
// From use-stats.ts - Statistics query implementation
export const statsQueryKeys = {
  all: ["stats"] as const,
  user: (address?: string) => [...statsQueryKeys.all, "user", address] as const,
};

export const useGetUserStatisticsQuery = (address?: string) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  return useQuery({
    queryKey: statsQueryKeys.user(address),
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const stats = await moneyFiAptos.getUserStatistic({ address });
        return stats;
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        throw error;
      }
    },
    enabled: !!(isAuthenticated && user && address),
    staleTime: 60_000, // 60 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 10, // Aggressive retry for important user data
  });
};
```

---

## SDK Integration Patterns

### MoneyFi SDK Instantiation

The MoneyFi SDK is consistently instantiated across all hooks using the integration code from environment variables:

```typescript
// Standard SDK instantiation pattern used across all hooks
const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
```

**Note**: The SDK now uses `quy-ts-sdk` package (imported as `import { MoneyFi } from "quy-ts-sdk";`) instead of the previous `@moneyfi/ts-sdk` package.

### Transaction Lifecycle Patterns

#### 1. Deposit Transaction Flow

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant Hook as useDepositMutation
    participant SDK as MoneyFi SDK
    participant Wallet as Aptos Wallet
    participant Chain as Aptos Blockchain

    UI->>Hook: Trigger deposit
    Hook->>SDK: getDepositTxPayload()
    SDK-->>Hook: Base64 encoded transaction
    Hook->>Hook: Deserialize transaction bytes
    Hook->>Wallet: Sign transaction
    Wallet-->>Hook: Signed transaction
    Hook->>Wallet: Submit transaction
    Wallet->>Chain: Broadcast transaction
    Chain-->>Hook: Transaction hash
    Hook->>UI: Success with hash
```

#### 2. Withdrawal Transaction Flow

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant Hook as useWithdrawMutation
    participant SDK as MoneyFi SDK
    participant Wallet as Aptos Wallet
    participant Chain as Aptos Blockchain

    UI->>Hook: Trigger withdrawal (amount from userStats.total_value)
    Hook->>Wallet: Sign withdrawal message
    Wallet-->>Hook: Signed message + signature
    Hook->>SDK: reqWithdraw(signature)
    SDK-->>Hook: Request submitted

    loop Status Polling
        Hook->>SDK: getWithdrawStatus()
        SDK-->>Hook: Status response
        alt Status not "done"
            Hook->>Hook: Wait 3 seconds
        else Status is "done"
            Hook->>SDK: getWalletAccountAssets()
            SDK-->>Hook: Token balances with withdraw_amount
            Hook->>Hook: Compare withdraw_amount vs requested amount
            alt withdraw_amount < requested amount
                Hook->>Hook: Adjust to withdraw_amount (liquidity limit)
            else withdraw_amount >= requested amount
                Hook->>Hook: Use requested amount
            end
            Hook->>SDK: getWithdrawTxPayload(actualAmount)
            SDK-->>Hook: Transaction payload
        end
    end

    Hook->>Wallet: Sign final transaction
    Wallet-->>Hook: Signed transaction
    Hook->>Chain: Submit transaction
    Chain-->>Hook: Transaction hash
    Hook->>UI: Success with hash
```

**Enhanced Withdrawal Flow**: The updated flow includes dynamic amount adjustment based on real-time token liquidity. After the withdrawal request is approved, the system fetches wallet account assets to determine the actual withdrawable amount for the specific token. If the available `withdraw_amount` is less than the user's requested amount, the system automatically adjusts to the maximum available liquidity, ensuring smooth withdrawals without failures.

### Query Management and Caching Strategy

#### Query Key Patterns

The SDK implements a hierarchical query key system for optimal cache management:

```typescript
// From use-moneyfi-queries.ts
export const moneyFiQueryKeys = {
  all: ["moneyfi"] as const,
  balance: (address?: string) =>
    [...moneyFiQueryKeys.all, "balance", address] as const,
  balanceRefreshing: (address?: string) =>
    [...moneyFiQueryKeys.balance(address), "refreshing"] as const,
};

// From use-stats.ts
export const statsQueryKeys = {
  all: ["stats"] as const,
  user: (address?: string) => [...statsQueryKeys.all, "user", address] as const,
};
```

#### Cache Invalidation Strategy

The SDK implements strategic cache invalidation to maintain data consistency:

```typescript
// Comprehensive invalidation after successful deposit
await queryClient.invalidateQueries({
  queryKey: moneyFiQueryKeys.balance(user.address),
});
await queryClient.invalidateQueries({
  queryKey: ["transactions", user.address],
});
await queryClient.invalidateQueries({
  queryKey: statsQueryKeys.user(user.address),
});
```

### Error Handling Patterns

#### Centralized Error Management

All hooks implement consistent error handling patterns:

```typescript
// Standard error handling in mutations
onError: (error) => {
  console.error("Transaction failed:", error);
  cleanup();
},
retry: false, // Disable automatic retries for transactions

// Query error handling with retry logic
retry: 10, // Aggressive retry for data fetching
```

#### User-Friendly Error Messages

Errors are transformed into user-friendly messages:

```typescript
// From deposit.tsx - Error message transformation
{
  stepError ||
    (depositMutation.error instanceof Error
      ? depositMutation.error.message
      : depositMutation.isError
      ? "Deposit failed"
      : "An unknown error occurred");
}
```

### Performance Optimization Patterns

#### Optimistic Updates

The SDK implements optimistic updates for better user experience:

```typescript
// Immediate UI update followed by delayed blockchain confirmation
await triggerDelayedRefetch({
  immediate: true, // Instant UI feedback
  delayed: true, // Blockchain confirmation after 4 seconds
});
```

#### Memory Management

Proper cleanup patterns prevent memory leaks:

```typescript
// Cleanup pattern used in all mutation hooks
React.useEffect(() => {
  return cleanup;
}, [cleanup]);
```

### Development Best Practices

#### Type Safety

All hooks maintain strict TypeScript typing:

```typescript
interface DepositMutationParams {
  tokenAddress: string;
  sender: string;
  amount: BigInt;
}

type CreateWithdrawRequestPayload = {
  encoded_signature: string;
  encoded_pubkey: string;
  full_message: string;
};
```

#### Configuration Management

Consistent configuration patterns across the application:

```typescript
export const BALANCE_REFETCH_CONFIG = {
  immediate: 0,
  delayed: 4000,
  staleTime: 30_000,
  gcTime: 5 * 60 * 1000,
} as const;
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
