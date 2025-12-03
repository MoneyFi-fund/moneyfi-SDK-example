import React from "react";
import {
  Button,
  HStack,
  Text,
  Menu,
  Portal,
  Box,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { useEVM } from "@/provider/evm-provider";
import { useConnect, useDisconnect } from "wagmi";
import { truncateAddress } from "@/auth/utils";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useThemeColors } from "@/provider/theme-provider";

interface EVMWalletButtonProps {
  compact?: boolean;
}

const EVMWalletButton: React.FC<EVMWalletButtonProps> = ({ compact = false }) => {
  const { address, isConnected, isConnecting, connect } = useEVM();
  const { connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { menuColors, buttonColors } = useThemeColors();

  const handleDisconnect = async () => {
    await disconnectAsync();
  };

  // Simple avatar component
  const SimpleAvatar: React.FC<{ address: string; size?: string }> = ({
    address,
    size = "sm",
  }) => {
    const displaySize = size === "sm" ? "32px" : "40px";
    return (
      <Box
        w={displaySize}
        h={displaySize}
        borderRadius="full"
        bg="cyan.400"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
        fontWeight="medium"
      >
        {address.slice(2, 4).toUpperCase()}
      </Box>
    );
  };

  // If connected, show address with dropdown
  if (isConnected && address) {
    if (compact) {
      return (
        <Menu.Root positioning={{ placement: "bottom-end" }}>
          <Menu.Trigger asChild>
            <Button
              variant="outline"
              minH="40px"
              px={4}
              borderColor="cyan.300"
              border="1px solid"
              borderRadius="sm"
              bg="cyan.50"
              boxShadow="sm"
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                bg: "cyan.100",
                borderColor: "cyan.400",
                boxShadow: "md",
              }}
              _active={{
                bg: "cyan.200",
                boxShadow: "sm",
              }}
            >
              <HStack gap={2}>
                <SimpleAvatar address={address} size="sm" />
                <Text
                  fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                  fontWeight="medium"
                  color="cyan.900"
                >
                  {truncateAddress(address)}
                </Text>
              </HStack>
            </Button>
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content
                bg={menuColors.background}
                border="1px solid"
                borderColor={menuColors.border}
                borderRadius={materialDesign3Theme.borderRadius.sm}
                boxShadow={materialDesign3Theme.elevation.level3}
                minW="220px"
              >
                <Menu.Item
                  value="address"
                  px={4}
                  py={3}
                  borderRadius={materialDesign3Theme.borderRadius.xs}
                  fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                  color={menuColors.text}
                  // isReadOnly
                  cursor="default"
                  _hover={{ bg: "transparent" }}
                >
                  <VStack align="start" gap={0}>
                    <Text
                      fontSize={materialDesign3Theme.typography.labelSmall.fontSize}
                      fontWeight="medium"
                      color={menuColors.textSecondary}
                    >
                      EVM Wallet
                    </Text>
                    <Text fontFamily="mono" fontSize="xs">
                      {address}
                    </Text>
                  </VStack>
                </Menu.Item>
                <Menu.Separator borderColor={menuColors.separator} />
                <Menu.Item
                  value="copy"
                  onClick={() => navigator.clipboard.writeText(address)}
                  px={4}
                  py={3}
                  borderRadius={materialDesign3Theme.borderRadius.xs}
                  fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                  color={menuColors.text}
                  _hover={{
                    bg: menuColors.hover,
                    color: menuColors.text,
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  cursor="pointer"
                >
                  Copy Address
                </Menu.Item>
                <Menu.Item
                  value="disconnect"
                  onClick={handleDisconnect}
                  color="error.600"
                  px={4}
                  py={3}
                  borderRadius={materialDesign3Theme.borderRadius.xs}
                  fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                  _hover={{ bg: "error.50", color: "error.700" }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  cursor="pointer"
                >
                  Disconnect
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
            </Portal>
          </Menu.Root>
      );
    }

    // Full size version
    return (
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <Button
            variant="outline"
            minH="44px"
            px={6}
            borderColor="cyan.300"
            border="2px solid"
            borderRadius="sm"
            bg="cyan.50"
            boxShadow="md"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              bg: "cyan.100",
              borderColor: "cyan.500",
              boxShadow: "lg",
            }}
            _active={{
              bg: "cyan.200",
              boxShadow: "md",
            }}
          >
            <HStack gap={3}>
              <SimpleAvatar address={address} size="sm" />
              <VStack align="start" gap={0}>
                <Badge
                  bg="cyan.500"
                  color="white"
                  fontSize="10px"
                  fontWeight="bold"
                  px={2}
                  py={1}
                >
                  EVM
                </Badge>
                <Text
                  fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                  fontWeight="medium"
                  color="cyan.900"
                >
                  {truncateAddress(address)}
                </Text>
              </VStack>
            </HStack>
          </Button>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content
              bg={menuColors.background}
              border="1px solid"
              borderColor={menuColors.border}
              borderRadius={materialDesign3Theme.borderRadius.sm}
              boxShadow={materialDesign3Theme.elevation.level3}
              minW="250px"
            >
              <Menu.Item
                value="address"
                px={4}
                py={3}
                borderRadius={materialDesign3Theme.borderRadius.xs}
                fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                color={menuColors.text}
                isReadOnly
                cursor="default"
                _hover={{ bg: "transparent" }}
              >
                <VStack align="start" gap={1}>
                  <HStack gap={2}>
                    <Badge bg="cyan.500" color="white" fontSize="10px">
                      EVM Wallet
                    </Badge>
                  </HStack>
                  <Text fontFamily="mono" fontSize="xs" wordBreak="break-all">
                    {address}
                  </Text>
                </VStack>
              </Menu.Item>
              <Menu.Separator borderColor={menuColors.separator} />
              <Menu.Item
                value="copy"
                onClick={() => navigator.clipboard.writeText(address)}
                px={4}
                py={3}
                borderRadius={materialDesign3Theme.borderRadius.xs}
                fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                color={menuColors.text}
                _hover={{
                  bg: menuColors.hover,
                  color: menuColors.text,
                }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                cursor="pointer"
              >
                Copy Address
              </Menu.Item>
              <Menu.Item
                value="disconnect"
                onClick={handleDisconnect}
                color="error.600"
                px={4}
                py={3}
                borderRadius={materialDesign3Theme.borderRadius.xs}
                fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                _hover={{ bg: "error.50", color: "error.700" }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                cursor="pointer"
              >
                Disconnect
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
          </Portal>
        </Menu.Root>
    );
  }

  // If not connected, show connect button
  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <Button
          loading={isConnecting}
          minH={compact ? "40px" : "44px"}
          px={compact ? 4 : 6}
          bg={buttonColors.secondary.background}
          color={buttonColors.secondary.text}
          borderRadius="sm"
          boxShadow="sm"
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          fontWeight="medium"
          fontSize={compact ? "label-md" : "label-lg"}
          _hover={{
            bg: buttonColors.secondary.hover,
            boxShadow: "md",
          }}
          _active={{
            bg: buttonColors.secondary.active,
            boxShadow: "sm",
          }}
          _loading={{
            bg: buttonColors.secondary.disabled,
          }}
        >
          {isConnecting ? "Connecting..." : "Connect EVM"}
        </Button>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content
            bg={menuColors.background}
            border="1px solid"
            borderColor={menuColors.border}
            borderRadius={materialDesign3Theme.borderRadius.sm}
            boxShadow={materialDesign3Theme.elevation.level3}
            minW="200px"
          >
            {connectors.map((connector) => (
              <Menu.Item
                key={connector.id}
                value={connector.id}
                onClick={() => connect(connector.id)}
                px={4}
                py={3}
                borderRadius={materialDesign3Theme.borderRadius.xs}
                fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                color={menuColors.text}
                _hover={{
                  bg: menuColors.hover,
                  color: menuColors.text,
                }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                cursor="pointer"
              >
                {connector.name}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
        </Portal>
      </Menu.Root>
  );
};

export default EVMWalletButton;
