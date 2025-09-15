import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import { useState } from "react";
import WalletButton from "./components/wallet-button";
import { BalancePreviewComponent } from "./components/transactions/balance-preview-component";
import { DepositComponent } from "./components/transactions/deposit";
import { WithdrawComponent } from "./components/transactions/withdraw";
import WalletConnectModal from "./components/wallet-connect-modal";
import moneyFi from "../../../public/logo/logo.svg";
import CheckWalletAccount from "./components/check-wallet-account/check-wallet-account";
export const DashboardPage = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <Box minH="100vh" bg="bg">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="border" py={4}>
        <Container maxW="7xl">
          <HStack justify="space-between" align="center">
            <HStack align="center" spaceX={2}>
              <Image src={moneyFi} alt="MoneyFi Logo" boxSize="40px" />
              <Text fontSize="2xl" fontWeight="medium" color="black" className="text-xl">
                MoneyFi SDK
              </Text>
            </HStack>
            <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />
          </HStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="full" p={8}>
        <VStack align="stretch" gap={6}>
          <Text fontSize="2xl" fontWeight="semibold">
            Dashboard
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <CheckWalletAccount />
            <BalancePreviewComponent />
            <DepositComponent />
            <WithdrawComponent />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </Box>
  );
};
