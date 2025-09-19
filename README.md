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
2. Click **"Withdraw All"** to initiate full withdrawal
3. **Confirm the transaction** in your wallet
4. **Monitor progress** via the transaction hash link to Aptos Explorer


## Transaction Component Architecture Deep Dive

### Multi-Layer Transaction Processing System

The MoneyFi SDK implements a sophisticated three-layer transaction processing architecture designed for seamless DeFi operations on the Aptos blockchain:

1. **Presentation Layer**: React components (`src/modules/dashboard/components/transaction/`)
2. **Hook Layer**: Custom React hooks with TanStack Query integration (`src/hooks/use-moneyfi-queries.ts`)
3. **SDK Layer**: MoneyFi TypeScript SDK integration (`moneyfi-ts-sdk`)

### Deposit Component Deep Dive

#### Multi-Step Deposit Workflow Architecture

The `DepositComponent` implements a sophisticated state machine with four distinct phases:

```typescript
type DepositState = "idle" | "creating-user" | "initializing-account" | "depositing";
```

##### Workflow Execution Sequence

```
1. User Input Validation
   ├── Amount validation (> 0, numeric)
   ├── Token selection (USDC/USDT)
   └── Wallet connection verification

2. Creating User Phase
   ├── Call useGetOrCreateUserMutation()
   ├── Create MoneyFi user account if non-existent
   ├── Query invalidation: ["user", userAddress], ["userProfile"]
   └── Automatic progression to account initialization

3. Initializing Account Phase (Conditional)
   ├── Check hasWalletAccount status
   ├── Execute checkOrCreateAptosAccount() if needed
   ├── Multi-agent transaction construction
   ├── Operator signature integration
   ├── Fee payer authentication
   └── Query invalidation: ["checkWalletAccount"], ["walletAccount", userAddress]

4. Depositing Phase
   ├── MoneyFi SDK transaction payload generation
   ├── Base64 payload decoding and deserialization
   ├── Transaction signing and submission
   ├── Optimistic UI updates
   └── Comprehensive query invalidation strategy
```

##### Smart Account Management System

The deposit component implements advanced multi-agent transaction support for account initialization:

```typescript
// Multi-agent transaction construction from signed transaction
const txBytes = new Uint8Array(atob(signed_tx).split("").map((c) => c.charCodeAt(0)));
const de = new Deserializer(txBytes);
const tx = SignedTransaction.deserialize(de);

// Extract operator authentication
const operatorAuth = (tx.authenticator as TransactionAuthenticatorMultiAgent).sender.bcsToBytes();

// Construct multi-agent transaction with operator
const multiAgentTx = new MultiAgentTransaction(tx.raw_txn, [operatorAddress]);

// Dual signature collection: User + Operator
const feepayerAuthenticator = await aptosSignTransaction({
  transactionOrPayload: multiAgentTx,
});
```

##### Error Handling and Recovery Mechanisms

- **Atomic Operations**: Each step completes entirely or rolls back completely
- **State Consistency**: UI state automatically synchronizes with transaction state
- **User Feedback**: Real-time progress indicators with specific error messages
- **Retry Capability**: Users can restart the process without data corruption

### Withdraw Component Deep Dive

#### Signature-Based Withdrawal Architecture

The `WithdrawComponent` implements a sophisticated cryptographic signature system supporting both Ed25519 and Keyless signature schemes.

##### Message Construction and Serialization

```typescript
// Structured withdrawal message
const message = {
  amount: amountNum,
  target_chain_id: -1,  // Aptos mainnet identifier
  token_address: selectedToken === "USDC" ? APTOS_ADDRESS.USDC : APTOS_ADDRESS.USDT,
};

// Deterministic serialization with nonce-based replay protection
const messageSerialized = JSON.stringify(message);
const nonce = Math.random().toString(36).substring(2, 15);
```

##### Multi-Signature Support System

The component automatically detects and handles different signature types:

```typescript
// Signature type detection
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
} else {
  // Ed25519 signature construction
  payload = {
    encoded_signature: withdrawSignature.signature.toString(),
    encoded_pubkey: aptosAccount.publicKey.toString(),
    full_message: withdrawSignature.fullMessage.toString(),
  };
}
```

##### Portfolio Validation System

- **Real-time portfolio value tracking** with automatic maximum amount calculation
- **Input validation with live feedback** including visual error indicators
- **One-click maximum withdrawal** functionality for user convenience
- **Dynamic UI feedback** based on amount validation status

### MoneyFi SDK Integration Patterns

#### useDepositMutation Implementation

Advanced SDK integration with sophisticated transaction payload processing:

```typescript
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
const depositTxSimple = new SimpleTransaction(depositTx);
```

#### useWithdrawMutation Implementation

Implements sophisticated status polling mechanism:

```typescript
// Asynchronous status polling with infinite loop
const pollWithdrawStatus = async (): Promise<any> => {
  while (true) {
    const statusResponse = await moneyFiAptos.getWithdrawStatus(user.address);

    if ((statusResponse as any) === "done" || (statusResponse as any)?.status === "done") {
      const txPayload = await moneyFiAptos.getWithdrawTxPayload({
        sender: user.address,
        chain_id: -1,
        token_address: tokenAddress,
        amount: amount as bigint,
      });
      return { withdrawResponse: response, txPayload };
    }

    // 3-second polling interval
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
};
```

#### Delayed Balance Refetch Mechanism

Implements optimistic updates with blockchain confirmation:

```typescript
export const BALANCE_REFETCH_CONFIG = {
  immediate: 0,     // Immediate optimistic refetch
  delayed: 4000,    // 4 seconds delayed refetch for blockchain confirmation
  staleTime: 30_000,    // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
} as const;

const triggerDelayedRefetch = useCallback(async (options) => {
  // Immediate optimistic refetch for UI responsiveness
  if (options.immediate) {
    await queryClient.refetchQueries({ queryKey, type: "active" });
  }

  // Delayed refetch for blockchain confirmation
  if (options.delayed) {
    setTimeout(async () => {
      await queryClient.refetchQueries({ queryKey, type: "active" });
    }, BALANCE_REFETCH_CONFIG.delayed);
  }
}, [queryClient, user?.address]);
```
#### Transaction Flow Patterns

**Deposit Flow**:
```
User Input → Authentication Check → Token/Amount Validation
    ↓
Creating User Phase → MoneyFi SDK createUser() → Query Invalidation
    ↓
Account Check → hasWalletAccount Query → Conditional Account Initialization
    ↓
Deposit Phase → MoneyFi SDK getDepositTxPayload() → Transaction Signing
    ↓
Transaction Submission → Blockchain Confirmation → Balance Refetch
    ↓
Success State → Aptos Explorer Link → UI Reset
```

**Withdrawal Flow**:
```
User Input → Portfolio Validation → Amount/Token Selection
    ↓
Message Construction → Nonce Generation → Signature Creation
    ↓
Signature Type Detection → Ed25519/Keyless Handling → Payload Transformation
    ↓
MoneyFi SDK reqWithdraw() → Status Polling Loop → Transaction Payload Generation
    ↓
Transaction Signing → Blockchain Submission → Balance Refetch
    ↓
Success State → Transaction Tracking → UI Reset
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
