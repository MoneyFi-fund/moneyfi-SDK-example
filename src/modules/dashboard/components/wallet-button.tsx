import React from 'react';
import { Button, HStack, Text, Menu, Portal, Box } from '@chakra-ui/react';
import { useAptos } from '@/provider/aptos-provider';
import { truncateAddress } from '@/auth/utils';
import { menuItems } from '@/utils/menu';
import { useNavigate } from '@tanstack/react-router';
import { materialDesign3Theme } from '@/theme/material-design-3';
import { useThemeColors } from '@/provider/theme-provider';

interface WalletButtonProps {
  onConnectClick: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ onConnectClick }) => {
  const { address, isConnected, isConnecting, disconnect } = useAptos();
  const { menuColors, buttonColors, isDark } = useThemeColors();
  const navigate = useNavigate();

  // Simple avatar component
  const SimpleAvatar: React.FC<{ name: string; size?: string }> = ({ name, size = "sm" }) => {
    const displaySize = size === "sm" ? "32px" : "40px";
    return (
      <Box
        w={displaySize}
        h={displaySize}
        borderRadius="full"
        bg="purple.400"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
        fontWeight="medium"
      >
        {name.slice(2, 4).toUpperCase()}
      </Box>
    );
  };

  // If Aptos wallet is connected, show account info with dropdown
  if (isConnected && address) {
    return (
      <Menu.Root positioning={{ placement: "bottom-end"}}>
        <Menu.Trigger asChild>
          <Button
            variant="outline"
            minH="40px"
            px={4}
            borderColor={isDark ? 'rgba(57,255,20,0.4)' : 'rgba(31,174,92,0.4)'}
            border="1px solid"
            borderRadius="sm"
            bg={isDark ? 'rgba(57,255,20,0.08)' : 'rgba(31,174,92,0.08)'}
            boxShadow="sm"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              bg: isDark ? 'rgba(57,255,20,0.15)' : 'rgba(31,174,92,0.15)',
              borderColor: isDark ? '#39FF14' : '#1FAE5C',
              boxShadow: isDark ? '0 0 12px rgba(57,255,20,0.3)' : 'md',
            }}
            _active={{
              bg: isDark ? 'rgba(57,255,20,0.2)' : 'rgba(31,174,92,0.2)',
              boxShadow: "sm",
            }}
          >
            <HStack gap={2}>
              <SimpleAvatar name={address} size="sm" />
              <Text
                fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                fontWeight="medium"
                color={isDark ? '#39FF14' : '#1FAE5C'}
                fontFamily="'JetBrains Mono', monospace"
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
              minW="200px"
            >
              {menuItems.map((item) => (
                <Menu.Item
                  key={item.name}
                  value={item.name.toLowerCase()}
                  onClick={() => navigate({ to: item.path })}
                  cursor="pointer"
                  px={4}
                  py={3}
                  borderRadius={materialDesign3Theme.borderRadius.xs}
                  fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                  color={menuColors.text}
                  _hover={{
                    bg: menuColors.hover,
                    color: menuColors.text
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  {item.name}
                </Menu.Item>
              ))}
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
                  color: menuColors.text
                }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Copy Address
              </Menu.Item>
              <Menu.Item
                value="disconnect"
                onClick={disconnect}
                color="error.600"
                px={4}
                py={3}
                borderRadius={materialDesign3Theme.borderRadius.xs}
                fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                _hover={{ bg: "error.50", color: "error.700" }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Disconnect
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    );
  }

  // If not authenticated, show connect button
  return (
    <Button
      onClick={onConnectClick}
      loading={isConnecting}
      minH="40px"
      px={6}
      bg={isDark ? '#39FF14' : '#1FAE5C'}
      color={isDark ? '#000000' : '#FFFFFF'}
      borderRadius="sm"
      boxShadow="sm"
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      fontWeight="600"
      fontSize="label-lg"
      _hover={{
        bg: isDark ? '#5FFF42' : '#15803D',
        boxShadow: isDark ? '0 0 20px rgba(57,255,20,0.5)' : 'none',
      }}
      _active={{
        bg: isDark ? '#2ECC10' : '#166534',
        boxShadow: "sm",
      }}
      _loading={{
        bg: buttonColors.primary.disabled,
      }}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletButton;