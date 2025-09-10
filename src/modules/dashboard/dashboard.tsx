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
import { BalancePreviewComponent } from "./components/transactions/BalancePreviewComponent";
import { DepositComponent } from "./components/transactions/DepositComponent";
import { WithdrawComponent } from "./components/transactions/WithdrawComponent";
import WalletConnectModal from "./components/wallet-connect-modal";
import moneyFi from "../../../public/logo/logo.svg";
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
              <Text fontSize="2xl" fontWeight="bold" color="black">
                MoneyFi SDK Demo
              </Text>
            </HStack>
            <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />
          </HStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        <VStack align="stretch" spaceX={8} gap={6}>
          <Text fontSize="xl" fontWeight="semibold">
            Dashboard
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
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
