import WalletButton from "@/modules/dashboard/components/wallet-button";
import { Box, Container, HStack, Text, Image, Link as ChakraLink } from "@chakra-ui/react";
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import moneyFi from "../../../public/logo/logo.svg";
import WalletConnectModal from "@/modules/dashboard/components/wallet-connect-modal";
import { CompactThemeToggle } from "@/components/theme-toggle";
import { useThemeColors } from "@/provider/theme-provider";
import { menuItems } from "@/utils/menu";

export default function Header() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const location = useLocation();
  const { colors, cardColors } = useThemeColors();

  return (
    <Box 
      bg={colors.surfaceBg} 
      borderBottom="1px solid" 
      borderColor={cardColors.border} 
      py={4}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <Container maxW="7xl">
        <HStack justify="space-between" align="center">
          <HStack align="center" gap={2}>
            <Image src={moneyFi} alt="MoneyFi Logo" boxSize="40px" />
            <Text
              fontSize="2xl"
              fontWeight="medium"
              color={colors.onSurface}
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
                  color={location.pathname === item.path ? "primary.500" : colors.onSurfaceVariant}
                  fontWeight={location.pathname === item.path ? "semibold" : "medium"}
                  _hover={{ color: "primary.500" }}
                  transition="color 0.2s"
                >
                  {item.name}
                </ChakraLink>
              </Link>
            ))}
          </HStack>

          <HStack gap={3}>
            <CompactThemeToggle />
            <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />
          </HStack>

          <WalletConnectModal
            isOpen={isWalletModalOpen}
            onClose={() => setIsWalletModalOpen(false)}
          />
        </HStack>
      </Container>
    </Box>
  );
}