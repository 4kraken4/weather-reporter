# Weather Reporter App

A modern weather application with intuitive UI, real-time updates, and detailed forecasts.

## Loading Component

The application includes a weather-themed loading component that provides an engaging user experience while the application initializes.

### AppLoader Component

The `AppLoader` component is a weather-themed loading screen that provides visual feedback during application initialization. It includes animated weather effects that change based on the loading stage.

#### Usage

```tsx
import { AppLoader } from './core/components/loading/AppLoader';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  const handleLoadComplete = () => {
    console.log('Loading complete');
    // Additional actions after loading
  };
  
  return (
    <>
      <AppLoader 
        isLoading={isLoading} 
        onLoadComplete={handleLoadComplete} 
      />
      {!isLoading && <MainApplication />}
    </>
  );
}
```

For performance-sensitive applications, a memoized version is also available:

```tsx
import { MemoizedAppLoader } from './core/components/loading/AppLoader';

function App() {
  // Same usage as regular AppLoader
  return (
    <MemoizedAppLoader 
      isLoading={true} 
      onLoadComplete={() => console.log('Loading complete')} 
    />
  );
}
```

#### Features

- **Weather-themed loading steps**: Each loading step features a different weather element (cloud, sun, rain, wind, thunder)
- **Dynamic animations**: Smooth transitions and weather-specific particle effects
- **Accessibility**: ARIA labels, skip button, and reduced motion support
- **Performance optimization**: Memoized version and load time monitoring
- **Responsive design**: Adapts to different screen sizes
- **Theme support**: Works with both light and dark themes
- **Customizable**: Easy to update loading steps and animations

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `isLoading` | boolean | Controls whether the loader is displayed |
| `onLoadComplete` | () => void | Callback function triggered when loading completes |

#### Accessibility

The component includes several accessibility features:
- ARIA live regions for screen readers
- Skip button to bypass animations
- Reduced motion support
- High contrast mode compatibility
- Keyboard navigation support

#### Integration Example

Here's a complete example of how to integrate the AppLoader with your main application content:

```tsx
import { useState, useEffect } from 'react';
import { AppLoader } from './core/components/loading/AppLoader';
import MainWeatherDashboard from './features/weather/components/MainWeatherDashboard';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  
  // Simulate data loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your actual data fetching
        const response = await fetch('/api/weather');
        const data = await response.json();
        
        // Simulate minimum loading time for better UX
        setTimeout(() => {
          setWeatherData(data);
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <>
      <AppLoader 
        isLoading={isLoading} 
        onLoadComplete={() => console.log('Loading animation complete')} 
      />
      
      {!isLoading && weatherData && (
        <MainWeatherDashboard data={weatherData} />
      )}
      
      {!isLoading && !weatherData && (
        <div className="error-container">
          <h2>Unable to load weather data</h2>
          <p>Please check your connection and try again.</p>
          <button onClick={() => setIsLoading(true)}>Retry</button>
        </div>
      )}
    </>
  );
}

export default App;
```

# 🌤️ Weather Reporter

A modern, responsive weather application built with React, TypeScript, and Vite. Get real-time weather information for Sri Lankan districts with an intuitive interactive map interface.

## ✨ Features

### 🎯 Core Functionality

- **Real-time Weather Data**: Get accurate, up-to-the-minute weather information from trusted meteorological sources
- **Interactive Sri Lanka Map**: Click on any district to view detailed weather information
- **Location-based Forecasts**: Precise weather predictions tailored to specific Sri Lankan districts
- **Advanced Analytics**: Detailed weather trends and atmospheric data including humidity, pressure, and wind patterns
- **Responsive Design**: Seamless experience across all devices and screen sizes

### 🎨 User Experience

- **Modern UI**: Clean, intuitive interface with PrimeReact components
- **Dark/Light Theme**: Toggle between light and dark modes for comfortable viewing
- **Smooth Animations**: Framer Motion powered animations for enhanced user experience
- **Loading States**: Skeleton components for better perceived performance
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

### 🗺️ Map Features

- **Interactive District Selection**: Click on any Sri Lankan district for weather data
- **Visual Indicators**: Pulse animations and hover effects for better interaction
- **District Information**: Population, area, and description for each district
- **Disabled Regions**: Configurable disabled districts for maintenance or data unavailability

## 🚀 Technologies Used

### Frontend Framework

- **React 19** - Latest React features with improved performance
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool with hot module replacement

### UI & Styling

- **PrimeReact** - Comprehensive React component library
- **PrimeFlex** - Flexible CSS utility framework
- **Framer Motion** - Production-ready motion library for animations
- **Sass** - Enhanced CSS with variables and mixins

### Additional Libraries

- **React Router DOM** - Client-side routing
- **React Leaflet** - Interactive maps for React
- **Axios** - HTTP client for API requests
- **React Icons** - Popular icon library
- **Chroma.js** - Color manipulation library

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/weather-reporter.git
   cd weather-reporter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_API_BASE_URL=your_weather_api_base_url
   VITE_OPEN_WEATHER_ICON_URL=your_weather_icon_url
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🏗️ Project Structure

```
src/
├── core/                   # Core application infrastructure
│   ├── components/         # Reusable UI components
│   │   ├── error/         # Error handling components
│   │   ├── features/      # Feature showcase components
│   │   ├── hero/          # Hero section components
│   │   ├── loading/       # Loading states
│   │   ├── magic-card/    # Interactive card components
│   │   ├── notification/  # Message notifications
│   │   └── search/        # Search functionality
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── layout/            # Layout components
│   ├── router/            # Routing configuration
│   ├── services/          # API services
│   └── types/             # TypeScript type definitions
├── features/
│   └── weather/           # Weather-specific features
│       ├── components/    # Weather UI components
│       ├── context/       # Weather context
│       ├── hooks/         # Weather-specific hooks
│       ├── routes/        # Weather routes
│       └── services/      # Weather API services
├── pages/                 # Page components
└── assets/               # Static assets
```

## 🌐 API Integration

The application integrates with weather APIs to provide:

- Current weather conditions
- Temperature, humidity, and wind speed data
- Weather icons and descriptions
- Region-specific weather information for Sri Lankan districts

## 🎨 Design System

### Theme Support

- **Light Theme**: Clean, bright interface for day use
- **Dark Theme**: Easy-on-the-eyes dark mode for night use
- **Consistent Colors**: Carefully selected color palette using Chroma.js

### Component Library

- **PrimeReact Components**: Professional UI components
- **Custom Components**: Tailored components for weather-specific needs
- **Responsive Grid**: PrimeFlex-based responsive layout system

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

The `vercel.json` configuration handles:

- Static asset caching
- Single Page Application routing
- Build optimization

## 🔧 Development Features

### Code Quality

- **ESLint**: Comprehensive linting with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strong typing for better development experience

### Performance

- **Lazy Loading**: Code splitting for better initial load times
- **Skeleton Loading**: Improved perceived performance
- **Optimized Animations**: 60fps animations with Framer Motion

### Error Handling

- **Error Boundaries**: React error boundaries for graceful error handling
- **API Error Handling**: Comprehensive error handling for weather API calls
- **User Feedback**: Toast notifications for user actions

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Author**: Waruna Wimalaweera  
**Email**: warunamadushanka456@gmail.com  
**Version**: 1.0.0  
**Last Updated**: July 5, 2025

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [PrimeReact](https://primereact.org/) for UI components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [React Leaflet](https://react-leaflet.js.org/) for map integration

---

**Made with ❤️ for better weather forecasting in Sri Lanka**
