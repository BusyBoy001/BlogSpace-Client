# BlogSpace Client

A modern React blog application with dark mode support, user authentication, and rich text editing.

## Features

- 🌙 Dark/Light mode toggle
- 🔍 Search functionality
- 👤 User authentication (login/register)
- ✍️ Rich text editor for blog posts
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 🔒 Protected routes for admin features

## Recent Fixes & Improvements

### ✅ Fixed Issues

1. **Server Configuration**

   - Added missing start/dev scripts to package.json
   - Removed deprecated MongoDB connection options
   - Added comprehensive troubleshooting guide

2. **Client-Side Improvements**

   - Fixed duplicate ThemeProvider usage
   - Uncommented search functionality in Navbar
   - Added missing login/register functions to auth utility
   - Updated components to use auth utility functions
   - Added Vite proxy configuration for API calls
   - Replaced hardcoded localhost URLs with relative paths
   - Added ErrorBoundary for graceful error handling
   - Created centralized API utility for better error handling
   - Added reusable LoadingSpinner component

3. **Code Quality**
   - Removed unused imports
   - Improved error handling consistency
   - Added proper loading states
   - Centralized API calls

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Make sure the server is running on port 5000

## Environment Setup

The client uses a proxy configuration to forward API calls to the server. Make sure:

1. Server is running on `http://localhost:5000`
2. Server has proper `.env` file configured
3. MongoDB is running and accessible

## Project Structure

```
src/
├── components/          # React components
│   ├── ErrorBoundary.jsx
│   ├── LoadingSpinner.jsx
│   └── ...
├── utils/              # Utility functions
│   ├── auth.js         # Authentication utilities
│   └── api.js          # API utilities
├── contexts/           # React contexts
│   ├── ThemeContext.jsx
│   └── SearchContext.jsx
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
