import { useState } from "react";
import AptosWalletSelector from "./aptos-wallet-selector";

const AptosConnectWallet = () => {
  const [openAptosWalletSelector, setOpenAptosWalletSelector] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpenAptosWalletSelector(true)}
        className="rounded-lg bg-[#252629] hover:cursor-pointer hover:bg-[#2b2c30]"
      >
        <div className="flex items-center gap-4 p-3">
          <div className="flex size-[32px] items-center justify-center rounded-md bg-black">
            <img
              src="/icons/aptos/aptos.svg"
              alt="aptos-wallet"
              className="size-[24px]"
            />
          </div>
          <p className="text-[14px] leading-[18px] font-semibold">Aptos</p>
        </div>
      </button>
      <AptosWalletSelector
        open={openAptosWalletSelector}
        onClose={() => setOpenAptosWalletSelector(false)}
      />
    </>
  );
};

export default AptosConnectWallet;
