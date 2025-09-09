import { Button, HStack, Text, Image, Box } from "@chakra-ui/react";

type WalletOptionProps = {
  iconUrl: string;
  name: string;
  onClick: () => void;
  isInstalled?: boolean;
};

const WalletOption = ({ iconUrl, name, onClick, isInstalled }: WalletOptionProps) => {
  return (
    <Button
      w="full"
      h="auto"
      p={4}
      bg="gray.800"
      _hover={{ bg: "gray.700" }}
      borderRadius="md"
      justifyContent="space-between"
      onClick={onClick}
      variant="ghost"
    >
      <HStack gap={3}>
        <Box w="32px" h="32px" borderRadius="md" overflow="hidden">
          <Image src={iconUrl} alt={name} w="32px" h="32px" />
        </Box>
        <Text fontSize="sm" fontWeight="semibold" color="white">
          {name}
        </Text>
      </HStack>

      {isInstalled && (
        <Text fontSize="xs" fontWeight="semibold" color="green.400">
          Connect
        </Text>
      )}
      {!isInstalled && (
        <Text fontSize="xs" color="gray.400">
          Install
        </Text>
      )}
    </Button>
  );
};

export default WalletOption;
