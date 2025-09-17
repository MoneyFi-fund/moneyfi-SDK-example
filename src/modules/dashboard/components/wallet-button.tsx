import React from 'react';
import { Button, HStack, Text, Menu, Portal, Box } from '@chakra-ui/react';
import { useAuth } from '@/provider/auth-provider';
import { truncateAddress } from '@/auth/utils';
import { menuItems } from '@/utils/menu';
import { useNavigate } from '@tanstack/react-router';
import { materialDesign3Theme } from '@/theme/material-design-3';
import { useThemeColors } from '@/provider/theme-provider';

interface WalletButtonProps {
  onConnectClick: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ onConnectClick }) => {
  const { isAuthenticated, user, isConnecting, signOut } = useAuth();
  const { menuColors, buttonColors } = useThemeColors();
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

  // If user is authenticated, show account info with dropdown
  if (isAuthenticated && user) {
    return (
      <Menu.Root positioning={{ placement: "bottom-end"}}>
        <Menu.Trigger asChild>
          <Button
            variant="outline"
            minH="40px"
            px={4}
            borderColor="neutral.300"
            border="1px solid"
            borderRadius="sm"
            bg="surface.50"
            boxShadow="sm"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              bg: "neutral.100",
              borderColor: "neutral.400",
              boxShadow: "md",
            }}
            _active={{
              bg: "neutral.200",
              boxShadow: "sm",
            }}
          >
            <HStack gap={2}>
              <SimpleAvatar name={user.address} size="sm" />
              <Text
                fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                fontWeight="medium"
                color="black"
              >
                {truncateAddress(user.address)}
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
                onClick={() => navigator.clipboard.writeText(user.address)}
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
                onClick={signOut}
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
      bg={buttonColors.primary.background}
      color={buttonColors.primary.text}
      borderRadius="sm"
      boxShadow="sm"
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      fontWeight="medium"
      fontSize="label-lg"
      _hover={{
        bg: buttonColors.primary.hover,
        boxShadow: "md",
      }}
      _active={{
        bg: buttonColors.primary.active,
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