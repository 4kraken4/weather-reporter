# WeatherInformationPanel Component

## Overview

The `WeatherInformationPanel` is a reusable React component that displays comprehensive weather information in a structured, visually appealing format. It was extracted from the `WeatherPage` component to improve code modularity and reusability.

## Features

- **Title & Location**: Displays city name and country with theme-aware styling
- **Weather Icon**: Shows current weather condition icon in a styled container
- **Temperature Display**: Temperature text with visual indicator bar
- **Wind Information**: Wind speed with directional indicator
- **Humidity Display**: Humidity percentage with visual indicator
- **Detailed Information**: Expandable accordion with additional weather data

## Props

```typescript
type WeatherInformationPanelProps = {
  data: WeatherResponseType;
  owIconURL: string;
};
```

### `data` (required)

- **Type**: `WeatherResponseType`
- **Description**: Complete weather data object containing all weather metrics and information

### `owIconURL` (required)

- **Type**: `string`
- **Description**: Base URL for OpenWeather icons (typically from environment variables)

## Usage

```tsx
import { WeatherInformationPanel } from '@/features/weather/components/weather-info-panel';

// In your component
<WeatherInformationPanel
  data={weatherData}
  owIconURL={process.env.VITE_OPEN_WEATHER_ICON_URL}
/>;
```

## Component Structure

### 1. **Title & Weather Icon Section**

```tsx
<div className='grid'>
  <div className='col-12 md:col-9'>
    <h4>
      {data?.cityName}, {data?.system?.country}
    </h4>
  </div>
  <div className='col-12 md:col-3'>
    <img src={`${owIconURL}/${data?.conditions[0].icon}@2x.png`} />
  </div>
</div>
```

### 2. **Temperature Section**

```tsx
<div className='flex flex-row gap-3'>
  <p>Temperature: {data.metrics.temp}°C</p>
  <TemperatureIndicator temperature={data.metrics.temp} />
</div>
```

### 3. **Wind Speed Section**

```tsx
<div className='flex flex-row gap-3'>
  <p>Wind Speed: {data.wind.speed} m/s</p>
  <WindDirectionIndicator deg={data.wind.deg} speed={data.wind.speed} />
</div>
```

### 4. **Humidity Section**

```tsx
<div className='flex flex-row gap-3'>
  <p>Humidity: {data.metrics.humidity}%</p>
  <HumidityIndicator humidity={data.metrics.humidity} />
</div>
```

### 5. **More Info Accordion**

```tsx
<Accordion className='w-full'>
  <AccordionTab header='More Info'>
    <WeatherInfoTab {...data} />
  </AccordionTab>
</Accordion>
```

## Dependencies

### External Libraries

- `primereact/accordion` - For expandable information sections
- `react` - Core React functionality

### Internal Components

- `HumidityIndicator` - Visual humidity display
- `TemperatureIndicator` - Visual temperature display
- `WindDirectionIndicator` - Visual wind direction display
- `WeatherInfoTab` - Detailed weather information

### Hooks & Types

- `useTheme` - For theme-aware styling
- `WeatherResponseType` - TypeScript type definition

## Styling

The component uses PrimeReact's CSS framework with the following key classes:

- **Layout**: `grid`, `flex`, `flex-column`, `flex-row`
- **Responsive**: `col-12`, `md:col-9`, `md:col-3`
- **Spacing**: `gap-3`, `p-2`, `m-0`
- **Typography**: `text-3xl`, `text-sm`, `font-semibold`, `font-bold`, `font-italic`
- **Theme**: Dynamic classes based on `isDarkMode` state

## Theme Support

The component automatically adapts to light and dark themes:

### Light Theme

- Title: `text-cyan-700`
- Icon container: `surface-border bg-primary-500 shadow-2`

### Dark Theme

- Title: `text-cyan-300`
- Icon container: `bg-gray-800 border-gray-700`

## Responsive Design

- **Mobile**: Single column layout, centered alignment
- **Desktop**: Two-column grid with left alignment for content
- **Breakpoint**: Uses `md:` prefix for medium screens and above

## Performance Optimization

- **Memoized**: Component is wrapped with `React.memo` for optimal re-rendering
- **Conditional Rendering**: Only renders indicators when data is available
- **Lazy Evaluation**: Uses optional chaining for safe property access

## File Structure

```
src/features/weather/components/weather-info-panel/
├── WeatherInformationPanel.tsx    # Main component
├── index.ts                       # Export barrel
└── README.md                      # This documentation
```

## Integration Example

### Before (in WeatherPage.tsx)

```tsx
// 80+ lines of weather information JSX inline
<div className='weather-section'>
  <div className='grid'>
    <div className='col-12 md:col-9'>
      <h4>
        {data?.cityName}, {data?.system?.country}
      </h4>
    </div>
    // ... more inline JSX
  </div>
  // ... temperature section // ... wind section // ... humidity section // ...
  accordion section
</div>
```

### After (in WeatherPage.tsx)

```tsx
// Clean, single-line component usage
<WeatherInformationPanel data={data} owIconURL={owIconURL} />
```

## Benefits

### 🎯 **Separation of Concerns**

- Weather display logic separated from page layout logic
- Easier to test and maintain individual components

### ♻️ **Reusability**

- Can be used in other pages or components
- Consistent weather display across the application

### 🧹 **Code Organization**

- Reduced complexity in WeatherPage component
- Better file structure and modularity

### 🔧 **Maintainability**

- Changes to weather display logic isolated to single component
- Easier debugging and feature additions

### 📱 **Responsive Design**

- Consistent responsive behavior
- Reusable responsive patterns

This component represents a successful extraction that improves code quality while maintaining all original functionality and styling.
