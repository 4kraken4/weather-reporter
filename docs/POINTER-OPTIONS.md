# LkMap Pointer Options Documentation

## Overview

The `LkMap` component now supports customizable pointer animations that activate when a district is selected. These animations help visually connect the selected district to the weather data panel.

## Pointer Options

The `pointerOptions` prop allows you to control which pointer features are enabled:

```typescript
type PointerOptions = {
  showPulseIndicator?: boolean;
  showExtendingLine?: boolean;
  showInfoPanel?: boolean;
};
```

### Default Values

All options default to `true` when not specified:

```typescript
const defaultPointerOptions = {
  showPulseIndicator: true,
  showExtendingLine: true,
  showInfoPanel: true,
};
```

## Usage Examples

### 1. All Features Enabled (Default)

```tsx
<LkMap
  // ... other props
  pointerOptions={{
    showPulseIndicator: true,
    showExtendingLine: true,
    showInfoPanel: true,
  }}
/>
```

**Features:**

- Pulsing dot at district center
- Animated line extending toward weather data panel
- Slide-in information panel with district details

### 2. Pulse Indicator Only

```tsx
<LkMap
  // ... other props
  pointerOptions={{
    showPulseIndicator: true,
    showExtendingLine: false,
    showInfoPanel: false,
  }}
/>
```

**Features:**

- Only the pulsing dot at the district center
- Minimal visual indication of selection

### 3. Extending Line Only

```tsx
<LkMap
  // ... other props
  pointerOptions={{
    showPulseIndicator: false,
    showExtendingLine: true,
    showInfoPanel: false,
  }}
/>
```

**Features:**

- Animated line pointing from district to weather panel
- No additional UI elements

### 4. Information Panel Only

```tsx
<LkMap
  // ... other props
  pointerOptions={{
    showPulseIndicator: false,
    showExtendingLine: false,
    showInfoPanel: true,
  }}
/>
```

**Features:**

- Slide-in panel with district information
- No connecting line or pulse indicator

### 5. No Pointer Features

```tsx
<LkMap
  // ... other props
  pointerOptions={{
    showPulseIndicator: false,
    showExtendingLine: false,
    showInfoPanel: false,
  }}
/>
```

**Features:**

- Standard map behavior without pointer animations
- Districts still change color when selected

## Feature Details

### Pulse Indicator (`showPulseIndicator`)

- Creates a pulsating dot at the center of the selected district
- Uses CSS animations for smooth pulsing effect
- Color matches the application's primary theme

### Extending Line (`showExtendingLine`)

- Draws an animated line from the district center toward the weather data panel
- Line direction and length are calculated dynamically based on layout
- Animates from 0 to full length over 0.8 seconds
- Uses CSS custom properties for dynamic width animation

### Information Panel (`showInfoPanel`)

- Displays a slide-in panel with district information
- Shows population, area, and description when available
- Includes a close button to hide the pointer
- Positioned dynamically based on line direction and length

## Animation Behavior

- Animations restart each time a new district is selected
- Each animation uses a unique React key to force re-rendering
- Pointer position is calculated dynamically to always point toward the weather data panel
- All animations are CSS-based for optimal performance

## Styling

The pointer features use the following CSS classes:

- `.pointer-container` - Main container for all pointer elements
- `.pointer-dot` - Pulsing dot indicator
- `.pointer-line` - Extending line element
- `.district-info-panel` - Information panel container
- `.info-panel-content` - Panel content wrapper
- `.close-pointer-btn` - Close button for the panel

## Accessibility

- All interactive elements include appropriate ARIA labels
- Keyboard navigation is supported for the close button
- Color contrasts meet accessibility standards
- Animations respect user preferences for reduced motion

## Browser Compatibility

- All modern browsers supporting CSS custom properties
- Uses CSS animations and transforms for optimal performance
- Graceful degradation on older browsers
