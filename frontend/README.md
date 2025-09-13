# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Expense Tracking Application

This application helps users track travel expenses, calculate distances, and visualize routes.

## Features

- User authentication
- Expense entry and management
- Google Maps integration for route calculation and visualization
- Expense reports and analytics
- PDF and CSV export

## Setting Up Route Visualization

### Google Maps API Key

1. Get a Google Maps API key from [Google Cloud Platform](https://console.cloud.google.com/)
2. Enable the following APIs:

   - Maps JavaScript API
   - Places API
   - Directions API
   - Distance Matrix API
   - Geocoding API

3. Create a `.env.local` file in the root directory and add your API key:

   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Restrict your API key to your domain for security

### Using Route Visualization

The route visualization feature provides:

- Interactive map display of routes
- Start and end location markers
- Waypoint markers for multi-point trips
- Route distance and duration calculation
- Route optimization option

## Development

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Technologies Used

- React
- Vite
- Google Maps API
- Tailwind CSS
- Framer Motion
- Axios
