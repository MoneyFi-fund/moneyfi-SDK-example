import WalletButton from "@/modules/dashboard/components/wallet-button";
import { Box, Container, HStack, Text, Image } from "@chakra-ui/react";
import { useState } from "react";
import moneyFi from "../../../public/logo/logo.svg";
import WalletConnectModal from "@/modules/dashboard/components/wallet-connect-modal";

export default function Header() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <Box bg="white" borderBottom="1px solid" borderColor="border" py={4}>
      <Container maxW="7xl">
        <HStack justify="space-between" align="center">
          <HStack align="center" spaceX={2}>
            <Image src={moneyFi} alt="MoneyFi Logo" boxSize="40px" />
            <Text
              fontSize="2xl"
              fontWeight="medium"
              color="black"
              className="text-xl"
            >
              MoneyFi SDK
            </Text>
          </HStack>
          <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />

          <WalletConnectModal
            isOpen={isWalletModalOpen}
            onClose={() => setIsWalletModalOpen(false)}
          />
        </HStack>
      </Container>
    </Box>
  );
}
