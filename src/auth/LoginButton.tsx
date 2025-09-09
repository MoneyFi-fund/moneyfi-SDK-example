import React, { useState } from 'react';
import { Button, HStack, VStack, Text, Avatar, Menu, Tooltip, IconButton } from '@chakra-ui/react';
import { KeyboardArrowDown, ContentCopy, Logout, Person } from '@mui/icons-material';
import { useAuth } from './AuthProvider';
import { WalletSelector } from './WalletSelector';
import { truncateAddress } from './utils';

interface LoginButtonProps {
  /** Button variant style */
  variant?: 'solid' | 'outline' | 'ghost';
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show user address when authenticated */
  showAddress?: boolean;
  /** Custom connect button text */
  connectText?: string;
  /** Custom connecting button text */  
  connectingText?: string;
  /** Custom disconnect text in menu */
  disconnectText?: string;
  /** Show wallet name when connected */
  showWalletName?: boolean;
  /** Compact mode for headers/navbars */
  compact?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Custom icon for the button */
  icon?: React.ReactNode;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  variant = 'solid',
  size = 'md',
  showAddress = true,
  connectText = 'Connect Wallet',
  connectingText = 'Connecting...',
  disconnectText = 'Disconnect',
  showWalletName = true,
  compact = false,
  className,
  disabled = false,
  icon,
}) => {
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const { isAuthenticated, isConnecting, user, signOut, error } = useAuth();

  const handleCopyAddress = async () => {
    if (user?.address) {
      try {
        await navigator.clipboard.writeText(user.address);
        // Could integrate with notification system here
      } catch (error) {
        console.warn('Failed to copy address:', error);
      }
    }
  };

  const handleViewExplorer = () => {
    if (user?.address) {
      const explorerUrl = `https://explorer.aptoslabs.com/account/${user.address}`;
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Compact mode for headers/navigation
  if (compact) {
    if (isAuthenticated && user) {
      return (
        <HStack gap={1}>
          <Tooltip content={user.address}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              maxW="120px"
            >
              <Text fontSize="sm" noOfLines={1}>
                {truncateAddress(user.address)}
              </Text>
            </Button>
          </Tooltip>
          
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="Account options"
              >
                <KeyboardArrowDown />
              </IconButton>
            </Menu.Trigger>
            
            <Menu.Content>
              <Menu.Item onClick={handleCopyAddress}>
                <HStack>
                  <ContentCopy fontSize="small" />
                  <Text>Copy Address</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item onClick={handleViewExplorer}>
                <HStack>
                  <Person fontSize="small" />
                  <Text>View Profile</Text>
                </HStack>
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item onClick={signOut} color="red.500">
                <HStack>
                  <Logout fontSize="small" />
                  <Text>{disconnectText}</Text>
                </HStack>
              </Menu.Item>
            </Menu.Content>
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
          loading
          loadingText={connectingText}
        >
          {connectingText}
        </Button>
      );
    }

    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsWalletSelectorOpen(true)}
          disabled={disabled}
        >
          {icon || connectText}
        </Button>

        <WalletSelector
          isOpen={isWalletSelectorOpen}
          onClose={() => setIsWalletSelectorOpen(false)}
        />
      </>
    );
  }

  // Full-featured mode
  if (isAuthenticated && user) {
    return (
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button
            variant={variant}
            size={size}
            rightIcon={<KeyboardArrowDown />}
            maxW="300px"
            className={className}
          >
            <HStack gap={2} minW={0}>
              <Avatar 
                size="sm" 
                name={user.walletName || 'User'} 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.address}`}
              />
              <VStack gap={0} align="start" minW={0}>
                {showWalletName && user.walletName && (
                  <Text fontSize="sm" fontWeight="medium" lineHeight="1" noOfLines={1}>
                    {user.walletName}
                  </Text>
                )}
                {showAddress && (
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    lineHeight="1"
                    noOfLines={1}
                  >
                    {truncateAddress(user.address)}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Button>
        </Menu.Trigger>

        <Menu.Content>
          <Menu.Item onClick={handleCopyAddress}>
            <HStack>
              <ContentCopy fontSize="small" />
              <VStack align="start" gap={0}>
                <Text>Copy Address</Text>
                <Text fontSize="xs" color="gray.500">
                  {truncateAddress(user.address, 10, 8)}
                </Text>
              </VStack>
            </HStack>
          </Menu.Item>
          
          <Menu.Item onClick={handleViewExplorer}>
            <HStack>
              <Person fontSize="small" />
              <Text>View in Explorer</Text>
            </HStack>
          </Menu.Item>
          
          <Menu.Separator />
          
          <Menu.Item onClick={signOut} color="red.500">
            <HStack>
              <Logout fontSize="small" />
              <Text>{disconnectText}</Text>
            </HStack>
          </Menu.Item>
        </Menu.Content>
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
        loading
        loadingText={connectingText}
        className={className}
      >
        {connectingText}
      </Button>
    );
  }

  // Disconnected state
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsWalletSelectorOpen(true)}
        disabled={disabled}
        className={className}
        colorScheme={error ? 'red' : 'blue'}
      >
        {icon && <HStack gap={2}>{icon}<Text>{connectText}</Text></HStack>}
        {!icon && connectText}
      </Button>

      <WalletSelector
        isOpen={isWalletSelectorOpen}
        onClose={() => setIsWalletSelectorOpen(false)}
      />
    </>
  );
};

// Convenience export for compact usage
export const CompactLoginButton: React.FC<Omit<LoginButtonProps, 'compact'>> = (props) => (
  <LoginButton {...props} compact />
);