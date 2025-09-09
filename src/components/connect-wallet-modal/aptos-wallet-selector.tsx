import { Dialog, useMediaQuery, useTheme } from "@mui/material";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
    <div className="flex flex-col">
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
    </div>
  );

  return (
    <>
      {isModal ? (
        <Dialog
          open={open}
          onClose={onClose}
          className="!z-[1000]"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            backdropFilter: "blur(3px)",
          }}
          PaperProps={{
            style: {
              backgroundImage: "none",
              boxShadow: "none",
            },
            sx: {
              margin: "12px !important",
              width: "100%",
              maxWidth: "360px",
              borderRadius: "24px",
              bgcolor: "#1f2023",
              padding: "16px",
            },
          }}
        >
          {content}
        </Dialog>
      ) : (
        content
      )}
    </>
  );
};

export default AptosWalletSelector;
