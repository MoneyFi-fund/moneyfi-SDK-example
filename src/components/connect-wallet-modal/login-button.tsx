import { useTranslation } from "react-i18next";
import { type JSX } from "react";
import { cn } from "@/utils/utils";
import { useAuth } from "@/provider/AuthProvider";
import { AppName, Platform } from "@/types/common";
import { APP_NAME } from "@/constants/common";

interface ILoginButtonProps {
  icon?: JSX.Element;
}
export default function LoginButton({ icon }: ILoginButtonProps) {
  const { t } = useTranslation();
  const { setOpenConnectModal, handleLogin } = useAuth();

  const handleConnect = async () => {
    if (APP_NAME === AppName.APTOS) {
      setOpenConnectModal(true);
    } else {
      handleLogin(Platform.EVM);
    }
  };

  return (
    <button
      onClick={handleConnect}
      className={cn(
        "rounded-3xl px-4 py-2 font-bold transition-all duration-300 ease-in-out hover:cursor-pointer",
        icon
          ? "border border-green-600 text-green-600 hover:scale-105 hover:border-green-800 hover:bg-green-800 hover:text-white" // outlined style
          : "w-[120px] bg-green-600 text-white hover:scale-105 hover:bg-green-700" // filled style
      )}
    >
      {icon ? icon : t("navbar.login")}
    </button>
  );
}
