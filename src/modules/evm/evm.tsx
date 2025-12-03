import React from 'react'
import {
  Box,
  Container,
  VStack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import CheckWalletAccount from '../dashboard/components/check-wallet-account/check-wallet-account';
import { EVMDepositComponent } from './components/transaction/evm-deposit';
import { EVMWithdrawComponent } from './components/transaction/evm-withdraw';

export default function EVMPage() {
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
              <SimpleGrid columns={{ base: 1, md: 1, lg: 3 }} gap={6}>
                {/* <InitAccountComponent /> */}
                <EVMDepositComponent />
                <EVMWithdrawComponent />
              </SimpleGrid>
              {/* <Supported /> */}
            </VStack>
          </Container>
        </Box>
  )
}
