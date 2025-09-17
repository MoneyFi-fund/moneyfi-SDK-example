# Material Design 3 Implementation Guide

## Overview

This guide documents the transformation of the MoneyFi SDK from neobrutalist design to Material Design 3. The new design system provides a modern, accessible, and cohesive user experience while maintaining all existing functionality.

## Design Transformation Summary

### Before (Neobrutalist)
- Sharp corners (`borderRadius="0"`)
- Bold black borders (`border="2px/3px solid black"`)
- Drop shadows with offset (`boxShadow="5px 5px 0px black"`)
- Transform effects on hover (`translate(2px, 2px)`)
- High contrast colors (black backgrounds, white text)
- Harsh, geometric aesthetics

### After (Material Design 3)
- Rounded corners using 4px scale (`4px, 8px, 12px, 16px`)
- Subtle borders with neutral colors (`1px solid neutral.200`)
- Elevation system with soft shadows
- Smooth cubic-bezier transitions
- Harmonious color palette with semantic meaning
- Modern, accessible design patterns

## Design System

### Color Palette

The Material Design 3 color system uses semantic color tokens:

#### Primary Colors
- **Primary**: `#4CAF50` (Green) - Used for main actions and brand elements
- **Secondary**: `#9C27B0` (Purple) - Used for partnerships and secondary actions
- **Tertiary**: `#42A5F5` (Blue) - Used for informational elements

#### Semantic Colors
- **Success**: `#4CAF50` - Positive outcomes, successful transactions
- **Warning**: `#FF9800` - Cautionary states, account warnings
- **Error**: `#F44336` - Error states, failed transactions
- **Neutral**: Grayscale palette for text and surfaces

#### Surface Colors
- **Surface**: `#FFFFFF` to `#EEEEEE` - Background surfaces with subtle variations

### Typography Scale

Material Design 3 typography system with consistent hierarchy:

#### Display
- **Display Large**: 57px/64px - Hero sections
- **Display Medium**: 45px/52px - Page headers
- **Display Small**: 36px/44px - Section headers

#### Headlines
- **Headline Large**: 32px/40px - Major headings
- **Headline Medium**: 28px/36px - Section titles
- **Headline Small**: 24px/32px - Card titles

#### Titles
- **Title Large**: 22px/28px - Component titles
- **Title Medium**: 16px/24px - Form labels, small headings
- **Title Small**: 14px/20px - Captions, metadata

#### Body & Labels
- **Body Large**: 16px/24px - Primary body text
- **Body Medium**: 14px/20px - Secondary body text
- **Label Large**: 14px/20px - Button text, form labels
- **Label Medium**: 12px/16px - Small labels, tags

### Elevation System

Material Design 3 elevation uses subtle shadows:

- **Level 0**: No shadow - Default surface
- **Level 1**: `0px 1px 2px rgba(0,0,0,0.3), 0px 1px 3px rgba(0,0,0,0.15)` - Cards
- **Level 2**: `0px 1px 2px rgba(0,0,0,0.3), 0px 2px 6px rgba(0,0,0,0.15)` - Hover states
- **Level 3**: `0px 1px 3px rgba(0,0,0,0.3), 0px 4px 8px rgba(0,0,0,0.15)` - Dropdowns
- **Level 4**: `0px 2px 3px rgba(0,0,0,0.3), 0px 6px 10px rgba(0,0,0,0.15)` - Navigation
- **Level 5**: `0px 4px 4px rgba(0,0,0,0.3), 0px 8px 12px rgba(0,0,0,0.15)` - Modals

### Border Radius Scale

Consistent rounded corners:

- **xs**: 4px - Small elements (icons, chips)
- **sm**: 8px - Inputs, buttons
- **md**: 12px - Cards, containers
- **lg**: 16px - Large containers
- **xl**: 20px - Modal dialogs
- **full**: 9999px - Circular elements

### Spacing Scale

4px-based spacing system:

- **1**: 4px
- **2**: 8px
- **3**: 12px
- **4**: 16px
- **5**: 20px
- **6**: 24px
- **8**: 32px
- **10**: 40px
- **12**: 48px

## Component Specifications

### Cards

**Structure**: Surface containers with elevation and rounded corners

```typescript
<Card.Root
  bg="surface.50"
  borderRadius={materialDesign3Theme.borderRadius.md}
  boxShadow={materialDesign3Theme.elevation.level1}
  border="1px solid"
  borderColor="neutral.200"
  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  _hover={{
    boxShadow: materialDesign3Theme.elevation.level2,
  }}
>
```

### Buttons

**Primary Button**: Main actions (deposits, withdrawals)
```typescript
<Button
  bg="primary.500"
  color="white"
  minH="48px"
  borderRadius={materialDesign3Theme.borderRadius.sm}
  boxShadow={materialDesign3Theme.elevation.level1}
  _hover={{
    bg: "primary.600",
    boxShadow: materialDesign3Theme.elevation.level2,
  }}
>
```

**Secondary Button**: Alternative actions
```typescript
<Button
  bg="secondary.500"
  color="white"
  // ... similar structure
>
```

**Error Button**: Destructive actions (withdrawals)
```typescript
<Button
  bg="error.500"
  color="white"
  // ... similar structure
>
```

