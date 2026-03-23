// Web3 Dark+Green Theme Configuration
// Preserves all MD3 helper function signatures for backward compatibility
export const materialDesign3Theme = {
  // Light Mode — clean minimal with emerald green
  light: {
    primary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#1FAE5C',
      600: '#15803D',
      700: '#166534',
      800: '#14532D',
      900: '#052E16',
    },
    secondary: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#15803D',
      600: '#166534',
      700: '#14532D',
      800: '#052E16',
      900: '#022C22',
    },
    tertiary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#059669',
      600: '#047857',
      700: '#065F46',
      800: '#064E3B',
      900: '#022C22',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#DC2626',
      600: '#B91C1C',
      700: '#991B1B',
      800: '#7F1D1D',
      900: '#450A0A',
    },
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#1FAE5C',
      600: '#15803D',
      700: '#166534',
      800: '#14532D',
      900: '#052E16',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#D97706',
      600: '#B45309',
      700: '#92400E',
      800: '#78350F',
      900: '#451A03',
    },
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    surface: {
      50: '#FFFFFF',
      100: '#FCFCFC',
      200: '#FAFAFA',
      300: '#F8F8F8',
      400: '#F5F5F5',
      500: '#F0F0F0',
      600: '#EBEBEB',
      700: '#E5E5E5',
      800: '#E0E0E0',
      900: '#D4D4D4',
    },
    background: '#F8F8F8',
    onBackground: '#0A0A0A',
    surfaceBg: '#FFFFFF',
    onSurface: '#1A1A1A',
    surfaceVariant: '#F0F0F0',
    onSurfaceVariant: '#666666',
    outline: '#E0E0E0',
    outlineVariant: '#EEEEEE',
  },

  // Dark Mode — cyberpunk neon green on black
  dark: {
    primary: {
      50: '#031A0B',
      100: '#052E16',
      200: '#0A4D22',
      300: '#12753A',
      400: '#1FAE5C',
      500: '#39FF14',
      600: '#5FFF42',
      700: '#85FF70',
      800: '#ABFF9E',
      900: '#D1FFCC',
    },
    secondary: {
      50: '#011A12',
      100: '#033D2B',
      200: '#065F46',
      300: '#047857',
      400: '#059669',
      500: '#1FAE5C',
      600: '#34D399',
      700: '#6EE7B7',
      800: '#A7F3D0',
      900: '#D1FAE5',
    },
    tertiary: {
      50: '#011A12',
      100: '#031A0B',
      200: '#0A3D1E',
      300: '#0F5C2E',
      400: '#15803D',
      500: '#00FF41',
      600: '#39FF14',
      700: '#5FFF42',
      800: '#85FF70',
      900: '#ABFF9E',
    },
    error: {
      50: '#450A0A',
      100: '#7F1D1D',
      200: '#991B1B',
      300: '#B91C1C',
      400: '#DC2626',
      500: '#FF4444',
      600: '#F87171',
      700: '#FCA5A5',
      800: '#FECACA',
      900: '#FEF2F2',
    },
    success: {
      50: '#052E16',
      100: '#0A3D1E',
      200: '#0F5C2E',
      300: '#15803D',
      400: '#1FAE5C',
      500: '#39FF14',
      600: '#5FFF42',
      700: '#85FF70',
      800: '#ABFF9E',
      900: '#D1FFCC',
    },
    warning: {
      50: '#451A03',
      100: '#78350F',
      200: '#92400E',
      300: '#B45309',
      400: '#D97706',
      500: '#FFB800',
      600: '#FBBF24',
      700: '#FCD34D',
      800: '#FDE68A',
      900: '#FEF3C7',
    },
    neutral: {
      50: '#0A0A0A',
      100: '#171717',
      200: '#262626',
      300: '#404040',
      400: '#525252',
      500: '#737373',
      600: '#A3A3A3',
      700: '#D4D4D4',
      800: '#E5E5E5',
      900: '#FAFAFA',
    },
    surface: {
      50: '#000000',
      100: '#060808',
      200: '#0C1010',
      300: '#121616',
      400: '#181E1E',
      500: '#1E2626',
      600: '#252E2E',
      700: '#2E3838',
      800: '#384242',
      900: '#424E4E',
    },
    background: '#000000',
    onBackground: '#E8FFE8',
    surfaceBg: '#060808',
    onSurface: '#D4E8D4',
    surfaceVariant: '#080C08',
    onSurfaceVariant: '#8AAA8A',
    outline: 'rgba(57, 255, 20, 0.12)',
    outlineVariant: 'rgba(57, 255, 20, 0.06)',
  },

  // Common colors — defaults to light for backward compat
  colors: {
    primary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#1FAE5C',
      600: '#15803D',
      700: '#166534',
      800: '#14532D',
      900: '#052E16',
    },
    secondary: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#15803D',
      600: '#166534',
      700: '#14532D',
      800: '#052E16',
      900: '#022C22',
    },
    tertiary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#059669',
      600: '#047857',
      700: '#065F46',
      800: '#064E3B',
      900: '#022C22',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#DC2626',
      600: '#B91C1C',
      700: '#991B1B',
      800: '#7F1D1D',
      900: '#450A0A',
    },
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#1FAE5C',
      600: '#15803D',
      700: '#166534',
      800: '#14532D',
      900: '#052E16',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#D97706',
      600: '#B45309',
      700: '#92400E',
      800: '#78350F',
      900: '#451A03',
    },
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    surface: {
      50: '#FFFFFF',
      100: '#FCFCFC',
      200: '#FAFAFA',
      300: '#F8F8F8',
      400: '#F5F5F5',
      500: '#F0F0F0',
      600: '#EBEBEB',
      700: '#E5E5E5',
      800: '#E0E0E0',
      900: '#D4D4D4',
    },
  },

  // Elevation — cyberpunk neon glow system
  elevation: {
    level0: 'none',
    level1: '0 0 12px rgba(57, 255, 20, 0.15), inset 0 0 20px rgba(57, 255, 20, 0.02)',
    level2: '0 0 24px rgba(57, 255, 20, 0.25), 0 0 4px rgba(57, 255, 20, 0.1)',
    level3: '0 0 40px rgba(57, 255, 20, 0.35), 0 0 8px rgba(57, 255, 20, 0.15)',
    level4: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(57, 255, 20, 0.1)',
    level5: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 50px rgba(57, 255, 20, 0.15)',
  },

  borderRadius: {
    none: '0px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    full: '9999px',
  },

  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
  },

  typography: {
    displayLarge: { fontSize: '57px', lineHeight: '64px', fontWeight: '400', letterSpacing: '-0.25px' },
    displayMedium: { fontSize: '45px', lineHeight: '52px', fontWeight: '400', letterSpacing: '0px' },
    displaySmall: { fontSize: '36px', lineHeight: '44px', fontWeight: '400', letterSpacing: '0px' },
    headlineLarge: { fontSize: '32px', lineHeight: '40px', fontWeight: '400', letterSpacing: '0px' },
    headlineMedium: { fontSize: '28px', lineHeight: '36px', fontWeight: '400', letterSpacing: '0px' },
    headlineSmall: { fontSize: '24px', lineHeight: '32px', fontWeight: '400', letterSpacing: '0px' },
    titleLarge: { fontSize: '22px', lineHeight: '28px', fontWeight: '400', letterSpacing: '0px' },
    titleMedium: { fontSize: '16px', lineHeight: '24px', fontWeight: '500', letterSpacing: '0.15px' },
    titleSmall: { fontSize: '14px', lineHeight: '20px', fontWeight: '500', letterSpacing: '0.1px' },
    labelLarge: { fontSize: '14px', lineHeight: '20px', fontWeight: '500', letterSpacing: '0.1px' },
    labelMedium: { fontSize: '12px', lineHeight: '16px', fontWeight: '500', letterSpacing: '0.5px' },
    labelSmall: { fontSize: '11px', lineHeight: '16px', fontWeight: '500', letterSpacing: '0.5px' },
    bodyLarge: { fontSize: '16px', lineHeight: '24px', fontWeight: '400', letterSpacing: '0.5px' },
    bodyMedium: { fontSize: '14px', lineHeight: '20px', fontWeight: '400', letterSpacing: '0.25px' },
    bodySmall: { fontSize: '12px', lineHeight: '16px', fontWeight: '400', letterSpacing: '0.4px' },
  },

  states: {
    hover: { opacity: 0.08 },
    focus: { opacity: 0.12 },
    pressed: { opacity: 0.12 },
    disabled: { opacity: 0.38 },
  },

  components: {
    card: { borderRadius: '12px', elevation: 'level1', padding: '16px' },
    button: { borderRadius: '8px', padding: '12px 24px', minHeight: '40px' },
    input: { borderRadius: '8px', padding: '12px 16px', minHeight: '40px' },
    modal: { borderRadius: '16px', elevation: 'level5' },
  },
};

// Theme helper functions — signatures preserved for backward compat
export const getElevationStyle = (level: keyof typeof materialDesign3Theme.elevation) => ({
  boxShadow: materialDesign3Theme.elevation[level],
});

export const getTypographyStyle = (variant: keyof typeof materialDesign3Theme.typography) =>
  materialDesign3Theme.typography[variant];

export const getColorWithOpacity = (color: string, opacity: number) =>
  `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;

export const getThemeColors = (mode: 'light' | 'dark') => {
  return mode === 'dark' ? materialDesign3Theme.dark : materialDesign3Theme.light;
};

export const getThemedColor = (mode: 'light' | 'dark', colorPath: string): string => {
  const colors = getThemeColors(mode);
  const pathParts = colorPath.split('.');
  let result: any = colors;

  for (const part of pathParts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part];
    } else {
      result = materialDesign3Theme.light;
      for (const fallbackPart of pathParts) {
        if (result && typeof result === 'object' && fallbackPart in result) {
          result = result[fallbackPart];
        } else {
          return '#000000';
        }
      }
      break;
    }
  }

  return typeof result === 'string' ? result : '#000000';
};

// Component-specific themed color helpers
export const getCardColors = (mode: 'light' | 'dark') => {
  const colors = getThemeColors(mode);
  return {
    background: mode === 'dark' ? 'rgba(6, 20, 6, 0.75)' : colors.surfaceBg,
    border: mode === 'dark' ? 'rgba(57, 255, 20, 0.12)' : colors.outlineVariant,
    text: colors.onSurface,
    textSecondary: colors.onSurfaceVariant,
  };
};

export const getButtonColors = (mode: 'light' | 'dark', variant: 'primary' | 'secondary' | 'error') => {
  const colors = getThemeColors(mode);
  const variantColors = colors[variant];

  return {
    background: variantColors[500],
    hover: variantColors[mode === 'dark' ? 400 : 600],
    active: variantColors[mode === 'dark' ? 300 : 700],
    disabled: colors.neutral[mode === 'dark' ? 300 : 300],
    // Black text on neon green in dark mode for high contrast
    text: mode === 'dark' && variant === 'primary' ? '#000000' : mode === 'dark' ? colors.neutral[900] : '#FFFFFF',
  };
};

export const getMenuColors = (mode: 'light' | 'dark') => {
  const colors = getThemeColors(mode);
  return {
    background: mode === 'dark' ? 'rgba(6, 8, 6, 0.95)' : colors.surfaceBg,
    border: colors.outline,
    text: colors.onSurface,
    textSecondary: colors.onSurfaceVariant,
    hover: mode === 'dark' ? 'rgba(57, 255, 20, 0.06)' : colors.surfaceVariant,
    separator: colors.outlineVariant,
  };
};

// Chakra UI compatible theme extension
export const chakraUIThemeExtension = {
  colors: materialDesign3Theme.colors,
  shadows: materialDesign3Theme.elevation,
  radii: materialDesign3Theme.borderRadius,
  space: materialDesign3Theme.spacing,
  fontSizes: {
    'display-lg': materialDesign3Theme.typography.displayLarge.fontSize,
    'display-md': materialDesign3Theme.typography.displayMedium.fontSize,
    'display-sm': materialDesign3Theme.typography.displaySmall.fontSize,
    'headline-lg': materialDesign3Theme.typography.headlineLarge.fontSize,
    'headline-md': materialDesign3Theme.typography.headlineMedium.fontSize,
    'headline-sm': materialDesign3Theme.typography.headlineSmall.fontSize,
    'title-lg': materialDesign3Theme.typography.titleLarge.fontSize,
    'title-md': materialDesign3Theme.typography.titleMedium.fontSize,
    'title-sm': materialDesign3Theme.typography.titleSmall.fontSize,
    'label-lg': materialDesign3Theme.typography.labelLarge.fontSize,
    'label-md': materialDesign3Theme.typography.labelMedium.fontSize,
    'label-sm': materialDesign3Theme.typography.labelSmall.fontSize,
    'body-lg': materialDesign3Theme.typography.bodyLarge.fontSize,
    'body-md': materialDesign3Theme.typography.bodyMedium.fontSize,
    'body-sm': materialDesign3Theme.typography.bodySmall.fontSize,
  },
  lineHeights: {
    'display-lg': materialDesign3Theme.typography.displayLarge.lineHeight,
    'display-md': materialDesign3Theme.typography.displayMedium.lineHeight,
    'display-sm': materialDesign3Theme.typography.displaySmall.lineHeight,
    'headline-lg': materialDesign3Theme.typography.headlineLarge.lineHeight,
    'headline-md': materialDesign3Theme.typography.headlineMedium.lineHeight,
    'headline-sm': materialDesign3Theme.typography.headlineSmall.lineHeight,
    'title-lg': materialDesign3Theme.typography.titleLarge.lineHeight,
    'title-md': materialDesign3Theme.typography.titleMedium.lineHeight,
    'title-sm': materialDesign3Theme.typography.titleSmall.lineHeight,
    'label-lg': materialDesign3Theme.typography.labelLarge.lineHeight,
    'label-md': materialDesign3Theme.typography.labelMedium.lineHeight,
    'label-sm': materialDesign3Theme.typography.labelSmall.lineHeight,
    'body-lg': materialDesign3Theme.typography.bodyLarge.lineHeight,
    'body-md': materialDesign3Theme.typography.bodyMedium.lineHeight,
    'body-sm': materialDesign3Theme.typography.bodySmall.lineHeight,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
