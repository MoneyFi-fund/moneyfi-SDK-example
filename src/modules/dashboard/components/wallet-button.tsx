import React from 'react';
import { Button, HStack, Text, Menu, Portal, Box, Spinner } from '@chakra-ui/react';
import { useAuth } from '@/provider/auth-provider';
import { truncateAddress } from '@/auth/utils';

interface WalletButtonProps {
  onConnectClick: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ onConnectClick }) => {
  const { isAuthenticated, user, isConnecting, signOut } = useAuth();

  // Simple avatar component
  const SimpleAvatar: React.FC<{ name: string; size?: string }> = ({ name, size = "sm" }) => {
    const displaySize = size === "sm" ? "32px" : "40px";
    return (
      <Box
        w={displaySize}
        h={displaySize}
        borderRadius="full"
        bg="blue.500"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="sm"
        fontWeight="bold"
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
            size="md"
            h="40px"
            borderColor="black"
            _hover={{ bg: "gray.200" }}
          >
            <HStack gap={2}>
              <SimpleAvatar name={user.address} size="sm" />
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                {truncateAddress(user.address)}
              </Text>
            </HStack>
          </Button>
        </Menu.Trigger>
        
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="copy" onClick={() => navigator.clipboard.writeText(user.address)}>
                Copy Address
              </Menu.Item>
              <Menu.Item 
                value="disconnect" 
                onClick={signOut} 
                color="red.500"
                _hover={{ bg: "red.50" }}
                borderRadius="sm"
                px={3}
                py={2}
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
      size="md"
      h="40px"
      colorScheme="blue"
      variant="solid"
      border="1px solid"
      transition="background-color 0.2s"
      _hover={{ bg: "blue.200" }}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletButton;