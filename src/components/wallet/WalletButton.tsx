import {
  Button,
  Menu,
  Text,
  HStack,
  VStack,
  Box,
  IconButton,
  Portal,
} from "@chakra-ui/react";
import { KeyboardArrowDown, ContentCopy, OpenInNew } from "@mui/icons-material";
import { useState } from "react";
import { WalletConnectModal } from "./WalletConnectModal";
import { useWalletService } from "@/hooks/useWalletService";
import { useNotifications } from "@/hooks/useNotifications";

interface WalletButtonProps {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showAddress?: boolean;
  onConnectClick?: () => void;
}

export const WalletButton = ({
  variant = "solid",
  size = "md",
  showAddress = true,
  onConnectClick,
}: WalletButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const walletService = useWalletService();
  const { showSuccess, showError } = useNotifications();
  const { isConnected, account, walletName, isConnecting } = walletService.getState();
  console.log(account?.address);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    if (account?.address) {
      try {
        const addressString = account.address.toString();
        await navigator.clipboard.writeText(addressString);
        showSuccess("Address Copied", "Wallet address copied to clipboard");
      } catch (error) {
        showError("Copy Failed", "Failed to copy address to clipboard");
      }
    }
  };

  const handleViewExplorer = () => {
    if (account?.address) {
      const addressString = account.address.toString();
      const explorerUrl = `https://explorer.aptoslabs.com/account/${addressString}`;
      window.open(explorerUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDisconnect = async () => {
    try {
      await walletService.disconnect();
      showSuccess("Wallet Disconnected", "Your wallet has been disconnected");
    } catch (error: any) {
      showError("Disconnect Failed", error.message || "Failed to disconnect wallet");
    }
  };

  // Connected state
  if (isConnected && account) {
    return (
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button
            variant={variant}
            size={size}
            maxW="300px"
            borderRadius="xl"
            bg="green.50"
            borderColor="green.200"
            borderWidth="1px"
            color="green.800"
            _hover={{ bg: "green.100" }}
          >
            <HStack gap={3} minW={0}>
              <Box
                boxSize={8}
                bg="green.500"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="sm"
                fontWeight="bold"
              >
                {walletName ? walletName.charAt(0).toUpperCase() : "W"}
              </Box>
              <VStack gap={0} align="start" minW={0}>
                {walletName && (
                  <Text fontSize="sm" fontWeight="semibold" lineHeight="1">
                    {walletName}
                  </Text>
                )}
                {showAddress && (
                  <Text fontSize="xs" color="green.600" lineHeight="1">
                    {truncateAddress(account.address.toString())}
                  </Text>
                )}
              </VStack>
              <KeyboardArrowDown />
            </HStack>
          </Button>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              boxShadow="lg"
              py={2}
              minW="200px"
            >
              <Menu.Item 
                value="copy" 
                onClick={handleCopyAddress}
                px={4}
                py={3}
                _hover={{ bg: "gray.50" }}
                borderRadius="md"
                mx={2}
                cursor="pointer"
              >
                <HStack gap={3} w="full">
                  <Box color="gray.600">
                    <ContentCopy fontSize="small" />
                  </Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Copy Address
                  </Text>
                </HStack>
              </Menu.Item>
              <Menu.Item 
                value="explorer" 
                onClick={handleViewExplorer}
                px={4}
                py={3}
                _hover={{ bg: "gray.50" }}
                borderRadius="md"
                mx={2}
                cursor="pointer"
              >
                <HStack gap={3} w="full">
                  <Box color="gray.600">
                    <OpenInNew fontSize="small" />
                  </Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    View in Explorer
                  </Text>
                </HStack>
              </Menu.Item>
              <Menu.Separator my={2} borderColor="gray.200" />
              <Menu.Item 
                value="disconnect" 
                onClick={handleDisconnect}
                px={4}
                py={3}
                _hover={{ bg: "red.50" }}
                borderRadius="md"
                mx={2}
                cursor="pointer"
              >
                <Text fontSize="sm" fontWeight="medium" color="red.600" w="full">
                  Disconnect
                </Text>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    );
  }

  // Connecting state
  if (isConnecting) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        borderRadius="xl"
        bg="blue.100"
        color="blue.700"
      >
        <HStack gap={2}>
          <Box
            boxSize={4}
            border="2px solid"
            borderColor="blue.500"
            borderTopColor="transparent"
            borderRadius="full"
            animation="spin 1s linear infinite"
          />
          <Text>Connecting...</Text>
        </HStack>
      </Button>
    );
  }

  // Disconnected state
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={onConnectClick || (() => setIsModalOpen(true))}
        cursor="pointer"
        borderRadius="xl"
        bg="blue.600"
        color="white"
        fontWeight="semibold"
        _hover={{ 
          bg: "blue.700",
          transform: "translateY(-1px)",
          boxShadow: "lg"
        }}
        _active={{ transform: "translateY(0)" }}
        transition="all 0.2s"
        px={6}
      >
        Connect Wallet
      </Button>

      {!onConnectClick && (
        <WalletConnectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

// Compact version for headers/nav
export const CompactWalletButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const walletService = useWalletService();
  const { showSuccess } = useNotifications();
  const { isConnected, account, isConnecting } = walletService.getState();

  const handleCopyAddress = async () => {
    if (account?.address) {
      try {
        const addressString = account.address.toString();
        await navigator.clipboard.writeText(addressString);
        showSuccess("Copied", "Address copied to clipboard");
      } catch (error) {
        // Silent fail for compact version
      }
    }
  };

  const handleViewExplorer = () => {
    if (account?.address) {
      const addressString = account.address.toString();
      const explorerUrl = `https://explorer.aptoslabs.com/account/${addressString}`;
      window.open(explorerUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isConnected && account) {
    const addressString = account.address.toString();
    return (
      <HStack gap={1}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyAddress}
          maxW="120px"
          borderRadius="lg"
          bg="green.50"
          color="green.700"
          _hover={{ bg: "green.100" }}
          title={addressString}
        >
          <Text fontSize="sm">
            {addressString.slice(0, 6)}...{addressString.slice(-4)}
          </Text>
        </Button>
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Wallet options"
              borderRadius="lg"
              _hover={{ bg: "gray.100" }}
            >
              <KeyboardArrowDown />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                boxShadow="lg"
                py={2}
                minW="180px"
              >
                <Menu.Item 
                  value="copy" 
                  onClick={handleCopyAddress}
                  px={4}
                  py={3}
                  _hover={{ bg: "gray.50" }}
                  borderRadius="md"
                  mx={2}
                  cursor="pointer"
                >
                  <HStack gap={3} w="full">
                    <Box color="gray.600">
                      <ContentCopy fontSize="small" />
                    </Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Copy
                    </Text>
                  </HStack>
                </Menu.Item>
                <Menu.Item 
                  value="explorer" 
                  onClick={handleViewExplorer}
                  px={4}
                  py={3}
                  _hover={{ bg: "gray.50" }}
                  borderRadius="md"
                  mx={2}
                  cursor="pointer"
                >
                  <HStack gap={3} w="full">
                    <Box color="gray.600">
                      <OpenInNew fontSize="small" />
                    </Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Explorer
                    </Text>
                  </HStack>
                </Menu.Item>
                <Menu.Separator my={2} borderColor="gray.200" />
                <Menu.Item 
                  value="disconnect" 
                  onClick={() => walletService.disconnect()}
                  px={4}
                  py={3}
                  _hover={{ bg: "red.50" }}
                  borderRadius="md"
                  mx={2}
                  cursor="pointer"
                >
                  <Text fontSize="sm" fontWeight="medium" color="red.600" w="full">
                    Disconnect
                  </Text>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </HStack>
    );
  }

  if (isConnecting) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled 
        borderRadius="lg"
        bg="blue.100"
        color="blue.700"
      >
        <HStack gap={2}>
          <Box
            boxSize={3}
            border="2px solid"
            borderColor="blue.500"
            borderTopColor="transparent"
            borderRadius="full"
            animation="spin 1s linear infinite"
          />
          <Text>Connecting</Text>
        </HStack>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        borderRadius="lg"
        bg="blue.50"
        color="blue.700"
        _hover={{ bg: "blue.100" }}
      >
        Connect
      </Button>

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};