### Input Fields

**Text Inputs**: Form fields with focus states
```typescript
<Input
  border="1px solid"
  borderColor="neutral.300"
  borderRadius={materialDesign3Theme.borderRadius.sm}
  minH="48px"
  _focus={{
    borderColor: "primary.500",
    boxShadow: `0 0 0 2px ${materialDesign3Theme.colors.primary[100]}`,
    outline: "none",
  }}
>
```

### Alerts

**Success Alerts**: Positive feedback
```typescript
<Alert.Root
  status="success"
  bg="success.50"
  border="1px solid"
  borderColor="success.200"
  borderRadius={materialDesign3Theme.borderRadius.sm}
>
```

**Error Alerts**: Error feedback
```typescript
<Alert.Root
  status="error"
  bg="error.50"
  border="1px solid"
  borderColor="error.200"
  borderRadius={materialDesign3Theme.borderRadius.sm}
>
```

### Modals

**Dialog Structure**: Elevated containers for modal content
```typescript
<DialogContent
  borderRadius={materialDesign3Theme.borderRadius.lg}
  boxShadow={materialDesign3Theme.elevation.level5}
  bg="surface.50"
>
```

## Interactive States

### Hover States
- Subtle elevation increase
- Color brightening (600 → 500 for backgrounds)
- Smooth transitions with `cubic-bezier(0.4, 0, 0.2, 1)`

### Focus States
- Border color change to primary/error color
- 2px colored outline for accessibility
- No browser default outline

### Active States
- Slight elevation decrease
- Color darkening (500 → 700 for backgrounds)

### Disabled States
- Neutral.300 background
- Neutral.500 text color
- No interactive effects

## Accessibility Improvements

### Color Contrast
- All text meets WCAG AA standards
- Error states use high-contrast red
- Success states use accessible green

### Focus Management
- Visible focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader friendly labels

### Interactive Targets
- Minimum 44px touch targets
- Adequate spacing between clickable elements

## Implementation Details

### Theme Integration

Import and use the theme configuration:

```typescript
import { materialDesign3Theme } from '@/theme/material-design-3';

// Use in component styles
borderRadius={materialDesign3Theme.borderRadius.md}
fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
boxShadow={materialDesign3Theme.elevation.level1}
```

### Transitions

Consistent timing and easing:

```typescript
transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
```

### Responsive Design

Components adapt to different screen sizes:
- Touch-friendly sizing on mobile
- Appropriate spacing adjustments
- Readable typography at all sizes

## Component Transformations

### Deposit Component
- **Card**: Surface background with subtle border and elevation
- **Inputs**: Material Design 3 text fields with proper focus states
- **Button**: Primary green button with elevation changes
- **Alerts**: Success/error states with appropriate colors

### Withdraw Component
- **Card**: Consistent with deposit component styling
- **Portfolio Display**: Tertiary color scheme for informational content
- **Button**: Error color scheme for destructive action
- **Form Elements**: Consistent input styling

### Create Partnership Component
- **Button**: Secondary purple color for partnership actions
- **Success State**: Clean alert with copy functionality
- **Layout**: Proper spacing and typography hierarchy

### Wallet Button
- **Connected State**: Outline button with elevation
- **Dropdown Menu**: Material Design 3 menu with proper spacing
- **Avatar**: Circular element with primary color

### Wallet Connect Modal
- **Dialog**: High elevation with rounded corners
- **Wallet Options**: Interactive cards with hover states
- **Loading States**: Consistent spinner and messaging

### Stats Component
- **Grid Layout**: Responsive card grid
- **Stat Cards**: Color-coded cards with semantic meanings
- **Loading States**: Centered loading indicators
- **Error States**: Clear error messaging

## Benefits of the Transformation

### User Experience
- **Modern Feel**: Contemporary design language
- **Better Usability**: Clearer hierarchy and navigation
- **Accessibility**: Improved contrast and focus management
- **Consistency**: Unified design system across components

### Technical Benefits
- **Maintainability**: Centralized theme configuration
- **Scalability**: Reusable design tokens
- **Performance**: Smooth CSS transitions
- **Future-Proof**: Aligned with modern design standards

### Business Impact
- **Trust**: Professional appearance builds user confidence
- **Accessibility**: Wider user base support
- **Brand Alignment**: Modern, trustworthy financial application
- **User Retention**: Better user experience encourages continued use

## Migration Notes

### Breaking Changes
- Color token names have changed
- Border radius values are different
- Shadow system is completely new

### Backward Compatibility
- All functionality remains identical
- Component APIs unchanged
- No behavioral differences

### Performance Considerations
- CSS transitions are hardware-accelerated
- Elevation shadows are optimized
- Typography loading is efficient

## Future Enhancements

### Dark Mode Support
- Color system supports dark theme variants
- Theme switching infrastructure in place
- Semantic color tokens enable easy theming

### Animation System
- Motion design tokens can be added
- Micro-interactions can be enhanced
- Loading states can be animated

### Component Extensions
- Additional Material Design 3 components
- Enhanced form components
- Advanced layout primitives

This guide provides a comprehensive overview of the Material Design 3 transformation, ensuring consistent implementation across the entire application while maintaining the robust functionality of the MoneyFi SDK.