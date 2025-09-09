import { 
  Dialog, 
  Button, 
  VStack, 
  Text, 
  Image, 
  Alert,
  Spinner,
  Box,
  HStack,
  Link,
  Icon,
} from "@chakra-ui/react";
import { OpenInNew } from "@mui/icons-material";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { useWalletService } from "@/hooks/useWalletService";
import { useNotifications } from "@/hooks/useNotifications";

interface Wallet {
  name: string;
  readyState?: string;
  url?: string;
}

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletInfo {
  name: string;
  icon: string;
  downloadUrl?: string;
  description: string;
}

const WALLET_INFO: Record<string, WalletInfo> = {
  "Petra": {
    name: "Petra",
    icon: "https://petra.app/favicon.ico",
    downloadUrl: "https://petra.app/",
    description: "The Aptos wallet for everyone",
  },
  "Martian": {
    name: "Martian",
    icon: "https://martianwallet.xyz/favicon.ico", 
    downloadUrl: "https://martianwallet.xyz/",
    description: "Multi-chain wallet for Aptos",
  },
  "Pontem": {
    name: "Pontem",
    icon: "https://pontem.network/favicon.ico",
    downloadUrl: "https://chrome.google.com/webstore/detail/pontem-aptos-wallet/phkbamefinggmakgklpkljjmgibohnba",
    description: "Secure Aptos wallet",
  },
  "Fewcha": {
    name: "Fewcha",
    icon: "https://fewcha.app/favicon.ico",
    downloadUrl: "https://fewcha.app/",
    description: "Feature-rich Aptos wallet",
  },
  "Rise": {
    name: "Rise",
    icon: "https://risewallet.io/favicon.ico",
    downloadUrl: "https://risewallet.io/",
    description: "Next-gen crypto wallet",
  },
};

export const WalletConnectModal = ({ isOpen, onClose }: WalletConnectModalProps) => {
  const { wallets } = useWallet();
  const walletService = useWalletService();
  const { showSuccess, showError } = useNotifications();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const handleWalletConnect = async (wallet: Wallet) => {
    if (!wallet.readyState || wallet.readyState === "NotDetected") {
      return;
    }

    setConnectingWallet(wallet.name);
    
    try {
      await walletService.connect(wallet.name);
      showSuccess("Wallet Connected", `Successfully connected to ${wallet.name}`);
      onClose();
    } catch (error: any) {
      showError("Connection Failed", error.message || "Failed to connect wallet");
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleInstallWallet = (walletName: string) => {
    const walletInfo = WALLET_INFO[walletName];
    if (walletInfo?.downloadUrl) {
      window.open(walletInfo.downloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  const getWalletStatus = (wallet: Wallet) => {
    if (!wallet.readyState) return "loading";
    if (wallet.readyState === "Installed") return "installed";
    if (wallet.readyState === "NotDetected") return "not-detected";
    return "loading";
  };

  const installedWallets = wallets.filter(wallet => getWalletStatus(wallet) === "installed");
  const notDetectedWallets = wallets.filter(wallet => getWalletStatus(wallet) === "not-detected");

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Content maxW="md">
        <Dialog.Header>
          <Dialog.Title>Connect Wallet</Dialog.Title>
        </Dialog.Header>
        
        <Dialog.Body>
          <VStack gap={4} align="stretch">
            {/* Installed Wallets */}
            {installedWallets.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="fg.secondary" mb={3}>
                  Available Wallets
                </Text>
                <VStack gap={2} align="stretch">
                  {installedWallets.map((wallet) => {
                    const walletInfo = WALLET_INFO[wallet.name];
                    const isConnecting = connectingWallet === wallet.name;
                    
                    return (
                      <Button
                        key={wallet.name}
                        onClick={() => handleWalletConnect(wallet)}
                        disabled={isConnecting}
                        variant="outline"
                        size="lg"
                        justifyContent="flex-start"
                        h="auto"
                        p={4}
                      >
                        <HStack w="full" justify="space-between">
                          <HStack gap={3}>
                            {walletInfo?.icon ? (
                              <Image
                                src={walletInfo.icon}
                                alt={wallet.name}
                                boxSize={8}
                                borderRadius="md"
                              />
                            ) : (
                              <Box 
                                boxSize={8} 
                                bg="gray.200" 
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text fontSize="xs" fontWeight="bold">
                                  {wallet.name.charAt(0)}
                                </Text>
                              </Box>
                            )}
                            <VStack align="start" gap={0}>
                              <Text fontWeight="medium">{wallet.name}</Text>
                              {walletInfo?.description && (
                                <Text fontSize="xs" color="fg.secondary">
                                  {walletInfo.description}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                          
                          {isConnecting && <Spinner size="sm" />}
                        </HStack>
                      </Button>
                    );
                  })}
                </VStack>
              </Box>
            )}

            {/* Not Detected Wallets */}
            {notDetectedWallets.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="fg.secondary" mb={3}>
                  Install a Wallet
                </Text>
                <VStack gap={2} align="stretch">
                  {notDetectedWallets.map((wallet) => {
                    const walletInfo = WALLET_INFO[wallet.name];
                    
                    return (
                      <Button
                        key={wallet.name}
                        onClick={() => handleInstallWallet(wallet.name)}
                        variant="ghost"
                        size="lg"
                        justifyContent="flex-start"
                        h="auto"
                        p={4}
                        opacity={0.7}
                        _hover={{ opacity: 1 }}
                      >
                        <HStack w="full" justify="space-between">
                          <HStack gap={3}>
                            {walletInfo?.icon ? (
                              <Image
                                src={walletInfo.icon}
                                alt={wallet.name}
                                boxSize={8}
                                borderRadius="md"
                              />
                            ) : (
                              <Box 
                                boxSize={8} 
                                bg="gray.200" 
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text fontSize="xs" fontWeight="bold">
                                  {wallet.name.charAt(0)}
                                </Text>
                              </Box>
                            )}
                            <VStack align="start" gap={0}>
                              <Text fontWeight="medium">{wallet.name}</Text>
                              <Text fontSize="xs" color="fg.secondary">
                                Not installed
                              </Text>
                            </VStack>
                          </HStack>
                          
                          <Icon asChild color="fg.secondary">
                            <OpenInNew />
                          </Icon>
                        </HStack>
                      </Button>
                    );
                  })}
                </VStack>
              </Box>
            )}

            {/* No Wallets Available */}
            {wallets.length === 0 && (
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>No Wallets Detected</Alert.Title>
                  <Alert.Description>
                    Please install an Aptos wallet extension to continue.{" "}
                    <Link
                      href="https://petra.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="accent"
                      textDecoration="underline"
                    >
                      Download Petra Wallet
                    </Link>
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            {/* Help Text */}
            <Alert.Root status="info" variant="subtle">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description fontSize="sm">
                  By connecting a wallet, you agree to our{" "}
                  <Link color="accent" textDecoration="underline">
                    Terms of Service
                  </Link>{" "}
                  and acknowledge that you have read our{" "}
                  <Link color="accent" textDecoration="underline">
                    Privacy Policy
                  </Link>
                  .
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          </VStack>
        </Dialog.Body>
        
        <Dialog.Footer>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
};