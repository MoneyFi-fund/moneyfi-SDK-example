import React from 'react';
import { Button, Icon, Tooltip } from '@chakra-ui/react';
import { useTheme } from '@/provider/theme-provider';
import { BiSun, BiMoon } from 'react-icons/bi';
import { materialDesign3Theme } from '@/theme/material-design-3';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'solid' | 'ghost';
  showTooltip?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  variant = 'outline',
  showTooltip = true,
}) => {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === 'dark';

  const buttonContent = (
    <Button
      onClick={toggleMode}
      variant={variant}
      size={size}
      minH={size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}
      minW={size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}
      px={size === 'sm' ? 2 : 3}
      borderRadius="sm"
      bg={variant === 'solid' ? (isDark ? 'neutral.700' : 'neutral.100') : 'transparent'}
      color={isDark ? 'neutral.100' : 'neutral.800'}
      borderColor={variant === 'outline' ? (isDark ? 'neutral.600' : 'neutral.300') : 'transparent'}
      border={variant === 'outline' ? '1px solid' : 'none'}
      boxShadow={variant === 'solid' ? 'sm' : 'none'}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        bg: variant === 'solid' 
          ? (isDark ? 'neutral.600' : 'neutral.200')
          : (isDark ? 'neutral.800' : 'neutral.100'),
        borderColor: variant === 'outline' 
          ? (isDark ? 'neutral.500' : 'neutral.400') 
          : 'transparent',
        transform: 'scale(1.05)',
        boxShadow: variant === 'solid' ? 'md' : 'sm',
      }}
      _active={{
        bg: variant === 'solid' 
          ? (isDark ? 'neutral.500' : 'neutral.300')
          : (isDark ? 'neutral.700' : 'neutral.200'),
        transform: 'scale(0.95)',
        boxShadow: 'sm',
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Icon
        as={isDark ? BiSun : BiMoon}
        fontSize={size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px'}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        transform={isDark ? 'rotate(0deg)' : 'rotate(180deg)'}
      />
    </Button>
  );

  if (showTooltip) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {buttonContent}
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content
            bg={isDark ? 'neutral.200' : 'neutral.800'}
            color={isDark ? 'neutral.800' : 'neutral.100'}
            fontSize={materialDesign3Theme.typography.labelSmall.fontSize}
            px={3}
            py={2}
            borderRadius="xs"
            boxShadow={materialDesign3Theme.elevation.level2}
          >
            Switch to {isDark ? 'light' : 'dark'} mode
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    );
  }

  return buttonContent;
};

// Compact version for use in headers/toolbars
export const CompactThemeToggle: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <Button
      onClick={toggleMode}
      variant="ghost"
      size="sm"
      minH="36px"
      minW="36px"
      p={2}
      borderRadius="full"
      bg="transparent"
      color={isDark ? 'neutral.100' : 'neutral.800'}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        bg: isDark ? 'neutral.800' : 'neutral.100',
        transform: 'scale(1.1)',
      }}
      _active={{
        transform: 'scale(0.9)',
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Icon
        as={isDark ? BiSun : BiMoon}
        fontSize="20px"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        transform={isDark ? 'rotate(0deg)' : 'rotate(0deg)'}
      />
    </Button>
  );
};

export default ThemeToggle;