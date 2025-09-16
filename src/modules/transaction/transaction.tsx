import { Box, Container, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { BalancePreviewComponent } from "./components/balance-preview-component";
import { DepositComponent } from "./components/deposit";
import { WithdrawComponent } from "./components/withdraw";

export default function Transaction() {
  return (
    <Box>
      <Container maxW="full" p={8}>
        <VStack align="stretch" gap={6}>
          <Text fontSize="2xl" fontWeight="semibold">
            Dashboard
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <BalancePreviewComponent />
            <DepositComponent />
            <WithdrawComponent />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
