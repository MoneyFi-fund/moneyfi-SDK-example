type WalletOptionProps = {
  iconUrl: string;
  name: string;
  onClick: () => void;
  isInstalled?: boolean;
};

const WalletOption = ({ iconUrl, name, onClick, isInstalled }: WalletOptionProps) => {
  return (
    <button
      className="flex w-full items-center justify-between gap-4 rounded-md p-2 transition-all hover:cursor-pointer hover:bg-[var(--border-card)]"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <img
          src={iconUrl}
          alt={name}
          className="h-[32px] w-[32px] rounded-md"
        />
        <span className="text-[14px] leading-[18px] font-semibold">{name}</span>
      </div>

      {isInstalled && <span className="text-[12px] leading-[16px] font-semibold text-green-600">Connect</span>}
      {!isInstalled && <span className="font-nomarl text-[12px] leading-[16px] text-[#8e8e92]">Install</span>}
    </button>
  );
};

export default WalletOption;
