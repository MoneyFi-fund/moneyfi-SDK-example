import { Box, Spinner, VStack, Text } from '@chakra-ui/react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Loading({ message = "Loading...", size = "lg" }: LoadingProps) {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(255, 255, 255, 0.9)"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack gap={4}>
        <Spinner
          size={size}
          color="blue.500"
          borderWidth="2px"
        />
        <Text fontSize="md" color="gray.600" fontWeight="medium">
          {message}
        </Text>
      </VStack>
    </Box>
  );
}