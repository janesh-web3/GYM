# Gym Management Platform - Frontend

This is the frontend application for the Gym Management Platform, built with React, TypeScript, and Tailwind CSS.

## Features

- Modern and responsive UI
- User authentication
- Role-based access control
- Gym management dashboard
- Member management
- Trainer management
- Workout and diet plans
- Attendance tracking
- Payment integration (Stripe)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Development

The application uses:
- Vite for fast development and building
- TypeScript for type safety
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Zustand for state management

## Deployment

The frontend can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## License

MIT
