import { Box, Spinner, VStack, Text } from '@chakra-ui/react';
import { useThemeColors } from '@/provider/theme-provider';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Loading({ message = "Loading...", size = "lg" }: LoadingProps) {
  const { isDark } = useThemeColors();

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg={isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'}
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack gap={4}>
        <Spinner
          size={size}
          color={isDark ? '#39FF14' : '#1FAE5C'}
          borderWidth="2px"
        />
        <Text fontSize="md" color={isDark ? '#E0E0E0' : '#666666'} fontWeight="medium">
          {message}
        </Text>
      </VStack>
    </Box>
  );
}
