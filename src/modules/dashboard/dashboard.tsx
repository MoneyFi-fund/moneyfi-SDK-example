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
import { EVMDepositComponent } from "@/modules/evm/components/transaction/evm-deposit";
import { EVMWithdrawComponent } from "@/modules/evm/components/transaction/evm-withdraw";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useAuth } from "@/provider/auth-provider";
import Stats from "../stats/stats";
import Supported from "./components/supported/supported";
// import { CreatePartnershipComponent } from "./components/account/create-partnership";
// import { InitAccountComponent } from "./components/account/init-account";

export const DashboardPage = () => {
  const { colors, cardColors, buttonColors } = useThemeColors();
  const { user } = useAuth();
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
                fontSize={materialDesign3Theme.typography.headlineMedium.fontSize}
                fontWeight="semibold"
                color={colors.onBackground}
              >
                Dashboard
              </Text>
              {user?.address && (
                <Text
                  fontSize={
                    materialDesign3Theme.typography.bodySmall.fontSize
                  }
                  color={colors.onBackgroundVariant}
                >
                  Address: {user.address.slice(0, 10)}...{user.address.slice(-8)}
                </Text>
              )}
            </VStack>

            {/* Network Toggle */}
            <HStack gap={2}>
              <Button
                variant={networkMode === "aptos" ? "solid" : "outline"}
                onClick={() => setNetworkMode("aptos")}
                bg={
                  networkMode === "aptos"
                    ? buttonColors.primary.background
                    : "transparent"
                }
                color={
                  networkMode === "aptos"
                    ? buttonColors.primary.text
                    : cardColors.text
                }
                border="1px solid"
                borderColor={
                  networkMode === "aptos"
                    ? buttonColors.primary.background
                    : cardColors.border
                }
                borderRadius={materialDesign3Theme.borderRadius.sm}
                px={6}
                py={2}
                fontWeight="medium"
                fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  bg:
                    networkMode === "aptos"
                      ? buttonColors.primary.hover
                      : "neutral.100",
                }}
              >
                Aptos
              </Button>
              <Button
                variant={networkMode === "evm" ? "solid" : "outline"}
                onClick={() => setNetworkMode("evm")}
                bg={
                  networkMode === "evm"
                    ? buttonColors.primary.background
                    : "transparent"
                }
                color={
                  networkMode === "evm"
                    ? buttonColors.primary.text
                    : cardColors.text
                }
                border="1px solid"
                borderColor={
                  networkMode === "evm"
                    ? buttonColors.primary.background
                    : cardColors.border
                }
                borderRadius={materialDesign3Theme.borderRadius.sm}
                px={6}
                py={2}
                fontWeight="medium"
                fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  bg:
                    networkMode === "evm"
                      ? buttonColors.primary.hover
                      : "neutral.100",
                }}
              >
                EVM
              </Button>
            </HStack>
          </HStack>

          {/* Network-specific Content */}
          {networkMode === "aptos" ? (
            <>
              {/* Aptos Mode */}
              <SimpleGrid columns={{ base: 1, md: 1, lg: 3 }} gap={6}>
                <CheckWalletAccount />
                <DepositComponent />
                <WithdrawComponent />
              </SimpleGrid>
              <Stats />
            </>
          ) : (
            <>
              {/* EVM Mode */}
              <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} gap={6}>
                <EVMDepositComponent />
                <EVMWithdrawComponent />
              </SimpleGrid>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
