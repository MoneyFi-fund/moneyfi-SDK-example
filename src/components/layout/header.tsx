import WalletButton from "@/modules/dashboard/components/wallet-button";
import EVMWalletButton from "@/modules/dashboard/components/evm-wallet-button";
import { Box, Container, HStack, Text, Image, Link as ChakraLink, IconButton, VStack } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import moneyFi from "../../../public/logo/logo.svg";
import WalletConnectModal from "@/modules/dashboard/components/wallet-connect-modal";
import { CompactThemeToggle } from "@/components/theme-toggle";
import { useThemeColors } from "@/provider/theme-provider";
import { menuItems } from "@/utils/menu";
import { useEVM } from "@/provider/evm-provider";
import { useAptos } from "@/provider/aptos-provider";
import { HiMenu, HiX } from "react-icons/hi";

export default function Header() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { colors, isDark } = useThemeColors();
  const { isConnected: isEVMConnected } = useEVM();
  const { isConnected: isAptosConnected } = useAptos();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isSharedPage = ['/stats', '/history'].includes(location.pathname);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <Box
      bg={isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)'}
      backdropFilter="blur(10px)"
      css={{ WebkitBackdropFilter: 'blur(10px)' }}
      borderBottom="1px solid"
      borderColor={isDark ? 'rgba(255,255,255,0.08)' : '#E0E0E0'}
      py={4}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      position="sticky"
      top={0}
      zIndex={100}
      ref={mobileMenuRef}
    >
      <Container maxW="7xl">
        <HStack justify="space-between" align="center">
          {/* Logo */}
          <HStack align="center" gap={2} flexShrink={0}>
            <Image src={moneyFi} alt="MoneyFi Logo" boxSize="40px" />
            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="medium"
              color={isDark ? '#FFFFFF' : '#0A0A0A'}
            >
              MoneyFi SDK
            </Text>
          </HStack>

          {/* Desktop nav - hidden on mobile */}
          <HStack gap={8} display={{ base: "none", md: "flex" }}>
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <ChakraLink
                  color={location.pathname === item.path ? (isDark ? '#39FF14' : '#1FAE5C') : (isDark ? '#999999' : '#666666')}
                  fontWeight={location.pathname === item.path ? "semibold" : "medium"}
                  _hover={{ color: isDark ? '#39FF14' : '#1FAE5C' }}
                  transition="color 0.2s"
                  whiteSpace="nowrap"
                  borderBottom={location.pathname === item.path ? "2px solid" : undefined}
                  borderColor={location.pathname === item.path ? (isDark ? '#39FF14' : '#1FAE5C') : undefined}
                  pb={location.pathname === item.path ? "2px" : undefined}
                >
                  {item.name}
                </ChakraLink>
              </Link>
            ))}
          </HStack>

          {/* Right side: theme toggle, wallet, hamburger */}
          <HStack gap={{ base: 1, md: 3 }} flexShrink={0}>
            <CompactThemeToggle />
            {/* Wallet buttons - hidden on mobile, shown in mobile menu instead */}
            <Box display={{ base: "none", md: "flex" }} gap={3}>
              {location.pathname === '/evm' && <EVMWalletButton compact />}
              {location.pathname === '/' && <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />}
              {isSharedPage && isEVMConnected && <EVMWalletButton compact />}
              {isSharedPage && isAptosConnected && !isEVMConnected && (
                <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />
              )}
            </Box>
            {/* Hamburger button - mobile only */}
            <IconButton
              aria-label="Toggle menu"
              display={{ base: "flex", md: "none" }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="sm"
              color={colors.onSurface}
            >
              {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </IconButton>
          </HStack>

          <WalletConnectModal
            isOpen={isWalletModalOpen}
            onClose={() => setIsWalletModalOpen(false)}
          />
        </HStack>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <VStack
            display={{ base: "flex", md: "none" }}
            align="stretch"
            mt={4}
            pt={4}
            borderTop="1px solid"
            borderColor={isDark ? 'rgba(255,255,255,0.08)' : '#E0E0E0'}
            gap={1}
          >
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Box
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg={location.pathname === item.path ? (isDark ? 'rgba(57,255,20,0.05)' : 'rgba(31,174,92,0.08)') : "transparent"}
                  _hover={{ bg: isDark ? 'rgba(57,255,20,0.05)' : 'rgba(31,174,92,0.08)' }}
                  transition="background 0.2s"
                  cursor="pointer"
                >
                  <Text
                    color={location.pathname === item.path ? (isDark ? '#39FF14' : '#1FAE5C') : (isDark ? '#999999' : '#666666')}
                    fontWeight={location.pathname === item.path ? "semibold" : "medium"}
                    fontSize="sm"
                  >
                    {item.name}
                  </Text>
                </Box>
              </Link>
            ))}
            {/* Wallet button in mobile menu */}
            <Box px={3} py={2}>
              {location.pathname === '/evm' && <EVMWalletButton compact />}
              {location.pathname === '/' && <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />}
              {isSharedPage && isEVMConnected && <EVMWalletButton compact />}
              {isSharedPage && isAptosConnected && !isEVMConnected && (
                <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />
              )}
            </Box>
          </VStack>
        )}
      </Container>
    </Box>
  );
}
