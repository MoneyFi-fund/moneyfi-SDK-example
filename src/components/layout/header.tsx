import WalletButton from "@/modules/dashboard/components/wallet-button";
import { Box, Container, HStack, Text, Image, Link as ChakraLink } from "@chakra-ui/react";
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import moneyFi from "../../../public/logo/logo.svg";
import WalletConnectModal from "@/modules/dashboard/components/wallet-connect-modal";
import { menuItems } from "@/utils/menu";

export default function Header() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const location = useLocation();

  return (
    <Box bg="white" borderBottom="1px solid" borderColor="border" py={4}>
      <Container maxW="7xl">
        <HStack justify="space-between" align="center">
          <HStack align="center" gap={2}>
            <Image src={moneyFi} alt="MoneyFi Logo" boxSize="40px" />
            <Text
              fontSize="2xl"
              fontWeight="medium"
              color="black"
              className="text-xl"
            >
              MoneyFi SDK
            </Text>
          </HStack>
          
          <HStack gap={8}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
              >
                <ChakraLink
                  color={location.pathname === item.path ? "blue.500" : "gray.600"}
                  fontWeight={location.pathname === item.path ? "semibold" : "medium"}
                  _hover={{ color: "blue.500" }}
                  transition="color 0.2s"
                >
                  {item.name}
                </ChakraLink>
              </Link>
            ))}
          </HStack>

          <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />

          <WalletConnectModal
            isOpen={isWalletModalOpen}
            onClose={() => setIsWalletModalOpen(false)}
          />
        </HStack>
      </Container>
    </Box>
  );
}