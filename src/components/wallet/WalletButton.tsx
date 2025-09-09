import React from 'react';
import { Button, HStack, Text, MenuRoot, MenuTrigger, MenuContent, MenuItem, Box } from '@chakra-ui/react';
import { useAuth } from '@/providers/auth-provider';
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
      <MenuRoot>
        <MenuTrigger asChild>
          <Button
            variant="outline"
            size="md"
            h="40px"
            borderColor="gray.200"
            _hover={{ bg: "gray.50" }}
          >
            <HStack gap={2}>
              <SimpleAvatar name={user.address} size="sm" />
              <Text fontSize="sm" fontWeight="medium">
                {truncateAddress(user.address)}
              </Text>
            </HStack>
          </Button>
        </MenuTrigger>
        
        <MenuContent>
          <MenuItem value="copy" onClick={() => navigator.clipboard.writeText(user.address)}>
            Copy Address
          </MenuItem>
          <MenuItem value="disconnect" onClick={signOut} color="red.500">
            Disconnect
          </MenuItem>
        </MenuContent>
      </MenuRoot>
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
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletButton;