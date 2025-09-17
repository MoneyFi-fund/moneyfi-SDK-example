# Material Design 3 Developer Guide

## Quick Start

### 1. Import the Theme

```typescript
import { materialDesign3Theme } from '@/theme/material-design-3';
```

### 2. Use Design Tokens

Instead of hardcoded values, use theme tokens:

```typescript
// ❌ Before (Neobrutalist)
<Card
  bg="black"
  border="3px solid white"
  borderRadius="0"
  boxShadow="5px 5px 0px white"
/>

// ✅ After (Material Design 3)
<Card
  bg="surface.50"
  border="1px solid"
  borderColor="neutral.200"
  borderRadius={materialDesign3Theme.borderRadius.md}
  boxShadow={materialDesign3Theme.elevation.level1}
/>
```

## Common Patterns

### Card Container

```typescript
const cardStyles = {
  bg: "surface.50",
  borderRadius: materialDesign3Theme.borderRadius.md,
  boxShadow: materialDesign3Theme.elevation.level1,
  border: "1px solid",
  borderColor: "neutral.200",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  _hover: {
    boxShadow: materialDesign3Theme.elevation.level2,
  }
};

<Card.Root {...cardStyles}>
  <Card.Header p={6}>
    <Text
      fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
      fontWeight="medium"
      color="neutral.900"
    >
      Card Title
    </Text>
  </Card.Header>
  <Card.Body px={6} pb={6}>
    {/* Content */}
  </Card.Body>
</Card.Root>
```

### Primary Button

```typescript
const primaryButtonStyles = {
  bg: "primary.500",
  color: "white",
  minH: "48px",
  px: 6,
  borderRadius: materialDesign3Theme.borderRadius.sm,
  fontWeight: "medium",
  fontSize: materialDesign3Theme.typography.labelLarge.fontSize,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: materialDesign3Theme.elevation.level1,
  _hover: {
    bg: "primary.600",
    boxShadow: materialDesign3Theme.elevation.level2,
  },
  _active: {
    bg: "primary.700",
    boxShadow: materialDesign3Theme.elevation.level1,
  },
  _disabled: {
    bg: "neutral.300",
    color: "neutral.500",
    cursor: "not-allowed",
    boxShadow: "none",
  }
};

<Button {...primaryButtonStyles}>
  Primary Action
</Button>
```

### Error Button (for destructive actions)

```typescript
const errorButtonStyles = {
  ...primaryButtonStyles,
  bg: "error.500",
  _hover: {
    bg: "error.600",
    boxShadow: materialDesign3Theme.elevation.level2,
  },
  _active: {
    bg: "error.700",
    boxShadow: materialDesign3Theme.elevation.level1,
  }
};

<Button {...errorButtonStyles}>
  Withdraw
</Button>
```

### Text Input

```typescript
const inputStyles = {
  border: "1px solid",
  borderColor: "neutral.300",
  borderRadius: materialDesign3Theme.borderRadius.sm,
  minH: "48px",
  px: 4,
  bg: "surface.50",
  color: "neutral.900",
  _placeholder: { color: "neutral.500" },
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  _hover: {
    borderColor: "neutral.400",
  },
  _focus: {
    borderColor: "primary.500",
    boxShadow: `0 0 0 2px ${materialDesign3Theme.colors.primary[100]}`,
    outline: "none",
  }
};

<Input {...inputStyles} placeholder="Enter amount" />
```

### Success Alert

```typescript
const successAlertStyles = {
  status: "success" as const,
  bg: "success.50",
  border: "1px solid",
  borderColor: "success.200",
  borderRadius: materialDesign3Theme.borderRadius.sm,
  p: 4
};

<Alert.Root {...successAlertStyles}>
  <Alert.Description>
    <Text
      color="success.800"
      fontWeight="medium"
      fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
    >
      Success message
    </Text>
  </Alert.Description>
</Alert.Root>
```

### Error Alert

```typescript
const errorAlertStyles = {
  status: "error" as const,
  bg: "error.50",
  border: "1px solid",
  borderColor: "error.200",
  borderRadius: materialDesign3Theme.borderRadius.sm,
  p: 4
};

<Alert.Root {...errorAlertStyles}>
  <Alert.Description>
    <Text
      color="error.800"
      fontWeight="medium"
      fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
    >
      Error message
    </Text>
  </Alert.Description>
</Alert.Root>
```

## Color Usage Guidelines

### Semantic Colors

- **Primary** (`primary.500`): Main actions, brand elements
- **Secondary** (`secondary.500`): Partnership features, secondary actions
- **Tertiary** (`tertiary.500`): Informational content, portfolio displays
- **Success** (`success.500`): Positive outcomes, successful transactions
- **Warning** (`warning.500`): Cautionary states, account warnings
- **Error** (`error.500`): Error states, destructive actions
- **Neutral** (`neutral.500`): Text, borders, disabled states

### Color Variants

Each color has a scale from 50 (lightest) to 900 (darkest):

```typescript
// Backgrounds
bg: "primary.50"    // Very light background
bg: "primary.100"   // Light background
bg: "primary.500"   // Main color
bg: "primary.900"   // Very dark background

// Text colors
color: "primary.600"  // Standard text
color: "primary.700"  // Emphasized text
color: "primary.800"  // High emphasis text
```

### Border Colors

```typescript
// Light borders
borderColor: "neutral.200"
borderColor: "primary.200"

// Medium borders
borderColor: "neutral.300"
borderColor: "primary.300"

// Focus borders
borderColor: "primary.500"
borderColor: "error.500"
```

## Typography Guidelines

### Hierarchy

```typescript
// Page titles
fontSize={materialDesign3Theme.typography.headlineMedium.fontSize}
lineHeight={materialDesign3Theme.typography.headlineMedium.lineHeight}

// Section titles
fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
lineHeight={materialDesign3Theme.typography.titleLarge.lineHeight}

// Form labels
fontSize={materialDesign3Theme.typography.labelLarge.fontSize}

// Body text
fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}

// Small text
fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
```

### Font Weights

```typescript
fontWeight="medium"  // 500 - Labels, emphasized text
fontWeight="semibold"  // 600 - Headings
fontWeight="bold"    // 700 - Important values, stats
```

## Spacing Guidelines

### Component Spacing

```typescript
// Card padding
<Card.Header p={6}>        // 24px all sides
<Card.Body px={6} pb={6}>  // 24px horizontal, 24px bottom

// Form spacing
<VStack gap={6}>           // 24px between form sections
<VStack gap={2}>           // 8px between label and input

// Button spacing
px={6}                     // 24px horizontal padding
minH="48px"               // 48px minimum height
```

### Layout Spacing

```typescript
// Container spacing
<Container p={8}>          // 32px padding
<VStack gap={6}>          // 24px between major sections
<HStack gap={4}>          // 16px between related items
<HStack gap={2}>          // 8px between close items
```

## Elevation Usage

### Card Elevations

```typescript
// Default cards
boxShadow={materialDesign3Theme.elevation.level1}

// Hover states
_hover={{ boxShadow: materialDesign3Theme.elevation.level2 }}

// Dropdown menus
boxShadow={materialDesign3Theme.elevation.level3}

// Modals
boxShadow={materialDesign3Theme.elevation.level5}
```

## Border Radius Usage

```typescript
// Small elements (buttons, inputs)
borderRadius={materialDesign3Theme.borderRadius.sm}  // 8px

// Cards, containers
borderRadius={materialDesign3Theme.borderRadius.md}  // 12px

// Large containers, modals
borderRadius={materialDesign3Theme.borderRadius.lg}  // 16px

// Icons, small buttons
borderRadius={materialDesign3Theme.borderRadius.xs}  // 4px

// Circular elements
borderRadius="full"
```

## Animation Guidelines

### Transitions

```typescript
// Standard transition
transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"

// Card transitions
transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
```

### Hover Effects

```typescript
// Elevation change
_hover={{
  boxShadow: materialDesign3Theme.elevation.level2,
}}

// Color change
_hover={{
  bg: "primary.600",
}}

// Combined effect
_hover={{
  bg: "primary.600",
  boxShadow: materialDesign3Theme.elevation.level2,
}}
```

## Component Variants

### Button Variants

```typescript
// Primary (main actions)
const primaryButton = { bg: "primary.500", color: "white" };

// Secondary (alternative actions)
const secondaryButton = { bg: "secondary.500", color: "white" };

// Error (destructive actions)
const errorButton = { bg: "error.500", color: "white" };

// Outline (secondary actions)
const outlineButton = {
  bg: "surface.50",
  border: "1px solid",
  borderColor: "neutral.300",
  color: "neutral.700"
};
```

### Alert Variants

```typescript
// Success
{ bg: "success.50", borderColor: "success.200", color: "success.800" }

// Warning
{ bg: "warning.50", borderColor: "warning.200", color: "warning.800" }

// Error
{ bg: "error.50", borderColor: "error.200", color: "error.800" }

// Info
{ bg: "tertiary.50", borderColor: "tertiary.200", color: "tertiary.800" }
```

## Best Practices

### Do's

✅ Use theme tokens instead of hardcoded values
✅ Maintain consistent spacing with the 4px grid
✅ Use semantic colors for appropriate contexts
✅ Include proper focus states for accessibility
✅ Use elevation consistently across similar components
✅ Follow typography hierarchy for content structure

### Don'ts

❌ Don't use arbitrary color values
❌ Don't skip focus states on interactive elements
❌ Don't use inconsistent border radius values
❌ Don't ignore the elevation system
❌ Don't use extreme color contrasts without purpose
❌ Don't mix design systems within the same component

## Accessibility Checklist

- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible and clear
- [ ] Interactive elements are at least 44px in size
- [ ] Text is readable at all zoom levels
- [ ] Error states are clearly communicated
- [ ] Loading states provide appropriate feedback

## Migration Checklist

When converting a component:

- [ ] Replace hardcoded colors with theme tokens
- [ ] Update border radius values
- [ ] Replace shadow system with elevation
- [ ] Update typography to use theme scales
- [ ] Add proper transitions
- [ ] Ensure focus states are accessible
- [ ] Test hover and active states
- [ ] Verify responsive behavior

This guide provides practical examples and patterns for implementing Material Design 3 consistently across the MoneyFi SDK application.