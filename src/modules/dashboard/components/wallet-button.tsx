import React from 'react';
import { Button, HStack, Text, Menu, Portal, Box } from '@chakra-ui/react';
import { useAuth } from '@/provider/auth-provider';
import { truncateAddress } from '@/auth/utils';
import { menuItems } from '@/utils/menu';
import { useNavigate } from '@tanstack/react-router';

interface WalletButtonProps {
  onConnectClick: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ onConnectClick }) => {
  const { isAuthenticated, user, isConnecting, signOut } = useAuth();
  const navigate = useNavigate();

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
            border="3px solid black"
            borderRadius="0"
            bg="white"
            boxShadow="5px 5px 0px black"
            transition="all 0.3s ease"
            _hover={{ 
              bg: "gray.50",
              transform: "translate(2px, 2px)",
              boxShadow: "3px 3px 0px black"
            }}
            _active={{
              transform: "translate(4px, 4px)",
              boxShadow: "1px 1px 0px black"
            }}
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
              {menuItems.map((item) => (
                <Menu.Item 
                  key={item.name} 
                  value={item.name.toLowerCase()}
                  onClick={() => navigate({ to: item.path })}
                  cursor="pointer"
                >
                  {item.name}
                </Menu.Item>
              ))}
              <Menu.Separator />
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
      bg="blue.400"
      color="white"
      border="3px solid black"
      borderRadius="0"
      boxShadow="5px 5px 0px black"
      transition="all 0.3s ease"
      fontWeight="bold"
      _hover={{ 
        bg: "blue.500",
        transform: "translate(2px, 2px)",
        boxShadow: "3px 3px 0px black"
      }}
      _active={{
        transform: "translate(4px, 4px)",
        boxShadow: "1px 1px 0px black"
      }}
      _loading={{
        bg: "blue.300",
        transform: "none",
        boxShadow: "5px 5px 0px black"
      }}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletButton;