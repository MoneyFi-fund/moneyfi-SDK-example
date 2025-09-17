import { createSystem, defaultConfig } from "@chakra-ui/react"

// Dynamic theme colors that will be updated by the theme provider
const createDynamicColors = () => ({
  // Primary Colors (Green) - Light mode defaults
  primary: {
    50: 'var(--chakra-colors-primary-50)',
    100: 'var(--chakra-colors-primary-100)',
    200: 'var(--chakra-colors-primary-200)',
    300: 'var(--chakra-colors-primary-300)',
    400: 'var(--chakra-colors-primary-400)',
    500: 'var(--chakra-colors-primary-500)',
    600: 'var(--chakra-colors-primary-600)',
    700: 'var(--chakra-colors-primary-700)',
    800: 'var(--chakra-colors-primary-800)',
    900: 'var(--chakra-colors-primary-900)',
  },

  // Secondary Colors (Purple)
  secondary: {
    50: 'var(--chakra-colors-secondary-50)',
    100: 'var(--chakra-colors-secondary-100)',
    200: 'var(--chakra-colors-secondary-200)',
    300: 'var(--chakra-colors-secondary-300)',
    400: 'var(--chakra-colors-secondary-400)',
    500: 'var(--chakra-colors-secondary-500)',
    600: 'var(--chakra-colors-secondary-600)',
    700: 'var(--chakra-colors-secondary-700)',
    800: 'var(--chakra-colors-secondary-800)',
    900: 'var(--chakra-colors-secondary-900)',
  },

  // Tertiary Colors (Blue)
  tertiary: {
    50: 'var(--chakra-colors-tertiary-50)',
    100: 'var(--chakra-colors-tertiary-100)',
    200: 'var(--chakra-colors-tertiary-200)',
    300: 'var(--chakra-colors-tertiary-300)',
    400: 'var(--chakra-colors-tertiary-400)',
    500: 'var(--chakra-colors-tertiary-500)',
    600: 'var(--chakra-colors-tertiary-600)',
    700: 'var(--chakra-colors-tertiary-700)',
    800: 'var(--chakra-colors-tertiary-800)',
    900: 'var(--chakra-colors-tertiary-900)',
  },

  // Error Colors (Red)
  error: {
    50: 'var(--chakra-colors-error-50)',
    100: 'var(--chakra-colors-error-100)',
    200: 'var(--chakra-colors-error-200)',
    300: 'var(--chakra-colors-error-300)',
    400: 'var(--chakra-colors-error-400)',
    500: 'var(--chakra-colors-error-500)',
    600: 'var(--chakra-colors-error-600)',
    700: 'var(--chakra-colors-error-700)',
    800: 'var(--chakra-colors-error-800)',
    900: 'var(--chakra-colors-error-900)',
  },

  // Success Colors
  success: {
    50: 'var(--chakra-colors-success-50)',
    100: 'var(--chakra-colors-success-100)',
    200: 'var(--chakra-colors-success-200)',
    300: 'var(--chakra-colors-success-300)',
    400: 'var(--chakra-colors-success-400)',
    500: 'var(--chakra-colors-success-500)',
    600: 'var(--chakra-colors-success-600)',
    700: 'var(--chakra-colors-success-700)',
    800: 'var(--chakra-colors-success-800)',
    900: 'var(--chakra-colors-success-900)',
  },

  // Warning Colors (Orange)
  warning: {
    50: 'var(--chakra-colors-warning-50)',
    100: 'var(--chakra-colors-warning-100)',
    200: 'var(--chakra-colors-warning-200)',
    300: 'var(--chakra-colors-warning-300)',
    400: 'var(--chakra-colors-warning-400)',
    500: 'var(--chakra-colors-warning-500)',
    600: 'var(--chakra-colors-warning-600)',
    700: 'var(--chakra-colors-warning-700)',
    800: 'var(--chakra-colors-warning-800)',
    900: 'var(--chakra-colors-warning-900)',
  },

  // Neutral Colors
  neutral: {
    50: 'var(--chakra-colors-neutral-50)',
    100: 'var(--chakra-colors-neutral-100)',
    200: 'var(--chakra-colors-neutral-200)',
    300: 'var(--chakra-colors-neutral-300)',
    400: 'var(--chakra-colors-neutral-400)',
    500: 'var(--chakra-colors-neutral-500)',
    600: 'var(--chakra-colors-neutral-600)',
    700: 'var(--chakra-colors-neutral-700)',
    800: 'var(--chakra-colors-neutral-800)',
    900: 'var(--chakra-colors-neutral-900)',
  },

  // Surface Colors
  surface: {
    50: 'var(--chakra-colors-surface-50)',
    100: 'var(--chakra-colors-surface-100)',
    200: 'var(--chakra-colors-surface-200)',
    300: 'var(--chakra-colors-surface-300)',
    400: 'var(--chakra-colors-surface-400)',
    500: 'var(--chakra-colors-surface-500)',
    600: 'var(--chakra-colors-surface-600)',
    700: 'var(--chakra-colors-surface-700)',
    800: 'var(--chakra-colors-surface-800)',
    900: 'var(--chakra-colors-surface-900)',
  },

  // Semantic Colors
  background: 'var(--chakra-colors-background)',
  onBackground: 'var(--chakra-colors-on-background)',
  surfaceBg: 'var(--chakra-colors-surface-bg)',
  onSurface: 'var(--chakra-colors-on-surface)',
  surfaceVariant: 'var(--chakra-colors-surface-variant)',
  onSurfaceVariant: 'var(--chakra-colors-on-surface-variant)',
  outline: 'var(--chakra-colors-outline)',
  outlineVariant: 'var(--chakra-colors-outline-variant)',
});

// Material Design 3 Shadows (Elevation System)
const materialDesign3Shadows = {
  xs: 'none',
  sm: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  md: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  lg: '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
  xl: '0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
  '2xl': '0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
}

// Material Design 3 Border Radius
const materialDesign3Radii = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  full: '9999px',
}

// Create the custom Chakra UI system with Material Design 3
export const chakraTheme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        // Primary Colors (Green)
        primary: {
          50: { value: '#E8F5E8' },
          100: { value: '#C8E6C8' },
          200: { value: '#A5D6A5' },
          300: { value: '#81C784' },
          400: { value: '#66BB6A' },
          500: { value: '#4CAF50' },
          600: { value: '#43A047' },
          700: { value: '#388E3C' },
          800: { value: '#2E7D32' },
          900: { value: '#1B5E20' },
        },
        // Secondary Colors (Purple)
        secondary: {
          50: { value: '#F3E5F5' },
          100: { value: '#E1BEE7' },
          200: { value: '#CE93D8' },
          300: { value: '#BA68C8' },
          400: { value: '#AB47BC' },
          500: { value: '#9C27B0' },
          600: { value: '#8E24AA' },
          700: { value: '#7B1FA2' },
          800: { value: '#6A1B9A' },
          900: { value: '#4A148C' },
        },
        // Tertiary Colors (Blue)
        tertiary: {
          50: { value: '#E8F4FD' },
          100: { value: '#C5E4FB' },
          200: { value: '#9FD3F8' },
          300: { value: '#79C2F5' },
          400: { value: '#5CB5F3' },
          500: { value: '#42A5F5' },
          600: { value: '#3D9BE9' },
          700: { value: '#368FDC' },
          800: { value: '#2F83CF' },
          900: { value: '#1E6BB8' },
        },
        // Error Colors (Red)
        error: {
          50: { value: '#FFEBEE' },
          100: { value: '#FFCDD2' },
          200: { value: '#EF9A9A' },
          300: { value: '#E57373' },
          400: { value: '#EF5350' },
          500: { value: '#F44336' },
          600: { value: '#E53935' },
          700: { value: '#D32F2F' },
          800: { value: '#C62828' },
          900: { value: '#B71C1C' },
        },
        // Success Colors
        success: {
          50: { value: '#E8F5E8' },
          100: { value: '#C8E6C8' },
          200: { value: '#A5D6A5' },
          300: { value: '#81C784' },
          400: { value: '#66BB6A' },
          500: { value: '#4CAF50' },
          600: { value: '#43A047' },
          700: { value: '#388E3C' },
          800: { value: '#2E7D32' },
          900: { value: '#1B5E20' },
        },
        // Warning Colors (Orange)
        warning: {
          50: { value: '#FFF3E0' },
          100: { value: '#FFE0B2' },
          200: { value: '#FFCC80' },
          300: { value: '#FFB74D' },
          400: { value: '#FFA726' },
          500: { value: '#FF9800' },
          600: { value: '#FB8C00' },
          700: { value: '#F57C00' },
          800: { value: '#EF6C00' },
          900: { value: '#E65100' },
        },
        // Neutral Colors
        neutral: {
          50: { value: '#FAFAFA' },
          100: { value: '#F5F5F5' },
          200: { value: '#EEEEEE' },
          300: { value: '#E0E0E0' },
          400: { value: '#BDBDBD' },
          500: { value: '#9E9E9E' },
          600: { value: '#757575' },
          700: { value: '#616161' },
          800: { value: '#424242' },
          900: { value: '#212121' },
        },
        // Surface Colors
        surface: {
          50: { value: '#FFFFFF' },
          100: { value: '#FEFEFE' },
          200: { value: '#FDFDFD' },
          300: { value: '#FBFBFB' },
          400: { value: '#F9F9F9' },
          500: { value: '#F7F7F7' },
          600: { value: '#F5F5F5' },
          700: { value: '#F3F3F3' },
          800: { value: '#F1F1F1' },
          900: { value: '#EEEEEE' },
        },
      },
      shadows: {
        xs: { value: 'none' },
        sm: { value: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)' },
        md: { value: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)' },
        lg: { value: '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)' },
        xl: { value: '0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)' },
        '2xl': { value: '0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)' },
      },
      radii: {
        none: { value: '0px' },
        xs: { value: '4px' },
        sm: { value: '8px' },
        md: { value: '12px' },
        lg: { value: '16px' },
        xl: { value: '20px' },
        '2xl': { value: '24px' },
        '3xl': { value: '28px' },
        full: { value: '9999px' },
      },
      fontSizes: {
        'display-lg': { value: '57px' },
        'display-md': { value: '45px' },
        'display-sm': { value: '36px' },
        'headline-lg': { value: '32px' },
        'headline-md': { value: '28px' },
        'headline-sm': { value: '24px' },
        'title-lg': { value: '22px' },
        'title-md': { value: '16px' },
        'title-sm': { value: '14px' },
        'label-lg': { value: '14px' },
        'label-md': { value: '12px' },
        'label-sm': { value: '11px' },
        'body-lg': { value: '16px' },
        'body-md': { value: '14px' },
        'body-sm': { value: '12px' },
      },
      lineHeights: {
        'display-lg': { value: '64px' },
        'display-md': { value: '52px' },
        'display-sm': { value: '44px' },
        'headline-lg': { value: '40px' },
        'headline-md': { value: '36px' },
        'headline-sm': { value: '32px' },
        'title-lg': { value: '28px' },
        'title-md': { value: '24px' },
        'title-sm': { value: '20px' },
        'label-lg': { value: '20px' },
        'label-md': { value: '16px' },
        'label-sm': { value: '16px' },
        'body-lg': { value: '24px' },
        'body-md': { value: '20px' },
        'body-sm': { value: '16px' },
      },
    },
  },
})

// Export theme tokens for backward compatibility
export const materialDesign3Theme = {
  shadows: materialDesign3Shadows,
  radii: materialDesign3Radii,
  elevation: {
    level0: 'none',
    level1: materialDesign3Shadows.sm,
    level2: materialDesign3Shadows.md,
    level3: materialDesign3Shadows.lg,
    level4: materialDesign3Shadows.xl,
    level5: materialDesign3Shadows['2xl'],
  },
  borderRadius: materialDesign3Radii,
  typography: {
    displayLarge: { fontSize: '57px', lineHeight: '64px', fontWeight: '400' },
    displayMedium: { fontSize: '45px', lineHeight: '52px', fontWeight: '400' },
    displaySmall: { fontSize: '36px', lineHeight: '44px', fontWeight: '400' },
    headlineLarge: { fontSize: '32px', lineHeight: '40px', fontWeight: '400' },
    headlineMedium: { fontSize: '28px', lineHeight: '36px', fontWeight: '400' },
    headlineSmall: { fontSize: '24px', lineHeight: '32px', fontWeight: '400' },
    titleLarge: { fontSize: '22px', lineHeight: '28px', fontWeight: '400' },
    titleMedium: { fontSize: '16px', lineHeight: '24px', fontWeight: '500' },
    titleSmall: { fontSize: '14px', lineHeight: '20px', fontWeight: '500' },
    labelLarge: { fontSize: '14px', lineHeight: '20px', fontWeight: '500' },
    labelMedium: { fontSize: '12px', lineHeight: '16px', fontWeight: '500' },
    labelSmall: { fontSize: '11px', lineHeight: '16px', fontWeight: '500' },
    bodyLarge: { fontSize: '16px', lineHeight: '24px', fontWeight: '400' },
    bodyMedium: { fontSize: '14px', lineHeight: '20px', fontWeight: '400' },
    bodySmall: { fontSize: '12px', lineHeight: '16px', fontWeight: '400' },
  },
};