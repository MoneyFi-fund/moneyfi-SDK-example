import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
  VStack,
} from "@chakra-ui/react";
import { groupAndSortWallets, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAuth } from "@/providers/auth-provider";
import { Platform } from "@/types/common";
import { APTOS_WALLET } from "@/constants/wallet";
import { isEqual, uniqWith } from "lodash";
import WalletOption from "./wallet-option";

type AptosWalletSelectorProps = {
  open: boolean;
  onClose: () => void;
  isModal?: boolean;
};

const AptosWalletSelector = ({ open, onClose, isModal = true }: AptosWalletSelectorProps) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const { handleLogin } = useAuth();
  const { wallets = [], notDetectedWallets = [] } = useWallet();
  const { availableWallets, installableWallets } = groupAndSortWallets([...wallets, ...notDetectedWallets]);

  const handleConnectWallet = (walletName: string) => {
    handleLogin(Platform.APTOS, walletName);
  };

  const handleInstallWallet = (walletName: string, walletInstallUrl: string) => {
    const host = window.location.host;
    const dappUrl = `https://${host}`;
    const encodedDappUrl = encodeURIComponent(dappUrl);
    if (isMobile && !window.aptos) {
      if (walletName === APTOS_WALLET.OKX.name) {
        window.location.href = `${APTOS_WALLET.OKX.url}${encodeURIComponent("okx://wallet/dapp/url?dappUrl=" + encodeURIComponent(dappUrl))}`;
        return;
      }
      if (walletName === APTOS_WALLET.PETRA.name) {
        window.location.href = `${APTOS_WALLET.PETRA.url}${dappUrl}`;
        return;
      }
      if (walletName === APTOS_WALLET.NIGHTLY.name) {
        window.location.href = `${APTOS_WALLET.NIGHTLY.url}${encodedDappUrl}`;
        return;
      }
      if (walletName === APTOS_WALLET.PONTEM.name) {
        window.location.href = `${APTOS_WALLET.PONTEM.url}${dappUrl}`;
        return;
      }
    }
    window.open(walletInstallUrl, "_blank");
  };

  const content = (
    <VStack gap={3} alignItems="stretch">
      {uniqWith(availableWallets, isEqual).map((wallet) => (
        <WalletOption
          key={wallet.name}
          iconUrl={wallet.icon}
          name={wallet.name}
          onClick={() => handleConnectWallet(wallet.name)}
          isInstalled
        />
      ))}

      {installableWallets.map((wallet) => (
        <WalletOption
          key={wallet.name}
          iconUrl={wallet.icon}
          name={wallet.name}
          onClick={() => handleInstallWallet(wallet.name, wallet.url)}
        />
      ))}
    </VStack>
  );

  return (
    <>
      {isModal ? (
        <DialogRoot open={open} onOpenChange={(details) => !details.open && onClose()}>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent maxW="md" mx={4} bg="gray.900" color="white">
              <DialogHeader>
                <DialogTitle fontSize="xl" fontWeight="bold">
                  Select Wallet
                </DialogTitle>
                <DialogCloseTrigger />
              </DialogHeader>
              <DialogBody pb={6}>
                {content}
              </DialogBody>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      ) : (
        content
      )}
    </>
  );
};

export default AptosWalletSelector;
