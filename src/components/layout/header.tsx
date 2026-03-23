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
      bg={isDark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)'}
      backdropFilter="blur(16px)"
      css={{ WebkitBackdropFilter: 'blur(16px)' }}
      borderBottom="1px solid"
      borderColor={isDark ? 'rgba(57,255,20,0.1)' : '#E0E0E0'}
      py={4}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      position="sticky"
      top={0}
      zIndex={100}
      ref={mobileMenuRef}
      boxShadow={isDark ? '0 4px 30px rgba(0,0,0,0.5), 0 1px 0 rgba(57,255,20,0.08)' : 'none'}
    >
      <Container maxW="7xl">
        <HStack justify="space-between" align="center">
          {/* Logo */}
          <HStack align="center" gap={2} flexShrink={0}>
            <Image src={moneyFi} alt="MoneyFi Logo" boxSize="40px" />
            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="bold"
              // color={isDark ? '#E8FFE8' : '#0A0A0A'}
              letterSpacing={isDark ? '0.05em' : 'normal'}
              textTransform={isDark ? 'capitalize' : 'none'}
              // css={isDark ? {
              //   textShadow: '0 0 8px rgba(57, 255, 20, 0.3)',
              // } : {}}
              // className={isDark ? 'glitch-hover' : undefined}
            >
              MoneyFi SDK
            </Text>
          </HStack>

          {/* Desktop nav - hidden on mobile */}
          <HStack gap={8} display={{ base: "none", lg: "flex" }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <ChakraLink
                    className={isDark ? `cyber-nav-link${isActive ? ' active' : ''}` : undefined}
                    color={isActive ? (isDark ? '#39FF14' : '#1FAE5C') : (isDark ? '#8AAA8A' : '#666666')}
                    fontWeight={isActive ? "bold" : "medium"}
                    _hover={{
                      color: isDark ? '#39FF14' : '#1FAE5C',
                      textShadow: isDark ? '0 0 8px rgba(57,255,20,0.5)' : 'none',
                    }}
                    transition="all 0.2s"
                    whiteSpace="nowrap"
                    letterSpacing={isDark ? '0.08em' : 'normal'}
                    textTransform={isDark ? 'uppercase' : 'none'}
                    fontSize={isDark ? '13px' : 'inherit'}
                    css={isActive && isDark ? {
                      textShadow: '0 0 6px rgba(57, 255, 20, 0.4)',
                    } : {}}
                  >
                    {item.name}
                  </ChakraLink>
                </Link>
              );
            })}
          </HStack>

          {/* Right side: theme toggle, wallet, hamburger */}
          <HStack gap={{ base: 1, lg: 3 }} flexShrink={0}>
            <CompactThemeToggle />
            {/* Wallet buttons - hidden on mobile, shown in mobile menu instead */}
            <Box display={{ base: "none", lg: "flex" }} gap={3}>
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
              display={{ base: "flex", lg: "none" }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="sm"
              color={colors.onSurface}
              css={{
                '& svg': {
                  transition: 'transform 0.2s ease',
                },
                '&:active svg': {
                  transform: 'scale(0.85)',
                },
              }}
            >
              <Box
                as="span"
                display="inline-flex"
                transform={isMobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)'}
                transition="transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
              </Box>
            </IconButton>
          </HStack>

          <WalletConnectModal
            isOpen={isWalletModalOpen}
            onClose={() => setIsWalletModalOpen(false)}
          />
        </HStack>

        {/* Mobile menu dropdown - always rendered, animated via CSS */}
        <Box
          display={{ base: "block", lg: "none" }}
          overflow="hidden"
          maxH={isMobileMenuOpen ? '500px' : '0'}
          opacity={isMobileMenuOpen ? 1 : 0}
          transition="max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease"
        >
          <VStack
            align="stretch"
            mt={4}
            pt={4}
            borderTop="1px solid"
            borderColor={isDark ? 'rgba(57,255,20,0.1)' : '#E0E0E0'}
            gap={1}
          >
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Box
                    px={3}
                    py={2}
                    borderRadius="md"
                    bg={isActive ? (isDark ? 'rgba(57,255,20,0.06)' : 'rgba(31,174,92,0.08)') : "transparent"}
                    _hover={{ bg: isDark ? 'rgba(57,255,20,0.06)' : 'rgba(31,174,92,0.08)' }}
                    cursor="pointer"
                    borderLeft={isActive && isDark ? '2px solid' : 'none'}
                    borderLeftColor={isActive && isDark ? 'rgba(57,255,20,0.5)' : 'transparent'}
                    transform={isMobileMenuOpen ? 'translateY(0)' : 'translateY(-8px)'}
                    opacity={isMobileMenuOpen ? 1 : 0}
                    transition={`transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms, opacity 0.2s ease ${index * 50}ms, background 0.2s`}
                  >
                    <Text
                      color={isActive ? (isDark ? '#39FF14' : '#1FAE5C') : (isDark ? '#8AAA8A' : '#666666')}
                      fontWeight={isActive ? "bold" : "medium"}
                      fontSize="sm"
                      letterSpacing={isDark ? '0.06em' : 'normal'}
                      textTransform={isDark ? 'uppercase' : 'none'}
                      css={isActive && isDark ? {
                        textShadow: '0 0 6px rgba(57, 255, 20, 0.3)',
                      } : {}}
                    >
                      {item.name}
                    </Text>
                  </Box>
                </Link>
              );
            })}
            {/* Wallet button in mobile menu */}
            <Box
              px={3}
              py={2}
              transform={isMobileMenuOpen ? 'translateY(0)' : 'translateY(-8px)'}
              opacity={isMobileMenuOpen ? 1 : 0}
              transition={`transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) ${menuItems.length * 50}ms, opacity 0.2s ease ${menuItems.length * 50}ms`}
            >
              {location.pathname === '/evm' && <EVMWalletButton compact />}
              {location.pathname === '/' && <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />}
              {isSharedPage && isEVMConnected && <EVMWalletButton compact />}
              {isSharedPage && isAptosConnected && !isEVMConnected && (
                <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />
              )}
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
