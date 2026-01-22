import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  Text,
  SimpleGrid,
  HStack,
  Button,
} from "@chakra-ui/react";
import CheckWalletAccount from "./components/check-wallet-account/check-wallet-account";
import { DepositComponent } from "@/modules/dashboard/components/transaction/deposit";
import { WithdrawComponent } from "@/modules/dashboard/components/transaction/withdraw";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useAuth } from "@/provider/auth-provider";
import Stats from "../stats/stats";
import UserAssetAllocationComponent from "../evm/components/user-asset-allication";
import { useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";
// import { CreatePartnershipComponent } from "./components/account/create-partnership";
// import { InitAccountComponent } from "./components/account/init-account";

export const DashboardPage = () => {
  const { colors, cardColors, buttonColors } = useThemeColors();
  const { user } = useAuth();
  const { connected: isAptosConnected } = useAptosWallet();
  const [networkMode, setNetworkMode] = useState<"aptos" | "evm">("aptos");

  // Persist network mode to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("networkMode") as "aptos" | "evm" | null;
    if (saved) {
      setNetworkMode(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("networkMode", networkMode);
  }, [networkMode]);

  return (
    <Box minH="100vh" bg={colors.background}>
      <Container maxW="full" p={8}>
        <VStack align="stretch" gap={6}>
          {/* Header with Network Toggle */}
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <Text
                fontSize={
                  materialDesign3Theme.typography.headlineMedium.fontSize
                }
                fontWeight="semibold"
                color={colors.onBackground}
              >
                Dashboard
              </Text>
              {user?.address && (
                <Text
                  fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                  color={colors.onBackgroundVariant}
                >
                  Address: {user.address.slice(0, 10)}...
                  {user.address.slice(-8)}
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Network-specific Content */}
          <>
            {/* Aptos Mode */}
            <SimpleGrid columns={{ base: 1, md: 1, lg: 3 }} gap={6}>
              <CheckWalletAccount />
              <DepositComponent />
              <WithdrawComponent />
            </SimpleGrid>
            <UserAssetAllocationComponent
              address={user?.address}
              isConnected={isAptosConnected}
            />
            <Stats />
          </>
        </VStack>
      </Container>
    </Box>
  );
};
