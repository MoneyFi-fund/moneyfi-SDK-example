import {
  Box,
  Container,
  VStack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import CheckWalletAccount from "./components/check-wallet-account/check-wallet-account";
import { DepositComponent } from "@/modules/dashboard/components/transaction/deposit";
import { WithdrawComponent } from "@/modules/dashboard/components/transaction/withdraw";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import Stats from "../stats/stats";
import Supported from "./components/supported/supported";
// import { CreatePartnershipComponent } from "./components/account/create-partnership";
// import { InitAccountComponent } from "./components/account/init-account";

export const DashboardPage = () => {
  const { colors } = useThemeColors();

  return (
    <Box minH="100vh" bg={colors.background}>
      <Container maxW="full" p={8}>
        <VStack align="stretch" gap={6}>
          <Text 
            fontSize={materialDesign3Theme.typography.headlineMedium.fontSize}
            fontWeight="semibold"
            color={colors.onBackground}
          >
            Dashboard
          </Text>
          <Supported />
          <SimpleGrid columns={{ base: 1, md: 1, lg: 3 }} gap={6}>
            {/* <InitAccountComponent /> */}
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
