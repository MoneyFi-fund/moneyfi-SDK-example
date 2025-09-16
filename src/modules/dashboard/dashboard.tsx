import {
  Box,
  Container,
  VStack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import CheckWalletAccount from "./components/check-wallet-account/check-wallet-account";
import { CreatePartnershipComponent } from "./components/account/create-partnership";
import { CreateUserComponent } from "./components/account/create-user";
import { InitAccountComponent } from "./components/account/init-account";
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
            <CreateUserComponent />
            <InitAccountComponent />
            <CheckWalletAccount />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};
