import {
  Box,
  Container,
  VStack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import CheckWalletAccount from "./components/check-wallet-account/check-wallet-account";
import { CreatePartnershipComponent } from "./components/account/create-partnership";
import { DepositComponent } from "@/modules/dashboard/components/transaction/deposit";
import { WithdrawComponent } from "@/modules/dashboard/components/transaction/withdraw";
import Stats from "../stats/stats";
export const DashboardPage = () => {

  return (
    <Box minH="100vh" bg="bg">
      <Container maxW="full" p={8}>
        <VStack align="stretch" gap={6}>
          <Text fontSize="2xl" fontWeight="semibold">
            Dashboard
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <CreatePartnershipComponent />
            <CheckWalletAccount />
            <DepositComponent />
            <WithdrawComponent />
          </SimpleGrid>
          <Stats />
        </VStack>
      </Container>
    </Box>
  );
};
